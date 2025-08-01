import React from 'react';
import { useNavigate } from 'react-router-dom';
import HistoryStat from '../components/HistoryStat';

// Component QuizReview: render danh sách câu hỏi và đáp án
const quizData = [
  {
    question: "1. Thủ đô của Nhật Bản là?",
    options: ["Tokyo", "Kyoto", "Osaka", "Hokkaido"],
    correct: 0,
    userAnswer: 0
  },
  {
    question: "2. Ai phát minh ra bóng đèn?",
    options: ["Newton", "Edison", "Tesla", "Einstein"],
    correct: 1,
    userAnswer: 1
  },
  {
    question: "3. Trái Đất quay quanh gì?",
    options: ["Mặt trời", "Mặt trăng", "Sao Hỏa", "Sao Kim"],
    correct: 0,
    userAnswer: 0
  },
  {
    question: "4. Ngôn ngữ lập trình phổ biến nhất?",
    options: ["Java", "Python", "C++", "Ruby"],
    correct: 1,
    userAnswer: 2
  },
  {
    question: "5. Quốc gia có diện tích lớn nhất thế giới?",
    options: ["Canada", "Trung Quốc", "Nga", "Mỹ"],
    correct: 2,
    userAnswer: null
  }
];

function QuizReview() {
  const [showAnswer, setShowAnswer] = React.useState(true);
  return (
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden ml-6">
      {/* Thanh tiêu đề */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 className="font-semibold text-lg text-black">{quizData.length} câu hỏi</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-black">Hiển thị đáp án</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={showAnswer} onChange={() => setShowAnswer(v => !v)} />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-pink-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
          </label>
        </div>
      </div>
      {/* Danh sách câu hỏi */}
      <div>
        {quizData.map((q, idx) => (
          <div key={idx} className="p-4 border-b">
            <p className="font-medium mb-2 text-black">{q.question}</p>
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((opt, i) => {
                const isCorrect = i === q.correct;
                const isChosen = i === q.userAnswer;
                const classes = [
                  'flex', 'items-center', 'gap-2', 'p-2', 'border', 'rounded-md', 'text-black'
                ];
                if (showAnswer && isCorrect) classes.push('bg-green-100', 'text-green-700', 'font-medium');
                if (showAnswer && isChosen && !isCorrect) classes.push('bg-red-100', 'text-red-700', 'font-medium');
                return (
                  <label key={i} className={classes.join(' ')}>
                    <input
                      type="radio"
                      name={`q${idx}`}
                      checked={showAnswer ? isChosen : false}
                      disabled
                      className="accent-pink-500"
                      readOnly
                    />
                    <span className="text-black">{opt}</span>
                    {showAnswer && (isCorrect || (isChosen && !isCorrect)) && (
                      <svg className={`w-5 h-5 answer-icon ${isCorrect ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={isCorrect ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'} />
                      </svg>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const HistoryDetail = () => {
  const navigate = useNavigate();
  // Dữ liệu giả demo
  const statData = {
    topic: 'Toán học',
    title: 'Đại số cơ bản lớp 10 - Phương trình bậc hai và định lý Vi-et',
    name: 'Nguyễn Văn A',
    time: '20h00, 12/07/2025',
    rankValue: 'Top 3',
    scoreValue: '9/10',
    progressNow: 90,
    rightCount: 9,
    wrongCount: 1,
    avgTime: 12,
  };
  return (
    <div className="space-y-6 max-w-full">
      {/* Greeting + Room Code (giống Dashboard/History) */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {/* Icon back */}
          <button
            onClick={() => navigate(-1)}
            className="mr-3 mb-9 border-7 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
            aria-label="Quay lại"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <img 
            src="/historydetail.png" 
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
      {/* HistoryStat và QuizReview cạnh nhau */}
      <div className="flex flex-row gap-4 items-start flex-wrap">
        <div className="origin-top-left scale-90 w-full max-w-xl min-w-[320px] ml-0">
          <HistoryStat {...statData} />
        </div>
        <div className="flex-1 min-w-[320px] pr-6">
          <QuizReview />
        </div>
      </div>
      {/* Chi tiết lịch sử quiz (nếu cần giữ lại) */}
      {/* ... giữ lại nếu bạn muốn ... */}
    </div>
  );
};

export default HistoryDetail; 