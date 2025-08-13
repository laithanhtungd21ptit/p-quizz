import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreVertical } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import QuestionCard from '../components/QuestionCard'
import QuizCard from '../components/QuizCard'
import { getUserQuizzes, addFavorite, removeFavorite } from '../services/api'

const CreatedSets = () => {
  const navigate = useNavigate()
  const [createdSets, setCreatedSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchCreatedSets()
  }, [])

  // Function để fetch bộ câu hỏi đã tạo
  const fetchCreatedSets = async (page = 0, append = false) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getUserQuizzes(page, 10)
      const newQuizzes = response?.data || []
      
      if (append) {
        setCreatedSets(prev => [...prev, ...newQuizzes])
      } else {
        setCreatedSets(newQuizzes)
      }
      
      // Kiểm tra xem còn dữ liệu không
      setHasMore(newQuizzes.length === 10)
      setCurrentPage(page)
    } catch (err) {
      console.error('Lỗi khi lấy bộ câu hỏi đã tạo:', err)
      setError('Không thể tải dữ liệu. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // Function để load thêm dữ liệu
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchCreatedSets(currentPage + 1, true)
    }
  }

  // Function để refresh dữ liệu
  const refreshData = () => {
    fetchCreatedSets(0, false)
  }

  // Function để xử lý toggle favorite
  const handleToggleFavorite = async (quizId, newIsSavedState) => {
    try {
      if (newIsSavedState) {
        // Thêm vào yêu thích
        await addFavorite(quizId)
        console.log(`Đã thêm quiz ${quizId} vào yêu thích`)
      } else {
        // Bỏ yêu thích
        await removeFavorite(quizId)
        console.log(`Đã xóa quiz ${quizId} khỏi yêu thích`)
      }
      
      // Cập nhật state local
      setCreatedSets(prev => prev.map(quiz => 
        quiz.id === quizId 
          ? { ...quiz, favorite: newIsSavedState }
          : quiz
      ))
      
    } catch (err) {
      console.error('Lỗi khi toggle favorite:', err)
      alert('Không thể thay đổi trạng thái yêu thích. Vui lòng thử lại.')
    }
  }

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

      {/* Loading State */}
      {loading && createdSets.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ED005D]"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="px-6 py-2 bg-[#ED005D] text-white rounded-lg hover:bg-[#d10052] transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Quiz Cards */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 justify-items-center">
            {createdSets.length > 0 ? (
              createdSets.map((quiz) => (
                <QuizCard 
                  key={quiz.id}
                  quizId={quiz.id}
                  title={quiz.topic || 'Bộ câu hỏi'}
                  subtitle={quiz.name || quiz.description || ''}
                  questionCount={String(quiz.questions?.length || 0)}
                  playCount={String(quiz.countTimePlay || 0)}
                  author={quiz.createdBy?.firstname || 'Bạn'}
                  authorAvatar={quiz.createdBy?.avatar}
                  isSaved={!!quiz.favorite}
                  questions={quiz.questions || []}
                  imageUrl={quiz.imageUrl}
                  visibleTo={quiz.visibleTo}
                  onToggleSave={(quizTitle, isSaved) => {
                    handleToggleFavorite(quiz.id, isSaved)
                  }}
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <p className="text-gray-500 text-lg mb-4">Bạn chưa tạo bộ câu hỏi nào</p>
                <button
                  onClick={() => navigate('/create-question-set')}
                  className="px-6 py-3 bg-[#ED005D] text-white rounded-lg hover:bg-[#d10052] transition-colors"
                >
                  Tạo bộ câu hỏi đầu tiên
                </button>
              </div>
            )}
          </div>

          {/* Load More Button */}
          {hasMore && createdSets.length > 0 && (
            <div className="text-center py-6">
              <button
                onClick={loadMore}
                disabled={loading}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  loading 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#ED005D] text-white hover:bg-[#d10052]'
                }`}
              >
                {loading ? 'Đang tải...' : 'Tải thêm'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CreatedSets 