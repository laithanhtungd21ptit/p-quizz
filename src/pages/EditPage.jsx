import React, { useState, useRef, useEffect, useMemo } from 'react'

import { useNavigate, useLocation } from 'react-router-dom'
import ExplanationModal from '../components/ExplanationModal'
import { deleteQuestion, updateQuestion, getQuizById } from '../services/api'

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
  { id: 1, score: '50 điểm', time: '30s', question: 'Thủ đô của Nhật Bản là?', options: ['Tokyo', 'Osaka', 'Kyoto', 'Hokkaido'], answer: 'Tokyo' },
  { id: 2, score: '50 điểm', time: '30s', question: 'Thủ đô của Nhật Bản là?', options: ['Tokyo', 'Osaka', 'Kyoto', 'Hokkaido'], answer: 'Tokyo' },
  { id: 3, score: '50 điểm', time: '30s', question: 'Thủ đô của Nhật Bản là?', options: ['Tokyo', 'Osaka', 'Kyoto', 'Hokkaido'], answer: 'Tokyo' },
  { id: 4, score: '40 điểm', time: '20s', question: 'Thủ đô của Hàn Quốc là?', options: ['Seoul', 'Busan', 'Incheon', 'Daegu'], answer: 'Seoul' },
];

const QuestionList = ({ questions, onEditQuestion, onAddQuestion, onDeleteQuestion, onShowExplanation }) => {
  console.log('=== QUESTIONLIST RENDER ===');
  console.log('Questions prop:', questions);
  questions.forEach((q, idx) => {
    console.log(`Câu ${idx + 1}:`, q);
    console.log(`- Options:`, q.options);
    console.log(`- Answer:`, q.answer);
    console.log(`- Answer type:`, typeof q.answer);
  });
  
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
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                 {q.options.map((opt, optIndex) => {
                   const isCorrect = optIndex === q.answerIndex;
                   console.log(`Câu ${idx + 1}: Option ${optIndex} (${opt}) === AnswerIndex ${q.answerIndex} = ${isCorrect}`);
                   return (
                     <div key={opt} className="flex items-center gap-2 text-gray-700">
                       <div className="relative">
                         <input
                           type="radio"
                           name={`q${idx+1}`}
                           value={opt}
                           className={`border border-gray-300 rounded-full w-5 h-5 cursor-pointer ${
                             isCorrect 
                               ? 'bg-green-600 border-green-600' 
                               : 'bg-white border-gray-300'
                           }`}
                           checked={isCorrect}
                           readOnly
                         />
                         {isCorrect && (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white absolute top-1 left-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                           </svg>
                         )}
                       </div>
                       <span className={`${isCorrect ? 'font-semibold text-green-600' : ''}`}>
                         {opt}
                       </span>
                     </div>
                   );
                 })}
               </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

const EditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [score, setScore] = useState('');
  const [time, setTime] = useState('');
  const [questions, setQuestions] = useState([]);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [explanationValue, setExplanationValue] = useState('');
  const [explanationImage, setExplanationImage] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Nhận dữ liệu quiz từ navigation state
  useEffect(() => {
    if (location.state?.quizData) {
      const { quizData } = location.state;
      console.log('=== EDITPAGE: location.state ===', location.state);
      console.log('=== DỮ LIỆU TỪ API ===');
      console.log('Quiz data:', quizData);
      console.log('Questions:', quizData.questions);
      
      // Chuyển đổi dữ liệu từ API format sang format cần thiết
      const convertedQuestions = quizData.questions?.map((q, index) => {
        console.log(`Câu hỏi ${index + 1}:`, q);
        console.log(`- Content: ${q.content}`);
        console.log(`- AnswerA: ${q.answerA}`);
        console.log(`- AnswerB: ${q.answerB}`);
        console.log(`- AnswerC: ${q.answerC}`);
        console.log(`- AnswerD: ${q.answerD}`);
        console.log(`- CorrectAnswer: ${q.correctAnswer}`);
        console.log(`- CorrectAnswer type:`, typeof q.correctAnswer);
        console.log(`- CorrectAnswer === AnswerA:`, q.correctAnswer === q.answerA);
        console.log(`- CorrectAnswer === AnswerB:`, q.correctAnswer === q.answerB);
        console.log(`- CorrectAnswer === AnswerC:`, q.correctAnswer === q.answerC);
        console.log(`- CorrectAnswer === AnswerD:`, q.correctAnswer === q.answerD);
        
        // Xác định index của đáp án đúng dựa trên CorrectAnswer (A, B, C, D)
        let correctAnswerIndex = -1;
        if (q.correctAnswer === 'A') correctAnswerIndex = 0;
        else if (q.correctAnswer === 'B') correctAnswerIndex = 1;
        else if (q.correctAnswer === 'C') correctAnswerIndex = 2;
        else if (q.correctAnswer === 'D') correctAnswerIndex = 3;
        
        console.log(`- CorrectAnswer: ${q.correctAnswer} -> Index: ${correctAnswerIndex}`);
        
        return {
          id: q.id, // Giữ lại ID gốc từ API
          score: `${q.score || 200} điểm`,
          time: `${q.limitedTime || 30}s`,
          question: q.content || '',
          options: [q.answerA || '', q.answerB || '', q.answerC || '', q.answerD || ''],
          answerIndex: correctAnswerIndex, // Sử dụng index thay vì text
          description: q.description || '',
          imageUrl: q.imageUrl || ''
        };
      }) || [];
      
      console.log('=== DỮ LIỆU SAU KHI CHUYỂN ĐỔI ===');
      console.log('Converted questions:', convertedQuestions);
      convertedQuestions.forEach((q, idx) => {
        console.log(`Câu ${idx + 1}:`, q);
        console.log(`- ID:`, q.id);
        console.log(`- Question:`, q.question);
        console.log(`- Options:`, q.options);
        console.log(`- AnswerIndex:`, q.answerIndex);
      });
      
      setQuestions(convertedQuestions);
    } else {
      // Fallback về dữ liệu mẫu nếu không có dữ liệu
      console.log('Không có dữ liệu từ API, sử dụng dữ liệu mẫu');
      setQuestions(questionsData);
    }
  }, [location.state]);

  // Fetch dữ liệu mới nhất từ backend nếu có quizId
  useEffect(() => {
    const quizId = location.state?.quizData?.id;
    if (!quizId) return;
    (async () => {
      try {
        const res = await getQuizById(quizId);
        const quiz = res?.data || res; // ApiResponse hoặc raw
        if (!quiz) return;
        const latest = quiz.data || quiz; // ưu tiên field data nếu có

        // Cập nhật lại location.state để meta (name, topic, imageUrl, ...) luôn mới
        navigate(location.pathname, {
          state: { quizData: latest },
          replace: true
        });

        // Chuyển đổi câu hỏi sang format UI
        const convertedQuestions = (latest.questions || []).map((q) => {
          let correctAnswerIndex = -1;
          if (q.correctAnswer === 'A') correctAnswerIndex = 0;
          else if (q.correctAnswer === 'B') correctAnswerIndex = 1;
          else if (q.correctAnswer === 'C') correctAnswerIndex = 2;
          else if (q.correctAnswer === 'D') correctAnswerIndex = 3;
          return {
            id: q.id,
            score: `${q.score || 200} điểm`,
            time: `${q.limitedTime || 30}s`,
            question: q.content || '',
            options: [q.answerA || '', q.answerB || '', q.answerC || '', q.answerD || ''],
            answerIndex: correctAnswerIndex,
            description: q.description || '',
            imageUrl: q.imageUrl || ''
          };
        });
        setQuestions(convertedQuestions);
      } catch (e) {
        console.error('Lỗi fetch quiz mới nhất:', e);
      }
    })();
  }, [location.state?.quizData?.id, navigate, location.pathname]);

  // Chuẩn bị dữ liệu bộ câu hỏi để truyền sang trang chỉnh sửa chi tiết
  const questionSetData = useMemo(() => {
    if (location.state?.quizData) {
      const { quizData } = location.state;
      const normalizedCoverImage = (() => {
        const img = quizData?.imageUrl;
        if (!img) return '';
        if (typeof img !== 'string') return '';
        if (img.startsWith('data:') || img.startsWith('http://') || img.startsWith('https://')) return img;
        return `data:image/png;base64,${img}`;
      })();
      return {
        questionSetName: quizData.name || 'Bộ câu hỏi',
        description: quizData.description || '',
        category: quizData.topic || 'general',
        coverImage: normalizedCoverImage, // Ảnh bìa đã chuẩn hoá để hiển thị
        visibleTo: quizData.visibleTo || false, // Thêm quyền truy cập
        quizId: quizData.id, // Thêm ID của quiz
        questions: questions.map((q, idx) => ({
          id: q.id || (idx + 1), // Sử dụng id gốc từ API hoặc fallback về idx + 1
          question: q.question,
          options: q.options,
          correctAnswer: q.answerIndex || 0, // Sử dụng answerIndex thay vì tìm kiếm
          image: q.imageUrl || null,
          time: parseInt(q.time),
          score: parseInt(q.score),
          description: q.description || '', // ✅ Thêm field description (giải thích)
          questionFormat: { bold: false, italic: false, underline: false, align: 'left' },
          optionFormats: [
            { bold: false, italic: false, underline: false, align: 'left' },
            { bold: false, italic: false, underline: false, align: 'left' },
            { bold: false, italic: false, underline: false, align: 'left' },
            { bold: false, italic: false, underline: false, align: 'left' },
          ],
        }))
      };
    } else {
      return {
        questionSetName: 'Bộ câu hỏi mẫu',
        description: '',
        category: 'general',
        coverImage: '', // Thêm ảnh bìa mặc định
        visibleTo: false, // Thêm quyền truy cập mặc định
        quizId: null, // Thêm ID quiz mặc định
        questions: questions.map((q, idx) => ({
          id: q.id || (idx + 1), // Sử dụng id gốc từ API hoặc fallback về idx + 1
          question: q.question,
          options: q.options,
          correctAnswer: q.answerIndex || 0, // Sử dụng answerIndex thay vì tìm kiếm
          image: null,
          time: parseInt(q.time),
          score: parseInt(q.score),
          description: q.description || '', // ✅ Thêm field description (giải thích)
          questionFormat: { bold: false, italic: false, underline: false, align: 'left' },
          optionFormats: [
            { bold: false, italic: false, underline: false, align: 'left' },
            { bold: false, italic: false, underline: false, align: 'left' },
            { bold: false, italic: false, underline: false, align: 'left' },
            { bold: false, italic: false, underline: false, align: 'left' },
          ],
        }))
      };
    }
  }, [questions, location.state]);

  useEffect(() => {
    // Log cấu trúc dữ liệu chuyển sang EditQuestionSet
    console.log('=== EDITPAGE -> questionSetData (to EditQuestionSet) ===')
    console.log('Meta:', {
      questionSetName: questionSetData.questionSetName,
      description: questionSetData.description,
      category: questionSetData.category,
      coverImage: questionSetData.coverImage ? '[HAS_IMAGE]' : null,
      visibleTo: questionSetData.visibleTo,
      quizId: questionSetData.quizId
    })
    console.log('Questions length:', questionSetData.questions?.length)
    if (questionSetData.questions?.length) {
      console.log('First question sample:', questionSetData.questions[0])
    }
  }, [questionSetData])

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
    console.log('=== HANDLE DELETE QUESTION ===');
    console.log('Index:', idx);
    console.log('Question at index:', questions[idx]);
    console.log('Question ID:', questions[idx]?.id);
    
    // Hiển thị popup xác nhận xóa
    setQuestionToDelete({ index: idx, question: questions[idx] });
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteQuestion = async () => {
    if (!questionToDelete) return;
    
    console.log('=== XÓA CÂU HỎI ===');
    console.log('Question to delete:', questionToDelete);
    console.log('Question ID:', questionToDelete.question.id);
    console.log('Question object:', questionToDelete.question);
    
    if (!questionToDelete.question.id) {
      console.error('ID câu hỏi bị undefined!');
      console.error('Question object:', questionToDelete.question);
      alert('Không thể xác định ID câu hỏi. Vui lòng thử lại!');
      return;
    }
    
    try {
      setIsDeleting(true);
      
      // Gọi API xóa câu hỏi
      await deleteQuestion(questionToDelete.question.id);
      
      // Xóa câu hỏi khỏi danh sách local
      setQuestions(prevQuestions => 
        prevQuestions.filter((_, index) => index !== questionToDelete.index)
      );
      
      // Cập nhật location.state để đồng bộ với database
      if (location.state?.quizData) {
        const updatedQuizData = {
          ...location.state.quizData,
          questions: location.state.quizData.questions.filter((_, index) => index !== questionToDelete.index)
        };
        
        // Cập nhật navigation state
        navigate(location.pathname, { 
          state: { 
            quizData: updatedQuizData,
            replace: true 
          } 
        });
      }
      
      // Đóng popup
      setShowDeleteConfirmModal(false);
      setQuestionToDelete(null);
      
      // Hiển thị thông báo thành công
      alert('Đã xóa câu hỏi thành công!');
      
    } catch (error) {
      console.error('Lỗi khi xóa câu hỏi:', error);
      alert('Có lỗi xảy ra khi xóa câu hỏi. Vui lòng thử lại!');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteQuestion = () => {
    setShowDeleteConfirmModal(false);
    setQuestionToDelete(null);
  };

  // Function để refresh dữ liệu từ API (nếu cần)
  const refreshQuizData = async () => {
    if (location.state?.quizData?.id) {
      try {
        // TODO: Gọi API để lấy lại dữ liệu quiz mới nhất
        // const response = await getQuizById(location.state.quizData.id);
        // navigate(location.pathname, { 
        //   state: { quizData: response.data, replace: true } 
        // });
        console.log('Cần implement API getQuizById để refresh dữ liệu');
        
        // Tạm thời: Reload trang để lấy dữ liệu mới
        window.location.reload();
      } catch (error) {
        console.error('Lỗi khi refresh dữ liệu:', error);
      }
    } else {
      // Nếu không có ID, reload trang
      window.location.reload();
    }
  };

  const handleShowExplanation = (idx) => {
    setSelectedQuestionIndex(idx);
    setShowExplanationModal(true);
    // Load existing explanation if available
    const question = questions[idx];
    console.log('=== LOAD EXPLANATION ===');
    console.log('Question:', question);
    console.log('Description field:', question.description);
    console.log('ImageUrl field:', question.imageUrl);
    
    // Sử dụng field 'description' từ API thay vì 'explanation'
    if (question.description) {
      setExplanationValue(question.description);
    } else {
      setExplanationValue('');
    }
    
    // Sử dụng field 'imageUrl' từ API thay vì 'explanationImage'
    if (question.imageUrl) {
      setExplanationImage(question.imageUrl);
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

  const handleSaveExplanation = async () => {
    if (selectedQuestionIndex !== null) {
      const question = questions[selectedQuestionIndex];
      console.log('=== SAVE EXPLANATION ===');
      console.log('Question to update:', question);
      console.log('New explanation value:', explanationValue);
      console.log('New explanation image:', explanationImage);
      
      try {
        // Chuẩn bị dữ liệu để gửi API
        const updateData = {
          quizId: location.state?.quizData?.id,
          content: question.question,
          description: explanationValue, // Giải thích mới
          answerA: question.options[0] || '',
          answerB: question.options[1] || '',
          answerC: question.options[2] || '',
          answerD: question.options[3] || '',
          correctAnswer: ['A', 'B', 'C', 'D'][question.answerIndex] || 'A',
          limitedTime: parseInt(question.time),
          score: parseInt(question.score),
          imageUrl: question.imageUrl || ''
        };
        
        console.log('Data to send to API:', updateData);
        
        // Gọi API cập nhật câu hỏi
        await updateQuestion(question.id, updateData);
        
        // Cập nhật state local
        setQuestions(prevQuestions => 
          prevQuestions.map((q, idx) => 
            idx === selectedQuestionIndex 
              ? { ...q, description: explanationValue, imageUrl: explanationImage }
              : q
          )
        );
        
        // Hiển thị thông báo thành công
        alert('Đã lưu giải thích thành công!');
        
      } catch (error) {
        console.error('Lỗi khi lưu giải thích:', error);
        alert('Có lỗi xảy ra khi lưu giải thích. Vui lòng thử lại!');
      }
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
      {/* Top Controls cho EditPage - giống CreatePageTopControls nhưng không có nút lưu */}
      <div className="fixed top-0 left-0 w-full h-14 bg-black/90 border-b border-gray-700 px-6 py-3 flex items-center justify-between shadow-lg z-30">
        {/* Left side - Back button, topic, and title */}
        <div className="flex items-center space-x-4">
          {/* Nút trở lại */}
          <button 
            onClick={() => navigate(-1)}
            className="bg-white rounded-[10px] p-2 shadow-md hover:bg-gray-100 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Hiển thị chủ đề (chỉ đọc) */}
          <div className="w-60">
            <div className="bg-gray-200 rounded-[10px] p-2 w-full text-gray-800">
              {location.state?.quizData?.topic || 'Chưa chọn chủ đề'}
            </div>
          </div>

          {/* Hiển thị tiêu đề (chỉ đọc) */}
          <div className="w-80">
            <div className="bg-gray-200 rounded-[10px] p-2 w-full text-gray-800">
              {location.state?.quizData?.name || 'Bộ câu hỏi không có tiêu đề'}
            </div>
          </div>
        </div>

        {/* Right side - Nút lưu thay đổi */}
        <div className="flex items-center">
          <button
            onClick={() => {
              // TODO: Xử lý lưu thay đổi
              console.log('Lưu thay đổi câu hỏi');
              alert('Đã lưu thay đổi!');
            }}
            className="bg-[#ED005D] hover:bg-[#d10052] text-white rounded-[10px] px-4 py-2 font-medium transition-all duration-300 shadow-lg hover:shadow-[#ED005D]/25"
          >
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </div>
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
       
       {/* Delete Confirmation Modal */}
       {showDeleteConfirmModal && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
             <div className="flex items-center mb-4">
               <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                 <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                 </svg>
               </div>
               <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa câu hỏi</h3>
             </div>
             
             <p className="text-gray-600 mb-6">
               Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác.
             </p>
             
             <div className="flex space-x-3">
               <button
                 onClick={cancelDeleteQuestion}
                 disabled={isDeleting}
                 className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
               >
                 Hủy bỏ
               </button>
               <button
                 onClick={confirmDeleteQuestion}
                 disabled={isDeleting}
                 className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
               >
                 {isDeleting ? (
                   <>
                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Đang xóa...
                   </>
                 ) : (
                   'Xóa câu hỏi'
                 )}
               </button>
             </div>
           </div>
         </div>
       )}

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