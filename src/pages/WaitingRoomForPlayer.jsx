import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SupportCard from "../components/SupportCard";
import Chat from "../components/Chat"

const AVAILABLE_AVATARS = [
  "/avatar/avatar_1.png",
  "/avatar/avatar_2.png",
  "/avatar/avatar_3.png",
  "/avatar/avatar_4.png",
  "/avatar/avatar_5.png",
  "/avatar/avatar_6.png",
  "/avatar/avatar_7.png",
];

// Mapping từ backend enum sang UI object
const SUPPORT_CARD_MAPPING = {
  'HIDE_ANSWER': { 
    name: "50:50", 
    detail: "Loại bỏ 2 đáp án sai, tăng xác suất lựa chọn đúng", 
    icon: "/public/btn_50_50.png", 
    bgColor: "#FFE2CC", 
    borderColor: "#FF6D00" 
  },
  'DOUBLE_SCORE': { 
    name: "Nhân đôi điểm", 
    detail: "Nếu trả lời đúng, bạn nhận gấp đôi điểm ở câu này", 
    icon: "/public/btn_x2.png", 
    bgColor: "#E0E0ED", 
    borderColor: "#B1B1F2" 
  },
  'RETRY_ANSWER': { 
    name: "Thử lại", 
    detail: "Phao cứu sinh cho pha chọn sai, cho phép chọn lại nếu lần đầu chọn sai", 
    icon: "/public/btn_double try.png", 
    bgColor: "#EFE8C9", 
    borderColor: "#FAD63D" 
  }
};

// Hàm chuyển đổi từ backend enum sang UI object
const convertBackendCardsToUI = (backendCards) => {
  return backendCards.map(cardType => SUPPORT_CARD_MAPPING[cardType] || {
    name: "Thẻ không xác định",
    detail: "Thẻ này không có thông tin",
    icon: "/alert_icon.png",
    bgColor: "#F0F0F0",
    borderColor: "#999999"
  });
};



const WaitingRoomForPlayer = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  // States cho dữ liệu từ API
  const [roomData, setRoomData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // States cho UI
  const [avatar, setAvatar] = useState("/avatar/avatar_1.png");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef(null);
  const buttonRef = useRef(null);
  const hasFetchedInitialCards = useRef(false);
  const [supportPair, setSupportPair] = useState([]);
  const [swapCount, setSwapCount] = useState(0);
  const [maxSwapCount] = useState(3); // Giới hạn từ backend

  // Load dữ liệu từ localStorage và API
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        
        // Lấy thông tin user từ localStorage
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        console.log('=== WAITING ROOM INIT ===');
        console.log('Room ID from URL params:', roomId);
        console.log('Current room in localStorage:', localStorage.getItem('currentRoom'));
        console.log('Room ID in localStorage:', localStorage.getItem('roomId'));
        console.log('ClientSessionId in localStorage:', localStorage.getItem('clientSessionId'));
        
        if (!token || !userStr) {
          setError('Vui lòng đăng nhập lại');
          navigate('/login');
          return;
        }
        
        const user = JSON.parse(userStr);
        
        // Lấy clientSessionId từ localStorage nếu có
        const clientSessionId = localStorage.getItem('clientSessionId');
        console.log('ClientSessionId từ localStorage:', clientSessionId);
        if (clientSessionId) {
          user.clientSessionId = clientSessionId;
          console.log('ClientSessionId loaded from localStorage:', clientSessionId);
        } else {
          console.log('Không tìm thấy clientSessionId trong localStorage');
        }
        
        setUserData(user);
        setAvatar(user.avatar || "/avatar/avatar_1.png");
        
        // Validate roomId
        if (!roomId) {
          setError('Room ID không hợp lệ');
          return;
        }
        
        // Fetch room data và participants
        await Promise.all([
          fetchRoomData(token),
          fetchParticipants(token)
        ]);
        
      } catch (error) {
        console.error('Error initializing data:', error);
        setError('Không thể tải dữ liệu phòng');
      } finally {
        setLoading(false);
      }
    };
    
    initData();
    
    // Poll participants mỗi 3 giây
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token && !error) {
        fetchParticipants(token);
      }
    }, 3000);

    // Poll room status mỗi 5 giây để kiểm tra game đã bắt đầu chưa
    const roomStatusInterval = setInterval(async () => {
      // Dừng polling nếu room đã bắt đầu
      if (roomStarted) {
        console.log('Room already started, stopping status polling');
        return;
      }

      const token = localStorage.getItem('token');
      if (token && !error && roomId) {
        try {
          // Sử dụng API có sẵn để kiểm tra room status
          const response = await fetch(`http://localhost:8080/rooms/${roomId}/qrcode`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const roomData = await response.json();
            console.log('Room status check:', roomData);
            
            // Kiểm tra xem phòng có bị lock không (đã bắt đầu game)
            if (roomData.locked || roomData.startedAt) {
              console.log('Room has started or locked! Redirecting to game...');
              setRoomStarted(true);
              navigate(`/player-game/${roomId}`);
            }
          } else if (response.status === 403) {
            // Phòng có thể đã bắt đầu hoặc user không có quyền
            console.log('Room access forbidden - might be started');
            setRoomStarted(true);
            // Thử redirect đến game screen
            navigate(`/player-game/${roomId}`);
          }
        } catch (error) {
          console.error('Error checking room status:', error);
        }
      }
    }, 5000); // Tăng interval lên 5 giây để giảm spam
    
    return () => {
      clearInterval(interval);
      clearInterval(roomStatusInterval);
    };
  }, [roomId, navigate, error]);

  // WebSocket connection để nhận real-time updates
  useEffect(() => {
    if (!roomId) return;

    console.log('Setting up WebSocket connection for room:', roomId);
    
    // Sử dụng SockJS thay vì native WebSocket
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = Stomp.over(socket);
    
    // Disable STOMP debug logging
    stompClient.debug = null;
    
    stompClient.connect({}, (frame) => {
      console.log('STOMP connected for room:', roomId, frame);
      
      // Subscribe vào topic của phòng
      stompClient.subscribe(`/topic/room/${roomId}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log('STOMP message received:', data);
          
          // Kiểm tra xem có phải game start message không
          // Backend gửi question data khi game bắt đầu
          if (data.id && (data.answerA || data.answerB || data.answerC || data.answerD)) {
            console.log('Game started! Question received:', data.id);
            console.log('Question data:', data);
            
            // Lưu question data vào localStorage trước khi redirect
            localStorage.setItem('currentQuestionData', JSON.stringify(data));
            localStorage.setItem('gameStarted', 'true');
            
            console.log('Question data saved to localStorage, redirecting to game screen...');
            // Chuyển đến game screen
            navigate(`/player-game/${roomId}`);
            return; // Dừng xử lý tiếp
          }
          
          // Fallback: Kiểm tra các trường khác
          if (data.questionId || data.isQuestionLast !== undefined) {
            console.log('Game started! Alternative fields detected');
            console.log('Redirecting to game screen...');
            navigate(`/player-game/${roomId}`);
            return;
          }
        } catch (error) {
          console.error('Error parsing STOMP message:', error);
        }
      });
      
      console.log('Subscribed to /topic/room/' + roomId);
    }, (error) => {
      console.error('STOMP connection error:', error);
      console.log('Falling back to polling mechanism');
    });
    
    // Cleanup khi component unmount
    return () => {
      console.log('Cleaning up STOMP connection');
      if (stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, [roomId, navigate]);

  // Fallback: Kiểm tra WebSocket connection status
  useEffect(() => {
    if (!roomId) return;
    
    // Kiểm tra xem WebSocket có hoạt động không
    const checkWebSocketStatus = () => {
      if (typeof SockJS === 'undefined' || typeof Stomp === 'undefined') {
        console.warn('SockJS or STOMP not loaded, using polling only');
        return false;
      }
      return true;
    };
    
    // Kiểm tra sau 2 giây
    const timeout = setTimeout(() => {
      if (!checkWebSocketStatus()) {
        console.log('WebSocket not available, relying on polling mechanism');
      }
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [roomId]);

  // State để track room status
  const [roomStarted, setRoomStarted] = useState(false);
  
  // Fetch room data (pin code, QR code)
  const fetchRoomData = async (token) => {
    try {
      const response = await fetch(`http://localhost:8080/rooms/${roomId}/qrcode`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Room data response:', data);
        setRoomData(data);
        
        // Sau khi có roomData, gọi fetchSupportCards nếu có clientSessionId
        const clientSessionId = localStorage.getItem('clientSessionId');
        console.log('ClientSessionId khi gọi fetchSupportCards:', clientSessionId);
        console.log('PinCode từ response:', data.pinCode);
        
        if (clientSessionId && data.pinCode && !hasFetchedInitialCards.current) {
          console.log('Có đủ dữ liệu, gọi fetchSupportCards lần đầu');
          hasFetchedInitialCards.current = true;
          try {
            await fetchSupportCardsWithData(token, data.pinCode, clientSessionId);
            // Cập nhật số lượt đã sử dụng sau khi gọi thành công
            setSwapCount(1);
            console.log('Đã sử dụng 1 lượt xáo trộn ban đầu');
          } catch (error) {
            console.error('Lỗi khi lấy support cards lần đầu:', error);
            // Reset flag nếu lỗi để có thể thử lại
            hasFetchedInitialCards.current = false;
          }
        } else {
          console.log('Bỏ qua fetchSupportCards:', {
            clientSessionId: !!clientSessionId,
            pinCode: !!data.pinCode,
            alreadyFetched: hasFetchedInitialCards.current
          });
        }
      } else if (response.status === 404) {
        // Phòng không tồn tại (có thể đã bị xóa)
        setError('Phòng này không tồn tại hoặc đã bị xóa');
        setLoading(false);
      } else if (response.status === 403) {
        setError('Phòng này không tồn tại hoặc đã bị xóa');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching room data:', error);
      setError('Không thể kết nối đến phòng');
      setLoading(false);
    }
  };
  


  // Fetch participants
  const fetchParticipants = async (token) => {
    try {
      const response = await fetch(`http://localhost:8080/rooms/participants?roomId=${roomId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setParticipants(data);
      } else if (response.status === 404) {
        // Phòng không tồn tại (có thể đã bị xóa)
        setError('Phòng này không tồn tại hoặc đã bị xóa');
        setLoading(false);
      } else {
        console.error('Error fetching participants:', response.status);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  // Fetch support cards từ backend với dữ liệu cụ thể
  const fetchSupportCardsWithData = async (token, pinCode, clientSessionId) => {
    try {
      console.log('Debug fetchSupportCardsWithData:', {
        pinCode: pinCode || 'Không có',
        clientSessionId: clientSessionId || 'Không có',
        token: token ? 'Có' : 'Không có'
      });
      
      const requestBody = { clientSessionId: clientSessionId };
      console.log('Request body gửi lên API:', requestBody);
      console.log('API endpoint:', `http://localhost:8080/${pinCode}/support-card/random`);
      
      const response = await fetch(`http://localhost:8080/${pinCode}/support-card/random`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const backendCards = await response.json();
        console.log('Support cards từ backend:', backendCards);
        
        // Chuyển đổi từ backend enum sang UI object
        const uiCards = convertBackendCardsToUI(backendCards);
        setSupportPair(uiCards);
        
        // Lưu support cards vào localStorage để PlayerGame sử dụng
        localStorage.setItem('currentSupportCards', JSON.stringify(uiCards));
        console.log('💾 Đã lưu support cards vào localStorage cho PlayerGame');
      } else {
        // Log chi tiết lỗi
        let errorMessage = '';
        try {
          const errorData = await response.text();
          errorMessage = errorData;
          console.error('Error response body:', errorData);
        } catch (e) {
          console.error('Không thể đọc error response');
        }
        
        console.error('Lỗi khi lấy support cards:', response.status, errorMessage);
        throw new Error(`API Error: ${response.status} - ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error fetching support cards:', error);
      throw error;
    }
  };

  // Fetch support cards từ backend (sử dụng state hiện tại)
  const fetchSupportCards = async (token) => {
    const clientSessionId = localStorage.getItem('clientSessionId');
    
    if (!roomData?.pinCode || !clientSessionId) {
      console.log('Chưa có pinCode hoặc clientSessionId, bỏ qua fetch support cards');
      return;
    }

    return await fetchSupportCardsWithData(token, roomData.pinCode, clientSessionId);
  };



  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsPopupOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const togglePopup = () => setIsPopupOpen((prev) => !prev);
  const selectAvatar = (src) => {
    setAvatar(src);
    setIsPopupOpen(false);
  };
  const swapSupport = async () => {
    if (swapCount >= maxSwapCount) {
      console.log('Đã đạt giới hạn số lần xáo trộn');
      return;
    }

    const token = localStorage.getItem('token');
    const clientSessionId = localStorage.getItem('clientSessionId');
    
    console.log('Debug swapSupport:', {
      token: token ? 'Có' : 'Không có',
      clientSessionId: clientSessionId ? 'Có' : 'Không có',
      roomData: roomData ? 'Có' : 'Không có',
      pinCode: roomData?.pinCode || 'Không có',
      swapCount,
      maxSwapCount
    });
    
    if (!token || !clientSessionId || !roomData?.pinCode) {
      console.error('Không có đủ dữ liệu để gọi API xáo trộn thẻ');
      return;
    }

    try {
      await fetchSupportCards(token);
      setSwapCount(prev => prev + 1);
    } catch (error) {
      console.error('Lỗi khi xáo trộn thẻ:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-[calc(100vh-56px)] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--pink)]"></div>
        <p className="mt-4 text-white">Đang tải thông tin phòng...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4">
        <div className="bg-red-100 border border-red-300 text-red-700 px-6 py-4 rounded-lg text-center max-w-md">
          <div className="mb-3">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Phòng không khả dụng</h3>
          <p className="text-sm mb-4">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-[var(--pink)] text-white rounded-lg hover:bg-opacity-80 transition-colors"
            >
              Về trang chủ
            </button>
            <button
              onClick={() => navigate('/enter-room-code')}
              className="px-4 py-2 border border-[var(--pink)] text-[var(--pink)] rounded-lg hover:bg-[var(--pink)] hover:text-white transition-colors"
            >
              Tham gia phòng khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col items-center pt-8 px-4 font-content space-y-6">
      {/* Mã tham gia */}
      <div className="bg-white border-2 border-[var(--pink)] rounded-lg px-4 py-2 text-black text-2xl font-base text-center font-content">
        {roomData?.pinCode || 'Loading...'}
      </div>

      {/* Panel bao quanh */}
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-[0_0_30px_var(--shadow-pink)] p-6">
        {/* Row tên và avatar */}
        <div className="w-full flex flex-col sm:flex-row gap-4 relative">
          <div className="flex-1 bg-[var(--pink)] rounded-[10px] p-6 flex items-center justify-start">
            <span className="text-lg text-white font-content font-medium">
              {userData?.firstname || userData?.username || 'Player'}
            </span>
          </div>
          <div className="relative bg-[var(--pink)] rounded-[10px] p-6 w-40 h-32 flex-shrink-0">
            <img
              src={avatar}
              alt="Avatar"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-auto"
            />
            <button
              ref={buttonRef}
              onClick={togglePopup}
              className="absolute top-0 right-0 p-2 rounded-md focus:outline-none bg-white bg-opacity-75 hover:bg-opacity-60 transition-colors"
            >
              <img src="/edit_icon.png" alt="Edit icon" className="w-4 h-4 object-contain" />
            </button>
            {isPopupOpen && (
              <div
                ref={popupRef}
                className="absolute top-0 right-0 mt-10 bg-white border border-gray-200 rounded-sm shadow-lg z-10 p-2 grid grid-cols-4 gap-2"
              >
                {AVAILABLE_AVATARS.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt="avatar option"
                    className="w-12 h-auto cursor-pointer rounded-lg hover:ring-2 hover:ring-[var(--pink)]"
                    onClick={() => selectAvatar(src)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row Chế độ trợ giúp */}
        <div className="w-full flex justify-between items-center px-2 py-6 bg-white">
          <span className="text-base text-black font-content">Chế độ trợ giúp</span>
          <div className="flex items-center gap-2">
            <img
              src="/alert_icon.png"
              alt="Alert icon"
              className="w-5 h-5 object-contain"
            />
            <span className="text-sm text-black font-content">
              Còn {maxSwapCount - swapCount} lượt xáo trộn
            </span>
          </div>
        </div>

        {/* Row SupportCard + Swap */}
        <div className="w-full flex items-center justify-start gap-4">
          {supportPair.length >= 2 ? (
            <>
              <SupportCard {...supportPair[0]} />
              <SupportCard {...supportPair[1]} />
            </>
          ) : (
            <div className="flex gap-4">
              <div className="w-28 h-32 border rounded-lg bg-gray-200 animate-pulse"></div>
              <div className="w-28 h-32 border rounded-lg bg-gray-200 animate-pulse"></div>
            </div>
          )}
          <button
            onClick={swapSupport}
            disabled={swapCount >= maxSwapCount}
            className={`w-28 h-32 flex flex-col items-center justify-center p-4 border rounded-lg transition-transform ease-in-out ${
              swapCount >= maxSwapCount 
                ? 'bg-gray-300 border-gray-400 cursor-not-allowed' 
                : 'bg-[#F6E6E4] border-[#D48479] hover:shadow-lg hover:scale-105'
            }`}
          >
            <img src="/swap_icon.png" alt="Swap" className="w-6 h-6 object-contain" />
            <div className="mt-2 text-black text-sm font-content">
              Xáo trộn
            </div>
          </button>
        </div>
        
        {/* Hiển thị số lượng người chơi */}
        <div className="w-full bg-gray-50 rounded-lg p-4 mt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Người chơi ({participants.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {participants.map((participant, index) => (
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
            ))}
          </div>
        </div>
      </div>

      <div className="text-white text-center mt-10 text-base font-content">
        Đang chờ người điều khiển bắt đầu...
      </div>
      
      {/* Debug button - chỉ hiển thị trong development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-white text-lg mb-2">Debug Info</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <div>Token: {localStorage.getItem('token') ? 'Có' : 'Không có'}</div>
            <div>ClientSessionId: {localStorage.getItem('clientSessionId') || 'Không có'}</div>
            <div>RoomData: {roomData ? 'Có' : 'Không có'}</div>
            <div>PinCode: {roomData?.pinCode || 'Không có'}</div>
            <div>UserData: {userData ? 'Có' : 'Không có'}</div>
            <div>User ClientSessionId: {userData?.clientSessionId || 'Không có'}</div>
          </div>
          <button 
            onClick={() => {
              console.log('=== DEBUG INFO ===');
              console.log('localStorage:', {
                token: localStorage.getItem('token') ? 'Có' : 'Không có',
                clientSessionId: localStorage.getItem('clientSessionId'),
                currentRoom: localStorage.getItem('currentRoom'),
                roomId: localStorage.getItem('roomId')
              });
              console.log('State:', {
                roomData,
                userData,
                supportPair,
                swapCount
              });
            }}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Log Debug Info
          </button>
          
          <button 
            onClick={async () => {
              console.log('=== TEST API SUPPORT CARDS ===');
              const token = localStorage.getItem('token');
              const clientSessionId = localStorage.getItem('clientSessionId');
              const pinCode = roomData?.pinCode;
              
              if (!token || !clientSessionId || !pinCode) {
                console.log('Thiếu dữ liệu để test API');
                return;
              }
              
              try {
                const testResponse = await fetch(`http://localhost:8080/${pinCode}/support-card/random`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ clientSessionId })
                });
                
                console.log('Test API response status:', testResponse.status);
                if (testResponse.ok) {
                  const data = await testResponse.json();
                  console.log('Test API success:', data);
                } else {
                  const errorText = await testResponse.text();
                  console.log('Test API error:', errorText);
                }
              } catch (error) {
                console.error('Test API exception:', error);
              }
            }}
            className="mt-2 ml-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Test API Support Cards
          </button>
          
          <button 
            onClick={async () => {
              console.log('=== CHECK ROOM STATUS ===');
              const token = localStorage.getItem('token');
              const pinCode = roomData?.pinCode;
              
              if (!token || !pinCode) {
                console.log('Thiếu dữ liệu để check room status');
                return;
              }
              
              try {
                // Kiểm tra xem phòng có bị lock không
                const lockResponse = await fetch(`http://localhost:8080/${pinCode}/support-card/random`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ clientSessionId: 'test' })
                });
                
                console.log('Lock check response status:', lockResponse.status);
                if (lockResponse.status === 403) {
                  console.log('Phòng đã bị lock (đã bắt đầu game)');
                } else if (lockResponse.status === 400) {
                  const errorText = await lockResponse.text();
                  console.log('Lock check error (400):', errorText);
                } else {
                  console.log('Phòng chưa bị lock');
                }
              } catch (error) {
                console.error('Lock check exception:', error);
              }
            }}
            className="mt-2 ml-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Check Room Lock Status
          </button>
        </div>
      )}
      

      <div className="w-full max-w-3xl mx-auto">
        <Chat />
      </div>

    </div>
  );
};

export default WaitingRoomForPlayer;