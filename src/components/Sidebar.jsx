import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  BookOpen, 
  Heart, 
  Clock, 
  User, 
  ChevronDown,
  Plus,
  Star,
  Settings
} from 'lucide-react'

const Sidebar = ({ isCollapsed }) => {
  const [libraryExpanded, setLibraryExpanded] = useState(false)
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const menuItems = [
    { icon: Home, label: 'Trang chủ', path: '/' },
    { 
      icon: BookOpen, 
      label: 'Thư viện', 
      path: null,
      hasSubmenu: true,
      submenu: [
        { label: 'Bộ câu hỏi đã tạo', path: '/created-sets' },
        { label: 'Bộ câu hỏi đã lưu', path: '/saved-sets' }
      ]
    },
    { icon: Clock, label: 'Lịch sử chơi', path: '/history' },
    { icon: User, label: 'Hồ sơ', path: '/profile' },
  ]

  return (
    <aside className={`sidebar fixed left-0 h-full bg-gray-900 border-r border-gray-700 p-6 flex flex-col gap-10 shadow-[inset_4px_0px_18px_2px_#ED005D] z-30 ${isCollapsed ? 'sidebar-collapsed' : ''}`}
      style={{ width: isCollapsed ? '72px' : '288px', transition: 'width 0.2s cubic-bezier(.4,0,.2,1)', background: '#18181c' }}>
      {/* Logo đã chuyển lên TopControls */}
      <nav className="flex flex-col gap-4">
        {menuItems.map((item, index) => (
          <div key={index}>
            {item.hasSubmenu ? (
              isCollapsed ? (
                <button className="w-full flex items-center justify-center py-2" aria-label={item.label}>
                  <item.icon className="w-6 h-6 stroke-2" />
                </button>
              ) : (
                <div>
                  <button
                    onClick={() => setLibraryExpanded(!libraryExpanded)}
                    className={`w-full flex items-center gap-3 font-medium cursor-pointer text-gray-300 text-sm transition-colors duration-300 hover:text-[#ED005D] ${
                      libraryExpanded ? 'text-[#ED005D]' : ''
                    }`}
                    aria-expanded={libraryExpanded}
                  >
                    <item.icon className="w-5 h-5 stroke-2" />
                    {item.label}
                    <ChevronDown 
                      className={`w-4 h-4 ml-auto transition-transform duration-300 ${
                        libraryExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div className={`pl-9 mt-2 flex flex-col gap-2 text-sm font-normal text-gray-400 ${
                    libraryExpanded ? 'block' : 'hidden'
                  }`}>
                    {item.submenu.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        to={subItem.path}
                        className={`hover:text-[#ED005D] hover:underline transition-colors duration-300 ${
                          isActive(subItem.path) ? 'text-[#ED005D]' : ''
                        }`}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <Link
                to={item.path}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} font-medium cursor-pointer text-sm transition-colors duration-300 hover:text-[#ED005D] ${
                  isActive(item.path) ? 'text-[#ED005D]' : 'text-gray-300'
                } py-2`}
              >
                <item.icon className="w-6 h-6 stroke-2" />
                {!isCollapsed && item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
      <div className="mt-auto">
        <Link
          to="/settings"
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} font-medium cursor-pointer text-sm transition-colors duration-300 hover:text-[#ED005D] ${
            isActive('/settings') ? 'text-[#ED005D]' : 'text-gray-300'
          } py-2`}
        >
          <Settings className="w-6 h-6 stroke-2" />
          {!isCollapsed && 'Cài đặt'}
        </Link>
      </div>
    </aside>
  )
}

export default Sidebar 