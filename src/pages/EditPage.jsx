import React, { useState, useRef, useEffect } from 'react'
import CreatePageTopControls from '../components/CreatePageTopControls'
import { useNavigate } from 'react-router-dom'
import ExplanationModal from '../components/ExplanationModal'

const DROPDOWN_SCORE = [5, 10, 15];
const DROPDOWN_TIME = [10, 20, 30];

const DropdownInput = ({ placeholder, icon, options, value, setValue }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative w-40 dropdown${open ? ' open' : ''}`} ref={ref}>
      <input
        type="text"
        placeholder={placeholder}
        className="input-field w-full border border-pink-500 rounded-md py-2 pl-10 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onFocus={() => setOpen(true)}
        onChange={e => {
          const val = e.target.value.replace(/[^0-9]/g, '');
          setValue(val);
        }}
      />
      <div className="absolute top-2.5 left-3 text-pink-600">{icon}</div>
      <div className="absolute right-2 top-3 text-gray-400 pointer-events-none select-none">▼</div>
      {open && (
        <ul className="dropdown-menu absolute z-10 bg-white border border-pink-400 mt-1 rounded-md w-full shadow-lg text-gray-700">
          {options.map(opt => (
            <li
              key={opt}
              className="px-4 py-2 hover:bg-pink-100 cursor-pointer"
              onClick={() => {
                setValue(String(opt));
                setOpen(false);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const questionsData = [
  { score: '50 điểm', time: '30s', question: 'Thủ đô của Nhật Bản là?', options: ['Tokyo', 'Osaka', 'Kyoto', 'Hokkaido'], answer: 'Tokyo' },
  { score: '50 điểm', time: '30s', question: 'Thủ đô của Nhật Bản là?', options: ['Tokyo', 'Osaka', 'Kyoto', 'Hokkaido'], answer: 'Tokyo' },
  { score: '50 điểm', time: '30s', question: 'Thủ đô của Nhật Bản là?', options: ['Tokyo', 'Osaka', 'Kyoto', 'Hokkaido'], answer: 'Tokyo' },
  { score: '40 điểm', time: '20s', question: 'Thủ đô của Hàn Quốc là?', options: ['Seoul', 'Busan', 'Incheon', 'Daegu'], answer: 'Seoul' },
];

const QuestionList = ({ questions, onEditQuestion, onAddQuestion, onDeleteQuestion, onShowExplanation }) => {
  return (
    <div className="bg-white w-full max-w-2xl rounded-xl p-6 flex flex-col gap-4 shadow-lg max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center border-b border-gray-300 pb-3">
        <h2 className="text-base font-medium text-gray-800 font-content">{questions.length} câu hỏi</h2>
        <button 
          type="button" 
          className="text-pink-600 border border-pink-600 rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-pink-50 transition font-content" 
          aria-label="Thêm câu hỏi"
          onClick={onAddQuestion}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Thêm câu hỏi
        </button>
      </div>
             <div className="divide-y divide-gray-200">
         {questions.map((q, idx) => (
          <article key={idx} className={`py-6 flex flex-col gap-4${idx > 0 ? ' border-t border-gray-200' : ''}`}> 
            <header className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex gap-3">
                <div className="relative">
                  <label className="sr-only">Điểm câu hỏi {idx+1}</label>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-600 absolute left-2.5 top-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="7" />
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                  </svg>
                  <select className="pl-8 pr-3 border border-pink-600 rounded-lg py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer">
                    <option>{q.score}</option><option>40 điểm</option><option>30 điểm</option>
                  </select>
                </div>
                <div className="relative">
                  <label className="sr-only">Thời gian câu hỏi {idx+1}</label>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-600 absolute left-2.5 top-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <select className="pl-8 pr-3 border border-pink-600 rounded-lg py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer">
                    <option>{q.time}</option><option>20s</option><option>10s</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button aria-label="Sửa câu hỏi" className="bg-pink-100 text-pink-700 p-2 rounded-md hover:bg-pink-200 transition flex items-center justify-center" onClick={() => onEditQuestion(idx)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"></path>
                  </svg>
                </button>
                <button 
                  aria-label="Nổi bật câu hỏi" 
                  className="bg-pink-100 text-pink-700 p-2 rounded-md hover:bg-pink-200 transition flex items-center justify-center"
                  onClick={() => onShowExplanation(idx)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m0 14v1m7-7h1M4 12H3m16.364-4.364l.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" />
                  </svg>
                </button>
                <button 
                  aria-label="Xóa câu hỏi" 
                  className="bg-pink-100 text-pink-700 p-2 rounded-md hover:bg-pink-200 transition flex items-center justify-center"
                  onClick={() => onDeleteQuestion(idx)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </header>
            <div>
              <p className="font-medium text-gray-900 mb-2 font-content">{idx+1}. {q.question}</p>
              <form className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map(opt => (
                  <label key={opt} className="flex items-center gap-2 text-gray-700 cursor-pointer font-content">
                    {opt === q.answer ? (
                      <span className="inline-block w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center bg-green-600 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </span>
                    ) : null}
                    <input
                      type="radio"
                      name={`q${idx+1}`}
                      value={opt}
                      className={`border border-gray-300 rounded-full w-5 h-5 checked:bg-pink-600 checked:border-pink-600 cursor-pointer ${opt === q.answer ? 'hidden' : ''}`}
                      checked={opt === q.answer}
                      readOnly
                    />
                    {opt}
                  </label>
                ))}
              </form>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

const EditPage = () => {
  const [score, setScore] = useState('');
  const [time, setTime] = useState('');
  const [questions, setQuestions] = useState(questionsData);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [explanationValue, setExplanationValue] = useState('');
  const [explanationImage, setExplanationImage] = useState(null);
  const navigate = useNavigate();

  // Chuẩn bị dữ liệu bộ câu hỏi để truyền sang trang chỉnh sửa chi tiết
  const questionSetData = {
    questionSetName: 'Bộ câu hỏi mẫu',
    description: '',
    category: 'general',
    questions: questions.map((q, idx) => ({
      id: idx + 1,
      question: q.question,
      options: q.options,
      correctAnswer: q.options.findIndex(opt => opt === q.answer),
      image: null,
      time: parseInt(q.time),
      score: parseInt(q.score),
      questionFormat: { bold: false, italic: false, underline: false, align: 'left' },
      optionFormats: [
        { bold: false, italic: false, underline: false, align: 'left' },
        { bold: false, italic: false, underline: false, align: 'left' },
        { bold: false, italic: false, underline: false, align: 'left' },
        { bold: false, italic: false, underline: false, align: 'left' },
      ],
    }))
  };

  const handleAddQuestion = () => {
    // Tạo một câu hỏi mới với dữ liệu mặc định
    const newQuestion = {
      id: questionSetData.questions.length + 1,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      image: null,
      time: 10,
      score: 10,
      questionFormat: { bold: false, italic: false, underline: false, align: 'left' },
      optionFormats: [
        { bold: false, italic: false, underline: false, align: 'left' },
        { bold: false, italic: false, underline: false, align: 'left' },
        { bold: false, italic: false, underline: false, align: 'left' },
        { bold: false, italic: false, underline: false, align: 'left' },
      ],
    };

    // Thêm câu hỏi mới vào cuối danh sách
    const updatedQuestionSetData = {
      ...questionSetData,
      questions: [...questionSetData.questions, newQuestion]
    };

    // Chuyển đến trang EditQuestionSet với câu hỏi mới được thêm vào cuối
    navigate('/edit-question-set/new', { 
      state: { 
        questionSetData: updatedQuestionSetData, 
        selectedIdx: updatedQuestionSetData.questions.length - 1 // Chọn câu hỏi mới (cuối cùng)
      } 
    });
  };

  const handleDeleteQuestion = (idx) => {
    // Xóa câu hỏi khỏi danh sách
    setQuestions(prevQuestions => prevQuestions.filter((_, index) => index !== idx));
  };

  const handleShowExplanation = (idx) => {
    setSelectedQuestionIndex(idx);
    setShowExplanationModal(true);
    // Load existing explanation if available
    const question = questions[idx];
    if (question.explanation) {
      setExplanationValue(question.explanation);
    } else {
      setExplanationValue('');
    }
    if (question.explanationImage) {
      setExplanationImage(question.explanationImage);
    } else {
      setExplanationImage(null);
    }
  };

  const handleCloseExplanation = () => {
    setShowExplanationModal(false);
    setSelectedQuestionIndex(null);
    setExplanationValue('');
    setExplanationImage(null);
  };

  const handleSaveExplanation = () => {
    if (selectedQuestionIndex !== null) {
      setQuestions(prevQuestions => 
        prevQuestions.map((q, idx) => 
          idx === selectedQuestionIndex 
            ? { ...q, explanation: explanationValue, explanationImage: explanationImage }
            : q
        )
      );
    }
    handleCloseExplanation();
  };

  const handleDeleteExplanation = () => {
    if (selectedQuestionIndex !== null) {
      setQuestions(prevQuestions => 
        prevQuestions.map((q, idx) => 
          idx === selectedQuestionIndex 
            ? { ...q, explanation: '', explanationImage: null }
            : q
        )
      );
    }
    handleCloseExplanation();
  };

  return (
    <div className="min-h-screen bg-[url('/background2.png')] bg-cover bg-center bg-fixed flex flex-col">
      <CreatePageTopControls />
      <div className="flex-1 flex items-start justify-center mt-20 md:mt-24">
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 px-4">
          <div className="w-full md:w-1/2 flex justify-center items-start">
            <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md" style={{ boxShadow: '0 0 30px 8px rgba(255, 0, 128, 0.5)' }}>
              {/* Tiêu đề */}
              <div className="flex items-center text-pink-600 text-xl font-semibold mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Cập nhật câu hỏi hàng loạt
              </div>
              {/* Ô nhập có dropdown */}
              <div className="flex space-x-4">
                {/* Điểm */}
                <DropdownInput
                  placeholder="Điểm"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="7" />
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                    </svg>
                  }
                  options={DROPDOWN_SCORE}
                  value={score}
                  setValue={setScore}
                />
                {/* Thời gian */}
                <DropdownInput
                  placeholder="Thời gian (s)"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  options={DROPDOWN_TIME}
                  value={time}
                  setValue={setTime}
                />
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex justify-center items-start">
             {/* Sửa QuestionList: truyền hàm onEdit, onAddQuestion và onDeleteQuestion để chuyển trang */}
             <QuestionList 
               questions={questions}
               onEditQuestion={idx => navigate(`/edit-question-set/${idx}`, { state: { questionSetData, selectedIdx: idx } })}
               onAddQuestion={handleAddQuestion}
               onDeleteQuestion={handleDeleteQuestion}
               onShowExplanation={handleShowExplanation}
             />
           </div>
                 </div>
       </div>
       
       {/* Explanation Modal */}
       <ExplanationModal
         open={showExplanationModal}
         onClose={handleCloseExplanation}
         onSave={handleSaveExplanation}
         onDelete={handleDeleteExplanation}
         value={explanationValue}
         image={explanationImage}
         onValueChange={setExplanationValue}
         onImageChange={setExplanationImage}
       />
     </div>
   )
 }

export default EditPage 