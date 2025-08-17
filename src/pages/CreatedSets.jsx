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
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchCreatedSets()
  }, [])

  // Function để fetch bộ câu hỏi đã tạo
  const fetchCreatedSets = async (page = 0) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getUserQuizzes(page, 10)
      const newQuizzes = response?.data || []
      
      console.log('=== PAGINATION DEBUG ===')
      console.log('Full response:', response)
      console.log('Meta info:', response?.meta)
      console.log('Total pages:', response?.meta?.pages)
      console.log('Total elements:', response?.meta?.total)
      
      setCreatedSets(newQuizzes)
      
      // Cập nhật thông tin phân trang từ meta
      const totalPagesFromApi = response?.meta?.pages || Math.ceil((response?.meta?.total || newQuizzes.length) / 10)
      const totalElementsFromApi = response?.meta?.total || newQuizzes.length
      
      console.log('Setting totalPages:', totalPagesFromApi)
      console.log('Setting totalElements:', totalElementsFromApi)
      
      setTotalPages(totalPagesFromApi)
      setTotalElements(totalElementsFromApi)
      setCurrentPage(page)
    } catch (err) {
      console.error('Lỗi khi lấy bộ câu hỏi đã tạo:', err)
      setError('Không thể tải dữ liệu. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // Function để chuyển trang
  const goToPage = (page) => {
    if (!loading && page >= 0 && page < totalPages) {
      fetchCreatedSets(page)
    }
  }

  // Function để refresh dữ liệu
  const refreshData = () => {
    fetchCreatedSets(0)
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 py-6">
              {/* Nút Previous */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 0 || loading}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 0 || loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ‹
              </button>

              {/* Các trang - hiển thị tối đa 5 trang */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                // Tính toán trang bắt đầu để luôn hiển thị 5 trang (hoặc ít hơn nếu totalPages < 5)
                let startPage = Math.max(0, currentPage - 2)
                if (startPage + 5 > totalPages) {
                  startPage = Math.max(0, totalPages - 5)
                }
                
                const pageNumber = startPage + index
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => goToPage(pageNumber)}
                    disabled={loading}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      pageNumber === currentPage
                        ? 'bg-[#ED005D] text-white'
                        : loading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {pageNumber + 1}
                  </button>
                )
              })}

              {/* Nút Next */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages - 1 || loading}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentPage === totalPages - 1 || loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ›
              </button>
            </div>
          )}

          {/* Thông tin phân trang */}
          {totalElements > 0 && (
            <div className="text-center text-gray-500 text-sm">
              Hiển thị {currentPage * 10 + 1} - {Math.min((currentPage + 1) * 10, totalElements)} trong tổng số {totalElements} bộ câu hỏi
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CreatedSets 