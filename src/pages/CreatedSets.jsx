import React from 'react'
import { Plus, Search, Filter, MoreVertical } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import QuestionCard from '../components/QuestionCard'
import QuizCard from '../components/QuizCard'
import { mockQuestions } from '../data/mockData'

const CreatedSets = () => {
  const navigate = useNavigate()
  const createdSets = mockQuestions.filter(q => q.author === "John Doe")

  return (
    <div className="space-y-6 max-w-full">
      {/* Greeting + Room Code (giống Dashboard) */}
      <div className="flex items-center justify-between mb-4">
        <img src="/created-sets-title.png" alt="Bộ câu hỏi đã tạo" className="h-12 object-contain" />
        <div className="flex-shrink-0 flex items-center h-12">
          <button 
            onClick={() => navigate('/enter-room-code')}
            aria-label="Nhập mã phòng" 
            className="room-code-img-link"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer'
            }}
          >
            <img 
              src="./code.png" 
              alt="Nhập mã phòng" 
              className="h-12 object-contain block transition-transform duration-150 hover:scale-105" 
            />
          </button>
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