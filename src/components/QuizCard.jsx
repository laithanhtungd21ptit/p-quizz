import React from 'react'
import { Edit, Star, MoreHorizontal, Users, FileText } from 'lucide-react'

const QuizCard = ({ 
  title = "TIẾNG NHẬT",
  subtitle = "Từ vựng Mina no Nihongo bài 25",
  questionCount = "10",
  playCount = "2",
  author = "Bạn",
  authorAvatar = "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/e6aad9ee-7272-4c1d-a2a9-a273e9bdda28.png"
}) => {
  return (
    <div className="max-w-xl w-full bg-white rounded-lg shadow-lg flex gap-6 p-6 relative mx-auto mt-8 border-2 border-[#ED005D]"
         role="region" aria-label={`Thông tin bài quiz P-Quizz chủ đề ${title}`}>

      {/* Left block */}
      <div className="flex-shrink-0 w-40 h-28 bg-gray-300 rounded-md relative flex flex-col justify-center items-center select-none">
        <span className="text-4xl font-extrabold text-[#ED005D] mb-1" style={{fontFamily: 'Poppins, sans-serif'}}>P-QUIZZ</span>
        <div className="bg-[#ED005D] text-white rounded-full text-xs px-3 py-1 flex items-center gap-1 select-none">
          <FileText className="h-4 w-4" />
          {questionCount} câu hỏi
        </div>
      </div>

      {/* Right content block */}
      <div className="flex-1 flex flex-col justify-between leading-relaxed select-text">

        {/* Title and icons */}
        <div className="flex justify-between items-center gap-3 flex-wrap">
          <h2 className="text-lg font-semibold text-gray-900">
            CHỦ ĐỀ: <span className="uppercase">{title}</span>
          </h2>
          <div className="flex items-center gap-4 text-gray-600">
            {/* Edit */}
            <button aria-label="Chỉnh sửa bài quiz" className="hover:text-[#ED005D] focus-visible:outline-[#ED005D]">
              <Edit className="h-5 w-5" />
            </button>
            {/* Star */}
            <button aria-label="Yêu thích bài quiz" className="hover:text-[#ED005D] focus-visible:outline-[#ED005D]">
              <Star className="h-5 w-5" />
            </button>
            {/* More */}
            <button aria-label="Thêm tùy chọn" className="hover:text-[#ED005D] focus-visible:outline-[#ED005D]">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Subtitle and author */}
        <p className="mt-1 text-gray-700 font-normal text-base tracking-wide">{subtitle}</p>
        <div className="flex items-center mt-2 gap-2 text-gray-600 text-sm">
          <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-300 flex justify-center items-center bg-gray-100">
            <img 
              src={authorAvatar}
              alt={`Ảnh đại diện người dùng ${author}`}
              className="object-cover w-full h-full" 
              onError={(e) => e.target.style.display = 'none'} 
            />
          </div>
          <span>{author}</span>
        </div>

        {/* Buttons and stats */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 mt-3">
          <button type="button"
            className="bg-[#ED005D] text-white text-xs font-semibold px-4 py-1 rounded-full hover:bg-[#d10052] focus-visible:outline-[#ED005D] focus-visible:outline-2">
            Bắt đầu quiz trực tiếp
          </button>

          {/* Số lượt chơi + icon */}
          <div className="flex items-center gap-2">
            <div className="bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded-full select-none">
              {playCount} lượt chơi
            </div>
            <Users className="h-4 w-4 text-gray-600" />
          </div>
        </div>

      </div>
    </div>
  )
}

export default QuizCard 