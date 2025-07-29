import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus, Trash2, Settings } from 'lucide-react'
import CreatePageTopControls from '../components/CreatePageTopControls'
import CreateSidebar from '../components/CreateSidebar'
import FormatToolbar from '../components/FormatToolbar';
import QuestionEditor from '../components/QuestionEditor';
import ExplanationModal from '../components/ExplanationModal';

const defaultFormat = { bold: false, italic: false, underline: false, align: 'left' };

const CreateQuestionSet = () => {
  const navigate = useNavigate();
  const [questionSetName, setQuestionSetName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      image: null, // Thêm image riêng cho từng câu
      time: 10, // Thời gian cho câu hỏi (giây)
      score: 10, // Điểm số cho câu hỏi
      questionFormat: { ...defaultFormat },
      optionFormats: [
        { ...defaultFormat },
        { ...defaultFormat },
        { ...defaultFormat },
        { ...defaultFormat },
      ],
    }
  ])
  // selectedField: { questionId, type: 'question' | 'option', optionIndex? }
  const [selectedField, setSelectedField] = useState({ questionId: 1, type: 'question' })
  const [explanationModal, setExplanationModal] = useState({ open: false, optionIndex: null });
  const [explanations, setExplanations] = useState([
    { text: '', image: null },
    { text: '', image: null },
    { text: '', image: null },
    { text: '', image: null },
  ]);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const addQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      image: null, // Mỗi câu mới có image riêng
      time: 10, // Thời gian mặc định cho câu hỏi mới
      score: 10, // Điểm số mặc định cho câu hỏi mới
      questionFormat: { ...defaultFormat },
      optionFormats: [
        { ...defaultFormat },
        { ...defaultFormat },
        { ...defaultFormat },
        { ...defaultFormat },
      ],
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id))
    }
  }

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ))
  }

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) }
        : q
    ))
  }

  // Cập nhật định dạng cho ô đang chọn
  const updateFormat = (formatUpdate) => {
    setQuestions(questions.map(q => {
      if (q.id !== selectedField.questionId) return q;
      if (selectedField.type === 'question') {
        return { ...q, questionFormat: { ...q.questionFormat, ...formatUpdate } };
      } else if (selectedField.type === 'option') {
        const idx = selectedField.optionIndex;
        return {
          ...q,
          optionFormats: q.optionFormats.map((fmt, i) => i === idx ? { ...fmt, ...formatUpdate } : fmt)
        };
      }
      return q;
    }))
  }

  // Cập nhật thời gian cho câu hỏi hiện tại
  const updateTime = (newTime) => {
    setQuestions(questions.map(q => 
      q.id === questions[selectedIdx]?.id ? { ...q, time: newTime } : q
    ))
  }

  // Cập nhật điểm số cho câu hỏi hiện tại
  const updateScore = (newScore) => {
    setQuestions(questions.map(q => 
      q.id === questions[selectedIdx]?.id ? { ...q, score: newScore } : q
    ))
  }

  // Lấy format hiện tại của ô đang chọn
  const getCurrentFormat = () => {
    const q = questions.find(q => q.id === selectedField.questionId)
    if (!q) return defaultFormat;
    if (selectedField.type === 'question') return q.questionFormat;
    if (selectedField.type === 'option') return q.optionFormats[selectedField.optionIndex] || defaultFormat;
    return defaultFormat;
  }

  const handleTitleChange = (newTitle) => {
    setQuestionSetName(newTitle)
  }

  const handleSave = () => {
    // Xử lý lưu bộ câu hỏi
    console.log('Saving question set:', { questionSetName, description, category, questions })
  }

  // Hiện tại chỉ làm việc với câu hỏi đầu tiên (id=1)
  const currentQuestion = questions[0];

  // Mở modal giải thích cho đáp án đang chọn
  const handleAddExplanation = () => {
    if (selectedField.type === 'option') {
      setExplanationModal({ open: true, optionIndex: selectedField.optionIndex });
    }
  };

  // Lưu giải thích
  const handleSaveExplanation = () => {
    if (explanationModal.optionIndex !== null) {
      setExplanations(expls => expls.map((ex, idx) =>
        idx === explanationModal.optionIndex
          ? { text: explanationValue, image: explanationImage }
          : ex
      ));
    }
    setExplanationModal({ open: false, optionIndex: null });
    setExplanationValue('');
    setExplanationImage(null);
  };

  // Xóa giải thích
  const handleDeleteExplanation = () => {
    if (explanationModal.optionIndex !== null) {
      setExplanations(expls => expls.map((ex, idx) =>
        idx === explanationModal.optionIndex
          ? { text: '', image: null }
          : ex
      ));
    }
    setExplanationModal({ open: false, optionIndex: null });
    setExplanationValue('');
    setExplanationImage(null);
  };

  // Đóng modal
  const handleCloseExplanation = () => {
    setExplanationModal({ open: false, optionIndex: null });
    setExplanationValue('');
    setExplanationImage(null);
  };

  // State tạm cho modal
  const [explanationValue, setExplanationValue] = useState('');
  const [explanationImage, setExplanationImage] = useState(null);

  // Khi mở modal, nạp dữ liệu cũ nếu có
  React.useEffect(() => {
    if (explanationModal.open && explanationModal.optionIndex !== null) {
      setExplanationValue(explanations[explanationModal.optionIndex]?.text || '');
      setExplanationImage(explanations[explanationModal.optionIndex]?.image || null);
    }
  }, [explanationModal, explanations]);

  // State caret để lưu vị trí con trỏ
  const [caret, setCaret] = useState({ type: null, questionId: null, optionIndex: null, pos: 0 });
  const [activeInputRef, setActiveInputRef] = useState(null);

  // Mở trang preview mới
  const handleOpenPreview = () => {
    // Lưu dữ liệu vào localStorage hoặc state management để truyền cho PreviewPage
    localStorage.setItem('previewQuestions', JSON.stringify(questions));
    navigate('/preview');
  };

  // Chèn ký hiệu toán học vào đúng vị trí con trỏ
  const handleInsertSymbol = (symbol) => {
    const qid = selectedField.questionId;
    
    // Lấy nội dung và vị trí con trỏ trực tiếp từ textarea đang focus
    if (!activeInputRef || !activeInputRef.current) return;
    
    const textarea = activeInputRef.current;
    const currentValue = textarea.value;
    const pos = textarea.selectionStart ?? 0;
    
    // Tạo nội dung mới với ký hiệu được chèn vào
    const newValue = currentValue.slice(0, pos) + symbol + currentValue.slice(pos);
    
    setQuestions(questions => questions.map(q => {
      if (q.id !== qid) return q;
      
      // Xác định ô nào đang focus dựa trên selectedField
      if (selectedField.type === 'question') {
        return { ...q, question: newValue };
      } else if (selectedField.type === 'option') {
        const idx = selectedField.optionIndex;
        const newOptions = q.options.map((opt, i) => i === idx ? newValue : opt);
        return { ...q, options: newOptions };
      }
      return q;
    }));
    
    // Focus lại vào textarea và đặt lại vị trí con trỏ
    setTimeout(() => {
      if (activeInputRef && activeInputRef.current) {
        activeInputRef.current.focus();
        const newPos = pos + symbol.length;
        activeInputRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  // Thêm các hàm thao tác với card
  const handleDelete = (idx) => {
    if (questions.length === 1) return;
    setQuestions(qs => qs.filter((_, i) => i !== idx));
    if (selectedIdx >= questions.length - 1) setSelectedIdx(questions.length - 2);
  };

  const handleCopy = (idx) => {
    setQuestions(qs => {
      const newQ = { ...qs[idx], id: Date.now() + Math.random() };
      const arr = [...qs];
      arr.splice(idx + 1, 0, newQ);
      return arr;
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    setQuestions(qs => {
      const arr = Array.from(qs);
      const [removed] = arr.splice(result.source.index, 1);
      arr.splice(result.destination.index, 0, removed);
      return arr;
    });
    setSelectedIdx(result.destination.index);
  };

  // Chuẩn bị dữ liệu cho Sidebar
  const sidebarCards = questions.map((q, idx) => ({
    id: q.id,
    imageSrc: q.image
      ? (typeof q.image === 'string' ? q.image : URL.createObjectURL(q.image))
      : '/image.png', // Sử dụng đường dẫn tuyệt đối
    frameSrc: '/Frame 1171275867.png', // Sử dụng đường dẫn tuyệt đối
    infoText: q.question || 'Thêm thông tin ở đây...'
  }));

  return (
    <div className=" min-h-screen flex text-white">
      {/* Sidebar bên trái */}
      <CreateSidebar
        cards={sidebarCards}
        selectedIdx={selectedIdx}
        onSelect={(idx) => {
        setSelectedIdx(idx);
        setSelectedField({ questionId: questions[idx]?.id || 1, type: 'question' });
      }}
        onAddQuestion={() => {
          addQuestion();
          setSelectedIdx(questions.length); // chọn card mới
        }}
        onDelete={handleDelete}
        onCopy={handleCopy}
        onDragEnd={handleDragEnd}
      />
      {/* Main content bên phải */}
      <CreatePageTopControls 
        title={questionSetName || "Bộ câu hỏi không có tiêu đề"}
        onTitleChange={handleTitleChange}
        onSave={handleSave}
        showPreview={true}
        onPreview={handleOpenPreview}
      />
      <div className="flex-1 flex flex-col">
        {/* Toolbar định dạng */}
        <FormatToolbar 
          format={getCurrentFormat()} 
          onFormatChange={updateFormat}
          onAddExplanation={handleAddExplanation}
          onInsertSymbol={handleInsertSymbol}
          time={questions[selectedIdx]?.time || 10}
          score={questions[selectedIdx]?.score || 10}
          onTimeChange={updateTime}
          onScoreChange={updateScore}
        />
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="scale-75">
                      <QuestionEditor 
            question={questions[selectedIdx]?.question || ''}
            options={questions[selectedIdx]?.options || ['', '', '', '']}
            correctAnswer={questions[selectedIdx]?.correctAnswer || 0}
            questionFormat={questions[selectedIdx]?.questionFormat || { ...defaultFormat }}
            optionFormats={questions[selectedIdx]?.optionFormats || [
              { ...defaultFormat },
              { ...defaultFormat },
              { ...defaultFormat },
              { ...defaultFormat },
            ]}
            image={questions[selectedIdx]?.image || null}
            onChange={({ question, options, correctAnswer, image }) => {
              setQuestions(qs => qs.map((q, i) => i === selectedIdx ? { ...q, question, options, correctAnswer, image } : q));
            }}
            onFieldFocus={setSelectedField}
            onCaretChange={setCaret}
            onActiveInputRefChange={setActiveInputRef}
          />
          </div>
        </div>
        {/* Modal giải thích */}
        <ExplanationModal
          open={explanationModal.open}
          onClose={handleCloseExplanation}
          onSave={handleSaveExplanation}
          onDelete={handleDeleteExplanation}
          value={explanationValue}
          image={explanationImage}
          onValueChange={setExplanationValue}
          onImageChange={setExplanationImage}
        />
      </div>
    </div>
  )
}

export default CreateQuestionSet 