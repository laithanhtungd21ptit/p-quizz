import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Chat from "../components/Chat"

const WaitingRoomForController = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const websiteRef = useRef(null);
  const codeRef = useRef(null);
  
  // State cho room data
  const [roomData, setRoomData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState(null); // "website" | "code" | null

  const handleCopy = (ref, field) => {
    if (ref.current) {
      const text = ref.current.innerText;
      navigator.clipboard.writeText(text).then(() => {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000); // 2s ẩn
      });
    }
  };

  // Lấy thông tin phòng
  const fetchRoomData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Bạn cần đăng nhập để xem phòng');
        navigate('/login');
        return;
      }

      // Lấy QR code và pin code của phòng  
      const response = await fetch(`http://localhost:8080/rooms/${roomId}/qrcode`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoomData(data);
        console.log('Room data:', data);
      } else {
        console.error('Error fetching room data:', response.status);
        if (response.status === 403) {
          setError('Không có quyền truy cập phòng này');
        } else if (response.status === 404) {
          setError('Phòng không tồn tại');
        } else {
          setError('Không thể lấy thông tin phòng');
        }
      }
    } catch (error) {
      console.error('Error fetching room data:', error);
      setError('Lỗi kết nối khi lấy thông tin phòng');
    }
  };

  // Lấy danh sách participants
  const fetchParticipants = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:8080/rooms/participants?roomId=${roomId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Participants raw data:', data);
        console.log('First participant structure:', data[0]);
        console.log('First participant avatar:', data[0]?.avatar);
        console.log('First participant keys:', Object.keys(data[0] || {}));
        
        setParticipants(data);
      } else {
        console.error('Error fetching participants:', response.status);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  // Bắt đầu game
  const handleStart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Bạn cần đăng nhập để bắt đầu game');
        return;
      }

      const response = await fetch(`http://localhost:8080/rooms/start/${roomId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const participants = await response.json();
        console.log('Game started, participants:', participants);
        // Chuyển đến trang play room
        navigate(`/play-room-for-controller/${roomId}`);
      } else {
        const errorData = await response.text();
        setError(errorData || 'Không thể bắt đầu game');
      }
    } catch (error) {
      console.error('Error starting game:', error);
      setError('Lỗi kết nối khi bắt đầu game');
    }
  };

  // Load data khi component mount
  useEffect(() => {
    console.log('WaitingRoom roomId from params:', roomId);
    if (!roomId || roomId === 'undefined') {
      setError('Room ID không hợp lệ');
      navigate('/dashboard');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      // Load participants trước, QR code không critical
      await fetchParticipants();
      // QR code có thể fail, nhưng không block UI
      try {
        await fetchRoomData();
      } catch (error) {
        console.warn('Failed to load room data, continuing without QR code');
      }
      setLoading(false);
    };

    loadData();

    // Poll participants mỗi 3 giây
    const interval = setInterval(fetchParticipants, 3000);
    
    return () => clearInterval(interval);
  }, [roomId]);

  // Hiển thị loading
  if (loading) {
    return (
      <div className="h-[calc(100vh-56px)] flex flex-col items-center justify-center font-content">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--pink)] mx-auto mb-4"></div>
          <p className="text-black text-lg">Đang tải thông tin phòng...</p>
        </div>
      </div>
    );
  }

  // Hiển thị error
  if (error) {
    return (
      <div className="h-[calc(100vh-56px)] flex flex-col items-center justify-center font-content">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-[var(--pink)] text-white px-6 py-2 rounded-lg hover:opacity-80"
          >
            Quay về Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col items-center pt-8 px-4 font-content space-y-6">
      {/* Tiêu đề */}
      <h1 className="text-[var(--pink)] text-5xl md:text-7xl font-title font-bold text-center mb-8">
        P-QUIZZ
      </h1>

      {/* Card chứa Steps + QR */}
      <div className="w-full max-w-2xl bg-[var(--white)] border-4 border-[var(--pink)] shadow-[0_0_30px_var(--shadow-pink)] rounded-lg overflow-hidden">
        <div className="flex items-center gap-x-4">
          {/* Steps */}
          <div className="flex-1 space-y-6 pl-4">
            {/* Step 1 */}
            <div className="flex items-center relative">
              <div className="flex-shrink-0 flex items-center justify-center bg-[var(--pink)] rounded-full w-9 h-9">
                <span className="text-white font-medium">1</span>
              </div>
              <div className="flex-1 flex items-center justify-between bg-gray-100 border border-[var(--pink)] rounded-md px-4 py-2 ml-4 relative">
                <div className="flex items-center space-x-2 whitespace-nowrap leading-tight">
                  <span className="text-gray-500 text-base font-content">Truy cập</span>
                  <span ref={websiteRef} className="text-black text-lg font-content">pquizz.com</span>
                </div>
                <div className="relative flex items-center">
                  {copiedField === "website" && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm bg-gray-100 text-black px-2 py-0.5 rounded shadow whitespace-nowrap">
                      Đã sao chép
                    </div>
                  )}
                  <button
                    className="flex-shrink-0 px-2 focus:outline-none"
                    onClick={() => handleCopy(websiteRef, "website")}
                  >
                    <img src="/copy_icon.png" alt="Copy" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center relative">
              <div className="flex-shrink-0 flex items-center justify-center bg-[var(--pink)] rounded-full w-9 h-9">
                <span className="text-white font-medium">2</span>
              </div>
              <div className="flex-1 flex items-center justify-between bg-gray-100 border border-[var(--pink)] rounded-md px-4 py-2 ml-4 relative">
                <div className="flex items-center space-x-2 whitespace-nowrap leading-tight">
                  <span className="text-gray-500 text-base font-content">Nhập mã tham gia</span>
                  <span ref={codeRef} className="text-black text-lg font-content">
                    {roomData?.pinCode || 'Loading...'}
                  </span>
                </div>
                <div className="relative flex items-center">
                  {copiedField === "code" && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm bg-gray-100 text-black px-2 py-0.5 rounded shadow whitespace-nowrap">
                      Đã sao chép
                    </div>
                  )}
                  <button
                    className="flex-shrink-0 px-2 focus:outline-none"
                    onClick={() => handleCopy(codeRef, "code")}
                  >
                    <img src="/copy_icon.png" alt="Copy" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex-shrink-0 flex justify-end">
            {roomData?.qrCodeUrl ? (
              <img
                src={roomData.qrCodeUrl}
                alt="QR Code"
                className="w-44 h-44 object-cover"
              />
            ) : (
              <div className="w-44 h-44 bg-gray-200 flex items-center justify-center rounded">
                <span className="text-gray-500 text-sm">Loading QR...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nút Bắt đầu */}
      <button
        onClick={handleStart}
        className="mt-6 px-4 py-2 bg-[var(--pink)] rounded-lg text-white text-sm font-content font-semibold hover:shadow-lg hover:scale-105 transition-transform ease-in-out"
      >
        Bắt đầu
      </button>

      {/* Div chờ người tham gia */}
      <div className="mt-4 flex items-center bg-white rounded-lg px-4 py-2 shadow">
        <img
          src="/users_icon.png"
          alt="Users"
          className="w-6 h-6 object-contain mr-3"
        />
        <span className="text-black text-sm font-content">
          {participants.length > 0 
            ? `${participants.length} người tham gia` 
            : 'Đang chờ người tham gia...'
          }
        </span>
      </div>
      
      {/* Participants từ API */}
      {participants.length > 0 && (
        <div className="mt-6 w-full flex flex-col items-center space-y-6">
          {/* Render participants trong grid responsive */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-4xl">
            {participants.map((participant, index) => {
              console.log('Rendering participant:', {
                index: index,
                participant: participant,
                avatar: participant.avatar,
                firstname: participant.firstname,
                name: participant.name
              });
              
              return (
                <div
                  key={participant.id || index}
                  className="flex items-center space-x-2 bg-white rounded-lg p-2 border"
                >
                  <img
                    src={participant.avatar || '/avatar/avatar_1.png'}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {participant.firstname || participant.username || 'Player'}
                    </p>
                    {participant.isHost && (
                      <span className="text-xs text-[var(--pink)] font-semibold">
                        Host ⭐
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}         

      <div className="w-full max-w-3xl mx-auto">
        <Chat />
      </div>

    </div>
  );
};

export default WaitingRoomForController;
