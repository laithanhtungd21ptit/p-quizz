import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Chat from "../components/Chat"

const WaitingRoomForController = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const websiteRef = useRef(null);
  const codeRef = useRef(null);
  
  // Error boundary state
  const [hasError, setHasError] = useState(false);
  
  // State cho room data
  const [roomData, setRoomData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState(null);
  
  // State cho kick user popup
  const [showKickPopup, setShowKickPopup] = useState(false);
  const [userToKick, setUserToKick] = useState(null); // {id, name}

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
        
        const existingRoomStr = localStorage.getItem('currentRoom');
        let currentRoom;
        
        if (existingRoomStr) {
          currentRoom = JSON.parse(existingRoomStr);
          currentRoom.pinCode = data.pinCode;
          currentRoom.qrCodeUrl = data.qrCodeUrl;
          currentRoom.participants = participants;
          // Giữ nguyên createdAt từ CreateRoom nếu có
          if (!currentRoom.createdAt) {
            currentRoom.createdAt = new Date().toISOString();
          }
          currentRoom.isStarted = false;
        } else {
          // Fallback nếu không có dữ liệu từ CreateRoom
          currentRoom = {
            roomId: roomId,
            pinCode: data.pinCode,
            qrCodeUrl: data.qrCodeUrl,
            participants: participants,
            createdAt: new Date().toISOString(),
            isStarted: false
          };
        }
        
        localStorage.setItem('currentRoom', JSON.stringify(currentRoom));
        console.log('✅ Đã lưu thông tin phòng vào localStorage:', currentRoom);
      } else {
        console.error('Error fetching room data:', response.status);
        let errorMessage = '';
        try {
          errorMessage = await response.text();
          console.error('Error response body:', errorMessage);
        } catch (e) {
          console.error('Không thể đọc error response');
        }
        
        if (response.status === 403) {
          setError(`Không có quyền truy cập phòng này: ${errorMessage}`);
        } else if (response.status === 404) {
          setError(`Phòng không tồn tại: ${errorMessage}`);
        } else {
          setError(`Không thể lấy thông tin phòng (${response.status}): ${errorMessage}`);
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

      console.log('🔄 [INITIAL LOAD] Fetching participants for roomId:', roomId);
      const response = await fetch(`http://localhost:8080/rooms/participants?roomId=${roomId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('=== 🔄 [INITIAL] PARTICIPANTS API DEBUG ===');
        console.log('Participants response api:', data);
    
        // Debug user participation
        const userStr = localStorage.getItem('user');
        const currentUser = userStr ? JSON.parse(userStr) : null;
        
        if (currentUser && data.length > 0) {
          console.log('=== USER PARTICIPATION CHECK ===');
          
          // Kiểm tra xem user có trong danh sách participants không
          const isParticipant = data.some(p => {
            const usernameMatch = p.username === currentUser.username;
            const firstNameMatch = p.firstName === currentUser.username || p.firstname === currentUser.username;
            const idMatch = p.userId === currentUser.id || p.id === currentUser.id;
            
            console.log(`Participant ${p.username || p.firstName || p.firstname}:`, {
              username: p.username,
              firstName: p.firstName,
              firstname: p.firstname,
              userId: p.userId,
              id: p.id,
              isHost: p.isHost,
              usernameMatch,
              firstNameMatch,
              idMatch,
              isMatch: usernameMatch || firstNameMatch || idMatch
            });
            
            return usernameMatch || firstNameMatch || idMatch;
          });
          
          console.log('User có trong danh sách participants:', isParticipant);
          
          if (!isParticipant) {
            console.warn('⚠️ USER KHÔNG CÓ TRONG DANH SÁCH PARTICIPANTS!');
            console.warn('Username hiện tại:', currentUser.username);
            console.warn('Có thể gây lỗi 403 khi submit answer');
          }
        }
        
        setParticipants(data);
        
        // Cập nhật participants trong localStorage
        const currentRoomStr = localStorage.getItem('currentRoom');
        if (currentRoomStr) {
          const currentRoom = JSON.parse(currentRoomStr);
          currentRoom.participants = data;
          localStorage.setItem('currentRoom', JSON.stringify(currentRoom));
          console.log('✅ Đã cập nhật participants trong localStorage:', data);
        }
      } else {
        console.error('Error fetching participants:', response.status);
        let errorMessage = '';
        try {
          errorMessage = await response.text();
          console.error('Participants error response body:', errorMessage);
        } catch (e) {
          console.error('Không thể đọc participants error response');
        }
        
        if (response.status === 403) {
          console.error('Không có quyền xem participants của phòng này');
        } else if (response.status === 404) {
          console.error('Phòng không tồn tại khi fetch participants');
        } else {
          console.error(`Lỗi khi fetch participants (${response.status}): ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  // Hiển thị popup xác nhận kick
  const showKickConfirmation = (userId, username) => {
    setUserToKick({ id: userId, name: username });
    setShowKickPopup(true);
  };

  // Đóng popup kick
  const closeKickPopup = () => {
    setShowKickPopup(false);
    setUserToKick(null);
  };

  // Kick người dùng khỏi phòng (sau khi đã xác nhận)
  const confirmKickUser = async () => {
    if (!userToKick) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Bạn cần đăng nhập để kick người dùng');
        closeKickPopup();
        return;
      }

      const response = await fetch(`http://localhost:8080/rooms/kick/${roomId}/${userToKick.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh participants list sau khi kick thành công
        await fetchParticipants();
        closeKickPopup();
      } else {
        let errorData = '';
        try {
          errorData = await response.text();
        } catch (e) {
          // Ignore
        }
        
        closeKickPopup();
        
        if (response.status === 403) {
          setError(`Không có quyền kick người dùng: ${errorData}`);
        } else if (response.status === 404) {
          setError(`Người dùng không tồn tại: ${errorData}`);
        } else {
          setError(`Không thể kick người dùng (${response.status}): ${errorData}`);
        }
      }
    } catch (error) {
      console.error('Error kicking user:', error);
      setError('Lỗi kết nối khi kick người dùng');
      closeKickPopup();
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

      // Lấy thông tin user hiện tại
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      
      // Kiểm tra database roomId từ localStorage
      const currentRoomStr = localStorage.getItem('currentRoom');
      const currentRoom = currentRoomStr ? JSON.parse(currentRoomStr) : null;
      const databaseRoomId = currentRoom?.roomId;

      // QUAN TRỌNG: Sử dụng database roomId cho API call
      const apiRoomId = databaseRoomId || roomId;
      console.log('API sẽ sử dụng roomId:', apiRoomId);
      
      // Kiểm tra xem user hiện tại có phải host không
      const isCurrentUserHost = participants.some(p => 
        p.isHost && (
          // So sánh nhiều trường để tìm match
          p.firstname === currentUser?.firstname ||
          p.username === currentUser?.username ||
          p.id === currentUser?.id ||
          // So sánh username với firstname (trường hợp đặc biệt)
          p.firstname === currentUser?.username ||
          p.username === currentUser?.firstname
        )
      );
      console.log('Host check details:', {  
        currentUser: currentUser,
        participants: participants,
        hostParticipants: participants.filter(p => p.isHost),
        comparison: participants.map(p => ({
          participant: p,
          isMatch: (
            p.firstname === currentUser?.firstname ||
            p.username === currentUser?.username ||
            p.id === currentUser?.id ||
            p.firstname === currentUser?.username ||
            p.username === currentUser?.firstname
          )
        }))
      });
      
      const response = await fetch(`http://localhost:8080/rooms/start/${apiRoomId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const participants = await response.json();
        console.log('✅ Game started successfully! Participants:', participants);
        
        // Cập nhật trạng thái phòng trong localStorage
        const currentRoomStr = localStorage.getItem('currentRoom');
        if (currentRoomStr) {
          const currentRoom = JSON.parse(currentRoomStr);
          currentRoom.isStarted = true;
          currentRoom.startedAt = new Date().toISOString();
          localStorage.setItem('currentRoom', JSON.stringify(currentRoom));
          console.log('✅ Đã cập nhật trạng thái phòng đã start:', currentRoom);
        }
        
        window.messageCount = 0;
        
        // ✅ PROTECTION: Chỉ xóa nếu chưa có data
        const existingData = localStorage.getItem('firstQuestionData');
        if (!existingData) {
          console.log('🧹 Clearing localStorage - no existing question data');
          localStorage.removeItem('firstQuestionData');
        } else {
          console.log('✅ Keeping existing firstQuestionData in localStorage');
        }
        
        // Kiểm tra topic matching
        const frontendTopic = `/topic/room/${currentRoom?.roomId || roomId}`;
        const backendTopic = `/topic/room/${apiRoomId}`;
        const topicsMatch = frontendTopic === backendTopic;
        
        console.log('- Frontend subscribed to:', frontendTopic);
        console.log('- Backend will send to:', backendTopic);
        console.log('- Topics match:', topicsMatch);
        
        if (!topicsMatch) {
          console.error('❌ TOPIC MISMATCH! This is why messages are not received!');
        }
        
        // Tăng thời gian chờ lên 10 giây và kiểm tra định kỳ
        let waitTime = 0;
        const maxWaitTime = 10000; // 10 giây
        const checkInterval = 500; // Kiểm tra mỗi 0.5 giây
        
        const questionCheckInterval = setInterval(() => {
          waitTime += checkInterval;
          
          // Kiểm tra xem đã nhận được first question chưa (chỉ cần có dữ liệu)
          const questionData = localStorage.getItem('firstQuestionData');
          if (questionData) {
            console.log('✅ First question data detected! Navigating to controller game...');
            clearInterval(questionCheckInterval);
            navigate(`/play-room-for-controller/${roomId}`);
            return;
          }
        
          // Timeout sau 10 giây
          if (waitTime >= maxWaitTime) {
            console.warn('⚠️ TIMEOUT: No question after 10s!');
            
            // Kiểm tra localStorage cuối cùng
            const finalQuestionData = localStorage.getItem('firstQuestionData');
            console.warn('🔍 Final check:', {
              hasData: !!finalQuestionData,
              wsConnected: window.waitingRoomConnected
            });
            
            clearInterval(questionCheckInterval);
            navigate(`/play-room-for-controller/${roomId}`);
          }
        }, checkInterval);
      } else {
        let errorData = '';
        try {
          errorData = await response.text();
          console.error('Start game error response body:', errorData);
        } catch (e) {
          console.error('Không thể đọc start game error response');
        }
        
        if (response.status === 403) {
          setError(`Không có quyền bắt đầu game: ${errorData}`);
        } else if (response.status === 400) {
          setError(`Dữ liệu không hợp lệ: ${errorData}`);
        } else {
          setError(`Không thể bắt đầu game (${response.status}): ${errorData}`);
        }
      }
    } catch (error) {
      console.error('Error starting game:', error);
      setError('Lỗi kết nối khi bắt đầu game');
    }
  };

  // Setup unified WebSocket để nhận cả participants updates và câu hỏi đầu tiên
  const setupUnifiedWebSocket = () => {
    console.log('🔌 Setup unified WebSocket trong WaitingRoom...');
    const originalRemoveItem = localStorage.removeItem;
    localStorage.removeItem = function(key) {
      if (key === 'firstQuestionData' && window.questionDataProtected) {
        console.log('🛡️ PROTECTED: Không cho xóa', key, 'vì đã có question data');
        return;
      }
      return originalRemoveItem.call(this, key);
    };
    
    try {
      const socket = new window.SockJS('http://localhost:8080/ws');
      const client = window.Stomp.over(socket);
      client.debug = null;
      const currentRoom = localStorage.getItem('currentRoom');
      let connectHeaders = {};
      
      if (currentRoom) {
        const roomData = JSON.parse(currentRoom);
        if (roomData.clientSessionId) {
          connectHeaders.clientSessionId = roomData.clientSessionId;
        }
        if (roomData.pinCode) {
          connectHeaders.pinCode = roomData.pinCode;
        }
      }
      
      console.log('🔌 HOST connecting unified WebSocket with headers:', connectHeaders);

      client.connect(connectHeaders, (frame) => {
        
        // Đánh dấu connection đã sẵn sàng
        window.waitingRoomConnected = true;
        const currentRoom = localStorage.getItem('currentRoom');
        const actualRoomId = currentRoom ? JSON.parse(currentRoom).roomId : roomId;
        const topicPath = `/topic/room/${actualRoomId}`;
        
        client.subscribe(topicPath, (message) => {
          try {
            const data = JSON.parse(message.body);
            
            // Case 1: Participants update (ưu tiên xử lý trước)
            if (Array.isArray(data) && data.length > 0 && data[0].id && data[0].firstname) {
              console.log('👥 HOST nhận được participants update từ unified WebSocket:', data);
              console.log('👥 Participants data detail:', data);
              setParticipants(data);
              
              // Cập nhật participants trong localStorage
              const currentRoomStr = localStorage.getItem('currentRoom');
              if (currentRoomStr) {
                const currentRoom = JSON.parse(currentRoomStr);
                currentRoom.participants = data;
                localStorage.setItem('currentRoom', JSON.stringify(currentRoom));
              }
              return;
            }
            
            if (data && typeof data === 'object' && !Array.isArray(data)) {
              console.log('🔍 Kiểm tra object có thể là question:', Object.keys(data));
              
              const isQuestion = data.content || data.answerA || data.limitedTime;
              
              if (isQuestion) {
                console.log('🎯 PHÁT HIỆN QUESTION - LƯU NGAY!');
                console.log('🎯 Data:', data);
                try {
                  localStorage.setItem('firstQuestionData', JSON.stringify(data));
                  // firstQuestionReceived - chỉ dùng window flag, không cần localStorage
                  window.firstQuestionReceived = true;
                  
                  // ✅ PROTECTION: Set flag để không cho xóa
                  window.questionDataProtected = true;
                  
                  // Verify đã lưu thành công
                  const saved = localStorage.getItem('firstQuestionData');
                  console.log('✅ VERIFY SAVE SUCCESS:', {
                    dataSaved: !!saved,
                    windowFlagSet: window.firstQuestionReceived === true,
                    savedLength: saved ? saved.length : 0,
                    protected: window.questionDataProtected
                  });
                  
                  return;
                } catch (saveError) {
                  console.error('❌ LỖI KHI LƯU LOCALSTORAGE:', saveError);
                }
              }
            }
            
            console.log('📝 HOST unified message không xử lý được, bỏ qua:', data);
          } catch (error) {
            console.error('❌ HOST lỗi parse message trong unified WebSocket:', error);
          }
        });
        
        // Lưu client để có thể disconnect
        window.waitingRoomStompClient = client;
        window.participantsStompClient = client; // Cùng 1 client cho cả 2 mục đích
        window.participantsConnected = true;
        
      }, (error) => {
        console.error('❌ HOST Unified WebSocket error:', error);
        window.waitingRoomConnected = false;
        window.participantsConnected = false;
      });
      
      // Lưu client để có thể disconnect
      window.waitingRoomStompClient = client;
      window.waitingRoomConnected = false; // Ban đầu chưa connected
      
    } catch (error) {
      console.error('❌ HOST lỗi khi setup unified WebSocket:', error);
    }
  };

  // Load data khi component mount
  useEffect(() => {
    try {
      if (!roomId || roomId === 'undefined') {
        setError('Room ID không hợp lệ');
        navigate('/dashboard');
        return;
      }

      const loadData = async () => {
        try {
          setLoading(true);
          // Load participants trước, QR code không critical
          await fetchParticipants();
          // QR code có thể fail, nhưng không block UI - KHÔNG gọi fetchParticipants nữa
          try {
            await fetchRoomData();
          } catch (error) {
            console.warn('Failed to load room data, continuing without QR code');
          }
          setLoading(false);
        } catch (error) {
          console.error('❌ Lỗi khi load data:', error);
          setLoading(false);
        }
      };

      loadData();
      
      // Setup unified WebSocket để nhận cả participants updates và câu hỏi đầu tiên
      setupUnifiedWebSocket();

      return () => {
        // Disconnect unified WebSocket connection
        if (window.waitingRoomStompClient && window.waitingRoomConnected) {
          try {
            console.log('🔌 Disconnecting Unified WebSocket...');
            window.waitingRoomStompClient.disconnect();
            window.waitingRoomConnected = false;
            window.participantsConnected = false;
          } catch (error) {
            console.error('❌ Lỗi khi disconnect Unified WebSocket:', error);
          }
        }
      };
    } catch (error) {
      console.error('❌ Lỗi trong useEffect:', error);
      setHasError(true);
    }
  }, [roomId]);

  // Hiển thị error nếu có
  if (hasError) {
    return (
      <div className="h-[calc(100vh-56px)] flex flex-col items-center justify-center font-content">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg mb-4">Có lỗi xảy ra trong WaitingRoom</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[var(--pink)] text-white px-6 py-2 rounded-lg hover:opacity-80 mr-4"
          >
            Tải lại trang
          </button>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:opacity-80"
          >
            Về Dashboard
          </button>
        </div>
      </div>
    );
  }

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

      {/* Nút Bắt đầu - chỉ hiển thị cho host */}
      {(() => {
        const userStr = localStorage.getItem('user');
        const currentUser = userStr ? JSON.parse(userStr) : null;
        const isCurrentUserHost = participants.some(p => 
          p.isHost && (
            // So sánh nhiều trường để tìm match
            p.firstname === currentUser?.firstname ||
            p.username === currentUser?.username ||
            p.id === currentUser?.id ||
            // So sánh username với firstname (trường hợp đặc biệt)
            p.firstname === currentUser?.username ||
            p.username === currentUser?.firstname
          )
        );
        
        if (isCurrentUserHost) {
          return (
            <button
              onClick={handleStart}
              className="mt-6 px-4 py-2 bg-[var(--pink)] rounded-lg text-white text-sm font-content font-semibold hover:shadow-lg hover:scale-105 transition-transform ease-in-out"
            >
              Bắt đầu
            </button>
          );
        } else {
          return (
            <div className="mt-6 px-4 py-2 bg-gray-300 rounded-lg text-gray-600 text-sm font-content font-semibold text-center">
              Chỉ chủ phòng mới có thể bắt đầu game
            </div>
          );
        }
      })()}

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
              // Kiểm tra xem user hiện tại có phải host không
              const userStr = localStorage.getItem('user');
              const currentUser = userStr ? JSON.parse(userStr) : null;
              const isCurrentUserHost = participants.some(p => 
                p.isHost && (
                  p.firstname === currentUser?.firstname ||
                  p.username === currentUser?.username ||
                  p.id === currentUser?.id ||
                  p.firstname === currentUser?.username ||
                  p.username === currentUser?.firstname
                )
              );
              
              // Không cho kick host và không cho kick chính mình
              const canKickThisUser = isCurrentUserHost && !participant.isHost;
              
              return (
                <div
                  key={participant.id || index}
                  className="relative group flex items-center space-x-2 bg-white rounded-lg p-2 border hover:shadow-md transition-all duration-200"
                >
                  {/* Nút X để kick - chỉ hiện khi hover và có quyền kick */}
                  {canKickThisUser && (
                    <button
                      onClick={() => showKickConfirmation(participant.id, participant.firstname || participant.username)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 z-10"
                      title={`Kick ${participant.firstname || participant.username}`}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                  
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

      {/* Popup xác nhận kick user */}
      {showKickPopup && userToKick && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Xác nhận kick người chơi
              </h3>
              <button
                onClick={closeKickPopup}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="mb-6">
              <p className="text-gray-700">
                Bạn có chắc chắn muốn kick <span className="font-semibold text-red-600">"{userToKick.name}"</span> khỏi phòng?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Người chơi này sẽ bị đưa ra khỏi phòng và không thể tham gia lại trừ khi được mời lại.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeKickPopup}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={confirmKickUser}
                className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Kick ngay
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default WaitingRoomForController;
