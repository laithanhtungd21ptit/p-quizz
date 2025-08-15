import React, { useState, useEffect } from 'react'
import AdminSearchInput from '../../components/AdminSearchInput'

const ViolationList = () => {
  // State management
  const [violations, setViolations] = useState([])
  const [filteredViolations, setFilteredViolations] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pageSize] = useState(5)
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [bannedUsers, setBannedUsers] = useState(new Set()) // Track banned usernames
  const [userDetails, setUserDetails] = useState(new Map()) // Cache user details for firstname display

  // Lấy token từ localStorage
  const getToken = () => {
    return localStorage.getItem('token')
  }

  // API calls
  const fetchViolations = async (page = 0, size = 5) => {
    try {
      const token = getToken()
      if (!token) {
        console.error('No token found')
        return
      }

      const response = await fetch(`http://localhost:8080/admin/violations?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Raw violation data from backend:', data.content) // Debug log
        setViolations(data.content || [])
        setTotalPages(data.totalPages || 0)
        setCurrentPage(page)
      } else {
        console.error('Failed to fetch violations')
        setMessage('Có lỗi xảy ra khi tải danh sách vi phạm')
      }
    } catch (error) {
      console.error('Error fetching violations:', error)
      setMessage('Có lỗi xảy ra khi tải danh sách vi phạm')
    } finally {
      setLoading(false)
    }
  }

  // Get user ID from username
  const getUserIdFromUsername = async (username) => {
    try {
      const token = getToken()
      if (!token) return null

      // We need to get user ID from the users list API since ViolationDTO doesn't include userId
      const response = await fetch(`http://localhost:8080/admin/users?page=0&size=1000`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const user = (data.content || []).find(u => u.username === username)
        return user?.id
      }
      return null
    } catch (error) {
      console.error('Error getting user ID:', error)
      return null
    }
  }

  // Handle warning user (from violation list)
  const handleWarning = async (username) => {
    try {
      const userId = await getUserIdFromUsername(username)
      if (!userId) {
        setMessage('Không tìm thấy user ID để cảnh báo')
        return
      }

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
        setMessage('Gửi cảnh báo thành công!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        const errorText = await response.text()
        console.error('Warning error response:', response.status, errorText)
        setMessage(`Có lỗi xảy ra khi gửi cảnh báo: ${response.status}`)
        setTimeout(() => setMessage(''), 5000)
      }
    } catch (error) {
      console.error('Error warning user:', error)
      setMessage('Có lỗi xảy ra khi gửi cảnh báo')
    }
  }

  // Load all user details for violations display
  const loadUserDetailsForViolations = async () => {
    try {
      const token = getToken()
      if (!token) return

      const response = await fetch(`http://localhost:8080/admin/users?page=0&size=1000`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const users = data.content || []
        const detailsMap = new Map()
        users.forEach(user => {
          detailsMap.set(user.username, user)
        })
        setUserDetails(detailsMap)
        console.log('👥 Loaded user details for violations:', users.length, 'users')
        
        // Update ban status now that we have userDetails
        setTimeout(() => updateBanStatusFromUserDetails(), 100)
      }
    } catch (error) {
      console.error('Error loading user details:', error)
    }
  }

  // Ban user (from violation list)
  const handleBan = async (username) => {
    try {
      const userId = await getUserIdFromUsername(username)
      if (!userId) {
        setMessage('Không tìm thấy user ID để ban')
        return
      }

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
        // Add username to banned set
        setBannedUsers(prev => new Set([...prev, username]))
        
        // Save to localStorage for persistence
        const cached = JSON.parse(localStorage.getItem('bannedUsers') || '{}')
        cached[userId] = {
          userId: userId,
          username: username,
          bannedAt: new Date().toISOString()
        }
        localStorage.setItem('bannedUsers', JSON.stringify(cached))
        
        // Refresh violation list
        fetchViolations(currentPage, pageSize)
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

  // Unban user (from violation list)
  const handleUnban = async (username) => {
    try {
      const userId = await getUserIdFromUsername(username)
      if (!userId) {
        setMessage('Không tìm thấy user ID để unban')
        return
      }

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
        // Remove username from banned set
        setBannedUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(username)
          return newSet
        })
        
        // Remove from localStorage
        const cached = JSON.parse(localStorage.getItem('bannedUsers') || '{}')
        delete cached[userId]
        localStorage.setItem('bannedUsers', JSON.stringify(cached))
        
        // Refresh violation list
        fetchViolations(currentPage, pageSize)
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

  // Delete user (from violation list)
  const handleDeleteUser = async (username) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return
    }

    try {
      const userId = await getUserIdFromUsername(username)
      if (!userId) {
        setMessage('Không tìm thấy user ID để xóa')
        return
      }

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
        // Refresh violation list
        fetchViolations(currentPage, pageSize)
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
      setFilteredViolations(violations)
      return
    }

    const filtered = violations.filter(violation => {
      const searchLower = value.toLowerCase()
      const username = (violation.username || '').toLowerCase()
      const email = (userDetails.get(violation.username)?.email || '').toLowerCase()
      const firstName = (userDetails.get(violation.username)?.firstname || '').toLowerCase()
      const severity = (violation.severity || '').toLowerCase()
      
      // Tìm kiếm theo username, email, firstName, severity
      const textMatch = username.includes(searchLower) || 
                        email.includes(searchLower) || 
                        firstName.includes(searchLower) ||
                        severity.includes(searchLower)
      
      // Tìm kiếm theo thời gian (ngày/tháng/năm)
      let dateMatch = false
      if (violation.createdAt) {
        const createdDate = new Date(violation.createdAt)
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
    
    setFilteredViolations(filtered)
  }

  // Handle pagination
  const handlePageChange = (page) => {
    fetchViolations(page, pageSize)
  }

  // Get violation severity color
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'nặng':
        return 'bg-red-100 text-red-800'
      case 'medium':
      case 'vừa':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
      case 'nhẹ':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get violation severity text
  const getSeverityText = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'Nặng'
      case 'medium':
        return 'Vừa'
      case 'low':
        return 'Nhẹ'
      default:
        return severity || 'N/A'
    }
  }

  // Load ban status from localStorage cache
  const loadBanStatusFromCache = () => {
    try {
      const cached = localStorage.getItem('bannedUsers')
      if (cached) {
        const bannedData = JSON.parse(cached)
        console.log('📦 ViolationList - Raw bannedData from localStorage:', bannedData)
        
        // Extract usernames from the cached data
        const bannedUsernames = new Set()
        Object.values(bannedData).forEach(userData => {
          if (userData.username) {
            bannedUsernames.add(userData.username)
          }
        })
        
        setBannedUsers(bannedUsernames)
        console.log('📦 ViolationList loaded ban status from cache:', Array.from(bannedUsernames))
        
        // Also check if current violations should be marked as banned
        if (userDetails.size > 0) {
          updateBanStatusFromUserDetails()
        }
      }
    } catch (error) {
      console.error('Error loading ban status from cache:', error)
    }
  }

  // Update ban status based on userDetails and localStorage
  const updateBanStatusFromUserDetails = () => {
    try {
      const cached = localStorage.getItem('bannedUsers')
      if (cached && userDetails.size > 0) {
        const bannedData = JSON.parse(cached)
        const bannedUsernames = new Set()
        
        // Check each user in userDetails against localStorage
        userDetails.forEach((user, username) => {
          // Check if this user is banned (by userId or username)
          const isBannedById = bannedData[user.id]
          const isBannedByName = Object.values(bannedData).some(data => data.username === username)
          
          if (isBannedById || isBannedByName) {
            bannedUsernames.add(username)
          }
        })
        
        setBannedUsers(bannedUsernames)
        console.log('🔄 ViolationList updated ban status from userDetails:', Array.from(bannedUsernames))
      }
    } catch (error) {
      console.error('Error updating ban status from userDetails:', error)
    }
  }

  // Load data when component mounts
  useEffect(() => {
    fetchViolations(0, pageSize)
    loadUserDetailsForViolations()
    loadBanStatusFromCache()
    
    // Listen for localStorage changes (for cross-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === 'bannedUsers') {
        console.log('📢 ViolationList storage change detected, reloading ban status...')
        loadBanStatusFromCache()
        // Also update from userDetails if available
        if (userDetails.size > 0) {
          setTimeout(() => updateBanStatusFromUserDetails(), 100)
        }
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Update filteredViolations when violations or userDetails change
  useEffect(() => {
    setFilteredViolations(violations)
  }, [violations])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-pink-600 text-lg">Đang tải danh sách vi phạm...</div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header with image and button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <img 
            src="/public/ViolationList.png" 
            alt="Violation Management" 
            className="mr-4 w-3/5 h-3/5"
          />
        </div>
        <button className="bg-[#ED005D] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-[#d10052] transition-colors flex items-center gap-1.5 text-xs">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Thêm mới vi phạm
        </button>
      </div>
      
      {/* Breadcrumb */}
      <div className="text-sm text-white font-bold mb-4 font-content">
        <span className="font-bold">QUẢN LÍ TÀI KHOẢN</span>
        <span className="mx-2">{'>'}</span>
        <span className="font-bold">Danh sách vi phạm</span>
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
              placeholder="Tìm kiếm theo tên/ Tài khoản/ Email/ Mức độ/ Thời gian"
              suggestions={[
                ...violations.map(v => v.username).filter(Boolean),
                ...Array.from(userDetails.values()).map(u => u.firstname).filter(Boolean),
                ...Array.from(userDetails.values()).map(u => u.email).filter(Boolean),
                'Nặng', 'Vừa', 'Nhẹ',
                ...violations.map(v => {
                  if (v.createdAt) {
                    const date = new Date(v.createdAt)
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
          <span className="font-medium">Gợi ý tìm kiếm:</span> Bạn có thể tìm kiếm theo tên, tài khoản, email, mức độ vi phạm hoặc thời gian tạo (VD: 2024, 12, 25/12/2024)
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-gray-700 border border-gray-200 rounded-lg font-content">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="py-3 px-4">STT</th>
                <th className="py-3 px-4">Tên</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 cursor-pointer select-none">
                  Thời gian tạo 
                  <i className="fas fa-arrow-up ml-1"></i>
                </th>

                <th className="py-3 px-4">Mức độ vi phạm</th>
                <th className="py-3 px-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredViolations.length > 0 ? (
                filteredViolations.map((violation, index) => (
                  <tr key={violation.id || index} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4 flex items-center gap-2">
                      <img 
                        src={violation.user?.avatar || "https://randomuser.me/api/portraits/women/44.jpg"} 
                        className="w-6 h-6 rounded-full" 
                        alt="Avatar"
                      />
                      {userDetails.get(violation.username)?.firstname || violation.username || 'N/A'}
                    </td>
                    <td className="py-3 px-4">{userDetails.get(violation.username)?.email || violation.email || 'N/A'}</td>
                    <td className="py-3 px-4">
                      {violation.createdAt ? new Date(violation.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(violation.severity)}`}>
                        {getSeverityText(violation.severity)}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button 
                        onClick={() => handleWarning(violation.username)}
                        className="text-yellow-600 bg-gray-100 hover:bg-gray-200 rounded p-1 transition"
                        title="Cảnh báo"
                      >
                        <i className="fas fa-exclamation-triangle"></i>
                      </button>
                      {bannedUsers.has(violation.username) ? (
                        <button 
                          onClick={() => handleUnban(violation.username)}
                          className="text-green-600 bg-gray-100 hover:bg-gray-200 rounded p-1 transition"
                          title="Mở khóa"
                        >
                          <i className="fas fa-unlock"></i>
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleBan(violation.username)}
                          className="text-red-600 bg-gray-100 hover:bg-gray-200 rounded p-1 transition"
                          title="Ban người dùng"
                        >
                          <i className="fas fa-lock"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    {searchTerm ? 'Không tìm thấy vi phạm nào phù hợp với từ khóa tìm kiếm' : 'Không có vi phạm nào'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
            Tìm thấy {filteredViolations.length} kết quả cho "{searchTerm}"
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

export default ViolationList 