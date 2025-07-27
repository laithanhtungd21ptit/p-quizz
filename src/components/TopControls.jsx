// src/components/TopControls.jsx
import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Plus, ChevronDown, LogOut, Settings, User, Menu, Trello, FileText } from 'lucide-react'
import CreateRoom from '../pages/CreateRoom'

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
  const dropdownRef = useRef(null)
  const createDropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
      if (createDropdownRef.current && !createDropdownRef.current.contains(e.target)) {
        setIsCreateDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="topcontrols-bar fixed top-0 left-0 w-full h-14 bg-black/90 border-b border-gray-700 px-6 py-3 flex items-center gap-5 shadow-lg z-30">
      {/* Back button */}
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center"
          aria-label="Quay lại"
        >
          <img src="return_button.png" alt="Quay lại" className="w-7 h-7" />
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
        <div className="logo text-[#ED005D] font-black text-2xl tracking-wider select-none cursor-pointer mr-6">
          P-QUIZZ
        </div>
      )}

      {/* Search Bar */}
      {showSearch && (
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bộ câu hỏi..."
            className="w-full pl-12 pr-4 py-2.5 bg-white/10 border border-gray-600 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-[#ED005D] focus:ring-2 focus:ring-[#ED005D]/20 transition-all duration-300"
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
            <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
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
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
            alt="User Avatar"
            className="w-10 h-10 rounded-full border-2 border-[#ED005D]"
          />
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-white">John Doe</div>
            <div className="text-xs text-gray-400">Premium Member</div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
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
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-200 transition-colors duration-200">
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