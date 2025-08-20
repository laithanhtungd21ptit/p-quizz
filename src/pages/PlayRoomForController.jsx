import React, { useState, useEffect } from 'react';
import RankingTable from '../components/RankingTable';
import Chat from "../components/Chat";
import { getRoomRanking, getNextQuestion, getRoomParticipants } from '../services/api';

export default function PlayRoomForController() {
  // State cho WebSocket
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Lấy mã phòng từ localStorage
  const getJoinCodeFromStorage = () => {
    const currentRoom = localStorage.getItem('currentRoom');
    if (currentRoom) {
      const roomData = JSON.parse(currentRoom);
      return roomData.pinCode || 'Không có mã phòng';
    }
    return 'Không có mã phòng';
  };

  const [joinCode, setJoinCode] = useState('Đang tải...');
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRanking, setShowRanking] = useState(false);
  const [currentQuestionTime, setCurrentQuestionTime] = useState(0);
  const [showNextQuestionButton, setShowNextQuestionButton] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isQuestionActive, setIsQuestionActive] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);
  const [totalQuestionsFromBackend, setTotalQuestionsFromBackend] = useState(null);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1); // Track số câu hỏi hiện tại
  
  const getRoomIdFromJoinCode = () => {
    const currentRoom = localStorage.getItem('currentRoom');
    if (currentRoom) {
      const roomData = JSON.parse(currentRoom);
        return roomData.roomId;
    }
    return null;
  };

  // Thiết lập WebSocket connection
  const setupWebSocket = () => {
    console.log('🔌 Thiết lập WebSocket connection...');
    
    // Sử dụng SockJS và STOMP
    const socket = new window.SockJS('http://localhost:8080/ws');
    const client = window.Stomp.over(socket);
    
    // Disable STOMP debug logging
    client.debug = null;
    
    // Lấy clientSessionId và pinCode để authenticate WebSocket
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
    
    console.log('🔌 Connecting WebSocket with headers:', connectHeaders);
    
    client.connect(connectHeaders, (frame) => {
      console.log('✅ WebSocket connected successfully with authentication!');
      setIsConnected(true);
      setStompClient(client);
      
      // Lưu vào window để có thể sử dụng ở nơi khác
      window.stompClient = client;
      
      // Subscribe vào topic để nhận câu hỏi đầu tiên từ WaitingRoom
      const roomId = getRoomIdFromJoinCode();
      console.log('🔍 Debug Controller WebSocket setup:', {
        roomId: roomId,
        joinCode: joinCode,
        hasRoomId: !!roomId
      });
      
      if (roomId) {
        console.log('📡 Controller subscribing to topic: /topic/room/' + roomId);
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          try {
            const data = JSON.parse(message.body);
            console.log('📨 Nhận được dữ liệu từ WebSocket:', data);
            
            // Kiểm tra xem có phải câu hỏi không
            if (data.id && (data.content || data.answerA)) {
              console.log('🎯 CONTROLLER nhận được câu hỏi:', {
                questionId: data.id,
                content: data.content,
                limitedTime: data.limitedTime,
                totalQuestions: data.totalQuestions,
                timestamp: new Date().toISOString()
              });
              
              // Lưu totalQuestions từ backend nếu có
              if (data.totalQuestions) {
                setTotalQuestionsFromBackend(data.totalQuestions);
                console.log('📊 Controller - Total questions từ backend:', data.totalQuestions);
              }
              
              // Chỉ lưu và setup countdown, KHÔNG hiển thị UI câu hỏi
              localStorage.setItem('currentQuestionData', JSON.stringify(data));
              
                      // Setup countdown timer với thời gian từ backend  
              const questionTime = data.limitedTime || 30;
        
        console.log('🔍 Controller WebSocket Timer Setup:', {
          receivedLimitedTime: data.limitedTime,
          fallbackTime: 30,
          finalQuestionTime: questionTime,
          hasLimitedTimeFromBackend: !!data.limitedTime,
          currentTimerProtected: window.correctTimerSet === true
        });
        
        // ✅ PROTECTION: Chỉ setup timer nếu chưa có timer protected
        if (!window.correctTimerSet) {
          setTimeLeft(questionTime);
          setIsQuestionActive(true);
          setTimerFinished(false);
          console.log('✅ Controller WebSocket timer setup:', questionTime, 'giây');
        } else {
          console.log('🛡️ Timer protected - không override WebSocket timer');
        }
        
        // Cập nhật số câu hỏi hiện tại từ WebSocket message
        if (data.currentQuestion) {
          setCurrentQuestionNumber(data.currentQuestion);
          console.log('📊 Controller set question number từ WebSocket:', data.currentQuestion);
        } else {
          // Fallback: set về câu số 1 nếu không có thông tin
          setCurrentQuestionNumber(1);
          console.log('📊 Controller fallback set question number to 1');
        }
              
              // Ẩn ranking và nút khi có câu hỏi mới
              setShowRanking(false);
              setShowNextQuestionButton(false);
              
        console.log('⏰ Controller đếm ngược câu hỏi từ WebSocket:', {
          questionTime: questionTime,
          limitedTimeFromBackend: data.limitedTime,
          currentQuestionNumber: data.currentQuestion || 1,
          isTimerSetupSuccess: true
        });
            }
          } catch (error) {
            console.error('❌ Lỗi khi parse dữ liệu WebSocket:', error);
          }
        });
        
        // 📊 Subscribe vào ranking updates real-time từ Kafka
        const rankingTopic = `/topic/room/${roomId}/ranking`;
        console.log('📊 Debug ranking subscription:', {
          roomId: roomId,
          rankingTopic: rankingTopic,
          clientConnected: client.connected
        });
        
        client.subscribe(rankingTopic, (message) => {
          console.log('=== 📊 CONTROLLER RANKING UPDATE RECEIVED ===');
          console.log('📨 Raw ranking message:', message.body);
          
          try {
            const rankingDataFromSocket = JSON.parse(message.body);
            console.log('📊 Controller real-time ranking update:', rankingDataFromSocket);
            
            // Cập nhật ranking ngay lập tức cho controller
            setRankingData(rankingDataFromSocket);
            setLoading(false);
            
            // ✅ KHÔNG CẦN lưu finalRankingData - GameResult sẽ gọi API
            console.log('📊 [Controller WebSocket] Real-time ranking updated (không lưu localStorage)');
            
          } catch (error) {
            console.error('❌ Controller error parsing ranking update:', error);
          }
        });
        
        console.log('✅ Controller đã subscribe vào cả 2 topics cho room:', roomId);
      } else {
        console.error('❌ Controller không có roomId để subscribe WebSocket topics!');
        console.error('📊 Debug currentRoom data:', localStorage.getItem('currentRoom'));
      }
      
    }, (error) => {
      console.error('❌ WebSocket connection error:', error);
      setIsConnected(false);
    });
  };

  // Lấy bảng xếp hạng từ backend
  const fetchRanking = async () => {
    try {
      const roomId = getRoomIdFromJoinCode();
      if (roomId) {
        console.log('🔄 Lấy bảng xếp hạng cho phòng:', roomId);
        const response = await getRoomRanking(roomId);
        setRankingData(response);
        setLoading(false);
        console.log('📊 Bảng xếp hạng từ backend:', response);
        console.log('📊 Số lượng participants:', response.length);
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy bảng xếp hạng:', error);
      setLoading(false);
    }
  };

  // Tạo bảng xếp hạng ban đầu với điểm 0 từ API
  const createInitialRanking = async () => {
    console.log('Tạo bảng xếp hạng ban đầu từ API...');
    
    try {
      const roomId = getRoomIdFromJoinCode();
      if (roomId) {
        console.log('🔍 RoomId để gọi API:', roomId);
        
        // Gọi API để lấy bảng xếp hạng ban đầu
        const response = await getRoomRanking(roomId);
        console.log('📊 API response:', response);
        
        if (response && Array.isArray(response) && response.length > 0) {
          // Nếu API trả về dữ liệu hợp lệ, sử dụng luôn
          setRankingData(response);
          setLoading(false);
          console.log('✅ Sử dụng bảng xếp hạng từ API:', response);
          return;
        } else {
          console.log('⚠️ API trả về rỗng hoặc không hợp lệ, thử lấy participants...');
          
          // Thử lấy participants từ API thay vì tạo dữ liệu mẫu
          try {
            const participants = await getRoomParticipants(roomId);
            console.log('👥 Participants từ API:', participants);
            
            if (participants && Array.isArray(participants) && participants.length > 0) {
              // Lọc bỏ host và tạo ranking từ participants thực tế với điểm 0
              const playersOnly = participants.filter(participant => !participant.isHost);
              const realRanking = playersOnly.map((participant, index) => ({
                id: participant.id || participant.userId || index + 1,
                firstName: participant.firstname || participant.firstName || participant.username || participant.name || `User${index + 1}`,
                avatar: participant.avatar || `/avatar/avatar_${(index % 5) + 1}.png`,
                score: 0,
                correctCount: 0,
                ranking: index + 1
              }));
              
              setRankingData(realRanking);
              setLoading(false);
              console.log('✅ Tạo ranking từ participants thực tế:', realRanking);
              return;
            }
          } catch (participantsError) {
            console.error('❌ Lỗi khi lấy participants từ API:', participantsError);
          }
          
          // Nếu không lấy được gì từ API, mới tạo fallback
          console.log('⚠️ Không thể lấy dữ liệu từ API, tạo fallback...');
          createFallbackRanking();
        }
      } else {
        console.log('❌ Không có roomId, tạo fallback...');
        createFallbackRanking();
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy bảng xếp hạng ban đầu:', error);
      console.log('⚠️ Fallback: tạo bảng xếp hạng từ participants...');
      createFallbackRanking();
    }
  };

  // Tạo bảng xếp hạng fallback từ participants trong localStorage hoặc API
  const createFallbackRanking = async () => {
    console.log('Tạo bảng xếp hạng fallback từ participants...');
    
    try {
      // Thử lấy participants từ localStorage trước
      const currentRoom = localStorage.getItem('currentRoom');
      if (currentRoom) {
        const roomData = JSON.parse(currentRoom);
        console.log('🏠 Room data từ localStorage:', roomData);
        
        if (roomData.participants && Array.isArray(roomData.participants) && roomData.participants.length > 0) {
          console.log('👥 Participants từ localStorage:', roomData.participants);
          
          // Lọc bỏ host khỏi bảng xếp hạng
          const playersOnly = roomData.participants.filter(participant => !participant.isHost);
          const fallbackRanking = playersOnly.map((participant, index) => ({
            id: participant.id || participant.userId || index + 1,
            firstName: participant.firstname || participant.firstName || participant.username || participant.name || `User${index + 1}`,
            avatar: participant.avatar || `/avatar/avatar_${(index % 5) + 1}.png`,
            score: 0,
            correctCount: 0,
            ranking: index + 1
          }));
          
          setRankingData(fallbackRanking);
          setLoading(false);
          console.log('✅ Bảng xếp hạng fallback từ localStorage:', fallbackRanking);
          return;
        } else {
          console.log('⚠️ Không có participants trong localStorage hoặc không hợp lệ');
        }
      } else {
        console.log('⚠️ Không có currentRoom trong localStorage');
      }
      
      // Nếu không có trong localStorage, thử gọi API participants
      const roomId = getRoomIdFromJoinCode();
      if (roomId) {
        console.log('🔄 Thử lấy participants từ API với roomId:', roomId);
        
        try {
          const participants = await getRoomParticipants(roomId);
          console.log('👥 Participants từ API:', participants);
          
          if (participants && Array.isArray(participants) && participants.length > 0) {
            const fallbackRanking = participants.map((participant, index) => ({
              id: participant.id || participant.userId || index + 1,
              firstName: participant.firstName || participant.username || participant.name || `User${index + 1}`,
              avatar: participant.avatar || `/avatar/avatar_${(index % 5) + 1}.png`,
              score: 0,
              correctCount: 0,
              ranking: index + 1
            }));
            
            setRankingData(fallbackRanking);
            setLoading(false);
            console.log('✅ Bảng xếp hạng fallback từ API participants:', fallbackRanking);
            return;
          } else {
            console.log('⚠️ API participants trả về rỗng hoặc không hợp lệ');
          }
        } catch (apiError) {
          console.error('❌ Lỗi khi gọi API participants:', apiError);
        }
      } else {
        console.log('⚠️ Không có roomId để gọi API participants');
      }
      
      // Fallback cuối cùng: chỉ tạo bảng mẫu khi thực sự không có dữ liệu
      console.log('⚠️ Không thể lấy dữ liệu thực tế, tạo bảng mẫu cơ bản...');
      const basicRanking = [
        { id: 1, firstName: 'Chưa có người chơi', avatar: '/avatar/avatar_1.png', score: 0, correctCount: 0, ranking: 1 }
      ];
      setRankingData(basicRanking);
      setLoading(false);
      console.log('📝 Bảng xếp hạng mẫu cơ bản:', basicRanking);
      
    } catch (error) {
      console.error('❌ Lỗi khi tạo fallback ranking:', error);
      
      // Fallback cuối cùng khi có lỗi
      const basicRanking = [
        { id: 1, firstName: 'Lỗi tải dữ liệu', avatar: '/avatar/avatar_1.png', score: 0, correctCount: 0, ranking: 1 }
      ];
      setRankingData(basicRanking);
      setLoading(false);
      console.log('📝 Bảng xếp hạng mẫu khi có lỗi:', basicRanking);
    }
  };

  // Refresh bảng xếp hạng từ API
  const refreshRanking = async () => {
    console.log('🔄 Refresh bảng xếp hạng từ API...');
    setLoading(true);
    
    try {
      const roomId = getRoomIdFromJoinCode();
      if (roomId) {
        console.log('🔍 Refresh ranking cho roomId:', roomId);
        const response = await getRoomRanking(roomId);
        
        if (response && Array.isArray(response) && response.length > 0) {
          setRankingData(response);
          console.log('✅ Refresh thành công từ API:', response);
        } else {
          console.log('⚠️ API trả về rỗng, thử lấy participants...');
          // Thử lấy participants nếu ranking rỗng
          const participants = await getRoomParticipants(roomId);
          if (participants && Array.isArray(participants) && participants.length > 0) {
            const realRanking = participants.map((participant, index) => ({
              id: participant.id || participant.userId || index + 1,
              firstName: participant.firstName || participant.username || participant.name || `User${index + 1}`,
              avatar: participant.avatar || `/avatar/avatar_${(index % 5) + 1}.png`,
              score: 0,
              correctCount: 0,
              ranking: index + 1
            }));
            setRankingData(realRanking);
            console.log('✅ Refresh từ participants:', realRanking);
          }
        }
      } else {
        console.log('❌ Không có roomId để refresh');
      }
    } catch (error) {
      console.error('❌ Lỗi khi refresh ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  // Lấy thời gian câu hỏi hiện tại từ Redis hoặc localStorage
  const getCurrentQuestionTime = () => {
    const currentRoom = localStorage.getItem('currentRoom');
    if (currentRoom) {
      const roomData = JSON.parse(currentRoom);
      // Giả sử thời gian câu hỏi mặc định là 30s, có thể lấy từ backend
      return roomData.questionTime || 30;
    }
    return 30; // Mặc định 30 giây
  };

  // Gửi câu hỏi cho player qua WebSocket hoặc localStorage
  const sendQuestionToPlayers = (questionData, roomId) => {
    console.log('📡 Controller gửi câu hỏi cho người chơi...');
    console.log('🏠 RoomId:', roomId);
    console.log('🎯 Question data:', {
      id: questionData.id,
      content: questionData.content,
      limitedTime: questionData.limitedTime,
      questionLast: questionData.questionLast
    });
    
    // Gửi câu hỏi qua WebSocket topic của phòng
    if (window.stompClient && window.stompClient.connected) {
      const roomTopic = `/topic/room/${roomId}`;
      console.log('📡 Gửi đến WebSocket topic:', roomTopic);
      
      const messageToSend = {
        type: 'NEXT_QUESTION',
        data: questionData,
        timestamp: new Date().toISOString()
      };
      
      console.log('📤 Message được gửi:', messageToSend);
      
      window.stompClient.send(roomTopic, {}, JSON.stringify(messageToSend));
      
      console.log('✅ Controller đã gửi câu hỏi qua WebSocket thành công');
    } else {
      console.error('❌ WebSocket không kết nối, không thể gửi câu hỏi cho người chơi!');
      console.error('🔍 WebSocket state:', {
        stompClient: !!window.stompClient,
        connected: window.stompClient?.connected
      });
      
      // Fallback: Gửi qua localStorage để PlayerGame có thể nhận được
      localStorage.setItem('nextQuestionData', JSON.stringify(questionData));
      localStorage.setItem('questionUpdated', 'true');
      console.log('💾 Fallback: đã lưu câu hỏi vào localStorage');
    }
  };

  // Xử lý khi bấm nút "Câu tiếp theo"
  const handleNextQuestion = async () => {
    try {
      console.log('Controller bấm nút Câu tiếp theo');
      
      // Lấy thông tin user hiện tại
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      console.log('=== USER INFO DEBUG ===');
      console.log('Current user from localStorage:', currentUser);
      console.log('User fields:', {
        id: currentUser?.id,
        username: currentUser?.username,
        firstname: currentUser?.firstname,
        firstName: currentUser?.firstName,
        name: currentUser?.name
      });
      
      // Lấy danh sách participants từ localStorage
      const currentRoomStr = localStorage.getItem('currentRoom');
      if (!currentRoomStr) {
        alert('Không có thông tin phòng. Vui lòng quay lại trang chờ.');
        return;
      }
      
      const currentRoom = JSON.parse(currentRoomStr);
      const participants = currentRoom.participants || [];
      console.log('=== PARTICIPANTS DEBUG ===');
      console.log('Participants from localStorage:', participants);
      console.log('Host participants:', participants.filter(p => p.isHost));
      
      // Kiểm tra xem user hiện tại có phải host không
      const isCurrentUserHost = participants.some(p => {
        if (!p.isHost) return false;
        
        // So sánh nhiều trường để tìm match
        const usernameMatch = p.username === currentUser?.username;
        const firstnameMatch = p.firstname === currentUser?.firstname;
        const firstNameMatch = p.firstName === currentUser?.firstName;
        const idMatch = p.id === currentUser?.id;
        
        // So sánh username với firstname (trường hợp đặc biệt)
        const usernameFirstnameMatch = p.firstname === currentUser?.username;
        const firstnameUsernameMatch = p.username === currentUser?.firstname;
        
        console.log(`Checking participant ${p.firstname || p.username}:`, {
          participant: p,
          usernameMatch,
          firstnameMatch,
          firstNameMatch,
          idMatch,
          usernameFirstnameMatch,
          firstnameUsernameMatch,
          isHost: p.isHost,
          finalMatch: usernameMatch || firstnameMatch || firstNameMatch || idMatch || usernameFirstnameMatch || firstnameUsernameMatch
        });
        
        return usernameMatch || firstnameMatch || firstNameMatch || idMatch || usernameFirstnameMatch || firstnameUsernameMatch;
      });
    
      if (!isCurrentUserHost) {
        console.error('❌ User hiện tại không phải là chủ phòng!');
        alert('Chỉ chủ phòng mới có thể chuyển câu hỏi tiếp theo.');
        return;
      }
      
      console.log('✅ User xác minh là chủ phòng, tiếp tục gọi API...');
      
      // Lấy pinCode và clientSessionId từ currentRoom đã có
      const pinCode = currentRoom.pinCode;
      
      // Lấy clientSessionId từ user hiện tại hoặc tạo mới
      let clientSessionId = currentUser?.clientSessionId;
      if (!clientSessionId) {
        // Tạo clientSessionId mới nếu không có
        clientSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('Tạo clientSessionId mới:', clientSessionId);
      }
      
      console.log('🔍 Gọi API next-question với pinCode:', pinCode, 'clientSessionId:', clientSessionId);
      
              if (pinCode) {
        const nextQuestionData = await getNextQuestion(pinCode, clientSessionId);
        console.log('✅ Đã lấy câu hỏi tiếp theo:', nextQuestionData);
        
        // Lưu totalQuestions từ backend nếu có
        if (nextQuestionData.totalQuestions) {
          setTotalQuestionsFromBackend(nextQuestionData.totalQuestions);
          console.log('📊 Controller - Total questions từ getNextQuestion:', nextQuestionData.totalQuestions);
        }
        
        // Cập nhật số câu hỏi hiện tại khi lấy câu mới
        const nextQuestionNum = currentQuestionNumber + 1;
        setCurrentQuestionNumber(nextQuestionNum);
        
        // Kiểm tra xem có phải câu hỏi cuối cùng không
        const actualTotalQuestions = nextQuestionData.totalQuestions || totalQuestionsFromBackend || 4;
        const isReallyLastQuestion = nextQuestionNum >= actualTotalQuestions;
        
        console.log('🔍 === CONTROLLER LAST QUESTION DEBUG ===');
        console.log('Question ID:', nextQuestionData.id);
        console.log('Backend questionLast flag:', nextQuestionData.questionLast);
        console.log('Current question number:', nextQuestionNum);
        console.log('Total questions:', actualTotalQuestions);
        console.log('Is really last question (calculated):', isReallyLastQuestion);
        console.log('Question content:', nextQuestionData.content);
        console.log('Question answers:', {
          A: nextQuestionData.answerA,
          B: nextQuestionData.answerB,
          C: nextQuestionData.answerC,
          D: nextQuestionData.answerD
        });
        console.log('All question data keys:', Object.keys(nextQuestionData));
        
        if (isReallyLastQuestion) {
          console.log('🏁 Đây là câu hỏi cuối cùng! Gửi câu hỏi cuối cho players...');
          
          // ✅ QUAN TRỌNG: Gửi câu hỏi cuối cho players TRƯỚC KHI setup timer
          console.log('📡 Gửi câu hỏi cuối cùng cho tất cả players...');
          sendQuestionToPlayers(nextQuestionData, currentRoom.roomId);
          
          // Lưu dữ liệu câu hỏi cuối vào localStorage để GameResult có thể sử dụng
          localStorage.setItem('finalQuestionData', JSON.stringify(nextQuestionData));
          // ✅ CHUẨN HÓA: Chỉ dùng currentRoom, không lưu roomInfo duplicate
          // isLastQuestion - không cần lưu localStorage, chỉ là logic tạm thời
          
          // ✅ KHÔNG CẦN lưu finalRankingData - GameResult sẽ gọi API fresh
          console.log('🏁 Controller final question setup (không lưu ranking localStorage)');
          
          // Cập nhật câu hỏi hiện tại để Controller cũng thấy
          setCurrentQuestion(nextQuestionData);
          
          // Setup countdown cho câu hỏi cuối nhưng KHÔNG hiển thị nút "Câu tiếp theo"
          const questionTime = nextQuestionData.limitedTime || 30;
          
          console.log('🔍 Controller Final Question Timer Setup:', {
            receivedLimitedTime: nextQuestionData.limitedTime,
            fallbackTime: 30,
            finalQuestionTime: questionTime,
            hasLimitedTimeFromBackend: !!nextQuestionData.limitedTime,
            questionId: nextQuestionData.id,
            isFinalQuestion: true
          });
          
          setTimeLeft(questionTime);
          setIsQuestionActive(true);
          setTimerFinished(false);
          setShowNextQuestionButton(false); // Không hiển thị nút cho câu cuối
          setShowRanking(false);
          
          console.log('⏰ Controller đếm ngược câu hỏi cuối:', questionTime, 'giây');
          console.log('🎯 Controller limitedTime từ backend cho câu cuối:', nextQuestionData.limitedTime);
          console.log('🎯 Câu hỏi cuối đã được gửi cho players');
          
          // Đợi limitedTime + 7 giây để người chơi kịp trả lời và controller lấy ranking cuối
          const waitTime = (nextQuestionData.limitedTime || 30) * 1000 + 7000; // limitedTime + 7s
          console.log(`⏰ Sẽ chuyển đến GameResult sau ${waitTime/1000} giây...`);
          
          setTimeout(() => {
            console.log('🚀 Chuyển đến GameResult...');
            window.location.href = '/game-result';
          }, waitTime);
          
          return; // Không tiếp tục xử lý câu hỏi tiếp theo
        }
        
        console.log('🎯 Controller nhận câu hỏi tiếp theo:', {
          questionId: nextQuestionData.id,
          content: nextQuestionData.content,
          limitedTime: nextQuestionData.limitedTime
        });
        
        // Gửi câu hỏi tiếp theo cho tất cả người chơi
        sendQuestionToPlayers(nextQuestionData, currentRoom.roomId);
        
        // Setup countdown cho câu hỏi mới với thời gian từ backend
        const questionTime = nextQuestionData.limitedTime || 30;
        
        console.log('🔍 Controller Normal Question Timer Setup:', {
          receivedLimitedTime: nextQuestionData.limitedTime,
          fallbackTime: 30,
          finalQuestionTime: questionTime,
          hasLimitedTimeFromBackend: !!nextQuestionData.limitedTime,
          questionId: nextQuestionData.id,
          questionNumber: nextQuestionNum,
          isFinalQuestion: false
        });
        
        setTimeLeft(questionTime);
        setIsQuestionActive(true);
        setTimerFinished(false);
        
        // Ẩn nút và ranking cho câu hỏi mới
        setShowNextQuestionButton(false);
        setShowRanking(false);
        
        // ✅ RESET: Clear timer protection cho câu hỏi mới
        window.correctTimerSet = false;
        window.correctTimerValue = null;
        console.log('🔓 Reset timer protection for new question');
        
        // isLastQuestion - không cần clear vì không lưu localStorage nữa
        console.log('🧹 isLastQuestion logic - không dùng localStorage nữa');
        
        console.log('⏰ Controller bắt đầu đếm ngược câu hỏi số', nextQuestionNum, ':', questionTime, 'giây');
        console.log('🎯 Controller limitedTime từ backend:', nextQuestionData.limitedTime);
        
        // TODO: Emit event hoặc thông báo cho backend để chuyển câu hỏi
        // Có thể sử dụng WebSocket hoặc gọi API khác để thông báo
        
        // Không cần setTimeout nữa vì đã có countdown timer tự động
      }
    } catch (error) {
      console.error('Lỗi khi lấy câu hỏi tiếp theo:', error);
      alert('Không thể lấy câu hỏi tiếp theo. Vui lòng thử lại.');
    }
  };

  // Cập nhật joinCode khi component mount
  useEffect(() => {
    const code = getJoinCodeFromStorage();
    setJoinCode(code);
  }, []);

  // Thiết lập WebSocket khi component mount
  useEffect(() => {
    console.log('🔌 Setting up WebSocket...');
    setupWebSocket();
    
    // Cleanup WebSocket khi component unmount
    return () => {
      if (stompClient && stompClient.connected) {
        console.log('🔌 Disconnecting WebSocket...');
        stompClient.disconnect();
        setIsConnected(false);
      }
    };
  }, []);

  // Lấy bảng xếp hạng khi component mount
  useEffect(() => {
    // Reset question counter cho game mới  
    setCurrentQuestionNumber(1); // Reset về câu 1 khi bắt đầu game mới
    console.log('🧹 Reset currentQuestionNumber to 1 (không dùng isLastQuestion localStorage)');
    
    // ✅ RESET: Clear timer protection cho game mới
    window.correctTimerSet = false;
    window.correctTimerValue = null;
    console.log('🔓 Reset timer protection for new game');
    
    // 📊 Đọc totalQuestions từ currentRoom (từ CreateRoom)
    const currentRoom = localStorage.getItem('currentRoom');
    if (currentRoom) {
      try {
        const roomData = JSON.parse(currentRoom);
        console.log('🔍 Controller currentRoom data:', roomData);
        
        // Thử nhiều nguồn để lấy totalQuestions
        const totalFromRoom = roomData.totalQuestions;
        const totalFromSelectedQuiz = roomData.selectedQuiz?.questionCount;
        const finalTotal = totalFromRoom || totalFromSelectedQuiz || 4;
        
        setTotalQuestionsFromBackend(finalTotal);
        console.log('📊 Controller final totalQuestions:', finalTotal, 'from:', {
          totalFromRoom,
          totalFromSelectedQuiz,
          fallback: 4
        });
      } catch (error) {
        console.error('❌ Controller lỗi khi parse currentRoom:', error);
        // Fallback
        setTotalQuestionsFromBackend(4);
        console.log('📊 Controller fallback totalQuestions: 4');
      }
    } else {
      // Fallback nếu không có currentRoom
      setTotalQuestionsFromBackend(4);
      console.log('📊 Controller no currentRoom, fallback totalQuestions: 4');
    }
    
    // Tạo bảng xếp hạng ban đầu với điểm 0 (fallback nếu WebSocket chưa có data)
    createInitialRanking();
    
    // Kiểm tra câu hỏi đầu tiên từ WaitingRoom
    const firstQuestion = localStorage.getItem('firstQuestionData');
    
    console.log('🔍 CONTROLLER MOUNT DEBUG - localStorage check:', {
      hasFirstQuestion: !!firstQuestion,
      hasWindowFlag: window.firstQuestionReceived === true,
      firstQuestionLength: firstQuestion ? firstQuestion.length : 0,
      firstQuestionPreview: firstQuestion ? firstQuestion.substring(0, 100) : 'null'
    });

    if (firstQuestion) {
      try {
        const questionData = JSON.parse(firstQuestion);
        console.log('🎯 Controller load câu hỏi đầu tiên từ WaitingRoom:', {
          questionId: questionData.id,
          content: questionData.content,
          limitedTime: questionData.limitedTime,
          timeToCountdown: questionData.limitedTime || 30
        });
        
        // Chỉ lưu và setup countdown, KHÔNG hiển thị UI câu hỏi
        localStorage.setItem('currentQuestionData', firstQuestion);
        
        // Setup countdown timer
        const questionTime = questionData.limitedTime || 30;
        
        console.log('🔍 Controller localStorage Timer Setup:', {
          receivedLimitedTime: questionData.limitedTime,
          fallbackTime: 30,
          finalQuestionTime: questionTime,
          hasLimitedTimeFromBackend: !!questionData.limitedTime,
          source: 'firstQuestionData từ WaitingRoom'
        });
        
        // ✅ FORCE: Đảm bảo dùng thời gian từ question data
        if (questionData.limitedTime && questionData.limitedTime !== 30) {
          console.log('🕐 FORCING timer từ question data:', questionData.limitedTime, 'giây (không phải 30s fallback)');
          setTimeLeft(questionData.limitedTime);
          
          // ✅ PROTECTION: Prevent timer override
          window.correctTimerSet = true;
          window.correctTimerValue = questionData.limitedTime;
          console.log('🛡️ Protected timer value:', questionData.limitedTime);
        } else {
          console.log('🕐 Using fallback timer:', questionTime, 'giây');
          setTimeLeft(questionTime);
        }
        
        setIsQuestionActive(true);
        setTimerFinished(false);
        
        // Ẩn ranking và nút khi có câu hỏi
        setShowRanking(false);
        setShowNextQuestionButton(false);
        
        // ✅ KHÔNG XÓA localStorage - giữ lại cho debug
        // localStorage.removeItem('firstQuestionReceived'); // COMMENTED OUT
        
        console.log('✅ Controller bắt đầu đếm ngược từ localStorage:', questionTime, 'giây');
      } catch (error) {
        console.error('❌ Lỗi khi parse câu hỏi đầu tiên:', error);
        console.error('❌ Raw firstQuestion data:', firstQuestion);
        
        // Fallback nếu parse error: dùng timer mặc định
        console.log('🔧 Parse error fallback: setup timer 30s');
        setTimeLeft(30);
        setIsQuestionActive(true);
        setTimerFinished(false);
        setShowRanking(false);
        setShowNextQuestionButton(false);
      }
    } else {
      console.log('⚠️ Không có firstQuestionData trong localStorage');
      console.log('🔍 Debug localStorage flags:', {
        firstQuestion: !!localStorage.getItem('firstQuestionData'),
        windowFlag: window.firstQuestionReceived === true,
        currentQuestionData: !!localStorage.getItem('currentQuestionData')
      });
      
      // Fallback: kiểm tra localStorage cũ
      const savedQuestion = localStorage.getItem('currentQuestionData');
      if (savedQuestion) {
        try {
          const questionData = JSON.parse(savedQuestion);
          console.log('📚 Fallback load câu hỏi từ localStorage cũ:', questionData);
          console.log('🔍 Fallback timer setup:', {
            limitedTime: questionData.limitedTime,
            hasLimitedTime: !!questionData.limitedTime
          });
          setCurrentQuestion(questionData);
          
          // Setup timer cho fallback nếu cần
          if (questionData.limitedTime) {
            console.log('⏰ Setup timer từ fallback localStorage:', questionData.limitedTime);
            setTimeLeft(questionData.limitedTime);
            setIsQuestionActive(true);
            setTimerFinished(false);
            setShowRanking(false);
            setShowNextQuestionButton(false);
            console.log('✅ Controller fallback timer setup completed:', questionData.limitedTime, 'giây');
          }
        } catch (error) {
          console.error('❌ Lỗi khi parse câu hỏi từ localStorage:', error);
        }
      } else {
        console.warn('❌ CONTROLLER KHÔNG CÓ CÂU HỎI NÀO! Setup fallback timer 30s');
        
        // Setup fallback timer 30 giây
        console.log('🔧 Setting up fallback timer: 30 seconds');
        setTimeLeft(30);
        setIsQuestionActive(true);
        setTimerFinished(false);
        setShowRanking(false);
        setShowNextQuestionButton(false);
        
        console.log('✅ Controller bắt đầu đếm ngược fallback: 30 giây');
      }
    }
    
    console.log('🚀 Đã vào PlayRoomForController, câu hỏi đầu tiên đã được gửi từ WaitingRoom');
    
  }, []); // Bỏ dependency joinCode để không tạo lại interval

  // Countdown timer cho câu hỏi hiện tại
  useEffect(() => {
    if (!isQuestionActive || timerFinished) return;
    
    console.log('🕐 TIMER EFFECT STARTING:', {
      timeLeft: timeLeft,
      isQuestionActive: isQuestionActive,
      timerFinished: timerFinished,
      currentQuestionNumber: currentQuestionNumber,
      totalQuestions: totalQuestionsFromBackend
    });
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Đánh dấu timer đã kết thúc nhưng vẫn hiển thị 0s
          setTimerFinished(true);
          setShowRanking(true);
          
          // Kiểm tra xem có phải câu cuối cùng không - dùng số câu thực tế
          const actualTotalQuestions = totalQuestionsFromBackend || 4;
          const isReallyLastQuestion = currentQuestionNumber >= actualTotalQuestions;

          if (isReallyLastQuestion) {
            console.log('🏁 Câu cuối cùng kết thúc, lấy ranking cuối cùng...');
            setShowNextQuestionButton(false);
            
            // LẤY RANKING CUỐI CÙNG cho câu cuối
            const fetchFinalRanking = async () => {
              try {
                console.log('📊 Controller lấy bảng xếp hạng cuối cùng...');
                
                // ✅ KHÔNG CẦN lưu finalRankingData - GameResult sẽ gọi API fresh
                console.log('🏁 Controller timer finished for final question (không lưu ranking localStorage)');
                
              } catch (error) {
                console.error('❌ Lỗi khi lấy ranking cuối cùng:', error);
              }
            };
            
            // Gọi fetchFinalRanking ngay lập tức
            fetchFinalRanking();
            
            // Rút ngắn thời gian chờ xuống 5s cho câu cuối
            setTimeout(() => {
              console.log('🚀 Chuyển đến GameResult sau 5s...');
              window.location.href = '/game-result';
            }, 5000);
          } else {
            setShowNextQuestionButton(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isQuestionActive, timerFinished]);

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col items-center pt-8 px-4 font-content space-y-6">
      {/* Mã tham gia + Đồng hồ đếm ngược */}
      <div className="flex items-center gap-4">
        <div className="bg-white border-2 border-[var(--pink)] rounded-lg px-4 py-2 text-black text-2xl text-center">
          {joinCode}
        </div>
        
        {/* Đồng hồ đếm ngược - luôn hiển thị */}
        <div className="bg-white border-2 border-blue-500 rounded-lg px-4 py-2 flex items-center gap-2">
          <span className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500' : timeLeft === 0 ? 'text-gray-500' : 'text-blue-600'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Bảng xếp hạng */}
      <div className="w-full max-w-4xl">
        {loading ? (
          <div className="text-center text-gray-500 py-20">
            <div className="text-2xl mb-2">📊</div>
            <div>Đang tải bảng xếp hạng...</div>
          </div>
        ) : rankingData.length > 0 ? (
          <>
            <RankingTable data={rankingData} totalQuestions={totalQuestionsFromBackend || 4} />
          </>
        ) : (
          <div className="text-center text-gray-500 py-20">
            <div className="text-2xl mb-2">📊</div>
            <div>Chưa có dữ liệu xếp hạng</div>
          </div>
        )}
      </div>

      {/* Nút "Câu tiếp theo" - chỉ hiển thị khi hết thời gian */}
      {showNextQuestionButton && (
        <div className="text-center">
          <button
            onClick={handleNextQuestion}
            className="bg-pink-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg"
          >
            Câu tiếp theo →
          </button>
        </div>
      )}

      <div className="w-full max-w-3xl mx-auto">
        <Chat />
      </div>
    </div>
  );
}