import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import CreatePageTopControls from '../components/CreatePageTopControls';
import CreateSidebar from '../components/CreateSidebar';
import FormatToolbar from '../components/FormatToolbar';
import QuestionEditor from '../components/QuestionEditor';
import ExplanationModal from '../components/ExplanationModal';

const defaultFormat = { bold: false, italic: false, underline: false, align: 'left' };

const EditQuestionSet = () => {
  const navigate = useNavigate();
  const { idx } = useParams();
  const location = useLocation();
  const state = location.state;

  // Nếu không có dữ liệu truyền vào thì chuyển hướng về trang trước
  useEffect(() => {
    if (!state || !state.questionSetData) {
      navigate(-1);
    }
  }, [state, navigate]);

  if (!state || !state.questionSetData) {
    return <div className="text-center text-lg text-pink-600 mt-20">Không có dữ liệu bộ câu hỏi để chỉnh sửa.</div>;
  }

  const initialData = state.questionSetData;
  const initialIdx = typeof state.selectedIdx === 'number' ? state.selectedIdx : Number(idx) || 0;

  const [questionSetName, setQuestionSetName] = useState(initialData.questionSetName);
  const [description, setDescription] = useState(initialData.description);
  const [category, setCategory] = useState(initialData.category);
  const [questions, setQuestions] = useState(initialData.questions);
  const [selectedField, setSelectedField] = useState({ questionId: questions[initialIdx]?.id || 1, type: 'question' });
  const [explanationModal, setExplanationModal] = useState({ open: false, questionId: null });
  const [selectedIdx, setSelectedIdx] = useState(initialIdx);
  const [explanationValue, setExplanationValue] = useState('');
  const [explanationImage, setExplanationImage] = useState(null);
  const [caret, setCaret] = useState({ type: null, questionId: null, optionIndex: null, pos: 0 });
  const [activeInputRef, setActiveInputRef] = useState(null);

  // Copy toàn bộ logic từ CreateQuestionSet.jsx (addQuestion, removeQuestion, updateQuestion, ...)
  const addQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      image: null,
      time: 10,
      score: 10,
      questionFormat: { ...defaultFormat },
      optionFormats: [
        { ...defaultFormat },
        { ...defaultFormat },
        { ...defaultFormat },
        { ...defaultFormat },
      ],
      explanation: { text: '', image: null }, // Thêm explanation cho câu hỏi mới
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(questions.map(q =>
      q.id === questionId
        ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) }
        : q
    ));
  };

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
    }));
  };

  const updateTime = (newTime) => {
    setQuestions(questions.map((q, i) =>
      i === selectedIdx ? { ...q, time: newTime } : q
    ));
  };

  const updateScore = (newScore) => {
    setQuestions(questions.map((q, i) =>
      i === selectedIdx ? { ...q, score: newScore } : q
    ));
  };

  const getCurrentFormat = () => {
    const q = questions.find(q => q.id === selectedField.questionId);
    if (!q) return defaultFormat;
    if (selectedField.type === 'question') return q.questionFormat;
    if (selectedField.type === 'option') return q.optionFormats[selectedField.optionIndex] || defaultFormat;
    return defaultFormat;
  };

  const handleTitleChange = (newTitle) => {
    setQuestionSetName(newTitle);
  };

  const handleSave = () => {
    // Xử lý lưu bộ câu hỏi
    alert('Đã lưu bộ câu hỏi!');
  };

  const handleAddExplanation = () => {
    setExplanationModal({ open: true, questionId: questions[selectedIdx]?.id });
  };

  const handleSaveExplanation = () => {
    if (explanationModal.questionId !== null) {
      setQuestions(qs => qs.map(q => 
        q.id === explanationModal.questionId
          ? { ...q, explanation: { text: explanationValue, image: explanationImage } }
          : q
      ));
    }
    setExplanationModal({ open: false, questionId: null });
    setExplanationValue('');
    setExplanationImage(null);
  };

  const handleDeleteExplanation = () => {
    if (explanationModal.questionId !== null) {
      setQuestions(qs => qs.map(q => 
        q.id === explanationModal.questionId
          ? { ...q, explanation: { text: '', image: null } }
          : q
      ));
    }
    setExplanationModal({ open: false, questionId: null });
    setExplanationValue('');
    setExplanationImage(null);
  };

  const handleCloseExplanation = () => {
    setExplanationModal({ open: false, questionId: null });
    setExplanationValue('');
    setExplanationImage(null);
  };

  useEffect(() => {
    if (explanationModal.open && explanationModal.questionId !== null) {
      const currentQuestion = questions.find(q => q.id === explanationModal.questionId);
      setExplanationValue(currentQuestion?.explanation?.text || '');
      setExplanationImage(currentQuestion?.explanation?.image || null);
    }
  }, [explanationModal, questions]);

  const handleOpenPreview = () => {
    localStorage.setItem('previewQuestions', JSON.stringify(questions));
    navigate('/preview');
  };

  const handleInsertSymbol = (symbol) => {
    const qid = selectedField.questionId;
    if (!activeInputRef || !activeInputRef.current) return;
    const textarea = activeInputRef.current;
    const currentValue = textarea.value;
    const pos = textarea.selectionStart ?? 0;
    const newValue = currentValue.slice(0, pos) + symbol + currentValue.slice(pos);
    setQuestions(questions => questions.map(q => {
      if (q.id !== qid) return q;
      if (selectedField.type === 'question') {
        return { ...q, question: newValue };
      } else if (selectedField.type === 'option') {
        const idx = selectedField.optionIndex;
        const newOptions = q.options.map((opt, i) => i === idx ? newValue : opt);
        return { ...q, options: newOptions };
      }
      return q;
    }));
    setTimeout(() => {
      if (activeInputRef && activeInputRef.current) {
        activeInputRef.current.focus();
        const newPos = pos + symbol.length;
        activeInputRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

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

  const sidebarCards = questions.map((q, idx) => ({
    id: q.id,
    imageSrc: q.image
      ? (typeof q.image === 'string' ? q.image : URL.createObjectURL(q.image))
      : '/image.png',
    frameSrc: '/Frame 1171275867.png',
    infoText: q.question || 'Thêm thông tin ở đây...'
  }));

  return (
    <div className="min-h-screen flex text-white">
      <CreateSidebar
        cards={sidebarCards}
        selectedIdx={selectedIdx}
        onSelect={(idx) => {
          setSelectedIdx(idx);
          setSelectedField({ questionId: questions[idx]?.id || 1, type: 'question' });
        }}
        onAddQuestion={addQuestion}
        onDelete={handleDelete}
        onCopy={handleCopy}
        onDragEnd={handleDragEnd}
      />
      <div className="flex-1 flex flex-col" style={{ paddingLeft: 300 }}>
        <CreatePageTopControls
          title={questionSetName || 'Bộ câu hỏi không có tiêu đề'}
          onTitleChange={handleTitleChange}
          onSave={handleSave}
          showPreview={true}
          onPreview={handleOpenPreview}
        />
        <div className="flex flex-col flex-1">
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
        </div>
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
  );
};

export default EditQuestionSet; 