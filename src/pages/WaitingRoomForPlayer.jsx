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
        

        
        if (!token || !userStr) {
          setError('Vui lòng đăng nhập lại');
          navigate('/login');
          return;
        }
        
        const user = JSON.parse(userStr);
        
        // ✅ CHUẨN HÓA: Lấy clientSessionId từ currentRoom nếu có
        const currentRoom = localStorage.getItem('currentRoom');
        if (currentRoom) {
          const roomData = JSON.parse(currentRoom);
          if (roomData.clientSessionId) {
            user.clientSessionId = roomData.clientSessionId;
          }
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
    
    // ✅ KHÔNG CẦN POLLING NỮA - WebSocket real-time participants updates
    // const interval = setInterval(() => {
    //   const token = localStorage.getItem('token');
    //   if (token && !error) {
    //     fetchParticipants(token);
    //   }
    // }, 10000);

    // Poll room status mỗi 5 giây để kiểm tra game đã bắt đầu chưa
    const roomStatusInterval = setInterval(async () => {
      // Dừng polling nếu room đã bắt đầu
      if (roomStarted) {
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
            
            // Kiểm tra xem phòng có bị lock không (đã bắt đầu game)
            if (roomData.locked || roomData.startedAt) {
              setRoomStarted(true);
              navigate(`/player-game/${roomId}`);
            }
          } else if (response.status === 403) {
            // Phòng có thể đã bắt đầu hoặc user không có quyền
            setRoomStarted(true);
            navigate(`/player-game/${roomId}`);
          }
        } catch (error) {
          // Bỏ qua lỗi khi check room status
        }
      }
    }, 5000); // Tăng interval lên 5 giây để giảm spam
    
    return () => {
      // clearInterval(interval); // Không cần vì không có polling nữa
      clearInterval(roomStatusInterval);
    };
  }, [roomId, navigate, error]);


  // Setup unified WebSocket để nhận cả participants updates và game start detection
  const setupUnifiedWebSocket = () => {
    console.log('🔌 Player setup unified WebSocket...');
    
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = Stomp.over(socket);
    stompClient.debug = null;
    
    const currentRoom = localStorage.getItem('currentRoom');
    let connectHeaders = {};
    
    // ✅ CHUẨN HÓA: Lấy cả clientSessionId và pinCode từ currentRoom
    if (currentRoom) {
      const roomData = JSON.parse(currentRoom);
      if (roomData.clientSessionId) {
        connectHeaders.clientSessionId = roomData.clientSessionId;
      }
      if (roomData.pinCode) {
        connectHeaders.pinCode = roomData.pinCode;
      }
    }
    
    console.log('🔌 Player connecting unified WebSocket with headers:', connectHeaders);
    
    stompClient.connect(connectHeaders, (frame) => {
      console.log('✅ Player Unified WebSocket connected!');
      const currentRoom = localStorage.getItem('currentRoom');
      const actualRoomId = currentRoom ? JSON.parse(currentRoom).roomId : roomId;
      const topicPath = `/topic/room/${actualRoomId}`;
      
      console.log('🔌 Player Current room data:', currentRoom ? JSON.parse(currentRoom) : null);
      
      stompClient.subscribe(topicPath, (message) => {
        try {
          const timestamp = new Date().toISOString();
          const data = JSON.parse(message.body);
          console.log(`📨 [${timestamp}] Player unified WebSocket nhận được message:`, message.body);
          
          // Case 1: Participants update (ưu tiên xử lý trước)
          if (Array.isArray(data) && data.length > 0 && data[0].id && data[0].firstname) {
            console.log('👥 Player nhận được participants update từ unified WebSocket:', data);
            setParticipants(data);
            
            // Cập nhật participants trong localStorage
            const currentRoomStr = localStorage.getItem('currentRoom');
            if (currentRoomStr) {
              const currentRoom = JSON.parse(currentRoomStr);
              currentRoom.participants = data;
              localStorage.setItem('currentRoom', JSON.stringify(currentRoom));
              console.log('✅ Player đã cập nhật participants trong localStorage via unified WebSocket');
            }
            return;
          }
          
          // Case 2: Backend gửi question data trực tiếp (game start)
          if (data.id && (data.answerA || data.answerB || data.answerC || data.answerD)) {
            console.log('🎯 Player nhận được câu hỏi đầu tiên:', {
              questionId: data.id,
              content: data.content,
              description: data.description,
              answerA: data.answerA,
              answerB: data.answerB,
              answerC: data.answerC,
              answerD: data.answerD,
              limitedTime: data.limitedTime,
              fullData: data
            });
            localStorage.setItem('currentQuestionData', JSON.stringify(data));
            localStorage.setItem('gameStarted', 'true');
            console.log('🚀 Player navigating to player-game...');
            navigate(`/player-game/${roomId}`);
            return;
          }
          
          // Case 3: Backend gửi message với type NEXT_QUESTION
          if (data.type === 'NEXT_QUESTION' && data.data) {
            console.log('🎯 Player nhận được NEXT_QUESTION:', {
              type: data.type,
              questionData: data.data,
              fullMessage: data
            });
            localStorage.setItem('currentQuestionData', JSON.stringify(data.data));
            localStorage.setItem('gameStarted', 'true');
            console.log('🚀 Player navigating to player-game (NEXT_QUESTION)...');
            navigate(`/player-game/${roomId}`);
            return;
          }
          
          // Case 4: Backend gửi game start signal
          if (data.type === 'GAME_START' || data.gameStarted === true) {
            console.log('🎯 Player nhận được GAME_START signal:', {
              type: data.type,
              gameStarted: data.gameStarted,
              fullMessage: data
            });
            console.log('🚀 Player navigating to player-game (GAME_START)...');
            navigate(`/player-game/${roomId}`);
            return;
          }
          
          // Case 5: Backend gửi message có content và description (question format khác)
          if (data.id && (data.content || data.description)) {
            console.log('🎯 Player nhận được question với content:', {
              questionId: data.id,
              content: data.content,
              description: data.description,
              hasAnswers: !!(data.answerA || data.answerB || data.answerC || data.answerD),
              fullData: data
            });
            localStorage.setItem('currentQuestionData', JSON.stringify(data));
            localStorage.setItem('gameStarted', 'true');
            console.log('🚀 Player navigating to player-game (content/description)...');
            navigate(`/player-game/${roomId}`);
            return;
          }
          
          // Case 6: Fallback - Kiểm tra các trường khác
          if (data.questionId || data.isQuestionLast !== undefined) {
            console.log('🎯 Player fallback detection:', {
              questionId: data.questionId,
              isQuestionLast: data.isQuestionLast,
              fullMessage: data
            });
            console.log('🚀 Player navigating to player-game (fallback)...');
            navigate(`/player-game/${roomId}`);
            return;
          }
          
          console.log('📝 Player unified message không xử lý được, bỏ qua:', data);
          
        } catch (error) {
          console.error('❌ Player lỗi parse unified message:', error);
        }
      });
      
      // Subscribe vào queue để nhận thông báo kick riêng
      stompClient.subscribe('/user/queue/kick', (message) => {
        if (isBeingKicked || window.isBeingKicked) return; // Tránh duplicate processing
        setIsBeingKicked(true);
        
        // Disconnect WebSocket ngay để tránh nhận thêm message
        if (stompClient && stompClient.connected) {
          stompClient.disconnect();
        }
        
        // Set global flag để tránh các component khác nhận kick message
        window.isBeingKicked = true;
        
        alert(message.body); // Hiển thị thông báo kick
        // Clear room data và quay về dashboard
        localStorage.removeItem('currentRoom');
        localStorage.removeItem('clientSessionId');
        
        // Đợi một chút để disconnect hoàn thành trước khi navigate
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
      });
      
      // Lưu client để có thể disconnect - sử dụng cùng 1 client cho cả 2 mục đích
      window.playerGameStartStompClient = stompClient;
      window.playerParticipantsStompClient = stompClient;
      window.playerGameStartConnected = true;
      window.playerParticipantsConnected = true;
      
    }, (error) => {
      console.error('❌ Player Unified WebSocket error:', error);
      window.playerGameStartConnected = false;
      window.playerParticipantsConnected = false;
    });
  };

  // WebSocket connection để nhận real-time updates
  useEffect(() => {
    if (!roomId) return;

    // Setup unified WebSocket connection
    setupUnifiedWebSocket();
    
    // Cleanup khi component unmount
    return () => {
      if (window.playerGameStartStompClient && window.playerGameStartConnected) {
        try {
          console.log('🔌 Disconnecting Player Unified WebSocket...');
          window.playerGameStartStompClient.disconnect();
          window.playerGameStartConnected = false;
          window.playerParticipantsConnected = false;
        } catch (error) {
          console.error('❌ Lỗi disconnect Player Unified WebSocket:', error);
        }
      }
    };
  }, [roomId, navigate]);

  // Fallback: Kiểm tra WebSocket connection status
  useEffect(() => {
    if (!roomId) return;
    
    // Kiểm tra WebSocket availability
    const timeout = setTimeout(() => {
      // Check if WebSocket libraries are loaded
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [roomId]);

  // State để track room status
  const [roomStarted, setRoomStarted] = useState(false);
  const [isBeingKicked, setIsBeingKicked] = useState(false);
  
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
        setRoomData(data);
        
        // ✅ CHUẨN HÓA: Sau khi có roomData, gọi fetchSupportCards
        const currentRoom = localStorage.getItem('currentRoom');
        const clientSessionId = currentRoom ? JSON.parse(currentRoom).clientSessionId : null;
        
        if (clientSessionId && data.pinCode && !hasFetchedInitialCards.current) {
          hasFetchedInitialCards.current = true;
          try {
            await fetchSupportCardsWithData(token, data.pinCode, clientSessionId);
            // Cập nhật số lượt đã sử dụng sau khi gọi thành công
            setSwapCount(1);
          } catch (error) {
            // Reset flag nếu lỗi để có thể thử lại
            hasFetchedInitialCards.current = false;
          }
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
      const requestBody = { clientSessionId: clientSessionId };
      
      const response = await fetch(`http://localhost:8080/${pinCode}/support-card/random`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        const backendCards = await response.json();
        
        // Chuyển đổi từ backend enum sang UI object
        const uiCards = convertBackendCardsToUI(backendCards);
        setSupportPair(uiCards);
        
        // Lưu support cards vào localStorage để PlayerGame sử dụng
        localStorage.setItem('currentSupportCards', JSON.stringify(uiCards));
      } else {
        const errorMessage = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorMessage}`);
      }
    } catch (error) {
      throw error;
    }
  };

  // Fetch support cards từ backend (sử dụng state hiện tại)
  const fetchSupportCards = async (token) => {
    // ✅ CHUẨN HÓA: Lấy clientSessionId từ currentRoom
    const currentRoom = localStorage.getItem('currentRoom');
    const clientSessionId = currentRoom ? JSON.parse(currentRoom).clientSessionId : null;
    
    if (!roomData?.pinCode || !clientSessionId) {
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
      return;
    }

    const token = localStorage.getItem('token');
    // ✅ CHUẨN HÓA: Lấy clientSessionId từ currentRoom
    const currentRoom = localStorage.getItem('currentRoom');
    const clientSessionId = currentRoom ? JSON.parse(currentRoom).clientSessionId : null;
    
    if (!token || !clientSessionId || !roomData?.pinCode) {
      return;
    }

    try {
      await fetchSupportCards(token);
      setSwapCount(prev => prev + 1);
    } catch (error) {
      // Handle error silently
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

      

      <div className="w-full max-w-3xl mx-auto">
        <Chat />
      </div>

    </div>
  );
};

export default WaitingRoomForPlayer;