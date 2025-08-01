import React, { useState } from 'react'
import { Clock, Trophy, Target, Calendar } from 'lucide-react'
import { mockHistory } from '../data/mockData'
import DateArrow from '../components/DateArrow'
import PQuizzCard from '../components/PQuizzCard'
import { useNavigate } from 'react-router-dom'

const History = () => {
  const historyItems = mockHistory
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const navigate = useNavigate();

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 80) return 'text-yellow-400'
    if (score >= 70) return 'text-orange-400'
    return 'text-red-400'
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'text-green-400 bg-green-400/10'
      case 'intermediate':
        return 'text-yellow-400 bg-yellow-400/10'
      case 'advanced':
        return 'text-red-400 bg-red-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleDateSelect = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    setSelectedDate(newDate)
    setShowCalendar(false)
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  // Close calendar when clicking outside
  const handleClickOutside = (event) => {
    if (showCalendar && !event.target.closest('.calendar-container')) {
      setShowCalendar(false)
    }
  }

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showCalendar])

  return (
    <div className="space-y-6 max-w-full">
      {/* Greeting + Room Code (giống Dashboard) */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img 
            src="/history.png" 
            alt="Greeting" 
            className="h-16 object-contain"
          />
        </div>
        <div className="flex-shrink-0 flex items-center h-12">
          <button 
            onClick={() => navigate('/enter-room-code')}
            aria-label="Nhập mã phòng" 
            className="room-code-img-link"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer'
            }}
          >
            <img 
              src="./code.png" 
              alt="Nhập mã phòng" 
              className="h-12 object-contain block transition-transform duration-150 hover:scale-105" 
            />
          </button>
        </div>
      </div>
      
      {/* Filter */}
      <div className="relative calendar-container">
        <div className="flex items-center justify-between max-w-xs p-1 bg-pink-600 rounded-md">
          <input 
            type="text" 
            placeholder="Tất cả" 
            className="flex-grow bg-white rounded-md px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            aria-label="Bộ lọc tất cả"
          />
          <button 
            onClick={() => setShowCalendar(!showCalendar)}
            aria-label="Chọn ngày" 
            className="ml-2 text-white flex-shrink-0 hover:bg-pink-700 p-1 rounded transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </button>
        </div>

        {/* Calendar Popup */}
        {showCalendar && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-[280px]">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <button 
                onClick={prevMonth}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-lg font-semibold text-gray-800">
                {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
              </h3>
              <button 
                onClick={nextMonth}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Calendar Days */}
            <div className="p-4">
              {/* Week days header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: getFirstDayOfMonth(currentMonth) }, (_, i) => (
                  <div key={`empty-${i}`} className="h-8"></div>
                ))}
                {Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => {
                  const day = i + 1
                  const isSelected = selectedDate.getDate() === day && 
                                   selectedDate.getMonth() === currentMonth.getMonth() && 
                                   selectedDate.getFullYear() === currentMonth.getFullYear()
                  const isToday = new Date().getDate() === day && 
                                 new Date().getMonth() === currentMonth.getMonth() && 
                                 new Date().getFullYear() === currentMonth.getFullYear()
                  
                  return (
                    <button
                      key={day}
                      onClick={() => handleDateSelect(day)}
                      className={`h-8 w-8 rounded-full text-sm font-medium transition-colors ${
                        isSelected 
                          ? 'bg-pink-500 text-white' 
                          : isToday 
                            ? 'bg-pink-100 text-pink-600' 
                            : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Selected date display */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-center">
                <p className="text-sm text-gray-600">Ngày đã chọn:</p>
                <p className="text-lg font-semibold text-gray-800">{formatDate(selectedDate)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Date Arrow Component */}
      <DateArrow date={selectedDate} />
      
      {/* PQuizz Cards Grid */}
      <PQuizzCard 
        cards={[
          {
            topic: "Tiếng Nhật",
            description: "Từ vựng Mina no Nihongo bài 25 - Học các từ vựng cơ bản về gia đình và công việc",
            questionCount: 15,
            dateTime: "19h30, 10/07/2025",
            onViewDetails: () => navigate('/history-detail'),
            onDelete: () => console.log('Xóa'),
            isDeletable: true
          },
          {
            topic: "Toán học",
            description: "Đại số cơ bản lớp 10 - Phương trình bậc hai và định lý Vi-et",
            questionCount: 12,
            dateTime: "20h00, 12/07/2025",
            onViewDetails: () => navigate('/history-detail'),
            onDelete: () => console.log('Xóa 2'),
            isDeletable: true
          },
          {
            topic: "Tiếng Anh",
            description: "Grammar Intermediate - Present Perfect và Past Perfect tenses",
            questionCount: 18,
            dateTime: "21h00, 14/07/2025",
            onViewDetails: () => navigate('/history-detail'),
            onDelete: () => console.log('Xóa 3'),
            isDeletable: true
          }
        ]}
      />
      
      {/* Date Arrow Component 2 */}
      <DateArrow date={new Date('2025-07-15')} />
      
      {/* PQuizz Cards Grid 2 */}
      <PQuizzCard 
        cards={[
          {
            topic: "Vật lý",
            description: "Cơ học lượng tử - Nguyên lý bất định Heisenberg và hàm sóng",
            questionCount: 8,
            dateTime: "22h30, 16/07/2025",
            onViewDetails: () => navigate('/history-detail'),
            onDelete: () => console.log('Xóa 4'),
            isDeletable: true
          },
          {
            topic: "Hóa học",
            description: "Bảng tuần hoàn và liên kết hóa học - Cấu trúc electron",
            questionCount: 22,
            dateTime: "23h00, 18/07/2025",
            onViewDetails: () => navigate('/history-detail'),
            onDelete: () => console.log('Xóa 5'),
            isDeletable: true
          }
        ]}
      />
      
      {historyItems.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-400 mb-2">Chưa có lịch sử</h3>
          <p className="text-gray-500">Hoàn thành bài quiz đầu tiên để xem lịch sử</p>
        </div>
      )}
    </div>
  )
}

export default History 