// src/components/TopControls.jsx
import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, ChevronDown, LogOut, Settings, User, Menu, Trello, FileText } from 'lucide-react'
import CreateRoom from '../pages/CreateRoom'
import SearchInput from './SearchInput'
import { searchQuizzes } from '../services/api'

/**
 * Props mới:
 * - showMenu (boolean)     : hiển thị nút toggle sidebar
 * - showLogo (boolean)     : hiển thị logo "P-QUIZZ"
 * - showSearch (boolean)   : hiển thị ô tìm kiếm
 * - showCreate (boolean)   : hiển thị nút Plus
 * - showBack (boolean)     : hiển thị nút Quay lại
 */
const TopControls = ({
  sidebarCollapsed,
  setSidebarCollapsed,
  showMenu = true,
  showLogo = true,
  showSearch = true,
  showCreate = true,
  showBack = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false)
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [userLevel, setUserLevel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [topics, setTopics] = useState([])
  const [loadingTopics, setLoadingTopics] = useState(false)
  const dropdownRef = useRef(null)
  const createDropdownRef = useRef(null)
  const navigate = useNavigate()

  // Hàm lấy danh sách topic từ API
  const fetchTopics = async () => {
    try {
      setLoadingTopics(true)
      // Gọi API để lấy danh sách topic (có thể là search với topic rỗng)
      const response = await searchQuizzes('', '', 0, 50)
      const quizzes = response?.data || []
      
      // Lấy danh sách unique topics từ kết quả
      const uniqueTopics = [...new Set(quizzes.map(quiz => quiz.quizTopic).filter(Boolean))]
      setTopics(uniqueTopics)
    } catch (error) {
      console.error('Lỗi khi lấy danh sách topic:', error)
      // Fallback về danh sách topic mặc định
      setTopics([
        "Toán học", "Văn học", "Lịch sử", "Địa lý", "Tiếng Anh",
        "Vật lý", "Hóa học", "Sinh học", "Công nghệ thông tin", "Kinh tế học"
      ])
    } finally {
      setLoadingTopics(false)
    }
  }

  // Hàm lấy thông tin profile từ localStorage và API
  const fetchUserProfile = async () => {
    setLoading(true)
    try {
      // Đầu tiên kiểm tra localStorage để lấy thông tin cơ bản
      const storedUser = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      if (!token) {
        setUserProfile(null)
        setLoading(false)
        return
      }

      // Nếu có user trong localStorage, sử dụng thông tin này trước
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUserProfile(parsedUser)
        } catch (error) {
          console.error('Error parsing stored user:', error)
        }
      }

      // Sau đó fetch thông tin profile và level đầy đủ từ API
      const [profileResponse, levelResponse] = await Promise.all([
        fetch('http://localhost:8080/user/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:8080/user/level', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ])

      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setUserProfile(profileData)
      } else if (profileResponse.status === 401) {
        // Token không hợp lệ, xóa localStorage và chuyển về login
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        setUserProfile(null)
        setUserLevel(null)
      }

      if (levelResponse.ok) {
        const levelData = await levelResponse.json()
        setUserLevel(levelData)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      // Nếu lỗi kết nối, vẫn giữ thông tin từ localStorage nếu có
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserProfile()
    fetchTopics()

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
      if (createDropdownRef.current && !createDropdownRef.current.contains(e.target)) {
        setIsCreateDropdownOpen(false)
      }
    }

    // Lắng nghe sự thay đổi localStorage (khi user login ở tab khác)
    const handleStorageChange = () => {
      fetchUserProfile()
    }

    // Lắng nghe event khi profile được cập nhật
    const handleProfileUpdate = () => {
      fetchUserProfile()
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('profileUpdated', handleProfileUpdate)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('profileUpdated', handleProfileUpdate)
    }
  }, [])

  return (
    <div className="topcontrols-bar fixed top-0 left-0 w-full h-14 bg-black/90 border-b border-gray-700 px-6 py-3 flex items-center gap-5 shadow-lg z-[9997]">
      {/* Back button */}
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center"
          aria-label="Quay lại"
        >
          <img src="/return_button.png" alt="Quay lại" className="w-7 h-7" />
        </button>
      )}

      {/* Menu Icon */}
      {showMenu && (
        <button
          className="menu-btn mr-2 flex items-center justify-center"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label="Toggle sidebar"
        >
          <Menu className="w-7 h-7 text-[#ED005D]" />
        </button>
      )}

      {/* Logo */}
      {showLogo && (
        <div className="logo text-[#ED005D] font-black text-2xl tracking-wider select-none cursor-pointer mr-6 font-title">
          P-QUIZZ
        </div>
      )}

      {/* Search Bar */}
      {showSearch && (
        <div className="flex-1 relative z-[9998]">
          <SearchInput
            placeholder="Tìm kiếm bộ câu hỏi..."
            suggestions={topics}
            onSearch={async (value) => {
              if (value.trim()) {
                try {
                  // Tìm kiếm cả topic và name - kiểm tra xem value có match với topic không
                  const searchValue = value.trim()
                  
                  // Nếu value match với một topic trong suggestions, tìm theo topic
                  const isTopicSearch = topics.some(topic => 
                    topic.toLowerCase().includes(searchValue.toLowerCase())
                  )
                  
                  let response
                  if (isTopicSearch) {
                    // Tìm theo topic
                    response = await searchQuizzes(searchValue, '', 0, 10)
                    console.log('Search by topic:', searchValue, response?.data)
                  } else {
                    // Tìm theo name
                    response = await searchQuizzes('', searchValue, 0, 10)
                    console.log('Search by name:', searchValue, response?.data)
                  }
                  
                  // Navigate đến trang search với kết quả
                  navigate(`/search?q=${encodeURIComponent(searchValue)}`)
                } catch (error) {
                  console.error('Lỗi khi tìm kiếm:', error)
                  // Vẫn navigate đến trang search để hiển thị lỗi
                  navigate(`/search?q=${encodeURIComponent(value.trim())}`)
                }
              }
            }}
          />
        </div>
      )}

      {/* Create Button with Dropdown */}
      {showCreate && (
        <div className="relative ml-4" ref={createDropdownRef}>
          <button 
            onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
            className="w-12 h-12 bg-[#ED005D] hover:bg-[#d10052] text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-[#ED005D]/25"
          >
            <Plus className="w-6 h-6" />
          </button>
          {/* Create Dropdown Menu */}
          {isCreateDropdownOpen && (
            <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999]">
              <div className="py-2">
                <button 
                  onClick={() => {
                    setIsCreateDropdownOpen(false)
                    setShowCreateRoomModal(true)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                >
                  <Trello className="w-4 h-4" />
                  Tạo phòng
                </button>
                <button 
                  onClick={() => {
                    setIsCreateDropdownOpen(false)
                    navigate('/create-question-set')
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                >
                  <FileText className="w-4 h-4" />
                  Tạo bộ câu hỏi
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Dropdown */}
      <div className="relative ml-auto" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen((o) => !o)}
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-800/50 rounded-lg p-2 transition-colors duration-200"
        >
          {loading ? (
            <div className="w-10 h-10 rounded-full border-2 border-[#ED005D] bg-gray-200 animate-pulse"></div>
          ) : (
            <img
              src={
                userProfile?.avatar || 
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
              }
              alt="User Avatar"
              className="w-10 h-10 rounded-full border-2 border-[#ED005D] object-cover"
            />
          )}
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-white">
              {loading ? (
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                userProfile?.firstname || userProfile?.username || "Guest"
              )}
            </div>
            <div className="text-xs text-gray-400">
              {loading ? (
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
              ) : userProfile ? (
                userLevel ? `Level ${userLevel.level}` : "Member"
              ) : (
                "Not logged in"
              )}
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999]">
            <div className="py-2">
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                onClick={() => setIsDropdownOpen(false)}
              >
                <User className="w-4 h-4" />
                Hồ sơ
              </Link>
              <Link
                to="/settings"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                onClick={() => setIsDropdownOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Cài đặt
              </Link>
              <hr className="border-gray-200 my-1" />
              <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  // Xóa thông tin đăng nhập khỏi localStorage (nếu có)
                  localStorage.removeItem('user');
                  localStorage.removeItem('token');
                  // Reset user profile state
                  setUserProfile(null);
                  setUserLevel(null);
                  // Chuyển hướng đến trang đăng nhập
                  navigate('/login');
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-200 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          </div>
        )}
      </div>
      {showCreateRoomModal && <CreateRoom onClose={() => setShowCreateRoomModal(false)} />}
    </div>
  )
}

export default TopControls