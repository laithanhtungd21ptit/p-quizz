import React, { useState, useEffect } from 'react'
import { Search, Filter, Heart, Clock, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SavedQuizCard from '../components/SavedQuizCard'
import { getUserFavorites, addFavorite, removeFavorite } from '../services/api'

const SavedSets = () => {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Lấy danh sách favorites từ API
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true)
        const list = await getUserFavorites()
        // Map từ QuizSearchResponse -> dữ liệu card
        const mapped = list.map(item => ({
          quizId: item.quizId,
          quizTitle: item.quizTopic,
          description: item.quizName,
          questions: new Array(item.quantityQuestion || 0).fill(null),
          creator: item.creator,
          creatorImageUrl: item.creatorImageUrl,
          createdAt: item.createdAt,
        }))
        setFavorites(mapped)
        setError(null)
      } catch (err) {
        console.error('Lỗi khi lấy danh sách favorites:', err)
        setError('Không thể tải danh sách yêu thích. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [])

  // Xử lý toggle favorite
  const handleToggleSave = async (quizId, isSaved) => {
    try {
      // isSaved là TRẠNG THÁI MỚI sau khi toggle (!isStarred)
      // Nếu trạng thái mới là true => thêm; false => bỏ
      if (isSaved) {
        await addFavorite(quizId)
        const list = await getUserFavorites()
        const mapped = list.map(item => ({
          quizId: item.quizId,
          quizTitle: item.quizTopic,
          description: item.quizName,
          questions: new Array(item.quantityQuestion || 0).fill(null),
          creator: item.creator,
          creatorImageUrl: item.creatorImageUrl,
          createdAt: item.createdAt,
        }))
        setFavorites(mapped)
      } else {
        await removeFavorite(quizId)
        setFavorites(prev => prev.filter(fav => fav.quizId !== quizId))
      }
    } catch (err) {
      console.error('Lỗi khi toggle favorite:', err)
      // Có thể hiển thị thông báo lỗi cho user
      alert('Có lỗi xảy ra khi cập nhật yêu thích. Vui lòng thử lại.')
    }
  }

  // Format thời gian
  const formatTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInMs = now - date
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
      
      if (diffInDays === 0) return 'Hôm nay'
      if (diffInDays === 1) return '1 ngày trước'
      if (diffInDays < 7) return `${diffInDays} ngày trước`
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`
      if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} tháng trước`
      return `${Math.floor(diffInDays / 365)} năm trước`
    } catch (error) {
      console.error('Lỗi khi format thời gian:', error)
      return 'Không xác định'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-full">
        <div className="flex items-center justify-between mb-4">
          <img src="/saved-sets-title.png" alt="Bộ câu hỏi đã lưu" className="h-12 object-contain" />
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
        
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ED005D] mx-auto"></div>
          <p className="text-gray-500 mt-4 font-content">Đang tải danh sách yêu thích...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-full">
        <div className="flex items-center justify-between mb-4">
          <img src="/saved-sets-title.png" alt="Bộ câu hỏi đã lưu" className="h-12 object-contain" />
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
        
        <div className="text-center py-12">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h3 className="text-xl font-medium text-gray-400 mb-2 font-content">Có lỗi xảy ra</h3>
          <p className="text-gray-500 font-content">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-[#ED005D] text-white rounded-lg hover:bg-[#ED005D]/80 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-full">
      {/* Greeting + Room Code (giống Dashboard) */}
      <div className="flex items-center justify-between mb-4">
        <img src="/saved-sets-title.png" alt="Bộ câu hỏi đã lưu" className="h-12 object-contain" />
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

      {/* Saved Quiz Cards */}
      {favorites.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700 font-content">
              Tổng cộng {favorites.length} bộ câu hỏi yêu thích
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 justify-items-center">
            {favorites.map((favorite) => (
              <SavedQuizCard 
                key={favorite.quizId}
                id={favorite.quizId}
                title={favorite.quizTitle}
                subtitle={favorite.description || ''}
                questionCount={favorite.questions?.length || 0}
                author={favorite.creator}
                authorAvatar={favorite.creatorImageUrl}
                isSaved={true}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-400 mb-2 font-content">Chưa có bộ câu hỏi nào được lưu</h3>
          <p className="text-gray-500 font-content">Lưu các bộ câu hỏi yêu thích để học sau</p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="mt-4 px-6 py-2 bg-[#ED005D] text-white rounded-lg hover:bg-[#ED005D]/80 transition-colors font-content"
          >
            Khám phá bộ câu hỏi
          </button>
        </div>
      )}
    </div>
  )
}

export default SavedSets 