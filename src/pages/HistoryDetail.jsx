import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import axios from 'axios';
import HistoryStat from '../components/HistoryStat';

function QuizReview({ questions }) {
  const [showAnswer, setShowAnswer] = useState(true);

  return (
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden ml-6">
      {/* Thanh tiêu đề */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 className="font-semibold text-lg text-black">{questions.length} câu hỏi</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-black">Hiển thị đáp án</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={showAnswer}
              onChange={() => setShowAnswer(v => !v)}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-pink-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
          </label>
        </div>
      </div>

      {/* Danh sách câu hỏi */}
      <div>
        {questions.map((q, idx) => {
          const options = [
            { key: 'A', text: q.answerA },
            { key: 'B', text: q.answerB },
            { key: 'C', text: q.answerC },
            { key: 'D', text: q.answerD },
          ];

          return (
            <div key={q.questionId} className="p-4 border-b">
              <p className="font-medium mb-2 text-black">
                {idx + 1}. {q.questionContent}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {options.map((opt) => {
                  const isCorrect = opt.key === q.correctAnswer;
                  const isChosen = opt.key === q.selectedAnswer;

                  const classes = [
                    'flex', 'items-center', 'gap-2', 'p-2', 'border', 'rounded-md', 'text-black'
                  ];
                  if (showAnswer && isCorrect) classes.push('bg-green-100', 'text-green-700', 'font-medium');
                  if (showAnswer && isChosen && !isCorrect) classes.push('bg-red-100', 'text-red-700', 'font-medium');

                  return (
                    <label key={opt.key} className={classes.join(' ')}>
                      <input
                        type="radio"
                        name={`q${idx}`}
                        checked={isChosen}
                        disabled
                        className="accent-pink-500"
                        readOnly
                      />
                      <span className="text-black">{opt.text}</span>
                      {showAnswer && (isCorrect || (isChosen && !isCorrect)) && (
                        <svg
                          className={`w-5 h-5 answer-icon ${isCorrect ? 'text-green-600' : 'text-red-600'}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={isCorrect ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'}
                          />
                        </svg>
                      )}
                    </label>
                  );
                })}
              </div>
              {showAnswer && q.explanation && (
                <p className="mt-2 text-sm text-gray-600">💡 {q.explanation}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const HistoryDetail = () => {
  const { roomId } = useParams(); // 🔹 nhận roomId thay vì quizId
  const navigate = useNavigate();

  const [statData, setStatData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        // API 1: thông tin quiz (theo roomId)
        const quizRes = await axios.get(`http://localhost:8080/api/player-answers/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const quiz = quizRes.data;
        setStatData({
          topic: quiz.topicName,
          title: quiz.quizName,
          name: quiz.playerName,
          time: new Date(quiz.startedAt).toLocaleString('vi-VN'),
          rankValue: `Hạng ${quiz.ranking}`,
          scoreValue: `${quiz.score}/${quiz.totalQuestions * 10}`,
          progressNow: Math.round((quiz.correctCount / quiz.totalQuestions) * 100),
          rightCount: quiz.correctCount,
          wrongCount: quiz.wrongCount,
          avgTime: '12', // API chưa có avgTime
        });

        // API 2: chi tiết câu hỏi (theo roomId)
        const detailRes = await axios.get(`http://localhost:8080/api/player-answers/detail/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setQuestions(detailRes.data);
      } catch (err) {
        console.error('Lỗi tải chi tiết quiz:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roomId]);

  if (loading) {
    return <p className="text-center text-gray-500">Đang tải...</p>;
  }

  if (!statData) {
    return <p className="text-center text-red-500">Không tìm thấy dữ liệu</p>;
  }

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 mb-9 border-7 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
            aria-label="Quay lại"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <img src="/historydetail.png" alt="Detail" className="h-16 object-contain" />
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
              src="/code.png" 
              alt="Nhập mã phòng" 
              className="h-12 object-contain block transition-transform duration-150 hover:scale-105" 
            />
          </button>
        </div>
      </div>

      {/* HistoryStat + QuizReview */}
      <div className="flex flex-row gap-4 items-start flex-wrap">
        <div className="origin-top-left scale-90 w-full max-w-xl min-w-[320px] ml-0">
          <HistoryStat {...statData} />
        </div>
        <div className="flex-1 min-w-[320px] pr-6">
          <QuizReview questions={questions} />
        </div>
      </div>
    </div>
  );
};

export default HistoryDetail;
