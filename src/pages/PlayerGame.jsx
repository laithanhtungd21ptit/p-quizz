import React, { useState, useEffect, useMemo } from 'react';
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
    totalQuestions: 4 // Sửa từ 10 → 4 theo yêu cầu
  });
  
  // State để track số câu hỏi thực tế và tổng số câu từ backend
  const [actualQuestionCount, setActualQuestionCount] = useState(1);
  const [totalQuestionsFromBackend, setTotalQuestionsFromBackend] = useState(null);

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
    
    // 📊 Đọc totalQuestions từ currentRoom (từ CreateRoom)
    const currentRoom = localStorage.getItem('currentRoom');
    if (currentRoom) {
      try {
        const roomData = JSON.parse(currentRoom);
        if (roomData.totalQuestions) {
          setTotalQuestionsFromBackend(roomData.totalQuestions);
          console.log('📊 Loaded totalQuestions từ CreateRoom:', roomData.totalQuestions);
        }
      } catch (error) {
        console.error('❌ Lỗi khi parse currentRoom:', error);
      }
    }
    
    // ✅ KHÔNG CẦN load finalRankingData từ localStorage - real-time via WebSocket
    console.log('📊 PlayerGame init - ranking sẽ đến từ WebSocket real-time');

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
        
        // Lưu totalQuestions từ backend nếu có
        if (parsedData.totalQuestions) {
          setTotalQuestionsFromBackend(parsedData.totalQuestions);
          console.log('📊 Total questions từ backend:', parsedData.totalQuestions);
        }
        
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
          totalQuestions: parsedData.totalQuestions || 4 // Ưu tiên từ backend
        });
        
        // Reset actual question count cho game mới
        setActualQuestionCount(1);
        
        // Lấy thời gian từ database (nếu có)
        const questionTime = parsedData.limitedTime || parsedData.timeLimit || parsedData.time || 30; // Ưu tiên limitedTime từ backend
        console.log('Setting question time from database:', questionTime, 'seconds');
        setTimeLeft(questionTime);
        
        // ✅ KHÔNG CẦN lưu finalRankingData - real-time via WebSocket
        console.log('🔄 Reset PlayerGame state (không lưu ranking localStorage)');
        
        // Reset các state khác khi load question mới
        setHasAnswered(false);
        setIsCorrect(null);
        setShowRankingTable(false);
        setUsedTimeCard(false);
        setUsedTargetCard(false);
        setCountdownProgress(0);
        setAnswerResult(null);
        setRealRankingData([]);
        
        // Reset cached score và rank cho câu hỏi mới
        setCachedPlayerScore(null);
        setCachedPlayerRank(null);
        
        // ✅ RESET: Clear submission lock cho câu hỏi mới
        window.isSubmittingAnswer = false;
        console.log('🔓 Cleared submission lock for new question');
        
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
    }
    
    // Sử dụng SockJS và STOMP
    const socket = new window.SockJS('http://localhost:8080/ws');
    const client = window.Stomp.over(socket);
    
    // Disable STOMP debug logging
    client.debug = null;
    
    // ✅ CHUẨN HÓA: Lấy clientSessionId từ currentRoom thay vì localStorage riêng
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
    
    console.log('🔌 PlayerGame connecting WebSocket with headers:', connectHeaders);
    
    client.connect(connectHeaders, (frame) => {
      console.log('✅ PlayerGame WebSocket connected successfully with authentication!');
      setIsConnected(true);
      setStompClient(client);
      
      // Subscribe vào topic của phòng để nhận câu hỏi tiếp theo
      const roomTopic = `/topic/room/${roomId}`;
      console.log('📡 Subscribing to room topic:', roomTopic);
      
      client.subscribe(roomTopic, (message) => {
        console.log('=== 🎯 MESSAGE RECEIVED IN PLAYERGAME - ROOM TOPIC ===');
        console.log('📨 Raw message:', message.body);
        console.log('📨 Message timestamp:', new Date().toISOString());
        console.log('📨 Current question count when received:', actualQuestionCount);
        
        try {
          const data = JSON.parse(message.body);
          console.log('🔍 Parsed message data:', data);
          console.log('🔍 Message type check:', {
            hasType: !!data.type,
            type: data.type,
            hasId: !!data.id,
            hasAnswers: !!(data.answerA || data.answerB || data.answerC || data.answerD),
            isArray: Array.isArray(data)
          });
          
          // Kiểm tra xem có phải câu hỏi tiếp theo không
          if (data.type === 'NEXT_QUESTION' && data.data) {
            console.log('🎯 ROOM TOPIC: Nhận NEXT_QUESTION message!');
            console.log('Question answers:', {
              A: data.data.answerA,
              B: data.data.answerB,
              C: data.data.answerC,
              D: data.data.answerD
            });

            handleNextQuestion(data.data);
          } else if (data.id && (data.answerA || data.answerB || data.answerC || data.answerD)) {
            // Trường hợp nhận câu hỏi trực tiếp (không có type)
            console.log('🎯 ROOM TOPIC: Nhận câu hỏi trực tiếp từ backend!');
            handleNextQuestion(data);
          } else {
            console.log('📝 ROOM TOPIC: Không phải câu hỏi, bỏ qua message:', {
              hasType: !!data.type,
              type: data.type,
              hasId: !!data.id,
              messageKeys: Object.keys(data)
            });
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      });
      
      // Subscribe vào ranking updates từ Kafka/WebSocket
      const rankingTopic = `/topic/room/${roomId}/ranking`;
      console.log('📊 Subscribing to ranking topic:', rankingTopic);
      
      client.subscribe(rankingTopic, (message) => {
        console.log('=== 📊 RANKING UPDATE RECEIVED ===');
        console.log('📨 Raw ranking message:', message.body);
        
        try {
          const rankingData = JSON.parse(message.body);
          console.log('📊 Real-time ranking update:', rankingData);
          
          // Cập nhật ranking ngay lập tức từ WebSocket
          setRealRankingData(rankingData);
          
          // Cập nhật cached rank cho user hiện tại
          const currentUser = localStorage.getItem('user');
          if (currentUser && rankingData.length > 0) {
            try {
              const userData = JSON.parse(currentUser);
              const playerIndex = rankingData.findIndex(player => {
                return (
                  player.username === userData.username ||
                  player.name === userData.username ||
                  player.firstName === userData.username ||
                  player.id === userData.id ||
                  player.firstName === userData.firstName ||
                  player.username === userData.firstName
                );
              });
              
              if (playerIndex !== -1) {
                const realtimeRank = playerIndex + 1;
                setCachedPlayerRank(realtimeRank);
                console.log('📊 [WebSocket] Updated rank to:', realtimeRank);
                // KHÔNG cập nhật score - giữ nguyên từ submit response
              }
            } catch (error) {
              console.error('❌ Error processing real-time ranking:', error);
            }
          }
          
          // ✅ KHÔNG CẦN lưu finalRankingData - chỉ update state
          console.log('📊 [WebSocket] Real-time ranking updated (không lưu localStorage)');
          
        } catch (error) {
          console.error('❌ Error parsing ranking update:', error);
        }
      });
      
      // Subscribe vào personal queue để nhận câu hỏi tiếp theo riêng
      client.subscribe('/user/queue/next-question', (message) => {
        console.log('=== 📨 PERSONAL QUEUE MESSAGE RECEIVED ===');
        console.log('📨 Question raw message:', message.body);
        console.log('📨 Personal queue timestamp:', new Date().toISOString());
        console.log('📨 Current question count when received (personal):', actualQuestionCount);
        
        try {
          const data = JSON.parse(message.body);
          console.log('➡️ Next Question từ personal queue:', data);
          console.log('🔍 Personal queue message type check:', {
            hasType: !!data.type,
            type: data.type,
            hasId: !!data.id,
            hasAnswers: !!(data.answerA || data.answerB || data.answerC || data.answerD)
          });
          
          // Xử lý câu hỏi tiếp theo
          if (data.id && (data.answerA || data.answerB || data.answerC || data.answerD)) {
            console.log('🎯 PERSONAL QUEUE: Xử lý câu hỏi tiếp theo từ personal queue!');
            handleNextQuestion(data);
          } else if (data.type === 'NEXT_QUESTION' && data.data) {
            console.log('🎯 PERSONAL QUEUE: Xử lý NEXT_QUESTION từ personal queue!');
            handleNextQuestion(data.data);
          } else {
            console.log('📝 PERSONAL QUEUE: Personal message không phải câu hỏi:', {
              messageKeys: Object.keys(data),
              data: data
            });
          }
        } catch (error) {
          console.error('❌ Error parsing personal next-question message:', error);
          // Fallback: treat as plain text message
          console.log('📝 Treating as plain text message:', message.body);
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
    console.log('🔄 === PLAYER HANDLE NEXT QUESTION DEBUG ===');
    console.log('Question ID:', newQuestionData.id);
    console.log('Question content:', newQuestionData.content);
    console.log('Question questionLast:', newQuestionData.questionLast);
    console.log('Question limitedTime:', newQuestionData.limitedTime);
    console.log('Current actualQuestionCount (before update):', actualQuestionCount);
    console.log('Total questions from backend:', newQuestionData.totalQuestions);
    console.log('All question keys:', Object.keys(newQuestionData));
    console.log('📊 Question progression:', {
      currentCount: actualQuestionCount,
      newQuestionId: newQuestionData.id,
      isQuestionLast: newQuestionData.questionLast,
      willBecomeCount: actualQuestionCount + 1
    });
    
    // Lưu totalQuestions từ backend nếu có
    if (newQuestionData.totalQuestions) {
      setTotalQuestionsFromBackend(newQuestionData.totalQuestions);
      console.log('📊 Total questions từ backend (next question):', newQuestionData.totalQuestions);
    }
    
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
      currentQuestion: actualQuestionCount + 1, // Số câu hỏi mới (sẽ hiển thị)
      totalQuestions: newQuestionData.totalQuestions || totalQuestionsFromBackend || 4 // Ưu tiên từ backend
    });
    
    // Cập nhật actual question count TRƯỚC khi set state khác
    setActualQuestionCount(prev => prev + 1);
    
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
    
    // Reset cached score và rank cho câu hỏi mới
    setCachedPlayerScore(null);
    setCachedPlayerRank(null);
    
    // ✅ RESET: Clear submission lock cho câu hỏi tiếp theo
    window.isSubmittingAnswer = false;
    console.log('🔓 Cleared submission lock for next question');
    
    console.log('✅ Đã cập nhật câu hỏi mới và reset game state');
    console.log('📊 Current question count:', actualQuestionCount + 1);
    
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
  
  // State để cache điểm số tạm thời từ submit answer response
  const [cachedPlayerScore, setCachedPlayerScore] = useState(null);
  const [cachedPlayerRank, setCachedPlayerRank] = useState(null);

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

  // ✅ OPTIMIZATION: Memoize score/rank calculation để tránh re-calculation mỗi render
  const playerDisplayData = useMemo(() => {
    // Ưu tiên sử dụng cached data từ submit answer response
    let playerRank = cachedPlayerRank || "?";
    let playerScore = cachedPlayerScore || 0;
    
    console.log('🔍 Score Display Debug:', {
      cachedScore: cachedPlayerScore,
      cachedRank: cachedPlayerRank,
      displayScore: playerScore,
      displayRank: playerRank,
      hasRankingData: realRankingData.length > 0,
      timestamp: new Date().toISOString()
    });
    
    // Fallback: Chỉ lấy từ ranking nếu HOÀN TOÀN không có cached data
    if (cachedPlayerScore === null && cachedPlayerRank === null) {
      console.log('🔄 Using fallback ranking data (no cached data available)');
      const currentUser = localStorage.getItem('user');
      
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
            console.log('📊 Fallback data used:', { rank: playerRank, score: playerScore });
          }
        } catch (error) {
          console.error('❌ Error parsing user data for ranking:', error);
        }
      }
    } else {
      console.log('✅ Using cached data - no fallback needed');
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
    
    return {
      score: playerScore,
      rank: formatRank(playerRank)
    };
  }, [cachedPlayerScore, cachedPlayerRank, realRankingData]);

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
      const currentRoom = localStorage.getItem('currentRoom');
      // ✅ CHUẨN HÓA: Lấy clientSessionId từ currentRoom
      const clientSessionId = currentRoom ? JSON.parse(currentRoom).clientSessionId : null;
      
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
      // Kiểm tra pinCode có khớp với roomId không
      if (roomInfo.pinCode !== roomId) {
        console.warn('PinCode không khớp với roomId:', {
          pinCode: roomInfo.pinCode,
          roomId: roomId,
          roomIdFromStorage: roomInfo.roomId
        });
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
        
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('Current user:', currentUser);
        
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
    } else if (timeLeft === 0 && !hasAnswered && !window.isSubmittingAnswer) {
      // ✅ KHI HẾT THỜI GIAN VÀ CHƯA TRẢ LỜI: Gọi hàm submit answer với null
      console.log('⏰ Hết thời gian và chưa chọn đáp án! Tự động submit null answer...');
      submitAnswerWhenTimeUp();
    }
  }, [timeLeft, isTimerPaused, hasAnswered]);

  const bgImages = [
    '/Group1.png',
    '/Group2.png',
    '/Group3.png',
    '/Group4.png',
  ];

    const handleAnswerSelect = async (idx) => {
    // ✅ CHỌN VÀ SUBMIT ĐÁP ÁN NGAY LẬP TỨC
    if (!hasAnswered && timeLeft > 0 && !window.isSubmittingAnswer) {
      const selectedLetter = indexToLetter(idx);
      console.log('✅ Player chọn và submit đáp án ngay:', selectedLetter);
      
      // Set flag để tránh duplicate submission
      window.isSubmittingAnswer = true;
      console.log('🔒 Setting submission lock for immediate submit');
      
      // Lưu đáp án đã chọn ngay lập tức
      setQuestionData(prev => ({
        ...prev,
        selectedAnswer: selectedLetter
      }));
      
      // Tạo hiệu ứng haptic feedback nếu có (mobile)
      if (navigator.vibrate) {
        navigator.vibrate(50); // Rung nhẹ 50ms
      }
      
      try {
      // === CHUẨN BỊ DỮ LIỆU ĐÁP ÁN ===
      // ✅ CHUẨN HÓA: Lấy clientSessionId từ currentRoom
      const currentRoomData = localStorage.getItem('currentRoom');
      const clientSessionId = currentRoomData ? JSON.parse(currentRoomData).clientSessionId : null;
      
      const answerData = {
          selectedAnswer: selectedLetter,
        clientSessionId: clientSessionId
      };
      
        console.log('=== 🚀 SUBMIT ANSWER IMMEDIATELY ===');
        console.log('Selected answer:', selectedLetter);
        console.log('Time left when selected:', timeLeft);
        
        // Kiểm tra dữ liệu trước khi gửi
        if (!answerData.clientSessionId) {
          console.error('❌ Thiếu clientSessionId');
          window.isSubmittingAnswer = false;
          return;
        }
        
        if (!answerData.selectedAnswer) {
          console.error('❌ Thiếu selectedAnswer');
          window.isSubmittingAnswer = false;
          return;
        }
        
        // Gửi đáp án về backend ngay lập tức
      const roomDataForSubmit = localStorage.getItem('currentRoom');
      const pinCode = roomDataForSubmit ? JSON.parse(roomDataForSubmit).pinCode : null;
        
        if (pinCode) {
          const response = await submitAnswer(pinCode, answerData);
          console.log('✅ Kết quả từ backend:', response);
          
          // ✅ UNLOCK: Clear submission flag after successful submission
          window.isSubmittingAnswer = false;
          console.log('🔓 Cleared submission lock after successful immediate submit');
          
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
            
            // Cache điểm số từ response để hiển thị ngay lập tức
            setCachedPlayerScore(response.score);
            
            console.log('=== 🎯 IMMEDIATE SUBMIT ANSWER RESPONSE ===');
            console.log('Score mới từ backend:', response.score);
            console.log('Is Correct:', response.correct);
            console.log('Đáp án đúng:', response.correctAnswer);
            console.log('Bạn chọn:', response.selectedAnswer);
            console.log('Response questionLast:', response.questionLast);
            console.log('Response questionLast type:', typeof response.questionLast);
            console.log('Current question questionLast:', questionData.questionLast);
            console.log('🔍 QUESTION PROGRESSION DEBUG:', {
              currentQuestionId: questionData.id,
              responseQuestionId: response.questionId,
              actualQuestionCount: actualQuestionCount,
              totalQuestionsFromBackend: totalQuestionsFromBackend,
              questionDataTotalQuestions: questionData.totalQuestions,
              questionDataCurrentQuestion: questionData.currentQuestion
            });
            console.log('Full response object:', response);
            
            // Kiểm tra xem có phải câu hỏi cuối cùng không - Multiple checks
            const isLastQuestionByResponse = response.questionLast === true;
            const isLastQuestionByQuestionData = questionData.questionLast === true;
            const totalQuestions = totalQuestionsFromBackend || questionData.totalQuestions || 4;
            // ✅ FIX: Check nếu câu HIỆN TẠI (chưa tăng) là câu cuối
            const isLastQuestionByCount = actualQuestionCount === totalQuestions;
            
            // 🔧 IMPORTANT: Backend submit response không có questionLast field
            // Chỉ dùng questionData.questionLast NẾU backend response không có
            const shouldUseQuestionDataFlag = response.questionLast === undefined && isLastQuestionByQuestionData;
            
            console.log('🔍 LAST QUESTION CHECK (IMMEDIATE):', {
              byResponse: isLastQuestionByResponse,
              byQuestionData: isLastQuestionByQuestionData,
              byCount: isLastQuestionByCount,
              shouldUseQuestionDataFlag: shouldUseQuestionDataFlag,
              actualQuestionCount: actualQuestionCount,
              totalQuestions: totalQuestions,
              responseQuestionLast: response.questionLast,
              questionDataQuestionLast: questionData.questionLast,
              calculation: `${actualQuestionCount} === ${totalQuestions} = ${isLastQuestionByCount}`
            });
            
            // 🔧 LOGIC: Ưu tiên response.questionLast, fallback về questionData.questionLast nếu cần
            const isLastQuestion = isLastQuestionByResponse || shouldUseQuestionDataFlag;
            
            console.log('🎯 FINAL LAST QUESTION DECISION:', {
              isLastQuestion: isLastQuestion,
              reason: isLastQuestion ? 
                (isLastQuestionByResponse ? 'Backend response.questionLast === true' : 
                 shouldUseQuestionDataFlag ? 'questionData.questionLast === true (response missing)' : 'count check') 
                : 'Not last question'
            });
            
            // 🔧 BACKUP LOGIC: DISABLED temporarily to debug early navigation
            // const shouldForceLastQuestionByCount = isLastQuestionByCount && !isLastQuestion;
            // if (shouldForceLastQuestionByCount) {
            //   console.log('⚠️ BACKUP: Backend chưa set questionLast=true nhưng đã đủ số câu. Force last question logic!');
            //   // ... backup logic disabled
            // }
            console.log('🔧 BACKUP LOGIC: Currently disabled for debugging');
            
            // 🔍 COMPREHENSIVE DEBUG for early navigation detection
            console.log('🔍 [DEBUG] Pre-navigation check:', {
              isLastQuestion,
              isLastQuestionByResponse,
              isLastQuestionByQuestionData, 
              isLastQuestionByCount,
              actualQuestionCount,
              totalQuestions,
              questionDataQuestionLast: questionData.questionLast,
              responseQuestionLast: response.questionLast,
              currentQuestionField: questionData.currentQuestion,
              isAlreadyNavigating: !!window.isNavigatingToGameResult
            });
            
            if (isLastQuestion) {
              console.log('🏁 Đây là câu hỏi cuối cùng! Lấy ranking cuối cùng...', {
                detectedBy: isLastQuestionByResponse ? 'response' : isLastQuestionByQuestionData ? 'questionData' : 'count'
              });
              
              // ✅ SET FLAG to prevent multiple navigation
              if (window.isNavigatingToGameResult) {
                console.log('🚫 Already navigating to GameResult, skip duplicate');
                return;
              }
              window.isNavigatingToGameResult = true;
              
              // Lưu dữ liệu câu hỏi cuối và kết quả vào localStorage
              localStorage.setItem('finalQuestionData', JSON.stringify(questionData));
              // ✅ CHUẨN HÓA: Chỉ dùng currentRoom, không lưu roomInfo duplicate
              
              // LẤY RANKING CUỐI CÙNG TỪ BACKEND sau khi trả lời câu cuối
              try {
                const currentRoom = localStorage.getItem('currentRoom');
                if (currentRoom) {
                  const roomData = JSON.parse(currentRoom);
                  const roomId = roomData.roomId;
                  
                  if (roomId) {
                    console.log('📊 Lấy bảng xếp hạng cuối cùng cho phòng:', roomId);
                    const finalRankingResponse = await getRoomRanking(roomId);
                    
                    // Cập nhật ranking state để hiển thị
                    setRealRankingData(finalRankingResponse);
                    
                    // ✅ KHÔNG CẦN lưu vào localStorage - GameResult sẽ gọi API trực tiếp
                    console.log('📊 Final ranking response (không lưu localStorage):', finalRankingResponse);
                  }
                }
              } catch (rankingError) {
                console.error('❌ Lỗi khi lấy bảng xếp hạng cuối cùng:', rankingError);
                // Fallback: sử dụng ranking hiện tại nếu có lỗi
                // ✅ KHÔNG CẦN fallback localStorage - GameResult sẽ tự xử lý
                console.log('⚠️ Fallback: không lưu ranking vào localStorage, GameResult sẽ gọi API');
              }
              
              // Hiển thị kết quả và ranking cho câu cuối sau 3 giây
              console.log('📊 Sẽ hiển thị ranking cuối cùng sau 3 giây...');
              setTimeout(() => {
                console.log('📊 Hiển thị ranking cuối cùng ngay bây giờ!');
                setShowRankingTable(true);
              }, 3000); // 3 giây để xem kết quả đúng/sai và điểm
              
              // Bắt đầu countdown progress cho câu cuối (chỉ để hiệu ứng)
              setCountdownProgress(100);
              const finalCountdownInterval = setInterval(() => {
                setCountdownProgress(prev => {
                  if (prev <= 0) {
                    clearInterval(finalCountdownInterval);
                    return 0;
                  }
                  return prev - 1.4; // Giảm để hết 100% trong 7 giây (100/70 = ~1.4)
                });
              }, 100);
              
              // ✅ GUARANTEED NAVIGATION: Đảm bảo chuyển trang sau 8 giây
              const navigationTimer = setTimeout(() => {
                console.log('🚀 [TIMER] Navigating to GameResult after 8s...');
                console.log('🔍 [TIMER] Current state:', {
                  hasAnswered,
                  isLastQuestion,
                  showRankingTable,
                  timeLeft
                });
                window.location.href = '/game-result';
              }, 8000); // 8 giây để chắc chắn
              
              // Store timer reference to clear if needed
              window.gameResultNavigationTimer = navigationTimer;
              console.log('⏱️ Set navigation timer for 8 seconds');
              
              return; // Không tiếp tục xử lý ranking thường
            }
            console.log('✅ Ranking sẽ được cập nhật real-time qua WebSocket từ Kafka');
        } else {
            // Nếu backend trả về null (lỗi), vẫn set đã trả lời để tránh spam
            setHasAnswered(true);
            console.log('Backend trả về null, có thể có lỗi');
          }
        }
        
        // Bắt đầu countdown progress sau khi submit
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
        
      } catch (error) {
        console.error('❌ Lỗi trong handleAnswerSelect:', error);
        window.isSubmittingAnswer = false;
      }
      
    } else if (hasAnswered) {
      console.log('🚫 Đã submit rồi, không thể chọn lại');
    } else if (timeLeft <= 0) {
      console.log('🚫 Hết thời gian, không thể chọn đáp án');
    } else if (window.isSubmittingAnswer) {
      console.log('🚫 Đang submit, vui lòng đợi...');
    }
  };

  // ✅ HÀM SUBMIT ĐÁP ÁN KHI HẾT THỜI GIAN (CHỈ KHI CHƯA CHỌN)
  const submitAnswerWhenTimeUp = async () => {
    if (hasAnswered || window.isSubmittingAnswer) {
      console.log('🚫 Đã submit hoặc đang submit, bỏ qua');
      return;
    }

    // Kiểm tra xem đã chọn đáp án chưa
    if (questionData.selectedAnswer) {
      console.log('⚠️ Đã chọn đáp án rồi, không cần submit khi hết thời gian');
      return;
    }

    // Set flag để tránh duplicate submission
    window.isSubmittingAnswer = true;
    console.log('🔒 Setting submission lock for time-up null submit');
    
    try {
      // === CHUẨN BỊ DỮ LIỆU ĐÁP ÁN NULL ===
      // ✅ CHUẨN HÓA: Lấy clientSessionId từ currentRoom
      const currentRoomForTimeUp = localStorage.getItem('currentRoom');
      const clientSessionId = currentRoomForTimeUp ? JSON.parse(currentRoomForTimeUp).clientSessionId : null;
      
      const answerData = {
        selectedAnswer: null, // Submit null khi không chọn gì
        clientSessionId: clientSessionId
      };
        
      console.log('=== 🕐 SUBMIT NULL ANSWER WHEN TIME UP ===');
      console.log('Selected answer:', null);
      console.log('Time left:', timeLeft);
      
      // Kiểm tra dữ liệu trước khi gửi
      if (!answerData.clientSessionId) {
        console.error('❌ Thiếu clientSessionId');
        window.isSubmittingAnswer = false;
        return;
      }
      
      console.log('⚠️ Không có đáp án được chọn, submit null answer');
      
      // Gửi đáp án về backend
        const roomDataForTimeUpSubmit = localStorage.getItem('currentRoom');
        const pinCode = roomDataForTimeUpSubmit ? JSON.parse(roomDataForTimeUpSubmit).pinCode : null;
        
        if (pinCode) {
          const response = await submitAnswer(pinCode, answerData);
        console.log('✅ Đáp án đã được gửi thành công khi hết thời gian');
        console.log('✅ Kết quả từ backend:', response);
        
        // ✅ UNLOCK: Clear submission flag after successful submission
        window.isSubmittingAnswer = false;
        console.log('🔓 Cleared submission lock after successful submit');
          
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
              
          // Cache điểm số từ response để hiển thị ngay lập tức
          setCachedPlayerScore(response.score);
          
          console.log('=== 🎯 SUBMIT ANSWER RESPONSE ===');
          console.log('Score mới từ backend:', response.score);
              console.log('Is Correct:', response.correct);
              console.log('Đáp án đúng:', response.correctAnswer);
              console.log('Bạn chọn:', response.selectedAnswer);
          console.log('Response questionLast:', response.questionLast);
          console.log('Response questionLast type:', typeof response.questionLast);
          console.log('Current question questionLast:', questionData.questionLast);
          console.log('Full response object:', response);
          
          // Kiểm tra xem có phải câu hỏi cuối cùng không - Multiple checks
          const isLastQuestionByResponse = response.questionLast === true;
          const isLastQuestionByQuestionData = questionData.questionLast === true;
          const totalQuestions = totalQuestionsFromBackend || questionData.totalQuestions || 4;
          // ✅ FIX: Check nếu câu HIỆN TẠI (chưa tăng) là câu cuối
          const isLastQuestionByCount = actualQuestionCount === totalQuestions;
          
          console.log('🔍 LAST QUESTION CHECK:', {
            byResponse: isLastQuestionByResponse,
            byQuestionData: isLastQuestionByQuestionData,
            byCount: isLastQuestionByCount,
            actualQuestionCount: actualQuestionCount,
            totalQuestions: totalQuestions,
            calculation: `${actualQuestionCount} === ${totalQuestions} = ${isLastQuestionByCount}`
          });
          
          // ❌ THAY ĐỔI: Chỉ dựa vào response.questionLast từ backend, không dùng count
          const isLastQuestion = isLastQuestionByResponse;
          
          console.log('🎯 FINAL LAST QUESTION DECISION (TIME UP):', {
            isLastQuestion: isLastQuestion,
            reason: isLastQuestion ? 'Backend response.questionLast === true' : 'Not last question according to backend'
          });
          
          // 🔧 BACKUP LOGIC: DISABLED temporarily to debug early navigation (TIME UP)
          // const shouldForceLastQuestionByCount = isLastQuestionByCount && !isLastQuestion;
          // if (shouldForceLastQuestionByCount) {
          //   console.log('⚠️ BACKUP (TIME UP): Backend chưa set questionLast=true nhưng đã đủ số câu');
          //   // ... backup logic disabled
          // }
          console.log('🔧 BACKUP LOGIC (TIME UP): Currently disabled for debugging');
          
          // 🔍 COMPREHENSIVE DEBUG for early navigation detection (TIME UP)
          console.log('🔍 [DEBUG TIME UP] Pre-navigation check:', {
            isLastQuestion,
            isLastQuestionByResponse,
            isLastQuestionByQuestionData, 
            isLastQuestionByCount,
            actualQuestionCount,
            totalQuestions,
            questionDataQuestionLast: questionData.questionLast,
            responseQuestionLast: response.questionLast,
            currentQuestionField: questionData.currentQuestion,
            isAlreadyNavigating: !!window.isNavigatingToGameResult
          });
          
          if (isLastQuestion) {
            console.log('🏁 Đây là câu hỏi cuối cùng! Lấy ranking cuối cùng...', {
              detectedBy: isLastQuestionByResponse ? 'response' : isLastQuestionByQuestionData ? 'questionData' : 'count'
            });
            
            // ✅ SET FLAG to prevent multiple navigation (TIME UP case)
            if (window.isNavigatingToGameResult) {
              console.log('🚫 Already navigating to GameResult, skip duplicate (time up)');
              return;
            }
            window.isNavigatingToGameResult = true;
            
            // Lưu dữ liệu câu hỏi cuối và kết quả vào localStorage
            localStorage.setItem('finalQuestionData', JSON.stringify(questionData));
            // ✅ CHUẨN HÓA: Chỉ dùng currentRoom, không lưu roomInfo duplicate
                
            // LẤY RANKING CUỐI CÙNG TỪ BACKEND sau khi trả lời câu cuối
              try {
                const currentRoom = localStorage.getItem('currentRoom');
                if (currentRoom) {
                  const roomData = JSON.parse(currentRoom);
                  const roomId = roomData.roomId;
                  
                  if (roomId) {
                  console.log('📊 Lấy bảng xếp hạng cuối cùng cho phòng:', roomId);
                  const finalRankingResponse = await getRoomRanking(roomId);
                  
                  // Cập nhật ranking state để hiển thị
                  setRealRankingData(finalRankingResponse);
                  
                  // ✅ KHÔNG CẦN lưu vào localStorage - GameResult sẽ gọi API trực tiếp
                  console.log('📊 Final ranking response (time-up, không lưu localStorage):', finalRankingResponse);
                  }
                }
              } catch (rankingError) {
              console.error('❌ Lỗi khi lấy bảng xếp hạng cuối cùng:', rankingError);
              // Fallback: sử dụng ranking hiện tại nếu có lỗi
              // ✅ KHÔNG CẦN fallback localStorage - GameResult sẽ tự xử lý
              console.log('⚠️ Fallback (time-up): không lưu ranking vào localStorage, GameResult sẽ gọi API');
            }
            
            // Hiển thị kết quả và ranking cho câu cuối sau 3 giây (cho time-up case)
            console.log('📊 Sẽ hiển thị ranking cuối cùng sau 3 giây (time-up)...');
            setTimeout(() => {
              console.log('📊 Hiển thị ranking cuối cùng ngay bây giờ (time-up)!');
              setShowRankingTable(true);
            }, 3000); // 3 giây để xem kết quả
            
            // Bắt đầu countdown progress cho câu cuối (chỉ để hiệu ứng)
            setCountdownProgress(100);
            const finalCountdownInterval = setInterval(() => {
              setCountdownProgress(prev => {
                if (prev <= 0) {
                  clearInterval(finalCountdownInterval);
                  return 0;
                }
                return prev - 1.4; // Giảm để hết 100% trong 7 giây (100/70 = ~1.4)
              });
            }, 100);
            
            // ✅ GUARANTEED NAVIGATION: Đảm bảo chuyển trang sau 8 giây (TIME UP case)
            const navigationTimer = setTimeout(() => {
              console.log('🚀 [TIMER TIME-UP] Navigating to GameResult after 8s...');
              console.log('🔍 [TIMER TIME-UP] Current state:', {
                hasAnswered,
                isLastQuestion,
                showRankingTable,
                timeLeft
              });
              window.location.href = '/game-result';
            }, 8000); // 8 giây để chắc chắn
            
            // Store timer reference to clear if needed
            window.gameResultNavigationTimerTimeUp = navigationTimer;
            console.log('⏱️ Set navigation timer for 8 seconds (time up case)');
            
            return; // Không tiếp tục xử lý ranking thường
          }
          console.log('✅ Ranking sẽ được cập nhật real-time qua WebSocket từ Kafka');
          } else {
            // Nếu backend trả về null (lỗi), vẫn set đã trả lời để tránh spam
            setHasAnswered(true);
            console.log('Backend trả về null, có thể có lỗi');
          }
      }
      
      // Bắt đầu countdown progress sau khi submit
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
      
    } catch (error) {
      console.error('❌ Lỗi trong submitAnswerWhenTimeUp:', error);
      window.isSubmittingAnswer = false;
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
                  {/* Hạng */}
                  <div className="flex items-center px-3 py-1 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg text-white space-x-1 h-9">
                    <img src="/Frame (5).png" className="w-8 h-8" alt="crown" />
              <span className="text-sm font-bold">{playerDisplayData.rank}</span>
                  </div>
                  {/* Điểm */}
                  <div className="flex items-center px-3 py-1 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg text-white space-x-1 h-9">
                    <img src="Frame (6).png" className="w-8 h-8" alt="coin" />
              <span className="text-sm font-bold">{playerDisplayData.score}</span>
                  </div>
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
                    {questionData.currentQuestion || 1}/{totalQuestionsFromBackend || questionData.totalQuestions || 4}
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
                  <div className={`border-4 text-white w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl bg-transparent ${
                    timeLeft <= 10 ? 'border-red-500' : 'border-pink-500'
                  }`}>
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
                    let isSelected = false; // Track xem có được chọn không
                    
                    // Kiểm tra xem đáp án này có được chọn không (trước khi submit)
                    if (!hasAnswered && questionData.selectedAnswer === indexToLetter(idx)) {
                      isSelected = true;
                      // Có thể thay đổi background cho đáp án đã chọn
                      // bgImage = '/Group_selected.png'; // Nếu có ảnh riêng cho selected
                    }
                    
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
                         } ${
                           isSelected ? 'brightness-110' : ''
                        }`}
                        style={{ 
                          background: `url('${bgImage}') center center / 100% 100% no-repeat`, 
                           height: 104,
                           // Chỉ tăng độ sáng và bão hòa màu, không có viền
                           ...(isSelected && {
                             filter: 'brightness(1.2) saturate(1.3) contrast(1.1)'
                           })
                        }}
                        onClick={() => handleAnswerSelect(idx)}
                      >
                        <div className="w-full h-[69px] resize-none focus:outline-none bg-transparent text-base text-white overflow-hidden flex items-center">
                          <span className="text-white">{questionData.options[idx]}</span>
                        </div>
                        <div className="absolute -top-[11px] right-2 flex flex-col items-end group">
                          <span className="text-xs bg-pink-600 text-white px-2 py-0.5 rounded mb-1 opacity-0 group-hover:opacity-100 transition">
                            {hasAnswered ? 'Đã submit đáp án' : 'Chọn đáp án này'}
                          </span>
                          <input
                            type="radio"
                            name="correct"
                            checked={
                              // Hiển thị selected khi đã chọn (chưa submit) hoặc khi đã submit
                              questionData.selectedAnswer === indexToLetter(idx) ||
                              (answerResult && answerResult.selectedAnswer === indexToLetter(idx))
                            }
                            readOnly // ✅ READ-ONLY: Tránh onChange event, chỉ dùng onClick của container
                            className={`w-5 h-5 cursor-pointer transition-all duration-200 ${
                              isSelected ? 'scale-125' : ''
                            }`}
                            style={{
                              accentColor: 
                                questionData.selectedAnswer === indexToLetter(idx) && !hasAnswered 
                                  ? '#3b82f6' // Xanh dương khi chọn nhưng chưa submit
                                  : answerResult && answerResult.selectedAnswer === indexToLetter(idx) 
                                    ? '#dc2626' // Đỏ khi đã submit
                                    : '#9ca3af' // Xám mặc định
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
                   <RankingTable data={realRankingData} totalQuestions={totalQuestionsFromBackend || questionData.totalQuestions || 4} />
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