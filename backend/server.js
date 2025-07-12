const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock data
const mockQuestions = [
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
    lastModified: "15 min",
    savedAt: "2 ngày trước",
    lastPlayed: "1 tuần trước"
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
    lastModified: "1 ngày trước",
    savedAt: "1 ngày trước",
    lastPlayed: "2 ngày trước"
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
    lastModified: "3 ngày trước",
    savedAt: "3 ngày trước",
    lastPlayed: "1 tuần trước"
  }
];

const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    role: "Premium Member",
    joinDate: "January 2023"
  }
];

const mockStats = {
  totalQuestions: 1234,
  totalParticipants: 5678,
  completionRate: 89,
  thisWeek: 156
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'P-Quiz API is running' });
});

// Questions API
app.get('/api/questions', (req, res) => {
  res.json(mockQuestions);
});

app.get('/api/questions/:id', (req, res) => {
  const question = mockQuestions.find(q => q.id === parseInt(req.params.id));
  if (!question) {
    return res.status(404).json({ message: 'Question not found' });
  }
  res.json(question);
});

// User API
app.get('/api/user/profile', (req, res) => {
  res.json(mockUsers[0]);
});

app.put('/api/user/profile', (req, res) => {
  // In a real app, you would update the user in database
  const updatedUser = { ...mockUsers[0], ...req.body };
  res.json(updatedUser);
});

// Stats API
app.get('/api/stats', (req, res) => {
  res.json(mockStats);
});

// Dashboard API
app.get('/api/dashboard', (req, res) => {
  res.json({
    stats: mockStats,
    featuredQuestions: mockQuestions.slice(0, 3),
    weeklyData: [
      { day: 'T2', questions: 80, users: 60 },
      { day: 'T3', questions: 95, users: 75 },
      { day: 'T4', questions: 70, users: 65 },
      { day: 'T5', questions: 100, users: 80 },
      { day: 'T6', questions: 90, users: 70 },
      { day: 'T7', questions: 85, users: 68 },
      { day: 'CN', questions: 98, users: 85 }
    ]
  });
});

// Created Sets API
app.get('/api/created-sets', (req, res) => {
  res.json(mockQuestions.filter(q => q.author === "John Doe"));
});

// Saved Sets API
app.get('/api/saved-sets', (req, res) => {
  const savedSets = mockQuestions.map(q => ({
    ...q,
    savedAt: "2 ngày trước",
    lastPlayed: "1 tuần trước"
  }));
  res.json(savedSets);
});

// History API
app.get('/api/history', (req, res) => {
  const history = [
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
    }
  ];
  res.json(history);
});

// Search API
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json([]);
  }
  
  const results = mockQuestions.filter(question =>
    question.title.toLowerCase().includes(q.toLowerCase()) ||
    question.description.toLowerCase().includes(q.toLowerCase())
  );
  
  res.json(results);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
}); 