import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionEditor from '../components/QuestionEditor';

const PreviewPage = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCorrect, setShowCorrect] = useState(false);
  const [questions, setQuestions] = useState([]);

  // Load dữ liệu từ localStorage khi component mount
  useEffect(() => {
    const savedQuestions = localStorage.getItem('previewQuestions');
    if (savedQuestions) {
      try {
        const parsedQuestions = JSON.parse(savedQuestions);
        setQuestions(parsedQuestions);
      } catch (error) {
        console.error('Error parsing questions:', error);
        setQuestions([]);
      }
    }
  }, []);

  const handlePrevQuestion = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextQuestion = () => {
    setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1));
  };

  const handleToggleShowCorrect = () => {
    setShowCorrect(prev => !prev);
  };

  const handleBack = () => {
    navigate(-1); // Quay về trang trước đó
  };

  const currentQuestion = questions[currentIndex] || {
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    questionFormat: { bold: false, italic: false, underline: false, align: 'left' },
    optionFormats: [
      { bold: false, italic: false, underline: false, align: 'left' },
      { bold: false, italic: false, underline: false, align: 'left' },
      { bold: false, italic: false, underline: false, align: 'left' },
      { bold: false, italic: false, underline: false, align: 'left' },
    ],
    image: null
  };

  // Nếu không có câu hỏi nào, hiển thị thông báo
  if (questions.length === 0) {
    return (
      <div className="min-h-screen w-full bg-[url('/background2.png')] bg-cover bg-center bg-no-repeat flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Không có câu hỏi nào để xem trước</h1>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[url('/background2.png')] bg-cover bg-center bg-no-repeat relative overflow-hidden">
      {/* Nút X - góc trên cùng bên phải */}
      <button
        onClick={handleBack}
        className="absolute top-6 right-6 z-50 text-white hover:text-gray-300 text-3xl font-bold focus:outline-none transition-colors"
      >
        ×
      </button>

      {/* Text chế độ xem người chơi - góc trên cùng bên trái */}
      <div className="absolute top-6 left-6 z-50 text-white font-semibold text-lg">
        <span className="text-pink-400">+ Chế độ xem người chơi</span>
      </div>

      {/* Hiển thị câu hiện tại - góc giữa trên */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 text-white font-semibold text-lg bg-pink-500 px-4 rounded-lg">
        {currentIndex + 1} / {questions.length}
      </div>

      {/* QuestionEditor ở giữa */}
      <div className="flex items-center justify-center h-full">
        <div className="transform scale-90">
          <QuestionEditor
            question={currentQuestion.question}
            options={currentQuestion.options}
            correctAnswer={currentQuestion.correctAnswer}
            questionFormat={currentQuestion.questionFormat}
            optionFormats={currentQuestion.optionFormats}
            image={currentQuestion.image}
            readOnly={true}
            showCorrect={showCorrect}
          />
        </div>
      </div>

      {/* Nút bật/tắt đáp án - góc dưới cùng bên trái */}
      <div className="absolute bottom-8 left-48 z-50">
        <label className="flex items-center space-x-3 text-white text-lg font-medium cursor-pointer">
          <span>Hiển thị đáp án</span>
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={showCorrect}
            onChange={handleToggleShowCorrect}
          />
          <div className="w-10 h-5 bg-gray-600 rounded-full peer-checked:bg-green-600 relative transition-colors">
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${showCorrect ? 'translate-x-5' : 'translate-x-0'}`}></div>
          </div>
        </label>
      </div>

      {/* Nút chuyển câu - góc dưới cùng bên phải */}
      <div className="absolute bottom-6 right-6 z-50 flex gap-4">
        <button
          onClick={handlePrevQuestion}
          disabled={currentIndex === 0}
          className={`px-4 py-3 rounded-lg font-bold text-xl transition-colors ${
            currentIndex === 0
              ? 'bg-white/20 text-white/50 cursor-not-allowed'
              : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
          }`}
        >
          {'<'}
        </button>
        <button
          onClick={handleNextQuestion}
          disabled={currentIndex === questions.length - 1}
          className={`px-4 py-3 rounded-lg font-bold text-xl transition-colors ${
            currentIndex === questions.length - 1
              ? 'bg-white/20 text-white/50 cursor-not-allowed'
              : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
          }`}
        >
          {'>'}
        </button>
      </div>
    </div>
  );
};

export default PreviewPage; 