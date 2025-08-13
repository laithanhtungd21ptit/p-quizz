import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { addQuestions, updateQuestion as apiUpdateQuestion, deleteQuestion as apiDeleteQuestion } from '../services/api';
import EditPageTopControls from '../components/EditPageTopControls';
import CreateSidebar from '../components/CreateSidebar';
import FormatToolbar from '../components/FormatToolbar';
import QuestionEditor from '../components/QuestionEditor';
import ExplanationModal from '../components/ExplanationModal';
import indexedDBService from '../services/IndexedDBService';

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
  const [coverImage, setCoverImage] = useState(initialData.coverImage || '');
  const [visibleTo, setVisibleTo] = useState(initialData.visibleTo || false);
  const [quizId, setQuizId] = useState(initialData.quizId || null);
  const [questions, setQuestions] = useState(initialData.questions);
  const [selectedField, setSelectedField] = useState({ questionId: questions[initialIdx]?.id || 1, type: 'question' });
  const [explanationModal, setExplanationModal] = useState({ open: false, questionId: null });
  const [selectedIdx, setSelectedIdx] = useState(initialIdx);
  const [explanationValue, setExplanationValue] = useState('');
  const [explanationImage, setExplanationImage] = useState(null);
  const [caret, setCaret] = useState({ type: null, questionId: null, optionIndex: null, pos: 0 });
  const [activeInputRef, setActiveInputRef] = useState(null);

  // Chuẩn hoá dữ liệu câu hỏi để đảm bảo có description và imageUrl
  useEffect(() => {
    setQuestions(qs => (qs || []).map(q => ({
      ...q,
      description: q?.description ?? (q?.explanation?.text || ''),
      imageUrl: q?.imageUrl ?? (q?.image || null)
    })));
  }, []);

  // Chuẩn hoá ảnh bìa để đảm bảo hiển thị (thêm prefix nếu backend trả base64 thuần)
  useEffect(() => {
    const img = initialData?.coverImage;
    if (!img) return;
    if (img instanceof File) return; // để nguyên File
    if (typeof img === 'string') {
      if (img.startsWith('data:') || img.startsWith('http://') || img.startsWith('https://')) {
        setCoverImage(img);
      } else {
        setCoverImage(`data:image/png;base64,${img}`);
      }
    }
  }, [initialData]);

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

  const handleTopicChange = (newTopic) => {
    setCategory(newTopic);
  };

  const handleVisibilityChange = (newVisibility) => {
    setVisibleTo(newVisibility);
  };

  const handleImageUrlChange = (newImage) => {
    setCoverImage(newImage);
  };

  const handleSave = () => {
    // Lưu tất cả câu hỏi trong bộ (tạo mới, cập nhật, xóa)
    if (!questions || questions.length === 0) return;
    
    console.log('=== LƯU TẤT CẢ CÂU HỎI ===');
    console.log('Total questions:', questions.length);
    
    (async () => {
      try {
        // Phân loại câu hỏi
        const questionsToCreate = [];
        const questionsToUpdate = [];
        const questionsToDelete = [];
        
        // Lấy danh sách câu hỏi hiện tại từ backend để so sánh
        const originalQuestions = initialData.questions || [];
        const originalIds = new Set(originalQuestions.map(q => q.id).filter(id => Number.isInteger(id) && id > 0));
        
        // Phân loại câu hỏi hiện tại theo thứ tự hiển thị
        // Sử dụng for...of để xử lý async
        for (const [displayIndex, q] of questions.entries()) {
          const request = {
            content: q.question || '',
            description: q.description || '',
            answerA: q.options?.[0] || '',
            answerB: q.options?.[1] || '',
            answerC: q.options?.[2] || '',
            answerD: q.options?.[3] || '',
            correctAnswer: ['A','B','C','D'][q.correctAnswer || 0],
            limitedTime: parseInt(q.time) || 10,
            score: parseInt(q.score) || 10,
            quizId: quizId,
            imageUrl: typeof q.image === 'string' && !q.image?.startsWith('data:') ? q.image : ''
          };
          
          console.log(`Question ${displayIndex} - Request data:`, {
            content: request.content,
            description: request.description,
            hasDescription: !!request.description,
            descriptionLength: request.description?.length || 0
          });
          
          // Xử lý ảnh - chuyển File object thành base64 nếu cần
          let imageDataUrl = null;
          let imageFile = null;
          
          if (typeof q.image === 'string' && q.image.startsWith('data:')) {
            // Đã là base64
            imageDataUrl = q.image;
            console.log(`Question ${displayIndex}: Using existing base64 from q.image`);
          } else if (q.image instanceof File) {
            // File object - cần chuyển thành base64
            console.log(`Question ${displayIndex}: Converting File to base64...`);
            // Sử dụng Promise để xử lý FileReader async
            await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                imageDataUrl = e.target.result;
                console.log(`Question ${displayIndex}: File converted to base64, length:`, imageDataUrl.length);
                resolve();
              };
              reader.readAsDataURL(q.image);
            });
          } else if (typeof q.imageUrl === 'string' && q.imageUrl.startsWith('data:')) {
            // Fallback về base64 từ q.imageUrl
            imageDataUrl = q.imageUrl;
            console.log(`Question ${displayIndex}: Using base64 from q.imageUrl`);
          } else {
            console.log(`Question ${displayIndex}: No valid image found`);
          }
          
          console.log(`Question ${displayIndex} - Final imageDataUrl:`, imageDataUrl ? '[HAS_IMAGE]' : null);
          
          const questionData = { 
            request, 
            imageDataUrl, 
            imageFile,
            displayIndex // Lưu thứ tự hiển thị
          };
          
          // Kiểm tra ID hợp lệ: chỉ số nguyên dương từ backend
          if (q.id && Number.isInteger(q.id) && q.id > 0) {
            // Câu hỏi đã có trong DB
            questionsToUpdate.push({ id: q.id, ...questionData });
          } else if (q.id && typeof q.id === 'string' && q.id.startsWith('temp_')) {
            // Câu hỏi mới (có ID tạm)
            questionsToCreate.push(questionData);
          } else {
            // Câu hỏi mới (không có ID)
            questionsToCreate.push(questionData);
          }
        }
        
        // Tìm câu hỏi cần xóa (có trong DB nhưng không có trong questions hiện tại)
        originalIds.forEach(id => {
          if (!questions.find(q => q.id === id)) {
            questionsToDelete.push(id);
          }
        });
        
        console.log('Questions to create:', questionsToCreate.length);
        console.log('Questions to update:', questionsToUpdate.length);
        console.log('Questions to delete:', questionsToDelete.length);
        
        // Thực hiện các thao tác
        
        // 1. Xóa câu hỏi
        for (const questionId of questionsToDelete) {
          console.log('Deleting question:', questionId);
          await apiDeleteQuestion(questionId);
        }
        
        // 2. Tạo câu hỏi mới
        let createdQuestions = [];
        if (questionsToCreate.length > 0) {
          console.log('Creating new questions:', questionsToCreate.length);
          createdQuestions = await addQuestions(questionsToCreate);
          console.log('Created questions:', createdQuestions);
        }
        
        // 3. Cập nhật câu hỏi
        for (const questionData of questionsToUpdate) {
          console.log('Updating question:', questionData.id);
          await apiUpdateQuestion(questionData.id, questionData);
        }
        
        // Cập nhật local state với ID mới từ backend, GIỮ NGUYÊN THỨ TỰ HIỂN THỊ
        if (createdQuestions.length > 0) {
          setQuestions(prev => {
            const updated = [...prev];
            let createdIndex = 0;
            
            // Chỉ cập nhật ID, không thay đổi thứ tự
            updated.forEach((q, idx) => {
              if (!q.id || !Number.isInteger(q.id) || q.id <= 0 || (typeof q.id === 'string' && q.id.startsWith('temp_'))) {
                if (createdQuestions[createdIndex]) {
                  // Cập nhật ID nhưng giữ nguyên vị trí trong mảng
                  updated[idx] = { ...q, id: createdQuestions[createdIndex].id };
                  createdIndex++;
                }
              }
            });
            
            console.log('Updated questions with new IDs, maintaining display order:', updated);
            return updated;
          });
        }
        
        alert(`Đã lưu thành công!\n- Tạo mới: ${questionsToCreate.length} câu hỏi\n- Cập nhật: ${questionsToUpdate.length} câu hỏi\n- Xóa: ${questionsToDelete.length} câu hỏi\n\nThứ tự hiển thị đã được giữ nguyên!`);
        
      } catch (e) {
        console.error('Lưu bộ câu hỏi thất bại:', e);
        alert(`Có lỗi khi lưu bộ câu hỏi: ${e.response?.data?.message || e.message}`);
      }
    })();
  };

  const handleAddExplanation = () => {
    setExplanationModal({ open: true, questionId: questions[selectedIdx]?.id });
  };

  const handleSaveExplanation = () => {
    if (explanationModal.questionId !== null) {
      console.log('Saving explanation for question:', explanationModal.questionId);
      console.log('New explanation value:', explanationValue);
      console.log('New explanation image:', explanationImage);
      const current = questions.find(q => q.id === explanationModal.questionId) || null;
      if (!current) {
        setExplanationModal({ open: false, questionId: null });
        setExplanationValue('');
        setExplanationImage(null);
        return;
      }
      
      // Kiểm tra ID hợp lệ
      const hasValidId = current.id && Number.isInteger(current.id) && current.id > 0;
      
      const updatedLocal = { ...current, description: explanationValue, imageUrl: explanationImage };
      const request = {
        content: updatedLocal.question || '',
        description: updatedLocal.description || '',
        answerA: updatedLocal.options?.[0] || '',
        answerB: updatedLocal.options?.[1] || '',
        answerC: updatedLocal.options?.[2] || '',
        answerD: updatedLocal.options?.[3] || '',
        correctAnswer: ['A','B','C','D'][updatedLocal.correctAnswer || 0],
        limitedTime: parseInt(updatedLocal.time) || 10,
        score: parseInt(updatedLocal.score) || 10,
        quizId: quizId,
        imageUrl: typeof updatedLocal.image === 'string' && !updatedLocal.image?.startsWith('data:') ? updatedLocal.image : ''
      };
      const imageDataUrl = (typeof updatedLocal.imageUrl === 'string' && updatedLocal.imageUrl.startsWith('data:')) ? updatedLocal.imageUrl : null;
      
      console.log('Saving explanation:', {
        questionId: current.id,
        hasValidId,
        request,
        imageDataUrl: imageDataUrl ? '[HAS_IMAGE]' : null
      });
      
      // Cập nhật local state (không gọi API)
      setQuestions(qs => qs.map(q => q === current ? updatedLocal : q));
      console.log('Explanation saved to local state (no API call)');
      
      // Đóng modal
      setExplanationModal({ open: false, questionId: null });
      setExplanationValue('');
      setExplanationImage(null);
    } else {
      setExplanationModal({ open: false, questionId: null });
      setExplanationValue('');
      setExplanationImage(null);
    }
  };

  const handleDeleteExplanation = () => {
    if (explanationModal.questionId !== null) {
      console.log('Deleting explanation for question:', explanationModal.questionId);
      
      setQuestions(qs => qs.map(q => 
        q.id === explanationModal.questionId
          ? { 
              ...q, 
              description: '',        // Xóa description
              imageUrl: null          // Xóa imageUrl
            }
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
      console.log('Loading explanation for question:', currentQuestion);
      console.log('Question description:', currentQuestion?.description);
      console.log('Question imageUrl:', currentQuestion?.imageUrl);
      
      // Sử dụng description thay vì explanation.text
      setExplanationValue(currentQuestion?.description || '');
      // Sử dụng imageUrl thay vì explanation.image
      setExplanationImage(currentQuestion?.imageUrl || null);
    }
  }, [explanationModal, questions]);

  const handleOpenPreview = async () => {
    try {
      await indexedDBService.savePreviewQuestions(questions);
    } catch (error) {
      console.error('Lỗi khi lưu previewQuestions vào IndexedDB:', error);
    }
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
    const target = questions[idx];
    
    // Kiểm tra ID hợp lệ
    const hasValidId = target?.id && Number.isInteger(target.id) && target.id > 0;
    
    console.log('Deleting question:', {
      questionId: target?.id,
      hasValidId,
      questionContent: target?.question
    });
    
    (async () => {
      try {
        if (hasValidId) {
          // Xóa câu hỏi đã có trong database
          console.log('Deleting existing question with ID:', target.id);
          await apiDeleteQuestion(target.id);
        } else {
          // Câu hỏi chưa có trong database, chỉ xóa khỏi local
          console.log('Question not in database, removing from local state only');
        }
        
        setQuestions(qs => qs.filter((_, i) => i !== idx));
        if (selectedIdx >= questions.length - 1) setSelectedIdx(Math.max(0, questions.length - 2));
        alert('Đã xóa câu hỏi');
      } catch (e) {
        console.error('Xóa câu hỏi thất bại:', e);
        alert(`Có lỗi khi xóa câu hỏi: ${e.response?.data?.message || e.message}`);
      }
    })();
  };

  const handleCopy = (idx) => {
    setQuestions(qs => {
      // Tạo ID tạm thời để phân biệt, không phải ID thực từ backend
      const tempId = `temp_${Date.now()}_${Math.random()}`;
      const originalQ = qs[idx];
      const newQ = { ...originalQ, id: tempId };
      
      console.log('=== COPYING QUESTION ===');
      console.log('Original question ID:', originalQ.id);
      console.log('Original question description:', originalQ.description);
      console.log('Original question has description:', !!originalQ.description);
      console.log('Copied question ID:', newQ.id);
      console.log('Copied question description:', newQ.description);
      console.log('Copied question has description:', !!newQ.description);
      
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
                    <EditPageTopControls
              title={questionSetName || 'Bộ câu hỏi không có tiêu đề'}
              onTitleChange={handleTitleChange}
              onSave={handleSave}
              showPreview={true}
              onPreview={handleOpenPreview}
              onTopicChange={handleTopicChange}
              onVisibilityChange={handleVisibilityChange}
              onImageUrlChange={handleImageUrlChange}
              initialTopic={category}
              initialVisibility={visibleTo}
              initialImageUrl={coverImage}
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
                  console.log('QuestionEditor onChange:', { question, options, correctAnswer, image, imageType: typeof image });
                  console.log('Current question description:', questions[selectedIdx]?.description);
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