import React, { useState, useEffect } from 'react';
import Chat from '../components/Chat';
import RankingTable from '../components/RankingTable';

const PlayerGame = () => {
  // Dữ liệu mẫu cho câu hỏi
  const [questionData, setQuestionData] = useState({
    question: "Câu hỏi mẫu cho người chơi?",
    options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
    correctAnswer: 0,
    selectedAnswer: null,
    image: null, // Thêm image
    currentQuestion: 1,
    totalQuestions: 10
  });

  const [timeLeft, setTimeLeft] = useState(30);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardImage, setCardImage] = useState('');
  const [usedTimeCard, setUsedTimeCard] = useState(false);
  const [usedTargetCard, setUsedTargetCard] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showRankingTable, setShowRankingTable] = useState(false);
  const [countdownProgress, setCountdownProgress] = useState(0);

  // Dữ liệu mẫu cho bảng xếp hạng
  const rankingData = [
    { name: "Ngô Quốc Anh", score: 1020, correct: 8, wrong: 2, avatar: "/avatar/avatar_1.png" },
    { name: "Trần Văn B", score: 950, correct: 7, wrong: 3, avatar: "/avatar/avatar_2.png" },
    { name: "Lê Thị C", score: 880, correct: 6, wrong: 4, avatar: "/avatar/avatar_3.png" },
    { name: "Phạm Văn D", score: 820, correct: 5, wrong: 5, avatar: "/avatar/avatar_4.png" },
    { name: "Hoàng Thị E", score: 750, correct: 4, wrong: 6, avatar: "/avatar/avatar_5.png" },
  ];

  const handleNextQuestion = () => {
    // Reset các state về ban đầu
    setHasAnswered(false);
    setIsCorrect(null);
    setShowRankingTable(false);
    setTimeLeft(30);
    setUsedTimeCard(false);
    setUsedTargetCard(false);
    setCountdownProgress(0);
    
    // Cập nhật câu hỏi tiếp theo
    setQuestionData(prev => ({
      ...prev,
      currentQuestion: prev.currentQuestion + 1,
      selectedAnswer: null
    }));
  };

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

    const handleAnswerSelect = (idx) => {
    if (!hasAnswered) {
      setQuestionData(prev => ({
        ...prev,
        selectedAnswer: idx
      }));
      
      // Kiểm tra đáp án đúng/sai
      const correct = idx === questionData.correctAnswer;
      setIsCorrect(correct);
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

  const handleChatClick = () => {
    setShowChat(!showChat);
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
              <img src="public/Frame (5).png" className="w-8 h-8" alt="crown" />
              <span className="text-sm font-bold">1st</span>
            </div>
            {/* Điểm */}
            <div className="flex items-center px-3 py-1 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg text-white space-x-1 h-9">
              <img src="public/Frame (6).png" className="w-8 h-8" alt="coin" />
              <span className="text-sm font-bold">1020</span>
            </div>
          </div>
          {/* Giữa: Mã phòng */}
          <div className="bg-white rounded-lg border-2 border-pink-500 px-4 flex items-center h-9">
            <span className="text-black text-xl tracking-widest font-bold">682868</span>
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
            {/* Nút chat */}
            <button 
              className="w-9 h-9 flex items-center justify-center border-2 border-pink-500 rounded-lg bg-white hover:bg-pink-100"
              onClick={handleChatClick}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* QuestionEditor Interface hoặc RankingTable */}
      <div className={`flex items-center justify-center transition-all duration-300 ${showChat ? 'mr-[320px]' : ''}`}>
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
                       if (idx === questionData.correctAnswer) {
                         bgImage = '/Group_correct.png'; // Đáp án đúng - image khác
                         shouldShow = true; // Luôn hiển thị đáp án đúng
                       } else if (idx === questionData.selectedAnswer && idx !== questionData.correctAnswer) {
                         bgImage = '/Group_wrong.png'; // Đáp án sai đã chọn - image khác
                         shouldShow = true; // Hiển thị đáp án sai đã chọn
                       } else if (timeLeft === 0 && questionData.selectedAnswer === null) {
                         // Khi hết thời gian mà chưa chọn, ẩn tất cả trừ đáp án đúng
                         shouldShow = false;
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
                            checked={questionData.selectedAnswer === idx}
                            onChange={() => handleAnswerSelect(idx)}
                            className="w-5 h-5 cursor-pointer"
                            style={{
                              accentColor: questionData.selectedAnswer === idx ? '#dc2626' : '#9ca3af'
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
                 <RankingTable data={rankingData} totalQuestions={questionData.totalQuestions} />
                 
                 {/* Nút Câu tiếp theo */}
                 <div className="flex justify-center mt-6">
                   <button 
                     onClick={handleNextQuestion}
                     className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:from-pink-600 hover:to-pink-700 transition-all duration-300 shadow-lg"
                   >
                     Câu tiếp theo →
                   </button>
                 </div>
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
            <img src="../public/Group (2).png" alt="avatar" className="w-12 h-12" />

            {/* Tên người chơi */}
            <span className="text-lg font-semibold whitespace-nowrap">Ngô Quốc Anh</span>

            {/* Đường kẻ dọc */}
            <div className="w-px h-8 bg-gray-400 mx-2"></div>

            {/* Icon đồng hồ */}
            <img 
              src="../public/btn_+time.png" 
              alt="timer" 
              className={`w-10 h-10 transition-opacity ${usedTimeCard || hasAnswered ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
              onClick={handleTimeClick}
            />

            {/* Icon mục tiêu */}
            <img 
              src="../public/btn_50_50.png" 
              alt="target" 
              className={`w-10 h-10 transition-opacity ${usedTargetCard || hasAnswered ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
              onClick={handleTargetClick}
            />
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
      {showChat && (
        <div className="fixed z-15 right-4 top-[72px] font-content">
          {/* Khung chat */}
          <div className="fixed top-[56px] right-0 z-20 w-[300px] max-w-[90vw] bg-white shadow-xl flex flex-col h-[calc(100vh-56px)] transform transition-transform duration-300 translate-x-0">
            {/* Header */}
            <div className="flex justify-end p-2">
              <button onClick={() => setShowChat(false)}>
                <img src="/close_chat.png" alt="Close chat" className="w-6 h-6" />
              </button>
            </div>

            {/* Nội dung */}
            <div className="flex-1 overflow-y-auto px-4 text-center text-sm text-black">
              <p>Chưa có tin nhắn nào</p>
            </div>

            {/* Input + Sticker Picker */}
            <div className="bg-white">
              {/* ô nhập */}
              <div className="p-3">
                <div className="flex items-center border border-gray-400 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[var(--pink)] transition-all w-full">
                  <input
                    type="text"
                    placeholder="Soạn tin nhắn..."
                    className="flex-1 min-w-0 outline-none text-gray-700 placeholder-gray-500 text-sm"
                  />
                  <div className="flex items-center gap-2 text-gray-400 shrink-0">
                    <button className="shrink-0">
                      <img src="/choose_emoji.png" alt="Emoji" className="w-5 h-5" />
                    </button>
                    <span>|</span>
                    <button className="shrink-0">
                      <img src="/send.png" alt="Send" className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerGame; 