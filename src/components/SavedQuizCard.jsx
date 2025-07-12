import React from 'react'
import { Star, Share2, ChevronDown } from 'lucide-react'

const SavedQuizCard = ({ 
  title = "TIẾNG NHẬT",
  subtitle = "Từ vựng Mina no Nihongo bài 25",
  questionCount = "10",
  author = "Ngô Quốc Anh",
  authorAvatar = "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/8fb5f33e-5e67-4591-8df0-33e231a368c9.png"
}) => {
  return (
    <div className="bg-white rounded-xl p-6 space-y-5 relative flex-shrink-0"
         style={{
           boxShadow: '0 0 8px rgb(237 0 93 / 0.7), 0 0 20px rgb(237 0 93 / 0.45)',
           minWidth: '364px',
           maxWidth: '364px'
         }}>
      
      {/* Tiêu đề và icon */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">CHỦ ĐỀ: {title}</h2>
        <div className="flex items-center gap-3">
          {/* Icon yêu thích */}
          <button aria-label="Yêu thích" className="focus:outline-none hover:text-[#ED005D] text-[#ED005D]">
            <Star className="w-6 h-6 fill-current" />
          </button>
          {/* Icon chia sẻ */}
          <button aria-label="Chia sẻ" className="focus:outline-none text-gray-600 hover:text-[#ED005D]" title="Chia sẻ">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mô tả */}
      <p className="text-gray-700 text-sm leading-relaxed">{subtitle}</p>

      {/* Thông tin và tác giả */}
      <div className="flex flex-wrap items-center gap-4 justify-start sm:justify-between">
        <span className="inline-flex items-center gap-2 bg-[#ED005D]/90 text-white text-xs font-semibold rounded-full px-4 py-1 select-none">
          <ChevronDown className="w-4 h-4" />
          {questionCount} câu hỏi
        </span>

        <div className="flex items-center gap-3">
          <img
            src={authorAvatar}
            alt={`Ảnh đại diện hình tròn của ${author}`}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#ED005D]"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/40x40/ef4444/ffffff/png?text=?';
            }}
          />
          <span className="text-gray-800 font-medium text-sm">{author}</span>
        </div>
      </div>

    </div>
  )
}

export default SavedQuizCard 