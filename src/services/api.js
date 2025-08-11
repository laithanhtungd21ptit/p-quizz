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

// Response interceptor để xử lý lỗi authentication
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Authentication error, clearing token and redirecting to login');
      localStorage.removeItem('token');
      
      // Chuyển đến trang login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API tạo bộ câu hỏi
export const createQuiz = async (quizData) => {
  try {
    const response = await api.post('/api/questions', quizData);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tạo quiz:', error);
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
export const getUserFavorites = async () => {
  try {
    const response = await api.get('/api/favorites/user');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách favorites:', error);
    throw error;
  }
};

// API thêm/bỏ quiz khỏi favorites (toggle)
export const toggleFavorite = async (quizId) => {
  try {
    const response = await api.post('/api/favorites/toggle', null, {
      params: { quizId }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi toggle favorite:', error);
    throw error;
  }
};

export default api;
