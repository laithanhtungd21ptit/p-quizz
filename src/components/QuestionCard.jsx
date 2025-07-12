import React, { useState } from 'react'
import { Star, Clock, Users, TrendingUp } from 'lucide-react'

const QuestionCard = ({ question }) => {
  const [isStarred, setIsStarred] = useState(question.isStarred)

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
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:bg-gray-800/70 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-white line-clamp-2 flex-1 mr-3">
          {question.title}
        </h3>
        <button
          onClick={() => setIsStarred(!isStarred)}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            isStarred 
              ? 'text-yellow-400 bg-yellow-400/10' 
              : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'
          }`}
        >
          <Star className={`w-5 h-5 ${isStarred ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
        {question.description}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{question.time}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{question.questions} câu</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          <span>{question.rating}</span>
        </div>
      </div>

      {/* Difficulty Badge */}
      <div className="mb-4">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
          {question.difficulty}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={question.authorAvatar}
            alt={question.author}
            className="w-8 h-8 rounded-full border-2 border-gray-600"
          />
          <span className="text-sm text-gray-300 font-medium">
            {question.author}
          </span>
        </div>
        <button className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium rounded-lg transition-colors duration-200">
          Bắt đầu
        </button>
      </div>
    </div>
  )
}

export default QuestionCard 