import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'



const CreateRoom = ({ onClose }) => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('')
  const [showTopicDropdown, setShowTopicDropdown] = useState(false)
  const [search, setSearch] = useState('')
  const [showSuggestDropdown, setShowSuggestDropdown] = useState(false)
  const [questionSets, setQuestionSets] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [topicSuggestions, setTopicSuggestions] = useState([])
  const [topicLoading, setTopicLoading] = useState(false)
  const topicInputRef = useRef(null)
  const searchInputRef = useRef(null)
  
  // Debounce timer cho search
  const searchTimeoutRef = useRef(null)
  const topicTimeoutRef = useRef(null)

  // Hàm lấy tất cả topics từ API
  const loadAllTopics = async () => {
    setTopicLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setTopicSuggestions([])
        return
      }

      // Lấy tất cả quiz để extract topics
      const response = await fetch(`http://localhost:8080/api/questions/all?page=0&size=100`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Lấy danh sách topics unique từ tất cả quiz
        const topics = [...new Set(data.data?.map(quiz => quiz.topic).filter(Boolean))]
        setTopicSuggestions(topics)
      } else {
        setTopicSuggestions([])
      }
    } catch (error) {
      console.error('Error loading topics:', error)
      setTopicSuggestions([])
    } finally {
      setTopicLoading(false)
    }
  }

  // Hàm tìm kiếm topics từ API
  const searchTopics = async (topicTerm) => {
    if (!topicTerm.trim()) {
      // Nếu không có search term, load tất cả topics
      await loadAllTopics()
      return
    }

    setTopicLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setTopicSuggestions([])
        return
      }

      // Tìm kiếm quiz theo topic để lấy các topic có sẵn
      const params = new URLSearchParams()
      params.append('topic', topicTerm.trim())
      params.append('page', '0')
      params.append('size', '50')

      const response = await fetch(`http://localhost:8080/api/questions/search?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Lấy danh sách topics unique từ kết quả
        const topics = [...new Set(data.data?.map(quiz => quiz.topic).filter(Boolean))]
        
        // Lọc topics theo search term
        const filteredTopics = topics.filter(t => 
          t.toLowerCase().includes(topicTerm.toLowerCase())
        )
        
        setTopicSuggestions(filteredTopics.slice(0, 15))
      } else {
        setTopicSuggestions([])
      }
    } catch (error) {
      console.error('Error searching topics:', error)
      setTopicSuggestions([])
    } finally {
      setTopicLoading(false)
    }
  }

  // Hàm tìm kiếm quiz từ API
  const searchQuizzes = async (searchTerm, topicFilter = '') => {
    if (!searchTerm.trim()) {
      setQuestionSets([])
      return
    }

    setSearchLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Bạn cần đăng nhập để tìm kiếm bộ câu hỏi')
        return
      }

      const params = new URLSearchParams()
      if (searchTerm.trim()) params.append('name', searchTerm.trim())
      if (topicFilter.trim()) params.append('topic', topicFilter.trim())
      params.append('page', '0')
      params.append('size', '10')

      const response = await fetch(`http://localhost:8080/api/questions/search?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Search API response:', data)
        console.log('Question sets data:', data.data)
        setQuestionSets(data.data || [])
        setError('')
      } else {
        console.error('Lỗi khi tìm kiếm:', response.status)
        setError('Không thể tìm kiếm bộ câu hỏi')
      }
    } catch (error) {
      console.error('Error searching quizzes:', error)
      setError('Lỗi kết nối khi tìm kiếm')
    } finally {
      setSearchLoading(false)
    }
  }

  // Hàm tạo phòng
  const handleCreateRoom = async () => {
    if (!selectedQuiz) {
      setError('Vui lòng chọn một bộ câu hỏi')
      return
    }

    // Sử dụng quizId thay vì id vì API trả về quizId
    const quizId = selectedQuiz.quizId || selectedQuiz.id
    if (!quizId) {
      console.error('Selected quiz structure:', selectedQuiz)
      setError('Bộ câu hỏi được chọn không có ID hợp lệ. Vui lòng chọn lại.')
      return
    }

    console.log('Creating room with quiz:', selectedQuiz)
    console.log('Quiz ID:', quizId)
    console.log('Quiz topic:', selectedQuiz.quizTopic || selectedQuiz.topic)
    console.log('Quiz structure keys:', Object.keys(selectedQuiz))

    setLoading(true)
    setError('')
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Bạn cần đăng nhập để tạo phòng')
        return
      }

      const response = await fetch(`http://localhost:8080/rooms/create?quizId=${quizId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const roomData = await response.json()
        console.log('Phòng đã được tạo:', roomData)
        console.log('Room ID:', roomData.id)
        console.log('Room keys:', Object.keys(roomData))
        
        // Kiểm tra roomId có tồn tại không
        const roomId = roomData.roomId || roomData.id || roomData.room?.id
        console.log('Extracted roomId:', roomId)
        
        if (!roomId) {
          setError('Không thể lấy ID phòng từ response')
          return
        }
        
        // Đóng modal và chuyển đến trang phòng chờ cho controller
        if (onClose) onClose()
        navigate(`/waiting-room-for-controller/${roomId}`)
      } else {
        console.log('Create room failed with status:', response.status)
        const errorData = await response.text()
        console.log('Error response from backend:', errorData)
        
        // Xử lý message cụ thể 
        if (errorData.includes('Bạn đang ở trong một phòng khác')) {
          setError(`❌ Bạn đang ở trong một phòng khác!\n\n🔹 Vui lòng thoát khỏi phòng hiện tại trước khi tạo phòng mới.\n🔹 Hoặc kiểm tra xem bạn có đang ở trong phòng chờ nào không.\n🔹 Có thể refresh trang để reset trạng thái.`)
        } else if (errorData.includes('Quiz không tồn tại')) {
          setError('❌ Bộ câu hỏi được chọn không tồn tại. Vui lòng chọn bộ câu hỏi khác.')
        } else {
          setError(errorData || '❌ Không thể tạo phòng')
        }
      }
    } catch (error) {
      console.error('Error creating room:', error)
      setError('Lỗi kết nối khi tạo phòng')
    } finally {
      setLoading(false)
    }
  }

  // Debounced search effect cho quiz
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (search.trim()) {
        searchQuizzes(search, topic)
      } else {
        // Nếu không có search term, vẫn giữ quiz đã chọn
        // setQuestionSets([])
      }
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [search, topic])

  // Debounced search effect cho topic
  useEffect(() => {
    if (topicTimeoutRef.current) {
      clearTimeout(topicTimeoutRef.current)
    }

    topicTimeoutRef.current = setTimeout(() => {
      searchTopics(topic)
    }, 300)

    return () => {
      if (topicTimeoutRef.current) {
        clearTimeout(topicTimeoutRef.current)
      }
    }
  }, [topic])

  // Load all topics from API on mount
  useEffect(() => {
    loadAllTopics()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen w-full fixed inset-0 z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      {/* Popup */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative z-50">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-black text-xl font-bold"
          onClick={() => onClose ? onClose() : navigate('/dashboard')}
          aria-label="Đóng"
        >
          &times;
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-[#ED005D] text-xl font-semibold">➕ Tạo phòng</span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Chủ đề */}
        <div className="mb-4 relative" id="topic-block">
          <label className="block text-sm font-semibold text-[#ED005D] mb-1">Chủ đề</label>
          <input
            type="text"
            ref={topicInputRef}
            value={topic}
            onChange={e => { setTopic(e.target.value); setShowTopicDropdown(true); }}
            onFocus={() => {
              setShowTopicDropdown(true);
              // Nếu chưa có topic suggestions, load lại từ API
              if (topicSuggestions.length === 0) {
                loadAllTopics();
              }
            }}
            onBlur={() => setTimeout(() => setShowTopicDropdown(false), 100)}
            placeholder="Nhập/chọn chủ đề..."
            className="w-full border border-[#ED005D] rounded-md py-2 pl-10 pr-8 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#ED005D] text-black"
          />
          {/* Icon bên trái */}
          <div className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#ED005D] select-none pointer-events-none">📄</div>
          
          {/* Loading indicator cho topic search */}
          {topicLoading ? (
            <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#ED005D]"></div>
            </div>
          ) : (
            /* Mũi tên */
            <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
              <svg className="h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          )}
          
          {/* Dropdown gợi ý chủ đề từ API */}
          {showTopicDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md max-h-40 overflow-y-auto scrollbar-thin shadow">
              {topicSuggestions.length > 0 ? (
                topicSuggestions.map((topicItem, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black flex items-center justify-between"
                    onMouseDown={e => { 
                      setTopic(topicItem); 
                      setShowTopicDropdown(false); 
                      // Trigger search cho quiz với topic mới
                      if (search.trim()) {
                        searchQuizzes(search, topicItem)
                      }
                      e.preventDefault(); 
                    }}
                  >
                    <span>{topicItem}</span>
                    <div className="text-xs text-gray-500">📚</div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500 text-sm">
                  {topicLoading ? 'Đang tìm kiếm chủ đề...' : 'Không tìm thấy chủ đề nào'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tìm kiếm bộ câu hỏi */}
        <div className="mb-4 relative" id="search-block">
          <label className="block text-sm font-semibold text-[#ED005D] mb-1">
            Nhập tên bộ câu hỏi <span className="text-red-500">*</span>
          </label>
          <div className="text-xs text-gray-600 mb-2">
            Gõ để tìm kiếm và chọn một bộ câu hỏi từ danh sách
          </div>
          <input
            type="text"
            ref={searchInputRef}
            value={search}
            onChange={e => { 
              setSearch(e.target.value); 
              setShowSuggestDropdown(e.target.value.trim() !== '');
              // Không reset selectedQuiz khi gõ để giữ quiz đã chọn
              // setSelectedQuiz(null); 
            }}
            onFocus={() => { if (search.trim() !== '') setShowSuggestDropdown(true); }}
            onBlur={() => setTimeout(() => setShowSuggestDropdown(false), 100)}
            placeholder={selectedQuiz ? "Đã chọn quiz, gõ để tìm quiz khác..." : "Tìm kiếm bộ câu hỏi..."}
            className="w-full border border-[#ED005D] rounded-md py-2 px-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ED005D] text-black"
          />
          
          {/* Loading indicator cho search */}
          {searchLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#ED005D]"></div>
            </div>
          )}
          
          {/* Dropdown gợi ý từ API */}
          {showSuggestDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md max-h-40 overflow-y-auto scrollbar-thin shadow">
              {questionSets.length > 0 ? (
                questionSets.map((quiz, i) => (
                  <div
                    key={quiz.quizId || quiz.id || i}
                    className={`flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer text-black ${
                      selectedQuiz?.quizId === quiz.quizId || selectedQuiz?.id === quiz.id ? 'bg-blue-50 border-l-4 border-[#ED005D]' : ''
                    }`}
                    onMouseDown={e => { 
                      setSearch(quiz.name || quiz.quizName || 'Bộ câu hỏi'); 
                      setSelectedQuiz(quiz);
                      setShowSuggestDropdown(false); 
                      setError('');
                      // Clear search input để hiển thị quiz đã chọn
                      setSearch('');
                      e.preventDefault(); 
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{quiz.name || quiz.quizName || 'Bộ câu hỏi không có tên'}</span>
                      <span className="text-xs text-gray-500">{quiz.quizTopic || quiz.topic || 'Không có topic'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-xs text-gray-400">{quiz.quantityQuestion || quiz.questions?.length || 0} câu hỏi</span>
                      <div className="w-5 h-5 rounded-full bg-[#ED005D] text-white text-xs flex items-center justify-center">
                        Q
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500 text-sm">
                  {searchLoading ? 'Đang tìm kiếm...' : 'Không tìm thấy bộ câu hỏi nào'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Thông tin quiz đã chọn */}
        {selectedQuiz && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">
                ✓
              </div>
              <div className="flex-1">
                <div className="font-medium text-green-800">{selectedQuiz.name || selectedQuiz.quizName || 'Bộ câu hỏi không có tên'}</div>
                <div className="text-sm text-green-600">{selectedQuiz.quizTopic || selectedQuiz.topic || 'Không có topic'}</div>
                <div className="text-xs text-green-500">{selectedQuiz.quantityQuestion || selectedQuiz.questions?.length || 0} câu hỏi</div>
              </div>
              <button
                onClick={() => {
                  setSelectedQuiz(null)
                  setSearch('')
                  setError('')
                }}
                className="text-red-500 hover:text-red-700 text-sm"
                title="Bỏ chọn quiz này"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Nút tạo phòng */}
        <button 
          onClick={handleCreateRoom}
          disabled={loading || !selectedQuiz}
          className={`w-full mt-2 py-2 px-4 rounded-md font-semibold transition-all duration-200 ${
            loading || !selectedQuiz
              ? 'bg-gray-400 cursor-not-allowed text-gray-200'
              : 'bg-[#ED005D] hover:bg-pink-700 text-white hover:shadow-lg'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Đang tạo phòng...
            </div>
          ) : (
            'Tạo phòng'
          )}
        </button>
      </div>
    </div>
  )
}

export default CreateRoom 
