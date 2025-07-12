import React from 'react'
import { Clock, Trophy, Target, Calendar } from 'lucide-react'
import { mockHistory } from '../data/mockData'

const History = () => {
  const historyItems = mockHistory

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 80) return 'text-yellow-400'
    if (score >= 70) return 'text-orange-400'
    return 'text-red-400'
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'text-green-400 bg-green-400/10'
      case 'intermediate':
        return 'text-yellow-400 bg-yellow-400/10'
      case 'advanced':
        return 'text-red-400 bg-red-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  return (
    <div className="space-y-6 max-w-full">
      {/* Greeting + Room Code (giống Dashboard) */}
      <div className="flex items-center justify-between mb-4">
        <p className="greeting text-2xl font-semibold text-gray-100 tracking-wide m-0">
          Xin chào, John!
        </p>
        <div className="flex-shrink-0 flex items-center h-12">
          <a href="#" aria-label="Nhập mã phòng" className="room-code-img-link">
            <img 
              src="./code.png" 
              alt="Nhập mã phòng" 
              className="h-12 object-contain block transition-transform duration-150 cursor-pointer hover:scale-105" 
            />
          </a>
        </div>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Lịch sử</h1>
          <p className="text-gray-400 mt-1">Xem lại các bài quiz đã hoàn thành</p>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Clock className="w-5 h-5" />
          <span className="text-sm">{historyItems.length} bài quiz</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h3 className="text-sm font-medium text-gray-400">Điểm trung bình</h3>
          </div>
          <p className="text-3xl font-bold text-white">85%</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-green-400" />
            <h3 className="text-sm font-medium text-gray-400">Tổng câu đúng</h3>
          </div>
          <p className="text-3xl font-bold text-white">65</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-blue-400" />
            <h3 className="text-sm font-medium text-gray-400">Thời gian trung bình</h3>
          </div>
          <p className="text-3xl font-bold text-white">14:30</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6 text-purple-400" />
            <h3 className="text-sm font-medium text-gray-400">Tuần này</h3>
          </div>
          <p className="text-3xl font-bold text-white">3</p>
        </div>
      </div>

      {/* History List */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Bài quiz gần đây</h2>
        </div>
        
        <div className="divide-y divide-gray-700">
          {historyItems.map((item) => (
            <div key={item.id} className="p-6 hover:bg-gray-700/30 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-white">{item.title}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                      {item.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <span>Bởi {item.author}</span>
                    <span>•</span>
                    <span>{item.totalQuestions} câu hỏi</span>
                    <span>•</span>
                    <span>Thời gian: {item.timeSpent}</span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Điểm:</span>
                      <span className={`text-lg font-bold ${getScoreColor(item.score)}`}>
                        {item.score}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Đúng:</span>
                      <span className="text-sm text-white">
                        {item.correctAnswers}/{item.totalQuestions}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm text-gray-400">
                    {item.completedAt}
                  </span>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
                      Xem chi tiết
                    </button>
                    <button className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white text-sm rounded-lg transition-colors">
                      Chơi lại
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {historyItems.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-400 mb-2">Chưa có lịch sử</h3>
          <p className="text-gray-500">Hoàn thành bài quiz đầu tiên để xem lịch sử</p>
        </div>
      )}
    </div>
  )
}

export default History 