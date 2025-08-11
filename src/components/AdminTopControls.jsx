import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AdminTopControls = ({ sidebarCollapsed, setSidebarCollapsed }) => {
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [adminInfo, setAdminInfo] = useState({
    username: 'Admin',
    email: 'admin@example.com',
    avatar: null
  })

  // Get admin info from JWT token
  const getAdminInfoFromToken = () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        )
        const decodedToken = JSON.parse(jsonPayload)
        
        console.log('👤 Decoded admin token:', decodedToken)
        
        // Update admin info from token
        setAdminInfo({
          username: decodedToken.sub || decodedToken.username || 'Admin',
          email: decodedToken.email || decodedToken.sub || 'admin@example.com'
        })
      }
    } catch (error) {
      console.error('Error decoding token:', error)
    }
  }

  // Fetch admin profile from API
  const fetchAdminProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const response = await fetch('http://localhost:8080/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const profile = await response.json()
        console.log('👤 Admin profile from API:', profile)
        setAdminInfo({
          username: profile.firstname || profile.username || 'Admin',
          email: profile.email && profile.email !== 'null' ? profile.email : 'admin@example.com',
          avatar: profile.avatar && profile.avatar !== 'null' ? profile.avatar : null
        })
      } else {
        console.log('❌ Failed to fetch admin profile, using token data')
        getAdminInfoFromToken()
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error)
      getAdminInfoFromToken()
    }
  }

  // Load admin info when component mounts
  useEffect(() => {
    fetchAdminProfile()
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-black border-b border-white/10 z-50 flex items-center justify-between px-4">
      {/* Left side - Menu button and logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="text-[#ED005D] font-bold text-lg font-title">P-QUIZZ</div>
      </div>

      {/* Right side - User menu */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors relative">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <img
              className="w-8 h-8 rounded-full"
              src={adminInfo.avatar || "/public/avatar/avatar_1.png"}
              alt="Admin"
              onError={(e) => {
                e.target.src = "/public/avatar/avatar_1.png"
              }}
            />
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium">{adminInfo.username}</div>
              <div className="text-xs text-gray-300">Quản trị viên</div>
            </div>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

                     {/* Dropdown menu */}
           {showUserMenu && (
             <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
               <div className="px-4 py-2 border-b border-gray-200">
                 <div className="text-sm font-medium text-gray-900">{adminInfo.username}</div>
                 <div className="text-xs text-gray-500">{adminInfo.email}</div>
               </div>
               
               <button
                 onClick={() => {
                   setShowUserMenu(false)
                   navigate('/admin/profile')
                 }}
                 className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
               >
                 Hồ sơ
               </button>
               
               <button
                 onClick={() => {
                   setShowUserMenu(false)
                   navigate('/admin/settings')
                 }}
                 className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
               >
                 Cài đặt
               </button>
               
               <div className="border-t border-gray-200 mt-2 pt-2">
                 <button
                   onClick={() => {
                     setShowUserMenu(false)
                     // Clear auth data
                     localStorage.removeItem('token')
                     localStorage.removeItem('user')
                     localStorage.removeItem('bannedUsers')
                     navigate('/login')
                   }}
                   className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                 >
                   Đăng xuất
                 </button>
               </div>
             </div>
           )}
        </div>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  )
}

export default AdminTopControls 