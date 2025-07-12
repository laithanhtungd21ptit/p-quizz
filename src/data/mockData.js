// Mock data for the application
export const mockQuestions = [
  {
    id: 1,
    title: "JavaScript Fundamentals",
    description: "Test your knowledge of JavaScript basics including variables, functions, and DOM manipulation.",
    author: "Sarah Johnson",
    authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    questions: 25,
    time: "15 min",
    difficulty: "Beginner",
    rating: 4.8,
    isStarred: true,
    participants: 156,
    lastModified: "2 giờ trước"
  },
  {
    id: 2,
    title: "React Hooks Mastery",
    description: "Advanced React concepts focusing on hooks, state management, and performance optimization.",
    author: "Mike Chen",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    questions: 30,
    time: "20 min",
    difficulty: "Advanced",
    rating: 4.9,
    isStarred: false,
    participants: 89,
    lastModified: "1 ngày trước"
  },
  {
    id: 3,
    title: "CSS Grid & Flexbox",
    description: "Master modern CSS layout techniques with practical examples and real-world scenarios.",
    author: "Emily Davis",
    authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    questions: 20,
    time: "12 min",
    difficulty: "Intermediate",
    rating: 4.7,
    isStarred: true,
    participants: 234,
    lastModified: "3 ngày trước"
  },
  {
    id: 4,
    title: "Python Programming Basics",
    description: "Learn the fundamentals of Python programming language with practical examples.",
    author: "Sarah Johnson",
    authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    questions: 20,
    time: "12 min",
    difficulty: "Beginner",
    rating: 4.6,
    isStarred: false,
    participants: 89,
    lastModified: "5 ngày trước"
  },
  {
    id: 5,
    title: "Data Structures & Algorithms",
    description: "Master essential data structures and algorithms for technical interviews.",
    author: "Mike Chen",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    questions: 35,
    time: "25 min",
    difficulty: "Advanced",
    rating: 4.9,
    isStarred: true,
    participants: 156,
    lastModified: "1 tuần trước"
  }
];

export const mockUser = {
  id: 1,
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  role: "Premium Member",
  joinDate: "January 2023",
  bio: "Frontend Developer passionate about creating beautiful and functional user interfaces. Love working with React, TypeScript, and modern web technologies.",
  location: "Ho Chi Minh City, Vietnam"
};

export const mockStats = {
  totalQuestions: 1234,
  totalParticipants: 5678,
  completionRate: 89,
  thisWeek: 156
};

export const mockWeeklyData = [
  { day: 'T2', questions: 80, users: 60 },
  { day: 'T3', questions: 95, users: 75 },
  { day: 'T4', questions: 70, users: 65 },
  { day: 'T5', questions: 100, users: 80 },
  { day: 'T6', questions: 90, users: 70 },
  { day: 'T7', questions: 85, users: 68 },
  { day: 'CN', questions: 98, users: 85 }
];

export const mockHistory = [
  {
    id: 1,
    title: "JavaScript Fundamentals",
    author: "Sarah Johnson",
    completedAt: "2 giờ trước",
    score: 85,
    totalQuestions: 25,
    correctAnswers: 21,
    timeSpent: "12:34",
    difficulty: "Beginner",
    status: "completed"
  },
  {
    id: 2,
    title: "React Hooks Mastery",
    author: "Mike Chen",
    completedAt: "1 ngày trước",
    score: 92,
    totalQuestions: 30,
    correctAnswers: 28,
    timeSpent: "18:45",
    difficulty: "Advanced",
    status: "completed"
  },
  {
    id: 3,
    title: "CSS Grid & Flexbox",
    author: "Emily Davis",
    completedAt: "3 ngày trước",
    score: 78,
    totalQuestions: 20,
    correctAnswers: 16,
    timeSpent: "10:22",
    difficulty: "Intermediate",
    status: "completed"
  }
];

export const mockAchievements = [
  { title: 'Quiz Master', description: 'Hoàn thành 50 bài quiz', date: '2 ngày trước' },
  { title: 'Perfect Score', description: 'Đạt điểm tuyệt đối 3 lần', date: '1 tuần trước' },
  { title: 'Creator', description: 'Tạo 10 bộ câu hỏi', date: '2 tuần trước' }
]; 