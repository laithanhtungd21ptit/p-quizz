import axios from 'axios';

// Base URL cho API backend
const API_BASE_URL = 'http://localhost:8080'; // Thay đổi port nếu cần

// Tạo axios instance với base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header (nếu cần authentication)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding token to request:', token.substring(0, 20) + '...');
    } else {
      console.log('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi authentication (TẠM THỜI ẨN AUTO REDIRECT)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('=== LỖI AUTHENTICATION ===');
      console.log('Status:', error.response.status);
      console.log('Response data:', error.response.data);
      console.log('Response headers:', error.response.headers);
      console.log('Current token:', localStorage.getItem('token') ? 'Có token' : 'Không có token');
      
      // TẠM THỜI ẨN AUTO REDIRECT - CHỈ LOG LỖI
      // localStorage.removeItem('token');
      // if (window.location.pathname !== '/login') {
      //   window.location.href = '/login';
      // }
      
      console.log('Token đã được giữ lại để debug, không tự động redirect');
    }
    return Promise.reject(error);
  }
);

// API tạo bộ câu hỏi
export const createQuiz = async (quizData) => {
  try {
    console.log('=== GỌI API CREATE QUIZ ===');
    console.log('Endpoint:', '/api/questions');
    console.log('Method: POST');
    console.log('Data to send:', quizData);
    console.log('Current token:', localStorage.getItem('token') ? 'Có token' : 'Không có token');
    
    // Tạo FormData để gửi multipart/form-data
    const formData = new FormData();
    
    // Thêm quiz data dạng JSON string
    const quizRequest = {
      topic: quizData.topic,
      name: quizData.name,
      visibleTo: quizData.visibleTo,
      imageUrl: quizData.coverImage || '', // API cần imageUrl, không phải coverImage
      description: quizData.description || '',
      questions: quizData.questions.map(q => ({
        content: q.content,
        description: q.description,
        answerA: q.answerA,
        answerB: q.answerB,
        answerC: q.answerC,
        answerD: q.answerD,
        imageUrl: q.imageUrl || '',
        correctAnswer: q.correctAnswer,
        limitedTime: q.limitedTime,
        score: q.score
      }))
    };
    
    formData.append('quiz', new Blob([JSON.stringify(quizRequest)], { type: 'application/json' }));
    
    // Thêm ảnh bìa nếu có
    if (quizData.coverImage && quizData.coverImage.startsWith('data:')) {
      // Chuyển base64 thành File
      const base64Response = await fetch(quizData.coverImage);
      const blob = await base64Response.blob();
      const file = new File([blob], 'cover-image.png', { type: 'image/png' });
      formData.append('image', file);
    }
    
    // Thêm ảnh câu hỏi nếu có
    const questionImages = [];
    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];
      if (q.imageUrl && q.imageUrl.startsWith('data:')) {
        try {
          // Chuyển base64 thành File - sử dụng await
          const base64Response = await fetch(q.imageUrl);
          const blob = await base64Response.blob();
          const file = new File([blob], `question-${i + 1}.png`, { type: 'image/png' });
          questionImages.push(file);
          console.log(`Đã xử lý ảnh câu hỏi ${i + 1}:`, file.name, file.size);
        } catch (error) {
          console.error(`Lỗi khi xử lý ảnh câu hỏi ${i + 1}:`, error);
        }
      }
    }
    
    // Thêm tất cả ảnh câu hỏi vào FormData
    questionImages.forEach((file, index) => {
      formData.append('questionImages', file);
      console.log(`Đã thêm ảnh câu hỏi vào FormData:`, file.name);
    });
    
    console.log('FormData created:', {
      quiz: quizRequest,
      hasImage: formData.has('image'),
      questionImagesCount: questionImages.length,
      questionImagesDetails: questionImages.map(f => ({ name: f.name, size: f.size, type: f.type }))
    });
    
    // Log chi tiết FormData entries
    console.log('=== FORM DATA ENTRIES ===');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}:`, { name: value.name, size: value.size, type: value.type });
      } else {
        console.log(`${key}:`, value);
      }
    }
    
    // Gọi API với FormData
    const response = await api.post('/api/questions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('API response success:', response);
    console.log('=== API RESPONSE DETAILS ===');
    console.log('Response data:', response.data);
    console.log('Response status:', response.status);
    console.log('Response message:', response.data?.message);
    
    // Log chi tiết quiz được tạo
    if (response.data?.data) {
      console.log('Created quiz details:', response.data.data);
      console.log('Quiz ID:', response.data.data.id);
      console.log('Quiz name:', response.data.data.name);
      console.log('Quiz questions count:', response.data.data.questions?.length);
      
      // Log chi tiết câu hỏi
      if (response.data.data.questions) {
        response.data.data.questions.forEach((q, index) => {
          console.log(`Question ${index + 1}:`, {
            content: q.content,
            hasImage: !!q.imageUrl,
            imageUrl: q.imageUrl
          });
        });
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('=== LỖI API CREATE QUIZ ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Error config:', {
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers
    });
    throw error;
  }
};

// API lấy tất cả quiz của user
export const getUserQuizzes = async (page = 0, size = 10, userId = null) => {
  try {
    const params = { page, size };
    if (userId) params.userId = userId;
    const response = await api.get('/api/questions/user', { params });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy quiz của user:', error);
    throw error;
  }
};

// API lấy quiz theo ID
export const getQuizById = async (id) => {
  try {
    const response = await api.get(`/api/questions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy quiz theo ID:', error);
    throw error;
  }
};

// API tìm kiếm quiz
export const searchQuizzes = async (topic, name, page = 0, size = 10) => {
  try {
    const params = { page, size };
    if (topic) params.topic = topic;
    if (name) params.name = name;
    const response = await api.get('/api/questions/search', { params });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tìm kiếm quiz:', error);
    throw error;
  }
};

// API lấy thông tin user profile
export const getUserProfile = async () => {
  try {
    const response = await api.get('/user/profile');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin user profile:', error);
    throw error;
  }
};

// API xóa phòng
export const deleteRoom = async (roomId) => {
  try {
    const response = await api.delete(`/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa phòng:', error);
    throw error;
  }
};

// API lấy thống kê hàng ngày
export const getDailyStats = async (startDate) => {
  try {
    const response = await api.get('/statistics/daily', {
      params: { startDate: startDate.toISOString() }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy thống kê hàng ngày:', error);
    throw error;
  }
};

// API lấy top quiz creators
export const getTopQuizCreators = async () => {
  try {
    const response = await api.get('/statistics/top-quiz-creators');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy top quiz creators:', error);
    throw error;
  }
};

// API lấy danh sách favorites của user
export const getUserFavorites = async (page = 0, size = 10) => {
  try {
    const response = await api.get('/api/favorites/user', { params: { page, size } });
    // Backend trả ApiResponse<List<QuizSearchResponse>>; lấy mảng ở field data
    return response.data?.data || [];
  } catch (error) {
    console.error('Lỗi khi lấy danh sách favorites:', error);
    throw error;
  }
};

// API thêm/bỏ quiz khỏi favorites (toggle)
// API thêm vào danh sách yêu thích
export const addFavorite = async (quizId) => {
  try {
    const response = await api.post('/api/favorites/add', null, { params: { quizId } });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi thêm vào favorites:', error);
    throw error;
  }
};

// API bỏ khỏi danh sách yêu thích
export const removeFavorite = async (quizId) => {
  try {
    const response = await api.delete('/api/favorites/remove', { params: { quizId } });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa khỏi favorites:', error);
    throw error;
  }
};

// API xóa câu hỏi
export const deleteQuestion = async (questionId) => {
  try {
    const response = await api.delete(`/api/quiz/question/${questionId}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa câu hỏi:', error);
    throw error;
  }
};

// API thêm câu hỏi vào quiz (có thể thêm nhiều câu/lần) - multipart/form-data
export const addQuestions = async (questionRequests) => {
  try {
    // questionRequests: Array<{ request: QuestionRequestLike, imageDataUrl?: string | null }>
    const formData = new FormData();

    // Chuẩn hóa payload requests (chỉ phần JSON QuestionRequest)
    const requestsJson = questionRequests.map(q => q.request);
    formData.append('requests', new Blob([JSON.stringify(requestsJson)], { type: 'application/json' }));

    // Đảm bảo index ảnh trùng với index request: append file rỗng nếu không có ảnh
    for (let i = 0; i < questionRequests.length; i++) {
      const img = questionRequests[i].imageDataUrl;
      if (img && typeof img === 'string' && img.startsWith('data:')) {
        const base64Response = await fetch(img);
        const blob = await base64Response.blob();
        const file = new File([blob], `question-${i + 1}.png`, { type: blob.type || 'image/png' });
        formData.append('questionImages', file);
      } else {
        // Thêm file rỗng để giữ alignment
        const empty = new File([new Blob([])], `question-${i + 1}-empty`, { type: 'application/octet-stream' });
        formData.append('questionImages', empty);
      }
    }

    const response = await api.post('/api/quiz/question', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi thêm câu hỏi:', error);
    throw error;
  }
};

// API cập nhật câu hỏi (multipart/form-data: request + image?)
export const updateQuestion = async (questionId, questionData) => {
  try {
    const formData = new FormData();

    // Backward compatibility: accept plain JSON payload too
    let requestPayload;
    let imageDataUrl = null;
    if (questionData && questionData.request) {
      requestPayload = questionData.request;
      imageDataUrl = questionData.imageDataUrl || null;
    } else {
      // Legacy shape from EditPage.jsx
      requestPayload = {
        content: questionData.content,
        description: questionData.description,
        answerA: questionData.answerA,
        answerB: questionData.answerB,
        answerC: questionData.answerC,
        answerD: questionData.answerD,
        correctAnswer: questionData.correctAnswer,
        limitedTime: questionData.limitedTime,
        score: questionData.score,
        quizId: questionData.quizId,
        imageUrl: questionData.imageUrl || ''
      };
      if (typeof questionData.imageUrl === 'string' && questionData.imageUrl.startsWith('data:')) {
        imageDataUrl = questionData.imageUrl;
      }
    }

    // request JSON
    formData.append('request', new Blob([JSON.stringify(requestPayload)], { type: 'application/json' }));
    // optional image - prefer File if provided
    if (questionData.imageFile instanceof File) {
      formData.append('image', questionData.imageFile);
    } else if (imageDataUrl && imageDataUrl.startsWith('data:')) {
      const base64Response = await fetch(imageDataUrl);
      const blob = await base64Response.blob();
      const file = new File([blob], `question-${questionId}.png`, { type: blob.type || 'image/png' });
      formData.append('image', file);
    }
    const response = await api.put(`/api/quiz/question/${questionId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật câu hỏi:', error);
    throw error;
  }
};

// API cập nhật quiz
export const updateQuiz = async (quizId, quizData) => {
  try {
    const response = await api.put(`/api/questions/${quizId}`, quizData);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật quiz:', error);
    throw error;
  }
};

// API xóa quiz
export const deleteQuiz = async (quizId) => {
  try {
    const response = await api.delete(`/api/questions/${quizId}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa quiz:', error);
    throw error;
  }
};

// API submit answer cho câu hỏi
export const submitAnswer = async (pinCode, answerData) => {
  try {
    console.log('Gửi đáp án:', { pinCode, answerData });
    
    const response = await api.post(`/room/${pinCode}/submit-answer`, answerData);
    
    console.log('Response từ backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi submit answer:', error);
    if (error.response) {
      console.error('Response error:', error.response.data);
      console.error('Status:', error.response.status);
    }
    throw error;
  }
};

// API lấy bảng xếp hạng của phòng
export const getRoomRanking = async (roomId) => {
  try {
    console.log('Lấy bảng xếp hạng cho phòng:', roomId);
    
    const response = await api.get(`/gamerank/${roomId}/ranking`);
    
    console.log('Bảng xếp hạng từ backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy bảng xếp hạng:', error);
    if (error.response) {
      console.error('Response error:', error.response.data);
      console.error('Status:', error.response.status);
    }
    throw error;
  }
};

// API để controller lấy câu hỏi tiếp theo
export const getNextQuestion = async (pinCode, clientSessionId) => {
  try {
    console.log('Controller lấy câu hỏi tiếp theo cho pinCode:', pinCode);
    console.log('Client Session ID:', clientSessionId);
    
    // Gọi đúng endpoint với pinCode và có request body
    const response = await api.post(`/${pinCode}/next-question`, {
      clientSessionId: clientSessionId
    });
    
    console.log('Câu hỏi tiếp theo từ backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy câu hỏi tiếp theo:', error);
    if (error.response) {
      console.error('Response error:', error.response.data);
      console.error('Status:', error.response.status);
    }
    throw error;
  }
};

// API lấy danh sách participants của phòng
export const getRoomParticipants = async (roomId) => {
  try {
    console.log('Lấy danh sách participants cho phòng:', roomId);
    
    const response = await api.get(`/rooms/participants?roomId=${roomId}`);
    
    console.log('Participants từ backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy participants:', error);
    if (error.response) {
      console.error('Response error:', error.response.data);
      console.error('Status:', error.response.status);
    }
    throw error;
  }
};

// API lưu lịch sử chơi của player (không cần authentication)
export const savePlayerHistory = async (pinCode, clientSessionId) => {
  try {
    console.log('Lưu lịch sử chơi:', { pinCode, clientSessionId });
    
    // Sử dụng fetch thay vì axios để bypass interceptor
    const response = await fetch(`http://localhost:8080/api/player-answers/save/${pinCode}/${clientSessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Không gửi Authorization header
      }
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const result = await response.text(); // API trả về string
      console.log('Kết quả lưu lịch sử:', result);
      return result;
    } else {
      const errorText = await response.text();
      console.error('API error:', response.status, errorText);
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error('Lỗi khi lưu lịch sử:', error);
    throw error;
  }
};

export default api;
