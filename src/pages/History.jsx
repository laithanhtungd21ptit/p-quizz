import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import DateArrow from '../components/DateArrow';
import PQuizzCard from '../components/PQuizzCard';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const History = () => {
  const [historyItems, setHistoryItems] = useState({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // null = tất cả
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchName, setSearchName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Format yyyy-MM-dd để query API
  const formatDateParam = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 📌 Fetch lịch sử
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await axios.get('http://localhost:8080/api/player-answers/history', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            name: searchQuery ? searchQuery.trim() : undefined,
            date: selectedDate ? formatDateParam(selectedDate) : undefined,
          },
        });

        // Nhóm dữ liệu theo ngày
        const grouped = res.data.reduce((acc, item) => {
          const dateKey = new Date(item.startedAt)
            .toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
          if (!acc[dateKey]) acc[dateKey] = [];
          acc[dateKey].push({
            id: item.roomId, // dùng roomId để xóa
            topic: item.topic,
            description: item.quizName,
            questionCount: item.totalQuestions,
            dateTime: new Date(item.startedAt).toLocaleString('vi-VN'),
            onViewDetails: () => navigate(`/history-detail/${item.roomId}`), // xem chi tiết dùng quizId
            onDelete: () => handleDelete(item.roomId), // xóa theo roomId
            isDeletable: true,
          });
          return acc;
        }, {});
        setHistoryItems(grouped);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Không tải được lịch sử');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate, searchQuery, selectedDate]);

  // 📌 Xóa lịch sử theo roomId
  const handleDelete = async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/player-answers/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setHistoryItems((prev) => {
        const updated = {};
        Object.entries(prev).forEach(([day, items]) => {
          const filtered = items.filter((i) => i.id !== roomId);
          if (filtered.length > 0) {
            updated[day] = filtered;
          }
        });
        return updated;
      });

    } catch (err) {
      console.error('Xóa thất bại:', err);
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handleDateSelect = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    setShowCalendar(false);
  };

  const nextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  const handleClickOutside = (event) => {
    if (showCalendar && !event.target.closest('.calendar-container')) {
      setShowCalendar(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showCalendar]);

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <img src="/history.png" alt="History" className="h-16 object-contain" />
        <button
          onClick={() => navigate('/enter-room-code')}
          aria-label="Nhập mã phòng"
          className="room-code-img-link"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          <img
            src="./code.png"
            alt="Nhập mã phòng"
            className="h-12 object-contain block transition-transform duration-150 hover:scale-105"
          />
        </button>
      </div>

      {/* Search + Calendar */}
      <div className="relative calendar-container w-full max-w-md">
        <div className="flex items-center bg-white rounded-full border border-pink-500 shadow px-2">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setSearchQuery(searchName)}
            className="flex-grow bg-transparent px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none rounded-l-full"
          />
          <button
            onClick={() => setSearchQuery(searchName)}
            className="px-3 py-2 text-pink-600 hover:text-pink-800"
            aria-label="Tìm kiếm"
          >
            🔍
          </button>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="px-3 py-2 text-pink-600 hover:text-pink-800"
            aria-label="Chọn ngày"
          >
            📅
          </button>
        </div>

        {/* Calendar Popup */}
        {showCalendar && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-[280px]">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded">◀</button>
              <h3 className="text-lg font-semibold text-gray-800">
                {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
              </h3>
              <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">▶</button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((d) => (
                  <div key={d} className="text-center text-sm text-gray-500 py-2">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: getFirstDayOfMonth(currentMonth) }, (_, i) => (
                  <div key={`empty-${i}`} className="h-8"></div>
                ))}
                {Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => {
                  const day = i + 1;
                  const isSelected =
                    selectedDate &&
                    selectedDate.getDate() === day &&
                    selectedDate.getMonth() === currentMonth.getMonth() &&
                    selectedDate.getFullYear() === currentMonth.getFullYear();
                  const isToday =
                    new Date().getDate() === day &&
                    new Date().getMonth() === currentMonth.getMonth() &&
                    new Date().getFullYear() === currentMonth.getFullYear();
                  return (
                    <button
                      key={day}
                      onClick={() => handleDateSelect(day)}
                      className={`h-8 w-8 rounded-full text-sm transition-colors ${
                        isSelected
                          ? 'bg-pink-500 text-white'
                          : isToday
                          ? 'bg-pink-100 text-pink-600'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 text-center">
              {selectedDate ? (
                <>
                  <p className="text-sm text-gray-600">Ngày đã chọn:</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedDate.toLocaleDateString('vi-VN')}
                  </p>
                </>
              ) : (
                <p className="text-lg font-semibold text-gray-800">Hiển thị tất cả</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Nội dung */}
      {loading ? (
        <p className="text-center text-gray-500">Đang tải...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : Object.keys(historyItems).length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl text-gray-400 mb-2">Chưa có lịch sử</h3>
          <p className="text-gray-500">Hoàn thành bài quiz đầu tiên để xem lịch sử</p>
        </div>
      ) : (
        Object.entries(historyItems).map(([day, items]) => {
          // Convert string dd/mm/yyyy -> Date
          const [d, m, y] = day.split('/');
          const dateObj = new Date(`${y}-${m}-${d}`);
          return (
            <div key={day} className="space-y-4">
              <DateArrow date={dateObj} />
              <PQuizzCard cards={items} />
            </div>
          );
        })
      )}
    </div>
  );
};

export default History;
