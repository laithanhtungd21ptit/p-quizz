import React from 'react'
import { Search, Filter, Heart, Clock, Users } from 'lucide-react'
import SavedQuizCard from '../components/SavedQuizCard'
import { mockQuestions } from '../data/mockData'

const SavedSets = () => {
  const savedSets = mockQuestions.map(q => ({
    ...q,
    savedAt: "2 ngày trước",
    lastPlayed: "1 tuần trước"
  }))

  return (
    <div className="space-y-6 max-w-full">
      {/* Greeting + Room Code (giống Dashboard) */}
      <div className="flex items-center justify-between mb-4">
        <img src="/saved-sets-title.png" alt="Bộ câu hỏi đã lưu" className="h-12 object-contain" />
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

      {/* Saved Quiz Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 justify-items-center">
        <SavedQuizCard 
          title="TIẾNG NHẬT"
          subtitle="Từ vựng Mina no Nihongo bài 25"
          questionCount="10"
          author="Ngô Quốc Anh"
        />
        <SavedQuizCard 
          title="TOÁN HỌC"
          subtitle="Đại số cơ bản lớp 10"
          questionCount="15"
          author="Trần Thị Mai"
        />
        <SavedQuizCard 
          title="TIẾNG ANH"
          subtitle="Grammar Practice - Present Perfect"
          questionCount="12"
          author="Lê Văn Nam"
        />
        <SavedQuizCard 
          title="VẬT LÝ"
          subtitle="Cơ học Newton - Chương 1"
          questionCount="20"
          author="Phạm Thị Hoa"
        />
        <SavedQuizCard 
          title="HÓA HỌC"
          subtitle="Bảng tuần hoàn và liên kết hóa học"
          questionCount="18"
          author="Nguyễn Văn Tuấn"
        />
        <SavedQuizCard 
          title="LỊCH SỬ"
          subtitle="Lịch sử Việt Nam thời kỳ phong kiến"
          questionCount="14"
          author="Hoàng Thị Lan"
        />
      </div>


      {savedSets.length === 0 && (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-400 mb-2">Chưa có bộ câu hỏi nào được lưu</h3>
          <p className="text-gray-500">Lưu các bộ câu hỏi yêu thích để học sau</p>
        </div>
      )}
    </div>
  )
}

export default SavedSets 