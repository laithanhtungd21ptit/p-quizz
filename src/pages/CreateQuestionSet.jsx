import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus, Trash2, Settings } from 'lucide-react'
import CreatePageTopControls from '../components/CreatePageTopControls'
import CreateSidebar from '../components/CreateSidebar'
import FormatToolbar from '../components/FormatToolbar';
import QuestionEditor from '../components/QuestionEditor';
import ExplanationModal from '../components/ExplanationModal';
import indexedDBService from '../services/IndexedDBService';
import { createQuiz } from '../services/api';

const defaultFormat = { bold: false, italic: false, underline: false, align: 'left' };

const CreateQuestionSet = () => {
  const navigate = useNavigate();
  const [questionSetName, setQuestionSetName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')
  // Thêm state cho topic và visibility
  const [topic, setTopic] = useState('')
  const [visibleTo, setVisibleTo] = useState(true) // true = công khai, false = riêng tư
  const [imageUrl, setImageUrl] = useState('') // URL hình ảnh bìa
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
      explanation: { text: '', image: null }, // Thêm explanation cho từng câu hỏi
    }
  ])
  // selectedField: { questionId, type: 'question' | 'option', optionIndex? }
  const [selectedField, setSelectedField] = useState({ questionId: 1, type: 'question' })
  const [explanationModal, setExplanationModal] = useState({ open: false, questionId: null });
  const [isInitialized, setIsInitialized] = useState(false); // Thêm state để theo dõi đã khởi tạo chưa
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showBackConfirmModal, setShowBackConfirmModal] = useState(false); // State cho popup confirm back
  const [isSaving, setIsSaving] = useState(false); // State cho loading khi lưu

  // Hàm tự động lưu vào IndexedDB
  const autoSaveToIndexedDB = async () => {
    // Hàm chuyển đổi File thành base64
    const convertImageToBase64 = async (image) => {
      if (!image) return ''
      if (typeof image === 'string') return image // Nếu đã là string (base64 hoặc URL)
      
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(image)
      })
    }

    // Hàm xử lý tất cả ảnh trong questions
    const processQuestionsImages = async () => {
      const processedQuestions = await Promise.all(
        questions.map(async (q) => ({
          content: q.question,
          description: q.explanation?.text || '',
          answerA: q.options[0] || '',
          answerB: q.options[1] || '',
          answerC: q.options[2] || '',
          answerD: q.options[3] || '',
          imageUrl: await convertImageToBase64(q.image),
          correctAnswer: ['A', 'B', 'C', 'D'][q.correctAnswer] || 'A',
          limitedTime: q.time,
          score: q.score
        }))
      )

      const questionSetData = {
        topic: topic || 'Khác',
        name: questionSetName || 'Bộ câu hỏi không có tiêu đề',
        description: description || '',
        visibleTo: visibleTo,
        imageUrl: imageUrl,
        questions: processedQuestions
      }

      try {
        await indexedDBService.saveQuestionSetData(questionSetData);
        console.log('Auto-saved to IndexedDB:', questionSetData);
      } catch (error) {
        console.error('Lỗi khi lưu vào IndexedDB:', error);
      }
    }

    // Xử lý và lưu dữ liệu
    processQuestionsImages()
  }

  // Khôi phục dữ liệu từ IndexedDB khi component mount
  useEffect(() => {
    console.log('Component mounting, checking IndexedDB...')
    
    const loadDataFromIndexedDB = async () => {
      try {
        // Xóa dữ liệu preview khi quay về từ trang preview
        await indexedDBService.deletePreviewQuestions();
        console.log('Đã xóa previewQuestions khi quay về trang tạo câu hỏi');
        
        const savedData = await indexedDBService.getQuestionSetData();
        if (savedData) {
          console.log('Restoring data from IndexedDB:', savedData)
          
          // Khôi phục các trường cơ bản
          if (savedData.name) setQuestionSetName(savedData.name)
          if (savedData.description) setDescription(savedData.description)
          if (savedData.topic) setTopic(savedData.topic)
          if (savedData.visibleTo !== undefined) setVisibleTo(savedData.visibleTo)
          if (savedData.imageUrl) setImageUrl(savedData.imageUrl)
          
          // Khôi phục câu hỏi nếu có
          if (savedData.questions && savedData.questions.length > 0) {
            const restoredQuestions = savedData.questions.map((q, index) => {
              console.log('CreateQuestionSet: Restoring question image:', q.imageUrl);
              console.log('CreateQuestionSet: Image type:', typeof q.imageUrl);
              if (typeof q.imageUrl === 'string') {
                console.log('CreateQuestionSet: Image preview:', q.imageUrl.substring(0, 50) + '...');
              }
              
              return {
                id: index + 1,
                question: q.content || '',
                options: [q.answerA || '', q.answerB || '', q.answerC || '', q.answerD || ''],
                correctAnswer: ['A', 'B', 'C', 'D'].indexOf(q.correctAnswer) >= 0 ? ['A', 'B', 'C', 'D'].indexOf(q.correctAnswer) : 0,
                image: q.imageUrl || null, // Khôi phục ảnh từ base64 string
                time: q.limitedTime || 10,
                score: q.score || 10,
                questionFormat: { ...defaultFormat },
                optionFormats: [
                  { ...defaultFormat },
                  { ...defaultFormat },
                  { ...defaultFormat },
                  { ...defaultFormat },
                ],
                explanation: { text: q.description || '', image: null }
              };
            });
            setQuestions(restoredQuestions)
            console.log('Restored questions:', restoredQuestions)
          }
        } else {
          console.log('No saved data found, creating default question')
          // Nếu không có dữ liệu đã lưu, tạo câu hỏi mặc định
          setQuestions([{
            id: 1,
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            image: null, // Không có ảnh cho câu hỏi mặc định
            time: 10,
            score: 10,
            questionFormat: { ...defaultFormat },
            optionFormats: [
              { ...defaultFormat },
              { ...defaultFormat },
              { ...defaultFormat },
              { ...defaultFormat },
            ],
            explanation: { text: '', image: null }
          }])
        }
      } catch (error) {
        console.error('Error loading data from IndexedDB:', error)
        // Nếu có lỗi, tạo câu hỏi mặc định
        setQuestions([{
          id: 1,
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          image: null, // Không có ảnh cho câu hỏi mặc định
          time: 10,
          score: 10,
          questionFormat: { ...defaultFormat },
          optionFormats: [
            { ...defaultFormat },
            { ...defaultFormat },
            { ...defaultFormat },
            { ...defaultFormat },
          ],
          explanation: { text: '', image: null }
        }])
      }
      
      // Đánh dấu đã khởi tạo xong
      setIsInitialized(true)
      console.log('Component initialization completed')
    }

    // Gọi hàm async
    loadDataFromIndexedDB()
  }, []) // Chỉ chạy 1 lần khi component mount

  // Đảm bảo luôn có ít nhất 1 câu hỏi
  useEffect(() => {
    if (isInitialized && questions.length === 0) {
      console.log('No questions found, creating default question')
      setQuestions([{
        id: 1,
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        image: null, // Không có ảnh cho câu hỏi mặc định
        time: 10,
        score: 10,
        questionFormat: { ...defaultFormat },
        optionFormats: [
          { ...defaultFormat },
          { ...defaultFormat },
          { ...defaultFormat },
          { ...defaultFormat },
        ],
        explanation: { text: '', image: null }
      }])
    }
  }, [isInitialized, questions.length])

  // Tự động lưu mỗi khi có thay đổi (sau khi đã khôi phục dữ liệu)
  useEffect(() => {
    // Chỉ auto-save khi component đã mount và có dữ liệu
    if (isInitialized && (questionSetName || description || topic || questions.length > 0)) {
      console.log('Auto-saving to IndexedDB...')
      autoSaveToIndexedDB()
    }
  }, [isInitialized, questionSetName, description, topic, visibleTo, imageUrl, questions])

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
      explanation: { text: '', image: null }, // Thêm explanation cho câu hỏi mới
    }
    setQuestions(prev => [...prev, newQuestion])
  }

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter(q => q.id !== id))
    }
  }

  const updateQuestion = (id, field, value) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ))
  }

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) }
        : q
    ))
  }

  // Cập nhật định dạng cho ô đang chọn
  const updateFormat = (formatUpdate) => {
    setQuestions(prev => prev.map(q => {
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
    setQuestions(prev => prev.map((q, idx) => 
      idx === selectedIdx ? { ...q, time: newTime } : q
    ))
  }

  // Cập nhật điểm số cho câu hỏi hiện tại
  const updateScore = (newScore) => {
    setQuestions(prev => prev.map((q, idx) => 
      idx === selectedIdx ? { ...q, score: newScore } : q
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

  // Cập nhật topic từ settings
  const handleTopicChange = (newTopic) => {
    setTopic(newTopic)
  }

  // Cập nhật visibility từ settings
  const handleVisibilityChange = (isPublic) => {
    setVisibleTo(isPublic)
  }

  // Cập nhật image URL từ settings
  const handleImageUrlChange = (url) => {
    setImageUrl(url)
  }

  // Cập nhật description từ settings
  const handleDescriptionChange = (newDescription) => {
    setDescription(newDescription)
  }

  const handleSave = async () => {
    try {
      // Bắt đầu loading
      setIsSaving(true);

      // Validation dữ liệu trước khi gửi
      if (!questionSetName || questionSetName.trim() === '') {
        alert('Vui lòng nhập tên bộ câu hỏi!');
        setIsSaving(false);
        return;
      }

      if (!topic || topic.trim() === '') {
        alert('Vui lòng chọn chủ đề cho bộ câu hỏi!');
        setIsSaving(false);
        return;
      }

      if (questions.length === 0) {
        alert('Vui lòng thêm ít nhất một câu hỏi!');
        setIsSaving(false);
        return;
      }

      // Kiểm tra từng câu hỏi
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.question || q.question.trim() === '') {
          alert(`Vui lòng nhập nội dung câu hỏi số ${i + 1}!`);
          setIsSaving(false);
          return;
        }
        
        if (!q.options[0] || !q.options[1] || !q.options[2] || !q.options[3]) {
          alert(`Vui lòng nhập đầy đủ 4 đáp án cho câu hỏi số ${i + 1}!`);
          setIsSaving(false);
          return;
        }
      }

      // Hàm chuyển đổi File thành base64
      const convertImageToBase64 = async (image) => {
        if (!image) return ''
        if (typeof image === 'string') return image // Nếu đã là string (base64 hoặc URL)
        
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(image)
        })
      }

      // Xử lý tất cả ảnh trong questions
      const processedQuestions = await Promise.all(
        questions.map(async (q) => ({
          content: q.question,
          description: q.explanation?.text || '',
          answerA: q.options[0] || '',
          answerB: q.options[1] || '',
          answerC: q.options[2] || '',
          answerD: q.options[3] || '',
          imageUrl: await convertImageToBase64(q.image),
          correctAnswer: ['A', 'B', 'C', 'D'][q.correctAnswer] || 'A',
          limitedTime: q.time,
          score: q.score
        }))
      );

      // Chuẩn bị dữ liệu để gửi lên API
      const quizData = {
        topic: topic || 'Khác',
        name: questionSetName || 'Bộ câu hỏi không có tiêu đề',
        visibleTo: visibleTo,
        imageUrl: imageUrl || '',
        questions: processedQuestions
      };

      console.log('Sending quiz data to API:', quizData);

      // Gọi API tạo bộ câu hỏi
      const response = await createQuiz(quizData);
      console.log('Quiz created successfully:', response);

      // Xóa dữ liệu IndexedDB
      await indexedDBService.deleteQuestionSetData();
      await indexedDBService.deletePreviewQuestions();
      console.log('Đã xóa dữ liệu IndexedDB sau khi lưu thành công');

      // Hiển thị thông báo thành công
      alert('Đã lưu bộ câu hỏi vào database thành công!');

      // Chuyển đến trang chủ
      navigate('/');

    } catch (error) {
      console.error('Lỗi khi lưu quiz:', error);
      
      // Hiển thị thông báo lỗi chi tiết hơn
      let errorMessage = 'Có lỗi xảy ra khi lưu bộ câu hỏi. Vui lòng thử lại!';
      
      if (error.response) {
        // Lỗi từ server
        if (error.response.status === 401 || error.response.status === 403) {
          // Lỗi authentication sẽ được xử lý bởi response interceptor
          // Không cần hiển thị alert vì sẽ tự động chuyển đến trang login
          console.log('Authentication error handled by interceptor');
          return;
        } else if (error.response.status === 400) {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin!';
        } else if (error.response.status >= 500) {
          errorMessage = 'Lỗi server. Vui lòng thử lại sau!';
        }
      } else if (error.request) {
        // Lỗi kết nối
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!';
      }
      
      // Chỉ hiển thị alert cho các lỗi không phải authentication
      if (errorMessage !== 'Có lỗi xảy ra khi lưu bộ câu hỏi. Vui lòng thử lại!') {
        alert(errorMessage);
      }
    } finally {
      // Kết thúc loading
      setIsSaving(false);
    }
  }

  // Hiển thị popup confirm khi back về dashboard
  const handleBackToDashboard = () => {
    setShowBackConfirmModal(true);
  }

           // Xác nhận back về dashboard và xóa dữ liệu
         const confirmBackToDashboard = async () => {
           try {
             // Xóa tất cả dữ liệu liên quan đến CreateQuestionSet
             await indexedDBService.deleteQuestionSetData();
             await indexedDBService.deletePreviewQuestions();
             console.log('Đã xóa dữ liệu IndexedDB khi back về dashboard');
           } catch (error) {
             console.error('Lỗi khi xóa dữ liệu IndexedDB:', error);
           }
           
           // Đóng popup
           setShowBackConfirmModal(false);
           
           // Chuyển về trang dashboard
           navigate('/dashboard');
         }

  // Hủy bỏ back về dashboard
  const cancelBackToDashboard = () => {
    setShowBackConfirmModal(false);
  }

  // Hiện tại chỉ làm việc với câu hỏi đầu tiên (id=1)
  const currentQuestion = questions[0];

  // Mở modal giải thích cho câu hỏi hiện tại
  const handleAddExplanation = () => {
    setExplanationModal({ open: true, questionId: questions[selectedIdx]?.id });
  };

  // Lưu giải thích
  const handleSaveExplanation = () => {
    if (explanationModal.questionId !== null) {
      setQuestions(prev => prev.map(q => 
        q.id === explanationModal.questionId
          ? { ...q, explanation: { text: explanationValue, image: explanationImage } }
          : q
      ));
    }
    setExplanationModal({ open: false, questionId: null });
    setExplanationValue('');
    setExplanationImage(null);
  };

  // Xóa giải thích
  const handleDeleteExplanation = () => {
    if (explanationModal.questionId !== null) {
      setQuestions(prev => prev.map(q => 
        q.id === explanationModal.questionId
          ? { ...q, explanation: { text: '', image: null } }
          : q
      ));
    }
    setExplanationModal({ open: false, questionId: null });
    setExplanationValue('');
    setExplanationImage(null);
  };

  // Đóng modal
  const handleCloseExplanation = () => {
    setExplanationModal({ open: false, questionId: null });
    setExplanationValue('');
    setExplanationImage(null);
  };

  // State tạm cho modal
  const [explanationValue, setExplanationValue] = useState('');
  const [explanationImage, setExplanationImage] = useState(null);

  // Khi mở modal, nạp dữ liệu cũ nếu có
  React.useEffect(() => {
    if (explanationModal.open && explanationModal.questionId !== null) {
      const currentQuestion = questions.find(q => q.id === explanationModal.questionId);
      setExplanationValue(currentQuestion?.explanation?.text || '');
      setExplanationImage(currentQuestion?.explanation?.image || null);
    }
  }, [explanationModal, questions]);

  // State caret để lưu vị trí con trỏ
  const [caret, setCaret] = useState({ type: null, questionId: null, optionIndex: null, pos: 0 });
  const [activeInputRef, setActiveInputRef] = useState(null);

  // Mở trang preview mới
  const handleOpenPreview = async () => {
    // Lưu dữ liệu vào IndexedDB trước khi chuyển trang
    const previewData = {
      topic: topic || 'Khác',
      name: questionSetName || 'Bộ câu hỏi không có tiêu đề',
      description: description || '',
      visibleTo: visibleTo,
      imageUrl: imageUrl,
      questions: await Promise.all(questions.map(async (q) => {
        // Xử lý ảnh: nếu là File thì chuyển thành base64, nếu là string thì giữ nguyên
        let processedImage = q.image;
        if (q.image instanceof File) {
          processedImage = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(q.image);
          });
        }
        
        return {
          content: q.question,
          description: q.explanation?.text || '',
          answerA: q.options[0] || '',
          answerB: q.options[1] || '',
          answerC: q.options[2] || '',
          answerD: q.options[3] || '',
          imageUrl: processedImage, // Ảnh đã được xử lý
          correctAnswer: ['A', 'B', 'C', 'D'][q.correctAnswer] || 'A',
          limitedTime: q.time,
          score: q.score
        };
      }))
    };
    
    // Lưu vào IndexedDB với key 'previewQuestions' để PreviewPage có thể đọc
    try {
      await indexedDBService.savePreviewQuestions(previewData.questions);
    } catch (error) {
      console.error('Lỗi khi lưu previewQuestions vào IndexedDB:', error);
    }
    
    // Chuyển đến trang preview
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
    
    setQuestions(prev => prev.map(q => {
      if (q.id !== qid) return q;
      
      // Xác định ô nào đang focus dựa trên selectedField
      if (selectedField.type === 'question') {
        return { ...q, question: newValue };
      } else if (selectedField.type === 'option') {
        const idx = selectedField.optionIndex;
        return {
          ...q,
          options: q.options.map((opt, i) => i === idx ? newValue : opt)
        };
      }
      return q;
    }))
  }

  const handleDelete = (idx) => {
    removeQuestion(questions[idx]?.id)
    if (selectedIdx === idx) {
      setSelectedIdx(Math.max(0, idx - 1))
    } else if (selectedIdx > idx) {
      setSelectedIdx(selectedIdx - 1)
    }
  }

  const handleCopy = (idx) => {
    const questionToCopy = questions[idx]
    const newQuestion = {
      ...questionToCopy,
      id: questions.length + 1,
      question: questionToCopy.question, // Bỏ chữ "(Bản sao)"
      image: questionToCopy.image // Sao chép ảnh (có thể là base64 string hoặc File object)
    }
    setQuestions(prev => [...prev, newQuestion])
    setSelectedIdx(questions.length)
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    setQuestions(prev => {
      const arr = Array.from(prev);
      const [removed] = arr.splice(result.source.index, 1);
      arr.splice(result.destination.index, 0, removed);
      return arr;
    });
    setSelectedIdx(result.destination.index);
  }

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
    <div className="min-h-screen flex text-white">
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
      {/* Main content bên phải - bắt đầu từ sau sidebar */}
      <div className="flex-1 ml-[300px] flex flex-col">
        <CreatePageTopControls 
          title={questionSetName || "Bộ câu hỏi không có tiêu đề"}
          onTitleChange={handleTitleChange}
          onSave={handleSave}
          showPreview={true}
          onPreview={handleOpenPreview}
          onTopicChange={handleTopicChange}
          onVisibilityChange={handleVisibilityChange}
          onDescriptionChange={handleDescriptionChange}
          onImageUrlChange={handleImageUrlChange}
          onBack={handleBackToDashboard}
          initialTopic={topic}
          initialVisibility={visibleTo}
          isSaving={isSaving}
        />
        
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
              image={(() => {
                const image = questions[selectedIdx]?.image || null;
                console.log('CreateQuestionSet: Passing image to QuestionEditor:', image);
                console.log('CreateQuestionSet: Image type:', typeof image);
                console.log('CreateQuestionSet: Image instanceof File:', image instanceof File);
                console.log('CreateQuestionSet: Image instanceof Blob:', image instanceof Blob);
                if (typeof image === 'string') {
                  console.log('CreateQuestionSet: Image string preview:', image.substring(0, 50) + '...');
                }
                return image;
              })()}
              onChange={({ question, options, correctAnswer, image }) => {
                setQuestions(prev => prev.map((q, i) => 
                  i === selectedIdx ? { ...q, question, options, correctAnswer, image } : q
                ));
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

        {/* Popup confirm back về dashboard */}
        {showBackConfirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Xác nhận quay lại</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn quay lại dashboard? Tất cả dữ liệu bộ câu hỏi sẽ bị mất và không thể khôi phục.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={cancelBackToDashboard}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={confirmBackToDashboard}
                  className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors duration-200"
                >
                  Quay lại Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateQuestionSet 