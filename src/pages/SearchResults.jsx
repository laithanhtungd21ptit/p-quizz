import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import TopControls from '../components/TopControls'
import Sidebar from '../components/Sidebar'
import SavedQuizCard from '../components/SavedQuizCard'

const SearchResults = () => {
  const [searchParams] = useSearchParams()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const query = searchParams.get('q') || ''
    setSearchTerm(query)
    
    // Simulate API call để lấy kết quả tìm kiếm
    setLoading(true)
    setTimeout(() => {
      // Mock data - trong thực tế sẽ gọi API
      const mockResults = [
        {
          id: 1,
          title: "Toán học cơ bản",
          description: "Bộ câu hỏi về toán học cơ bản cho học sinh THCS",
          questionCount: 50,
          difficulty: "Dễ",
          category: "Toán học",
          author: "Nguyễn Văn A",
          createdAt: "2024-01-15",
          image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop"
        },
        {
          id: 2,
          title: "Văn học Việt Nam",
          description: "Tuyển tập các tác phẩm văn học Việt Nam nổi tiếng",
          questionCount: 30,
          difficulty: "Trung bình",
          category: "Văn học",
          author: "Trần Thị B",
          createdAt: "2024-01-10",
          image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop"
        },
        {
          id: 3,
          title: "Lịch sử thế giới",
          description: "Các sự kiện lịch sử quan trọng của thế giới",
          questionCount: 40,
          difficulty: "Khó",
          category: "Lịch sử",
          author: "Lê Văn C",
          createdAt: "2024-01-05",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop"
        },
        {
          id: 4,
          title: "Địa lý Việt Nam",
          description: "Khám phá địa lý tự nhiên và kinh tế Việt Nam",
          questionCount: 35,
          difficulty: "Trung bình",
          category: "Địa lý",
          author: "Phạm Thị D",
          createdAt: "2024-01-01",
          image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop"
        },
        {
            id: 5,
            title: "Địa lý Việt Nam",
            description: "Khám phá địa lý tự nhiên và kinh tế Việt Nam",
            questionCount: 35,
            difficulty: "Trung bình",
            category: "Địa lý",
            author: "Phạm Thị Dang á hhh",
            createdAt: "2024-01-01",
            image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop"
          },
          {
            id: 6,
            title: "Địa lý Việt Nam",
            description: "Khám phá địa lý tự nhiên và kinh tế Việt Nam",
            questionCount: 35,
            difficulty: "Trung bình",
            category: "Địa lý",
            author: "Phạm Thị D",
            createdAt: "2024-01-01",
            image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop"
          },
          {
            id: 7,
            title: "Địa lý Việt Nam",
            description: "Khám phá địa lý tự nhiên và kinh tế Việt Nam",
            questionCount: 35,
            difficulty: "Trung bình",
            category: "Địa lý",
            author: "Phạm Thị D",
            createdAt: "2024-01-01",
            image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop"
          }
      ]

      // Lọc kết quả dựa trên từ khóa tìm kiếm
      const filteredResults = mockResults.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )

      setSearchResults(filteredResults)
      setLoading(false)
    }, 1000)
  }, [searchParams])

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
                       key={quiz.id}
                       id={quiz.id}
                       title={quiz.title}
                       subtitle={quiz.description}
                       questionCount={quiz.questionCount}
                       author={quiz.author}
                       authorAvatar={quiz.image}
                       isSaved={false} // Mặc định chưa được lưu
                       onToggleSave={(quizId, isSaved) => {
                         console.log(`Quiz ${quizId} ${isSaved ? 'đã được lưu' : 'đã bỏ lưu'}`)
                         // TODO: Gọi API để lưu/bỏ lưu quiz
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