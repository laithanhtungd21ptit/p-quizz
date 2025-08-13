import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import TopControls from '../components/TopControls'
import Sidebar from '../components/Sidebar'
import SavedQuizCard from '../components/SavedQuizCard'
import { searchQuizzes, addFavorite, removeFavorite } from '../services/api'

const SearchResults = () => {
  const [searchParams] = useSearchParams()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const query = searchParams.get('q') || ''
    setSearchTerm(query)
    
    if (query.trim()) {
      // Gọi API tìm kiếm thật
      fetchSearchResults(query.trim())
    } else {
      setSearchResults([])
      setLoading(false)
    }
  }, [searchParams])

  // Function để fetch kết quả tìm kiếm từ API
  const fetchSearchResults = async (searchQuery) => {
    try {
      setLoading(true)
      setSearchResults([])
      
      // Gọi API searchQuizzes với topic và name
      const response = await searchQuizzes('', searchQuery, 0, 20)
      console.log('API Response:', response)
      console.log('Search Results:', response?.data)
      
      const results = response?.data || []
      setSearchResults(results)
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
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
      setSearchResults(prev => prev.map(quiz => 
        quiz.quizId === quizId 
          ? { ...quiz, favorite: newIsSavedState }
          : quiz
      ))
      
    } catch (err) {
      console.error('Lỗi khi toggle favorite:', err)
      alert('Không thể thay đổi trạng thái yêu thích. Vui lòng thử lại.')
    }
  }

  return (
    <div className="app-root flex h-screen bg-dark-bg text-white font-content">
      <Sidebar collapsed={sidebarCollapsed} />
      
      <div className="flex-1 flex flex-col">
        <TopControls 
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          showSearch={false}
        />
        
        <div className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2 font-content">
              Kết quả tìm kiếm
            </h1>
            <p className="text-gray-400 font-content">
              Tìm thấy {searchResults.length} bộ câu hỏi cho "{searchTerm}"
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ED005D]"></div>
            </div>
          )}

          {/* Search Results */}
          {!loading && (
            <div>
                             {searchResults.length > 0 ? (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 justify-items-center">
                   {searchResults.map((quiz) => (
                     <SavedQuizCard
                       key={quiz.quizId}
                       id={quiz.quizId}
                       title={quiz.quizTopic || 'Bộ câu hỏi'}
                       subtitle={quiz.quizName || quiz.quizDescription || ''}
                       questionCount={String(quiz.quantityQuestion || 0)}
                       author={quiz.creator || 'Ẩn danh'}
                       authorAvatar={quiz.creatorImageUrl}
                       isSaved={!!quiz.favorite}
                       onToggleSave={(quizId, isSaved) => {
                         handleToggleFavorite(quizId, isSaved)
                       }}
                     />
                   ))}
                 </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-300 mb-2 font-content">
                    Không tìm thấy kết quả
                  </h3>
                  <p className="text-gray-500 font-content">
                    Không có bộ câu hỏi nào phù hợp với "{searchTerm}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Search Tips */}
          {!loading && searchResults.length > 0 && (
            <div className="mt-8 p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 font-content">Mẹo tìm kiếm:</h3>
              <ul className="text-sm text-gray-400 space-y-1 font-content">
                <li>• Sử dụng từ khóa cụ thể để tìm kiếm chính xác hơn</li>
                <li>• Thử tìm kiếm theo tên môn học hoặc chủ đề</li>
                <li>• Sử dụng tiếng Việt có dấu để kết quả tốt hơn</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchResults 