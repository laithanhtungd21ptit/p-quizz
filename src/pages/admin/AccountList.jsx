import React, { useState, useEffect } from 'react'
import AdminSearchInput from '../../components/AdminSearchInput'

const AccountList = () => {
  // State management
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pageSize] = useState(5)
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [bannedUsers, setBannedUsers] = useState(new Set()) // Track banned user IDs

  // Lấy token từ localStorage
  const getToken = () => {
    return localStorage.getItem('token')
  }

  // API calls
  const fetchUsers = async (page = 0, size = 5) => {
    try {
      const token = getToken()
      if (!token) {
        console.error('No token found')
        return
      }

      const response = await fetch(`http://localhost:8080/admin/users?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Raw user data from backend:', data.content) // Debug log
        console.log('Sample user object keys:', Object.keys(data.content?.[0] || {})) // Debug available fields
        console.log('Sample loginDisabled:', data.content?.[0]?.loginDisabled) // Check if loginDisabled exists
        
        const usersData = data.content || []
        setUsers(usersData)
        setTotalPages(data.totalPages || 0)
        setCurrentPage(page)
        
        // If API returns loginDisabled, use it to set ban status
        if (usersData.length > 0 && usersData[0].hasOwnProperty('loginDisabled')) {
          console.log('✅ API returns loginDisabled field! Using real ban status from database.')
          const bannedUsers = usersData.filter(user => user.loginDisabled)
          const bannedUserIds = new Set(bannedUsers.map(user => user.id))
          setBannedUsers(bannedUserIds)
          console.log('👤 Users with loginDisabled=true:', bannedUsers.map(u => `${u.username}(${u.id})`))
          console.log('🔒 Banned user IDs set:', Array.from(bannedUserIds))
        } else {
          console.log('❌ API does not return loginDisabled field. Loading from localStorage cache.')
          loadBanStatusFromCache()
        }
      } else {
        console.error('Failed to fetch users')
        setMessage('Có lỗi xảy ra khi tải danh sách người dùng')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setMessage('Có lỗi xảy ra khi tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  // Load ban status from localStorage cache
  const loadBanStatusFromCache = () => {
    try {
      const cached = localStorage.getItem('bannedUsers')
      if (cached) {
        const bannedData = JSON.parse(cached)
        const bannedUserIds = new Set(Object.keys(bannedData).map(Number))
        setBannedUsers(bannedUserIds)
        console.log('📦 Loaded ban status from cache:', Array.from(bannedUserIds))
      }
    } catch (error) {
      console.error('Error loading ban status from cache:', error)
    }
  }

  // Handle edit user
  const handleEdit = async (userId) => {
    console.log('Edit user with ID:', userId)
    setMessage('Chức năng chỉnh sửa sẽ được phát triển sau!')
    setTimeout(() => setMessage(''), 3000)
  }

    // Warning user
  const handleWarning = async (userId) => {
    try {
      const token = getToken()
      if (!token) return

      const response = await fetch(`http://localhost:8080/admin/warning/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setMessage('Cảnh báo người dùng thành công!')
        setTimeout(() => setMessage(''), 3000)
        // Refresh user list
        fetchUsers(currentPage, pageSize)
      } else {
        const errorText = await response.text()
        console.error('Warning error response:', response.status, errorText)
        setMessage(`Có lỗi xảy ra khi cảnh báo người dùng: ${response.status}`)
        setTimeout(() => setMessage(''), 5000)
      }
    } catch (error) {
      console.error('Error warning user:', error)
      setMessage('Có lỗi xảy ra khi cảnh báo người dùng')
    }
  }

  // Ban user
  const handleBan = async (userId) => {
    try {
      const token = getToken()
      if (!token) return

      const response = await fetch(`http://localhost:8080/admin/ban/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setMessage('Ban người dùng thành công!')
        setTimeout(() => setMessage(''), 3000)
        // Add user to banned set
        setBannedUsers(prev => new Set([...prev, userId]))
        
        // Save to localStorage for persistence
        const user = users.find(u => u.id === userId)
        if (user) {
          const cached = JSON.parse(localStorage.getItem('bannedUsers') || '{}')
          cached[userId] = {
            userId: userId,
            username: user.username,
            bannedAt: new Date().toISOString()
          }
          localStorage.setItem('bannedUsers', JSON.stringify(cached))
        }
        
        // Refresh user list
        fetchUsers(currentPage, pageSize)
      } else {
        const errorText = await response.text()
        console.error('Ban error response:', response.status, errorText)
        setMessage(`Có lỗi xảy ra khi ban người dùng: ${response.status}`)
        setTimeout(() => setMessage(''), 5000)
      }
    } catch (error) {
      console.error('Error banning user:', error)
      setMessage('Có lỗi xảy ra khi ban người dùng')
    }
  }

  // Unban user
  const handleUnban = async (userId) => {
    try {
      const token = getToken()
      if (!token) return

      const response = await fetch(`http://localhost:8080/admin/unban/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setMessage('Mở khóa người dùng thành công!')
        setTimeout(() => setMessage(''), 3000)
        // Remove user from banned set
        setBannedUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(userId)
          return newSet
        })
        
        // Remove from localStorage
        const cached = JSON.parse(localStorage.getItem('bannedUsers') || '{}')
        delete cached[userId]
        localStorage.setItem('bannedUsers', JSON.stringify(cached))
        
        // Refresh user list
        fetchUsers(currentPage, pageSize)
      } else {
        const errorText = await response.text()
        console.error('Unban error response:', response.status, errorText)
        setMessage(`Có lỗi xảy ra khi mở khóa người dùng: ${response.status}`)
        setTimeout(() => setMessage(''), 5000)
      }
    } catch (error) {
      console.error('Error unbanning user:', error)
      setMessage('Có lỗi xảy ra khi mở khóa người dùng')
    }
  }

  // Delete user
  const handleDelete = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return
    }

    try {
      const token = getToken()
      if (!token) return

      const response = await fetch(`http://localhost:8080/admin/delete-user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setMessage('Xóa người dùng thành công!')
        setTimeout(() => setMessage(''), 3000)
        // Refresh user list
        fetchUsers(currentPage, pageSize)
      } else {
        const errorText = await response.text()
        console.error('Delete error response:', response.status, errorText)
        setMessage(`Có lỗi xảy ra khi xóa người dùng: ${response.status}`)
        setTimeout(() => setMessage(''), 5000)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setMessage('Có lỗi xảy ra khi xóa người dùng')
    }
  }

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value)
    
    if (!value.trim()) {
      setFilteredUsers(users)
      return
    }

    const filtered = users.filter(user => {
      const searchLower = value.toLowerCase()
      const firstName = (user.firstname || '').toLowerCase()
      const username = (user.username || '').toLowerCase()
      const email = (user.email || '').toLowerCase()
      
      // Tìm kiếm theo tên, username, email
      const textMatch = firstName.includes(searchLower) || 
                        username.includes(searchLower) || 
                        email.includes(searchLower)
      
      // Tìm kiếm theo thời gian (ngày/tháng/năm)
      let dateMatch = false
      if (user.createdAt) {
        const createdDate = new Date(user.createdAt)
        const dateString = createdDate.toLocaleDateString('vi-VN')
        const year = createdDate.getFullYear().toString()
        const month = (createdDate.getMonth() + 1).toString().padStart(2, '0')
        const day = createdDate.getDate().toString().padStart(2, '0')
        
        dateMatch = dateString.includes(searchLower) ||
                   year.includes(searchLower) ||
                   month.includes(searchLower) ||
                   day.includes(searchLower)
      }
      
      return textMatch || dateMatch
    })
    
    setFilteredUsers(filtered)
  }

  // Handle pagination
  const handlePageChange = (page) => {
    fetchUsers(page, pageSize)
  }

  // Load data when component mounts
  useEffect(() => {
    fetchUsers(0, pageSize)
    
    // Listen for localStorage changes (for cross-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === 'bannedUsers') {
        console.log('📢 Storage change detected, reloading ban status...')
        loadBanStatusFromCache()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Update filteredUsers when users change
  useEffect(() => {
    setFilteredUsers(users)
  }, [users])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-pink-600 text-lg">Đang tải danh sách người dùng...</div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header with image and button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <img 
            src="/public/AccountList.png" 
            alt="Account Management" 
            className="mr-4 w-3/5 h-3/5"
          />
        </div>
        <button className="bg-[#ED005D] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-[#d10052] transition-colors flex items-center gap-1.5 text-xs">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Thêm mới tài khoản
        </button>
      </div>
      
      {/* Breadcrumb */}
      <div className="text-sm text-white font-bold mb-4">
        <span className="font-bold">QUẢN LÍ TÀI KHOẢN</span>
        <span className="mx-2">{'>'}</span>
        <span className="font-bold">Danh sách tài khoản</span>
      </div>

      {/* Message */}
      {message && (
        <div className={`text-center p-3 rounded mb-4 ${message.includes('thành công') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
      
      {/* White background container */}
      <div className="p-6 bg-white min-h-screen rounded-lg">
        {/* Search */}
        <div className="mb-4 flex justify-start">
          <div className="relative w-80 z-[9998]">
            <AdminSearchInput
              placeholder="Tìm kiếm theo tên/ Tài khoản/ Email/ Thời gian"
              suggestions={[
                ...users.map(user => user.firstname || user.username).filter(Boolean),
                ...users.map(user => user.email).filter(Boolean),
                ...users.map(user => {
                  if (user.createdAt) {
                    const date = new Date(user.createdAt)
                    return date.toLocaleDateString('vi-VN')
                  }
                  return null
                }).filter(Boolean)
              ]}
              onSearch={handleSearch}
            />
          </div>
        </div>
        
        {/* Search Help Text */}
        <div className="mb-4 text-sm text-gray-600">
          <span className="font-medium">Gợi ý tìm kiếm:</span> Bạn có thể tìm kiếm theo tên, tài khoản, email hoặc thời gian tạo (VD: 2024, 12, 25/12/2024)
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-gray-700 border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="py-3 px-4">STT</th>
                <th className="py-3 px-4">Tên</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 cursor-pointer select-none">
                  Thời gian tạo 
                  <i className="fas fa-arrow-up ml-1"></i>
                </th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={user.id || index} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4 flex items-center gap-2">
                      <img 
                        src={user.avatar || "https://randomuser.me/api/portraits/women/44.jpg"} 
                        className="w-6 h-6 rounded-full" 
                        alt="Avatar"
                      />
                      {user.firstname || user.username || 'N/A'}
                    </td>
                    <td className="py-3 px-4">{user.email || 'N/A'}</td>
                    <td className="py-3 px-4">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bannedUsers.has(user.id) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {bannedUsers.has(user.id) ? 'Bị cấm' : 'Hoạt động'}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button 
                        onClick={() => handleEdit(user.id)}
                        className="text-blue-600 bg-gray-100 hover:bg-gray-200 rounded p-1 transition"
                        title="Chỉnh sửa"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      {bannedUsers.has(user.id) ? (
                        <button 
                          onClick={() => handleUnban(user.id)}
                          className="text-green-600 bg-gray-100 hover:bg-gray-200 rounded p-1 transition"
                          title="Mở khóa"
                        >
                          <i className="fas fa-unlock"></i>
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleBan(user.id)}
                          className="text-red-600 bg-gray-100 hover:bg-gray-200 rounded p-1 transition"
                          title="Ban"
                        >
                          <i className="fas fa-lock"></i>
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 bg-gray-100 hover:bg-gray-200 rounded p-1 transition"
                        title="Xóa"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    {searchTerm ? 'Không tìm thấy người dùng nào phù hợp với từ khóa tìm kiếm' : 'Không có người dùng nào'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
            Tìm thấy {filteredUsers.length} kết quả cho "{searchTerm}"
          </div>
        )}

        {/* Pagination - Only show when not searching */}
        {!searchTerm && totalPages > 1 && (
          <div className="mt-4 flex justify-end space-x-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-200 text-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &lt;
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + Math.max(0, currentPage - 2)
              if (page >= totalPages) return null
              
              return (
                <button 
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded border ${
                    page === currentPage 
                      ? 'bg-pink-500 text-white' 
                      : 'border-gray-300 hover:bg-gray-200 text-black'
                  }`}
                >
                  {page + 1}
                </button>
              )
            })}
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-200 text-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountList 