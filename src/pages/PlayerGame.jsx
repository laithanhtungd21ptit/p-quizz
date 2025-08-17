import React, { useState, useEffect } from 'react';
import { submitAnswer, getRoomRanking } from '../services/api';
import { useParams } from 'react-router-dom';
import Chat from '../components/Chat';
import RankingTable from '../components/RankingTable';

const PlayerGame = () => {
  const { roomId } = useParams();
  

  
  // State cho WebSocket
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const [questionData, setQuestionData] = useState({
    question: "Đang tải câu hỏi...",
    options: ["Đang tải...", "Đang tải...", "Đang tải...", "Đang tải..."],
    correctAnswer: null, // Không biết đáp án đúng, backend sẽ trả về
    selectedAnswer: null,
    image: null,
    currentQuestion: 1,
    totalQuestions: 10
  });

  // Dữ liệu mẫu cho bảng xếp hạng
  const rankingData = [
    { name: "Ngô Quốc Anh", score: 1020, correct: 8, wrong: 2, avatar: "/avatar/avatar_1.png" },
    { name: "Trần Văn B", score: 950, correct: 7, wrong: 3, avatar: "/avatar/avatar_2.png" },
    { name: "Lê Thị C", score: 880, correct: 6, wrong: 4, avatar: "/avatar/avatar_3.png" },
    { name: "Phạm Văn D", score: 820, correct: 5, wrong: 5, avatar: "/avatar/avatar_4.png" },
    { name: "Hoàng Thị E", score: 750, correct: 4, wrong: 6, avatar: "/avatar/avatar_5.png" },
  ];

  // Load question data từ localStorage khi component mount
  useEffect(() => {
    const savedQuestionData = localStorage.getItem('currentQuestionData');
    const gameStarted = localStorage.getItem('gameStarted');
    
    // Kiểm tra xem có ranking cũ trong localStorage không
    const savedRanking = localStorage.getItem('finalRankingData');
    if (savedRanking) {
      try {
        const parsedRanking = JSON.parse(savedRanking);
        console.log('📊 Load ranking cũ từ localStorage:', parsedRanking);
        setRealRankingData(parsedRanking);
      } catch (error) {
        console.error('❌ Lỗi khi parse ranking từ localStorage:', error);
      }
    }

    // Load support cards từ WaitingRoomForPlayer
    const savedSupportCards = localStorage.getItem('currentSupportCards');
    if (savedSupportCards) {
      try {
        const parsedCards = JSON.parse(savedSupportCards);
        console.log('🎲 Load support cards từ localStorage:', parsedCards);
        setSupportCards(parsedCards);
      } catch (error) {
        console.error('❌ Lỗi khi parse support cards từ localStorage:', error);
      }
    }
    
    if (savedQuestionData && gameStarted === 'true') {
      try {
        const parsedData = JSON.parse(savedQuestionData);
        console.log('Loading question data from localStorage:', parsedData);
        
        // Giữ nguyên cấu trúc backend để có đầy đủ thông tin
        setQuestionData({
          // Backend fields
          id: parsedData.id,
          content: parsedData.content,
          description: parsedData.description,
          answerA: parsedData.answerA,
          answerB: parsedData.answerB,
          answerC: parsedData.answerC,
          answerD: parsedData.answerD,
          limitedTime: parsedData.limitedTime,
          score: parsedData.score,
          imageUrl: parsedData.imageUrl,
          questionLast: parsedData.questionLast,
          startTime: parsedData.startTime,
          
          // Frontend fields (để tương thích)
          question: parsedData.content || parsedData.description || "Câu hỏi",
          options: [
            parsedData.answerA || "Đáp án A",
            parsedData.answerB || "Đáp án B", 
            parsedData.answerC || "Đáp án C",
            parsedData.answerD || "Đáp án D"
          ],
          correctAnswer: indexToLetter(parsedData.correctAnswer || 0), // Chuyển từ số sang chữ cái A, B, C, D
          selectedAnswer: null,
          image: parsedData.imageUrl || parsedData.image || null,
          currentQuestion: 1,
          totalQuestions: 10
        });
        
        // Lấy thời gian từ database (nếu có)
        const questionTime = parsedData.limitedTime || parsedData.timeLimit || parsedData.time || 30; // Ưu tiên limitedTime từ backend
        console.log('Setting question time from database:', questionTime, 'seconds');
        setTimeLeft(questionTime);
        
        // Lưu ranking cũ vào localStorage trước khi reset (nếu có)
        if (realRankingData.length > 0) {
          localStorage.setItem('finalRankingData', JSON.stringify(realRankingData));
          console.log('💾 Đã lưu ranking cũ vào localStorage trước khi reset');
        }
        
        // Reset các state khác khi load question mới
        setHasAnswered(false);
        setIsCorrect(null);
        setShowRankingTable(false);
        setUsedTimeCard(false);
        setUsedTargetCard(false);
        setCountdownProgress(0);
        setAnswerResult(null);
        setRealRankingData([]);
        
        // Clear localStorage để tránh load lại
        localStorage.removeItem('currentQuestionData');
        localStorage.removeItem('gameStarted');
        
      } catch (error) {
        console.error('Error parsing question data from localStorage:', error);
      }
    } else {
      console.log('No question data found in localStorage');
    }
  }, []); // Bỏ roomId dependency để tránh mount liên tục

  // Thiết lập WebSocket khi component mount
  useEffect(() => {
    if (roomId) {
      console.log('🔌 Setting up WebSocket for room:', roomId);
      setupWebSocket();
    }
    
    // Cleanup WebSocket khi component unmount
    return () => {
      if (stompClient && stompClient.connected) {
        console.log('🔌 Disconnecting WebSocket...');
        stompClient.disconnect();
        setIsConnected(false);
      }
    };
  }, []); // Bỏ roomId dependency để tránh mount liên tục

  // Thiết lập WebSocket connection
  const setupWebSocket = () => {
    if (!roomId) {
      console.log('❌ Không có roomId để kết nối WebSocket');
      return;
    }

    console.log('🔌 Thiết lập WebSocket connection cho room:', roomId);
    
    // Lấy pinCode từ localStorage để so sánh
    const currentRoom = localStorage.getItem('currentRoom');
    if (currentRoom) {
      const roomData = JSON.parse(currentRoom);
      console.log('🏠 Room data từ localStorage:', roomData);
      console.log('🔑 PinCode:', roomData.pinCode, 'RoomId:', roomData.roomId);
    }
    
    // Sử dụng SockJS và STOMP
    const socket = new window.SockJS('http://localhost:8080/ws');
    const client = window.Stomp.over(socket);
    
    // Disable STOMP debug logging
    client.debug = null;
    
    // Lấy clientSessionId để authenticate WebSocket
    const clientSessionId = localStorage.getItem('clientSessionId');
    const connectHeaders = clientSessionId ? { clientSessionId } : {};
    
    client.connect(connectHeaders, (frame) => {
      console.log('✅ WebSocket connected successfully!');
      setIsConnected(true);
      setStompClient(client);
      
      // Subscribe vào topic của phòng để nhận câu hỏi tiếp theo
      const roomTopic = `/topic/room/${roomId}`;
      console.log('📡 Subscribing to room topic:', roomTopic);
      
      client.subscribe(roomTopic, (message) => {
        console.log('=== 🎯 MESSAGE RECEIVED IN PLAYERGAME ===');
        console.log('📨 Raw message:', message.body);
        console.log('🎯 Topic received:', message.destination);
        
        try {
          const data = JSON.parse(message.body);
          console.log('🔍 Parsed message data:', data);
          
          // Kiểm tra xem có phải câu hỏi tiếp theo không
          if (data.type === 'NEXT_QUESTION' && data.data) {
            console.log('🚀 Nhận câu hỏi tiếp theo từ backend!');
            handleNextQuestion(data.data);
          } else if (data.id && (data.answerA || data.answerB || data.answerC || data.answerD)) {
            // Trường hợp nhận câu hỏi trực tiếp (không có type)
            console.log('🚀 Nhận câu hỏi trực tiếp từ backend!');
            handleNextQuestion(data);
          } else {
            console.log('📝 Không phải câu hỏi, bỏ qua message');
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      });
      
      // Subscribe vào queue để nhận thông báo kick riêng
      client.subscribe('/user/queue/kick', (message) => {
        if (isBeingKicked || window.isBeingKicked) return; // Tránh duplicate processing
        setIsBeingKicked(true);
        
        // Disconnect WebSocket ngay để tránh nhận thêm message
        if (client && client.connected) {
          client.disconnect();
        }
        
        // Set global flag để tránh các component khác nhận kick message
        window.isBeingKicked = true;
        
        alert(message.body); // Hiển thị thông báo kick
        // Clear room data và quay về dashboard
        localStorage.removeItem('currentRoom');
        localStorage.removeItem('clientSessionId');
        localStorage.removeItem('currentQuestionData');
        localStorage.removeItem('gameStarted');
        
        // Đợi một chút để disconnect hoàn thành trước khi navigate
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      });
      
      console.log('✅ Successfully subscribed to room topic');
      
    }, (error) => {
      console.error('❌ WebSocket connection error:', error);
      setIsConnected(false);
    });
  };

  // Xử lý khi nhận câu hỏi tiếp theo
  const handleNextQuestion = (newQuestionData) => {
    console.log('🔄 Xử lý câu hỏi tiếp theo:', newQuestionData.id);
    
    // Cập nhật question data
    setQuestionData({
      // Backend fields
      id: newQuestionData.id,
      content: newQuestionData.content,
      description: newQuestionData.description,
      answerA: newQuestionData.answerA,
      answerB: newQuestionData.answerB,
      answerC: newQuestionData.answerC,
      answerD: newQuestionData.answerD,
      limitedTime: newQuestionData.limitedTime,
      score: newQuestionData.score,
      imageUrl: newQuestionData.imageUrl,
      questionLast: newQuestionData.questionLast,
      startTime: newQuestionData.startTime,
      
      // Frontend fields
      question: newQuestionData.content || newQuestionData.description || "Câu hỏi",
      options: [
        newQuestionData.answerA || "Đáp án A",
        newQuestionData.answerB || "Đáp án B", 
        newQuestionData.answerC || "Đáp án C",
        newQuestionData.answerD || "Đáp án D"
      ],
      correctAnswer: indexToLetter(newQuestionData.correctAnswer || 0),
      selectedAnswer: null,
      image: newQuestionData.imageUrl || newQuestionData.image || null,
      currentQuestion: (questionData.currentQuestion || 0) + 1,
      totalQuestions: 10
    });
    
    // Reset timer với thời gian mới
    const newTime = newQuestionData.limitedTime || 30;
    setTimeLeft(newTime);
    
    // Reset các state khác
    setHasAnswered(false);
    setIsCorrect(null);
    setShowRankingTable(false);
    setUsedTimeCard(false);
    setUsedTargetCard(false);
    setCountdownProgress(0);
    setAnswerResult(null);
    
    console.log('✅ Đã cập nhật câu hỏi mới và reset game state');
    
    // Lưu câu hỏi mới vào localStorage
    localStorage.setItem('currentQuestionData', JSON.stringify(newQuestionData));
  };

  const [timeLeft, setTimeLeft] = useState(30);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardImage, setCardImage] = useState('');
  const [usedTimeCard, setUsedTimeCard] = useState(false);
  const [usedTargetCard, setUsedTargetCard] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  const [showRankingTable, setShowRankingTable] = useState(false);
  const [countdownProgress, setCountdownProgress] = useState(0);
  const [answerResult, setAnswerResult] = useState(null);
  const [realRankingData, setRealRankingData] = useState([]);
  const [currentParticipant, setCurrentParticipant] = useState(null);
  const [supportCards, setSupportCards] = useState([]);
  const [usedCards, setUsedCards] = useState([false, false]); // Track 2 thẻ đã sử dụng
  const [isBeingKicked, setIsBeingKicked] = useState(false);

  // Helper functions để chuyển đổi giữa index (0,1,2,3) và chữ cái (A,B,C,D)
  const indexToLetter = (idx) => ['A', 'B', 'C', 'D'][idx];
  const letterToIndex = (letter) => ['A', 'B', 'C', 'D'].indexOf(letter);

  // Helper function để chuyển từ UI support card object sang backend enum
  const getBackendCardType = (cardName) => {
    const mapping = {
      "50:50": "HIDE_ANSWER",
      "Nhân đôi điểm": "DOUBLE_SCORE",
      "Thử lại": "RETRY_ANSWER"
    };
    return mapping[cardName];
  };

  // Handler cho từng thẻ hỗ trợ
  const handleSupportCardClick = async (cardIndex) => {
    const card = supportCards[cardIndex];
    const backendCardType = getBackendCardType(card?.name);
    
    // Logic kiểm tra khác nhau cho từng loại thẻ
    if (backendCardType === 'RETRY_ANSWER') {
      // Thẻ RETRY_ANSWER chỉ dùng được SAU KHI trả lời SAI
      if (!hasAnswered || isCorrect || usedCards[cardIndex]) {
        console.log('Không thể sử dụng thẻ RETRY_ANSWER:', { 
          hasAnswered, 
          isCorrect,
          usedCards: usedCards[cardIndex]
        });
        return;
      }
    } else {
      // Các thẻ khác không dùng được sau khi đã trả lời
      if (hasAnswered || !supportCards[cardIndex] || usedCards[cardIndex]) {
        console.log('Không thể sử dụng thẻ:', { 
          hasAnswered, 
          cardExists: !!supportCards[cardIndex],
          cardUsed: usedCards[cardIndex]
        });
        return;
      }
    }

    if (!backendCardType) {
      console.error('Không tìm thấy backend card type cho:', card.name);
      return;
    }

    // NGAY LẬP TỨC: Đánh dấu thẻ đã được sử dụng để user thấy feedback
    setUsedCards(prev => {
      const newUsedCards = [...prev];
      newUsedCards[cardIndex] = true;
      return newUsedCards;
    });

    // HIỆN ANIMATION THẺ - Dùng ảnh thẻ lớn thay vì icon
    const cardImageMap = {
      'HIDE_ANSWER': '/public/thẻ 50_50.png',
      'DOUBLE_SCORE': '/public/thẻ x2.png', 
      'RETRY_ANSWER': '/public/thẻ double try.png'
    };
    
    const largeCardImage = cardImageMap[backendCardType] || card.icon;
    setCardImage(largeCardImage);
    setShowCardModal(true);
    setIsTimerPaused(true); // Pause timer khi hiện modal
    console.log('🎭 Hiển thị animation thẻ lớn:', card.name, '→', largeCardImage);

    console.log(`🎯 Đang sử dụng thẻ ${card.name}...`);

    try {
      await useSupportCard(backendCardType);
      console.log(`✅ Đã sử dụng thẻ ${card.name} thành công`);
      
      // Ẩn modal sau khi thành công (2.5 giây)
      setTimeout(() => {
        setIsModalClosing(true);
        setTimeout(() => {
          setShowCardModal(false);
          setIsModalClosing(false);
          setIsTimerPaused(false); // Resume timer khi ẩn modal
        }, 300);
      }, 2500);
      
    } catch (error) {
      console.error('Lỗi khi sử dụng thẻ:', error);
      
      // NẾU LỖI: Phục hồi lại trạng thái thẻ chưa sử dụng
      setUsedCards(prev => {
        const newUsedCards = [...prev];
        newUsedCards[cardIndex] = false;
        return newUsedCards;
      });
      
      console.log(`❌ Phục hồi thẻ ${card.name} do lỗi API`);
      
      // Ẩn modal ngay khi lỗi (1 giây)
      setTimeout(() => {
        setIsModalClosing(true);
        setTimeout(() => {
          setShowCardModal(false);
          setIsModalClosing(false);
          setIsTimerPaused(false); // Resume timer khi ẩn modal (lỗi)
        }, 300);
      }, 1000);
    }
  };

  // Hàm gọi API sử dụng thẻ hỗ trợ
  const useSupportCard = async (cardType) => {
    try {
      const token = localStorage.getItem('token');
      const clientSessionId = localStorage.getItem('clientSessionId');
      const currentRoom = localStorage.getItem('currentRoom');
      
      if (!token || !clientSessionId || !currentRoom) {
        console.error('Thiếu thông tin để gọi API sử dụng thẻ');
        return;
      }

      // Debug token
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔍 Token payload:', tokenPayload);
        console.log('🔍 Token exp:', new Date(tokenPayload.exp * 1000));
        console.log('🔍 Current time:', new Date());
        console.log('🔍 Token expired?', tokenPayload.exp * 1000 < Date.now());
      } catch (e) {
        console.error('❌ Token không thể decode:', e);
      }

      const roomData = JSON.parse(currentRoom);
      const pinCode = roomData.pinCode;
      
      const requestBody = {
        clientSessionId: clientSessionId,
        questionId: questionData.id,
        cardType: cardType
      };

      console.log('=== USE SUPPORT CARD API ===');
      console.log('PinCode:', pinCode);
      console.log('Request body:', requestBody);
      console.log('API URL:', `http://localhost:8080/${pinCode}/support-card`);

      const response = await fetch(`http://localhost:8080/${pinCode}/support-card`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        let result;
        
        // Xử lý response khác nhau tùy theo loại thẻ
        if (cardType === 'HIDE_ANSWER') {
          // HIDE_ANSWER trả về JSON (QuestionResponse)
          result = await response.json();
          console.log('✅ Sử dụng thẻ 50:50 thành công:', result);
          
          // Cập nhật UI với đáp án đã bị ẩn
          setQuestionData(prev => ({
            ...prev,
            options: [
              result.answerA || "Đã ẩn", 
              result.answerB || "Đã ẩn", 
              result.answerC || "Đã ẩn", 
              result.answerD || "Đã ẩn"
            ]
          }));
        } else {
          // Các thẻ khác trả về plain text
          result = await response.text();
          console.log('✅ Sử dụng thẻ thành công:', result);
          
          if (cardType === 'DOUBLE_SCORE') {
            // Điểm sẽ được nhân đôi ở backend khi submit answer
            console.log('Thẻ nhân đôi điểm đã được kích hoạt');
          } else if (cardType === 'RETRY_ANSWER') {
            // Đáp án cũ đã bị xóa, có thể chọn lại
            console.log('Thẻ thử lại đã được kích hoạt, có thể chọn đáp án khác');
            setQuestionData(prev => ({ ...prev, selectedAnswer: null }));
            setHasAnswered(false);
          }
        }
        
        return result;
      } else {
        const errorText = await response.text();
        console.error('❌ Lỗi khi sử dụng thẻ:', response.status, errorText);
        console.error('❌ Chi tiết request:', {
          pinCode,
          questionId: questionData.id,
          clientSessionId,
          cardType,
          token: token ? 'Có token' : 'Không có token'
        });
        throw new Error(`${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Lỗi API sử dụng thẻ:', error);
      throw error;
    }
  };

  // === KIỂM TRA MÔI TRƯỜNG VÀ DEBUG ===
  useEffect(() => {
    console.log('=== PLAYER GAME MOUNT DEBUG ===');
    console.log('Room ID từ URL:', roomId);
    
    // Kiểm tra token
    let token = localStorage.getItem('token');
    if (!token) {
      const authData = localStorage.getItem('auth');
      if (authData) {
        try {
          const parsedAuth = JSON.parse(authData);
          if (parsedAuth.bearer && parsedAuth.bearer.length > 0) {
            token = parsedAuth.bearer[0].value;
            console.log('Lấy token từ auth object:', token.substring(0, 20) + '...');
          }
        } catch (error) {
          console.error('Lỗi khi parse auth data:', error);
        }
      }
    }
    
    if (!token) {
      console.error('Không tìm thấy token khi component mount');
      alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      window.location.href = '/login';
      return;
    }
    
    console.log('Token hợp lệ:', token.substring(0, 20) + '...');
    
    // Kiểm tra thông tin phòng
    const currentRoom = localStorage.getItem('currentRoom');
    if (!currentRoom) {
      console.error('Không tìm thấy thông tin phòng');
      alert('Không tìm thấy thông tin phòng. Vui lòng tham gia phòng lại.');
      window.location.href = '/join-room';
      return;
    }
    
    try {
      const roomInfo = JSON.parse(currentRoom);
      console.log('=== THÔNG TIN PHÒNG DEBUG ===');
      console.log('Thông tin phòng hiện tại:', roomInfo);
      console.log('Tất cả keys:', Object.keys(roomInfo));
      console.log('PinCode:', roomInfo.pinCode);
      console.log('Room ID:', roomInfo.id);
      console.log('Room name:', roomInfo.name);
      console.log('Room status:', roomInfo.status);
      
      // Kiểm tra pinCode có khớp với roomId không
      if (roomInfo.pinCode !== roomId) {
        console.warn('PinCode không khớp với roomId:', {
          pinCode: roomInfo.pinCode,
          roomId: roomId,
          roomIdFromStorage: roomInfo.roomId
        });
        
        // Thử so sánh với roomId từ storage
        if (roomInfo.roomId && roomInfo.roomId.toString() === roomId) {
          console.log('✅ PinCode khớp với roomId từ storage');
        } else {
          console.warn('⚠️ PinCode và roomId không khớp!');
        }
      }
      
      // Kiểm tra có đủ thông tin cần thiết không
      if (!roomInfo.pinCode && !roomInfo.roomId) {
        console.error('Thiếu cả pinCode và roomId của phòng');
        alert('Thông tin phòng không đầy đủ. Vui lòng tham gia phòng lại.');
        window.location.href = '/join-room';
        return;
      }
      
      // === DEBUG ROOM PARTICIPANTS ===
      if (roomInfo.participants && Array.isArray(roomInfo.participants)) {
        console.log('=== ROOM PARTICIPANTS DEBUG ===');
        console.log('Participants trong room:', roomInfo.participants);
        
        // Kiểm tra user hiện tại có trong danh sách không
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('Current user:', currentUser);
        
        // Tìm participant hiện tại
        const foundParticipant = roomInfo.participants.find(p => {
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

        const isParticipant = !!foundParticipant;
        
        // Lưu participant hiện tại vào state
        if (foundParticipant) {
          setCurrentParticipant(foundParticipant);
          console.log('✅ Đã tìm thấy participant hiện tại:', foundParticipant);
        }
        
        console.log('User có trong danh sách participants:', isParticipant);
        
        if (!isParticipant) {
          console.warn('⚠️ USER KHÔNG CÓ TRONG DANH SÁCH PARTICIPANTS!');
          console.warn('Username hiện tại:', currentUser.username);
          console.warn('Có thể gây lỗi 403 khi submit answer');
          console.warn('Backend tìm kiếm bằng username:', currentUser.username);
        }
      } else {
        console.warn('Không có thông tin participants trong room data');
        console.log('Đang thử lấy participants từ API...');
        
        // Thử lấy participants từ API
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('Current user:', currentUser);
        
        // Lấy token
        let token = localStorage.getItem('token');
        if (!token) {
          const authData = localStorage.getItem('auth');
          if (authData) {
            try {
              const parsedAuth = JSON.parse(authData);
              if (parsedAuth.bearer && parsedAuth.bearer.length > 0) {
                token = parsedAuth.bearer[0].value;
              }
            } catch (error) {
              console.error('Lỗi khi parse auth data:', error);
            }
          }
        }
        
        if (token) {
          // Thử lấy participants bằng roomId
          fetch(`http://localhost:8080/rooms/participants?roomId=${roomInfo.roomId || roomId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          .then(response => response.json())
          .then(data => {
            console.log('=== PARTICIPANTS FROM API ===');
            console.log('Participants:', data);
            
            // CẬP NHẬT: Lưu participants vào currentRoom để sử dụng sau này
            const currentRoomData = JSON.parse(localStorage.getItem('currentRoom') || '{}');
            const updatedRoomData = {
              ...currentRoomData,
              participants: data
            };
            localStorage.setItem('currentRoom', JSON.stringify(updatedRoomData));
            console.log('✅ Đã cập nhật currentRoom với participants từ API');
            
            // Kiểm tra user có trong danh sách không
            const isParticipant = data.some(p => {
              const usernameMatch = p.username === currentUser.username;
              const firstNameMatch = p.firstName === currentUser.username || p.firstname === currentUser.username;
              const idMatch = p.userId === currentUser.id || p.id === currentUser.id;
              
              return usernameMatch || firstNameMatch || idMatch;
            });
            
            console.log('User có trong danh sách participants (API):', isParticipant);
            
            if (!isParticipant) {
              console.error('❌ USER KHÔNG CÓ TRONG DANH SÁCH PARTICIPANTS!');
              console.error('Đây chính là nguyên nhân gây lỗi 403!');
              console.error('Username hiện tại:', currentUser.username);
              console.error('Backend tìm kiếm bằng username:', currentUser.username);
            } else {
              console.log('✅ User có trong danh sách participants');
            }
          })
          .catch(error => {
            console.error('Lỗi khi lấy participants từ API:', error);
          });
        }
      }
      
    } catch (error) {
      console.error('Lỗi khi parse thông tin phòng:', error);
      localStorage.removeItem('currentRoom');
      alert('Thông tin phòng không hợp lệ. Vui lòng tham gia phòng lại.');
      window.location.href = '/join-room';
      return;
    }
  }, [roomId]);



  useEffect(() => {
    if (timeLeft > 0 && !isTimerPaused && !hasAnswered) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !hasAnswered) {
      // Khi thời gian hết mà chưa trả lời, tự động đánh dấu sai
      setIsCorrect(false);
      setHasAnswered(true);
      
      // Bắt đầu countdown progress
      setCountdownProgress(100);
      const countdownInterval = setInterval(() => {
        setCountdownProgress(prev => {
          if (prev <= 0) {
            clearInterval(countdownInterval);
            setShowRankingTable(true);
            return 0;
          }
          return prev - 2; // Giảm 2% mỗi 100ms (5 giây = 5000ms, 5000/100 = 50 lần, 100/50 = 2%)
        });
      }, 100);
    }
  }, [timeLeft, isTimerPaused, hasAnswered]);

  const bgImages = [
    '/Group1.png',
    '/Group2.png',
    '/Group3.png',
    '/Group4.png',
  ];

    const handleAnswerSelect = async (idx) => {
    if (!hasAnswered) {
      setQuestionData(prev => ({
        ...prev,
        selectedAnswer: indexToLetter(idx) // Chuyển từ số sang chữ cái A, B, C, D
      }));
      
      // Chỉ set selectedAnswer, KHÔNG set isCorrect hay hasAnswered
      // Đợi backend trả về kết quả trước khi hiển thị
      
      // === CHUẨN BỊ DỮ LIỆU ĐÁP ÁN ===
      const clientSessionId = localStorage.getItem('clientSessionId');
      
      const answerData = {
        selectedAnswer: indexToLetter(idx), // BE chỉ nhận selectedAnswer, timeTaken, clientSessionId
        timeTaken: Math.max(0, (questionData.limitedTime || 30) - timeLeft),
        clientSessionId: clientSessionId
      };
      
      console.log('=== DEBUG SUBMIT ANSWER ===');
      const token = localStorage.getItem('token');
      const currentRoom = localStorage.getItem('currentRoom');
      const pinCode = currentRoom ? JSON.parse(currentRoom).pinCode : null;
      console.log('Token:', token);
      console.log('Pin code:', pinCode);
      console.log('Answer data:', answerData);
      console.log('Room ID from URL:', roomId);
      console.log('User info:', JSON.parse(localStorage.getItem('user') || '{}'));
      console.log('Client session ID:', clientSessionId);
      console.log('Current room data:', currentRoom ? JSON.parse(currentRoom) : null);
      
      // === DEBUG USER PARTICIPATION ===
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const roomData = currentRoom ? JSON.parse(currentRoom) : null;
        
        console.log('=== USER PARTICIPATION DEBUG ===');
        console.log('Current user data:', userData);
        console.log('Current room data:', roomData);
        
        if (roomData && roomData.participants) {
          console.log('Participants in room:', roomData.participants);
          
          // Kiểm tra xem user có trong danh sách tham gia không
          const isParticipant = roomData.participants.some(p => {
            const usernameMatch = p.username === userData.username;
            const firstNameMatch = p.firstName === userData.username || p.firstname === userData.username;
            const idMatch = p.userId === userData.id || p.id === userData.id;
            
            console.log(`Participant ${p.username || p.firstName || p.firstname}:`, {
              username: p.username,
              firstName: p.firstName,
              firstname: p.firstname,
              userId: p.userId,
              id: p.id,
              usernameMatch,
              firstNameMatch,
              idMatch,
              isMatch: usernameMatch || firstNameMatch || idMatch
            });
            
            return usernameMatch || firstNameMatch || idMatch;
          });
          
          console.log('User có trong danh sách tham gia:', isParticipant);
          
          if (!isParticipant) {
            console.warn('⚠️ USER KHÔNG CÓ TRONG DANH SÁCH THAM GIA!');
            console.warn('Đây có thể là nguyên nhân gây lỗi 403');
            console.warn('Backend tìm kiếm bằng username:', userData.username);
            console.warn('Nhưng trong danh sách participants có thể không có username này');
          }
        } else {
          console.warn('Không có thông tin participants trong room data');
        }
      } catch (error) {
        console.error('Lỗi khi debug user participation:', error);
      }
      
      // Kiểm tra dữ liệu trước khi gửi
      if (!answerData.selectedAnswer) {
        throw new Error('Đáp án không hợp lệ');
      }
      
      if (answerData.timeTaken < 0) {
        console.warn('Thời gian trả lời âm, đặt lại thành 0');
        answerData.timeTaken = 0;
      }
      
      // Gửi đáp án về backend
      try {
        const currentRoom = localStorage.getItem('currentRoom');
        const pinCode = currentRoom ? JSON.parse(currentRoom).pinCode : null;
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        console.log('=== DEBUG SUBMIT ANSWER ===');
        console.log('Current room:', currentRoom);
        console.log('Pin code:', pinCode);
        console.log('Token exists:', !!token);
        console.log('User exists:', !!user);
        console.log('Room ID from URL:', roomId);
        
        if (pinCode) {
          
          const response = await submitAnswer(pinCode, answerData);
          console.log('Đáp án đã được gửi thành công');
          console.log('Kết quả từ backend:', response);
          
          // Xử lý kết quả từ backend
                      if (response) {
              // Set kết quả đúng/sai từ backend
              setIsCorrect(response.correct || false);
              setHasAnswered(true);
              
              // Lưu thông tin kết quả để hiển thị
              setAnswerResult({
                isCorrect: response.correct,
                correctAnswer: response.correctAnswer,
                selectedAnswer: response.selectedAnswer,
                score: response.score,
                timeTaken: response.timeTaken
              });
              
              console.log('Score mới:', response.score);
              console.log('Is Correct:', response.correct);
              console.log('Đáp án đúng:', response.correctAnswer);
              console.log('Bạn chọn:', response.selectedAnswer);
              
              // Kiểm tra xem có phải câu hỏi cuối cùng không
              if (questionData.questionLast === true) {
                console.log('🏁 Đây là câu hỏi cuối cùng! Sẽ chuyển đến GameResult sau khi hiển thị kết quả...');
                
                // Lưu dữ liệu câu hỏi cuối và kết quả vào localStorage để GameResult có thể sử dụng
                localStorage.setItem('finalQuestionData', JSON.stringify(questionData));
                localStorage.setItem('finalAnswerResult', JSON.stringify(response));
                
                // Lưu ranking hiện tại vào localStorage để GameResult có thể sử dụng
                if (realRankingData.length > 0) {
                  localStorage.setItem('finalRankingData', JSON.stringify(realRankingData));
                  console.log('💾 Đã lưu ranking cuối cùng vào localStorage cho GameResult');
                }
                
                // Lấy thông tin phòng
                const currentRoom = localStorage.getItem('currentRoom');
                if (currentRoom) {
                  localStorage.setItem('roomInfo', currentRoom);
                }
                
                // Đợi 5 giây để người chơi xem kết quả, sau đó chuyển đến GameResult
                setTimeout(() => {
                  console.log('🚀 Chuyển đến GameResult...');
                  window.location.href = '/game-result';
                }, 5000); // 5 giây
                
                return; // Không tiếp tục xử lý ranking
              }
              
              // Lấy bảng xếp hạng mới sau khi submit answer (chỉ khi không phải câu cuối)
              try {
                const currentRoom = localStorage.getItem('currentRoom');
                if (currentRoom) {
                  const roomData = JSON.parse(currentRoom);
                  const roomId = roomData.roomId;
                  
                  if (roomId) {
                    console.log('Lấy bảng xếp hạng cho phòng:', roomId);
                    const rankingResponse = await getRoomRanking(roomId);
                    setRealRankingData(rankingResponse);
                    console.log('Bảng xếp hạng mới:', rankingResponse);
                    
                    // Lưu ranking vào localStorage để GameResult có thể sử dụng
                    localStorage.setItem('finalRankingData', JSON.stringify(rankingResponse));
                    console.log('💾 Đã lưu ranking vào localStorage cho GameResult');
                  }
                }
              } catch (rankingError) {
                console.error('Lỗi khi lấy bảng xếp hạng:', rankingError);
              }
          } else {
            // Nếu backend trả về null (lỗi), vẫn set đã trả lời để tránh spam
            setHasAnswered(true);
            console.log('Backend trả về null, có thể có lỗi');
          }
        }
      } catch (error) {
        console.error('Lỗi khi gửi đáp án:', error);
      }
      
      // Bắt đầu countdown progress
      setCountdownProgress(100);
      const countdownInterval = setInterval(() => {
        setCountdownProgress(prev => {
          if (prev <= 0) {
            clearInterval(countdownInterval);
            setShowRankingTable(true);
            return 0;
          }
          return prev - 2; // Giảm 2% mỗi 100ms (5 giây = 5000ms, 5000/100 = 50 lần, 100/50 = 2%)
        });
      }, 100);
    }
  };

  const handleTimeClick = () => {
    if (!usedTimeCard && !hasAnswered) {
      console.log('Bấm vào đồng hồ');
      setCardImage('/thẻ +time.png');
      setShowCardModal(true);
      setUsedTimeCard(true);
      setIsTimerPaused(true);
      
      // Bắt đầu hiệu ứng đóng modal sau 2.5 giây
      setTimeout(() => {
        setIsModalClosing(true);
        // Ẩn modal sau khi animation fade out hoàn thành
        setTimeout(() => {
          setShowCardModal(false);
          setIsModalClosing(false);
          setIsTimerPaused(false);
        }, 300);
      }, 2500);
    }
  };

  const handleTargetClick = () => {
    if (!usedTargetCard && !hasAnswered) {
      console.log('Bấm vào mục tiêu');
      setCardImage('/thẻ 50_50.png');
      setShowCardModal(true);
      setUsedTargetCard(true);
      setIsTimerPaused(true);
      
      // Bắt đầu hiệu ứng đóng modal sau 2.5 giây
      setTimeout(() => {
        setIsModalClosing(true);
        // Ẩn modal sau khi animation fade out hoàn thành
        setTimeout(() => {
          setShowCardModal(false);
          setIsModalClosing(false);
          setIsTimerPaused(false);
        }, 300);
      }, 2500);
    }
  };



  return (
    <div className="min-h-screen w-full bg-[url('/background2.png')] bg-cover bg-center bg-no-repeat">
      {/* Header */}
      <div className="p-2">
        <div className="flex items-center justify-between px-8">
          {/* Bên trái: Hạng + Điểm */}
          <div className="flex items-center space-x-3">
            {(() => {
              // Tìm thông tin player hiện tại trong ranking
              const currentUser = localStorage.getItem('user');
              let playerRank = "?";
              let playerScore = 0;
              
              if (currentUser && realRankingData.length > 0) {
                try {
                  const userData = JSON.parse(currentUser);
                  
                  // Tìm player trong ranking - thử nhiều cách match
                  const playerIndex = realRankingData.findIndex(player => {
                    return (
                      player.username === userData.username ||  // username
                      player.name === userData.username ||      // name
                      player.firstName === userData.username || // firstName
                      player.id === userData.id ||              // id
                      player.firstName === userData.firstName || // firstName match
                      player.username === userData.firstName    // username vs firstName
                    );
                  });
                  
                  if (playerIndex !== -1) {
                    playerRank = (playerIndex + 1); // Rank bắt đầu từ 1
                    playerScore = realRankingData[playerIndex].score || 0;
                  }
                } catch (error) {
                  console.error('❌ Error parsing user data for ranking:', error);
                }
              }
              
              // Format rank display
              const formatRank = (rank) => {
                if (typeof rank === 'number') {
                  if (rank === 1) return '1st';
                  if (rank === 2) return '2nd'; 
                  if (rank === 3) return '3rd';
                  return `${rank}th`;
                }
                return rank;
              };
              
              return (
                <>
                  {/* Hạng */}
                  <div className="flex items-center px-3 py-1 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg text-white space-x-1 h-9">
                    <img src="/Frame (5).png" className="w-8 h-8" alt="crown" />
                    <span className="text-sm font-bold">{formatRank(playerRank)}</span>
                  </div>
                  {/* Điểm */}
                  <div className="flex items-center px-3 py-1 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg text-white space-x-1 h-9">
                    <img src="Frame (6).png" className="w-8 h-8" alt="coin" />
                    <span className="text-sm font-bold">{playerScore}</span>
                  </div>
                </>
              );
            })()}
          </div>
          {/* Giữa: Mã phòng */}
          <div className="bg-white rounded-lg border-2 border-pink-500 px-4 flex items-center h-9">
            <span className="text-black text-xl tracking-widest font-bold">
              {(() => {
                const currentRoom = localStorage.getItem('currentRoom');
                if (currentRoom) {
                  const roomData = JSON.parse(currentRoom);
                  return roomData.pinCode || 'N/A';
                }
                return 'N/A';
              })()}
            </span>
          </div>
          {/* Bên phải: Cài đặt + Chat */}
          <div className="flex items-center space-x-2">
            {/* Nút setting */}
            <button className="w-9 h-9 flex items-center justify-center border-2 border-pink-500 rounded-lg bg-white hover:bg-pink-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09c.7 0 1.32-.4 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06c.48.48 1.2.63 1.82.33.6-.27 1-.89 1-1.51V3a2 2 0 1 1 4 0v.09c0 .7.4 1.32 1 1.51.62.3 1.34.15 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06-.06c-.48.48-.63 1.2-.33 1.82.27.6.89 1 1.51 1H21a2 2 0 1 1 0 4h-.09c-.7 0-1.32.4-1.51 1z"/>
              </svg>
            </button>

          </div>
        </div>
      </div>

      {/* QuestionEditor Interface hoặc RankingTable */}
      <div className="flex items-center justify-center transition-all duration-300">
        {!showRankingTable ? (
          <div className="transform scale-80">
            <div className="relative" style={{ width: 1037, height: 614, background: `url('/Group.png') no-repeat center center`, backgroundSize: 'contain' }}>
              <div className="absolute top-[45px] left-[64px] right-[64px]">
                {/* Hiển thị số câu */}
                <div className="flex justify-center mb-2">
                  <div className="bg-pink-500 text-white px-4 rounded-lg font-bold text-lg">
                    {questionData.currentQuestion}/{questionData.totalQuestions}
                  </div>
                </div>

                {/* Nhập câu hỏi */}
                <div className="relative bg-white text-black rounded-xl w-4/5 mx-auto">
                  <div className="flex items-center justify-center w-full">
                    <div className="w-full h-12 text-lg resize-none focus:outline-none text-center flex items-center justify-center">
                      <span className="text-center">{questionData.question}</span>
                    </div>
                  </div>
                </div>

                {/* Ô thời gian đếm ngược */}
                <div className="absolute top-[30px] right-[5px]">
                  <div className="border-4 border-pink-500 text-white w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl bg-transparent">
                    {timeLeft}
                  </div>
                </div>

                {/* Hiển thị điểm ở chính giữa giao diện */}
                {hasAnswered && answerResult && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                    <div className="bg-white rounded-xl px-8 py-4 shadow-2xl border-4 border-pink-500 text-center">
                      <div className="text-2xl font-bold text-gray-700 mb-1">Score</div>
                      <div className="text-4xl font-black text-blue-600">{answerResult.score}</div>
                    </div>
                  </div>
                )}

                {/* Giao diện thêm hình ảnh - luôn giữ khoảng trống */}
                <div className="flex items-center justify-center w-full my-6" style={{ minHeight: '240px' }}>
                  {questionData.image ? (
                    <div className="bg-white rounded-xl glow-pink p-6 max-w-md w-full">
                      <div className="bg-gray-100 rounded border border-gray-300 text-center relative max-w-2xl w-full" style={{ marginTop: 0, marginBottom: 0, height: 210, width: 320, display: 'block', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                        <img src={questionData.image} alt="question" className="rounded-xl w-full h-full object-contain pointer-events-none" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-210"></div> // Khoảng trống khi không có ảnh
                  )}
                </div>

                {/* Các câu trả lời */}
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {[0, 1, 2, 3].map((idx) => {
                    let bgImage = bgImages[idx]; // Mặc định là background gốc
                    let shouldShow = true; // Mặc định hiển thị tất cả
                    
                                         if (hasAnswered) {
                       if (answerResult && indexToLetter(idx) === answerResult.correctAnswer) {
                         bgImage = '/Group_correct.png'; // Đáp án đúng từ backend
                         shouldShow = true; // Luôn hiển thị đáp án đúng
                       } else if (answerResult && indexToLetter(idx) === answerResult.selectedAnswer && indexToLetter(idx) !== answerResult.correctAnswer) {
                         bgImage = '/Group_wrong.png'; // Đáp án sai đã chọn từ backend
                         shouldShow = true; // Hiển thị đáp án sai đã chọn
                       } else if (timeLeft === 0 && questionData.selectedAnswer === null) {
                         // Khi hết thời gian mà chưa chọn, ẩn tất cả trừ đáp án đúng
                         shouldShow = answerResult && indexToLetter(idx) === answerResult.correctAnswer;
                       } else {
                         shouldShow = false; // Ẩn các đáp án còn lại
                       }
                     }
                    
                    return (
                      <div
                        key={idx}
                        className={`relative text-black px-6 py-6 rounded cursor-pointer transition-all duration-300 ${
                          shouldShow ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                        style={{ 
                          background: `url('${bgImage}') center center / 100% 100% no-repeat`, 
                          height: 104 
                        }}
                        onClick={() => handleAnswerSelect(idx)}
                      >
                        <div className="w-full h-[69px] resize-none focus:outline-none bg-transparent text-base text-white overflow-hidden flex items-center">
                          <span className="text-white">{questionData.options[idx]}</span>
                        </div>
                        <div className="absolute -top-[11px] right-2 flex flex-col items-end group">
                          <span className="text-xs bg-pink-600 text-white px-2 py-0.5 rounded mb-1 opacity-0 group-hover:opacity-100 transition">
                            Chọn đáp án này
                          </span>
                          <input
                            type="radio"
                            name="correct"
                            checked={answerResult && answerResult.selectedAnswer === indexToLetter(idx)}
                            onChange={() => handleAnswerSelect(idx)}
                            className="w-5 h-5 cursor-pointer"
                            style={{
                              accentColor: answerResult && answerResult.selectedAnswer === indexToLetter(idx) ? '#dc2626' : '#9ca3af'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
                 ) : (
           <div className="transform scale-80">
             <div className="relative" style={{ width: 1037, height: 614 }}>
               <div className="absolute top-[45px] left-[64px] right-[64px]">
                 {realRankingData.length > 0 ? (
                   <RankingTable data={realRankingData} totalQuestions={questionData.totalQuestions} />
                 ) : (
                   <div className="text-center text-gray-500 mt-20">
                     <div className="text-2xl mb-2">📊</div>
                     <div>Đang tải bảng xếp hạng...</div>
                   </div>
                 )}
               </div>
             </div>
           </div>
         )}
      </div>

                           {/* User Info - góc dưới bên trái của trang */}
        <div className={`absolute bottom-0 left-0 right-0 px-8 transition-colors duration-300 ${
          showRankingTable 
            ? 'bg-transparent' 
            : hasAnswered 
              ? (isCorrect ? 'bg-green-500 bg-opacity-80' : 'bg-red-500 bg-opacity-80') 
              : ''
        }`}>
          {/* Countdown Progress Bar */}
          {hasAnswered && !showRankingTable && countdownProgress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-30">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 to-pink-600 transition-all duration-100 ease-linear"
                style={{ width: `${countdownProgress}%` }}
              />
            </div>
          )}
        <div className="flex items-end justify-between text-white py-2">
          {/* Bên trái: Avatar, tên, icon */}
          <div className="flex items-end space-x-4">
            {/* Avatar */}
            <img 
              src={currentParticipant?.avatar || "../public/Group (2).png"} 
              alt="avatar" 
              className="w-12 h-12 rounded-full object-cover" 
            />

            {/* Tên người chơi */}
            <span className="text-lg font-semibold whitespace-nowrap">
              {currentParticipant?.firstname || currentParticipant?.firstName || currentParticipant?.username || 'Player'}
            </span>

            {/* Đường kẻ dọc */}
            <div className="w-px h-8 bg-gray-400 mx-2"></div>

            {/* Support Cards */}
            {supportCards.length >= 2 ? (
              <>
                {/* Thẻ 1 */}
                <img 
                  src={supportCards[0]?.icon} 
                  alt={supportCards[0]?.name || "support card 1"} 
                  className={`w-10 h-10 transition-opacity ${
                    usedCards[0] || 
                    (hasAnswered && getBackendCardType(supportCards[0]?.name) !== 'RETRY_ANSWER') ||
                    (hasAnswered && getBackendCardType(supportCards[0]?.name) === 'RETRY_ANSWER' && isCorrect)
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'cursor-pointer hover:opacity-80'
                  }`}
                  onClick={() => handleSupportCardClick(0)}
                />

                {/* Thẻ 2 */}
                <img 
                  src={supportCards[1]?.icon} 
                  alt={supportCards[1]?.name || "support card 2"} 
                  className={`w-10 h-10 transition-opacity ${
                    usedCards[1] || 
                    (hasAnswered && getBackendCardType(supportCards[1]?.name) !== 'RETRY_ANSWER') ||
                    (hasAnswered && getBackendCardType(supportCards[1]?.name) === 'RETRY_ANSWER' && isCorrect)
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'cursor-pointer hover:opacity-80'
                  }`}
                  onClick={() => handleSupportCardClick(1)}
                />
              </>
            ) : (
              <>
                {/* Fallback - hiển thị loading hoặc placeholder */}
                <div className="w-10 h-10 bg-gray-400 rounded animate-pulse"></div>
                <div className="w-10 h-10 bg-gray-400 rounded animate-pulse"></div>
              </>
            )}
          </div>

                     {/* Giữa: Kết quả đúng/sai */}
           {hasAnswered && !showRankingTable && (
             <div className="flex items-center justify-center space-x-2">
               {isCorrect ? (
                 <>
                   <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                   </svg>
                   <span className="text-white font-bold text-xl">Chính xác</span>
                 </>
               ) : (
                 <>
                   <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                   </svg>
                   <span className="text-white font-bold text-xl">Sai</span>
                 </>
               )}
             </div>
           )}

          {/* Bên phải: Để trống để cân bằng */}
          <div className="w-12 h-12"></div>
        </div>
      </div>

      {/* Modal hiển thị thẻ */}
      {showCardModal && (
        <div className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 ${isModalClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
          <div className={`${isModalClosing ? 'animate-scaleOut' : 'animate-scaleIn'}`}>
            <img src={cardImage} alt="card" className="w-96 h-96 object-contain animate-shake" />
          </div>
        </div>
      )}

      <style>{`
        .glow-pink { box-shadow: 0 0 25px 10px #e9004a; }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes scaleIn {
          from { 
            transform: scale(0.5);
            opacity: 0;
          }
          to { 
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes scaleOut {
          from { 
            transform: scale(1);
            opacity: 1;
          }
          to { 
            transform: scale(0.5);
            opacity: 0;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-fadeOut {
          animation: fadeOut 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
        
        .animate-scaleOut {
          animation: scaleOut 0.3s ease-out;
        }
        
        .animate-shake {
          animation: shake 1s ease-in-out;
        }
      `}</style>

      {/* Chat Component */}
      <div className="w-full max-w-3xl mx-auto">
        <Chat />
      </div>
    </div>
  );
};

export default PlayerGame; 