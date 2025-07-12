import React from 'react'
import { Plus, Search, Filter, MoreVertical } from 'lucide-react'
import QuestionCard from '../components/QuestionCard'
import QuizCard from '../components/QuizCard'
import { mockQuestions } from '../data/mockData'

const CreatedSets = () => {
  const createdSets = mockQuestions.filter(q => q.author === "John Doe")

  return (
    <div className="space-y-6 max-w-full">
      {/* Greeting + Room Code (giống Dashboard) */}
      <div className="flex items-center justify-between mb-4">
        <img src="/created-sets-title.png" alt="Bộ câu hỏi đã tạo" className="h-12 object-contain" />
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

      {/* Quiz Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 justify-items-center">
        <QuizCard 
          title="TIẾNG NHẬT"
          subtitle="Từ vựng Mina no Nihongo bài 25"
          questionCount="10"
          playCount="2"
          author="Bạn"
        />
        <QuizCard 
          title="TOÁN HỌC"
          subtitle="Đại số cơ bản lớp 10"
          questionCount="15"
          playCount="5"
          author="Bạn"
        />
        <QuizCard 
          title="VẬT LÝ"
          subtitle="Cơ học Newton - Chương 1"
          questionCount="20"
          playCount="3"
          author="Bạn"
        />
        <QuizCard 
          title="HÓA HỌC"
          subtitle="Bảng tuần hoàn và liên kết hóa học"
          questionCount="18"
          playCount="7"
          author="Bạn"
        />
        <QuizCard 
          title="LỊCH SỬ"
          subtitle="Lịch sử Việt Nam thời kỳ phong kiến"
          questionCount="14"
          playCount="4"
          author="Bạn"
        />
      </div>
    </div>
  )
}

export default CreatedSets 