import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './profile.css'

const Profile = () => {
  const navigate = useNavigate()
  
  // State cho profile và level
  const [profile, setProfile] = useState({
    firstname: '',
    email: '',
    socialLinks: '',
    avatar: ''
  })
  
  const [level, setLevel] = useState({
    level: 0,
    exp: 0
  })
  
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState('')
  
  // Lấy token từ localStorage
  const getToken = () => {
    return localStorage.getItem('token')
  }
  
  // API calls
  const fetchProfile = async () => {
    try {
      const token = getToken()
      if (!token) {
        navigate('/login')
        return
      }
      
      const response = await fetch('http://localhost:8080/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else {
        console.error('Failed to fetch profile')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }
  
  const fetchLevel = async () => {
    try {
      const token = getToken()
      if (!token) return
      
      const response = await fetch('http://localhost:8080/user/level', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setLevel(data)
      } else {
        console.error('Failed to fetch level')
      }
    } catch (error) {
      console.error('Error fetching level:', error)
    }
  }
  
  // Load data khi component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchProfile(), fetchLevel()])
      setLoading(false)
    }
    
    loadData()
  }, [])
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setUpdating(true)
    setMessage('')
    
    try {
      const token = getToken()
      if (!token) {
        navigate('/login')
        return
      }
      
      const formData = new FormData()
      formData.append('firstname', profile.firstname)
      formData.append('email', profile.email)
      formData.append('socialLinks', profile.socialLinks)
      
      // Nếu có avatar mới được chọn
      const avatarInput = document.getElementById('avatar-input')
      if (avatarInput && avatarInput.files[0]) {
        formData.append('avatar', avatarInput.files[0])
      }
      
      const response = await fetch('http://localhost:8080/user/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      if (response.ok) {
        // Kiểm tra content-type để xử lý response phù hợp
        const contentType = response.headers.get("content-type")
        
        if (contentType && contentType.includes("application/json")) {
          // Nếu server trả về JSON (profile data mới)
          const updatedProfile = await response.json()
          setProfile(updatedProfile)
        } else {
          // Nếu server chỉ trả về text message
          const textResponse = await response.text()
          console.log('Profile update response:', textResponse)
          // Fetch lại profile data mới từ API
          await fetchProfile()
        }
        
        setMessage('Cập nhật profile thành công!')
        setTimeout(() => setMessage(''), 3000)
        
        // Dispatch custom event để thông báo TopControls cập nhật
        window.dispatchEvent(new CustomEvent('profileUpdated'))
      } else {
        const errorText = await response.text()
        console.error('Profile update error:', errorText)
        setMessage('Có lỗi xảy ra khi cập nhật profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage('Có lỗi xảy ra khi cập nhật profile')
    } finally {
      setUpdating(false)
    }
  }
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // Handle avatar change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfile(prev => ({
          ...prev,
          avatar: e.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-pink-600 text-lg">Đang tải thông tin...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Greeting + Room Code (giống Dashboard) */}
      <div className="flex items-center justify-between mb-4">
        <p className="greeting text-2xl font-semibold text-gray-100 tracking-wide m-0">
          CÀI ĐẶT TÀI KHOẢN
        </p>
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
      
      {/* Message */}
      {message && (
        <div className={`text-center p-3 rounded ${message.includes('thành công') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
      
      {/* Level Info */}
      <div className="bg-white border-4 border-pink-600 p-4 shadow-lg max-w-md mx-auto">
        <h3 className="text-pink-600 font-bold text-lg mb-2">Thông tin cấp độ</h3>
        <div className="space-y-2">
          <p><span className="font-semibold">Cấp độ:</span> {level.level}</p>
          <p><span className="font-semibold">EXP:</span> {level.exp}</p>
        </div>
      </div>
      
      {/* Two Sections Container */}
      <div className="flex flex-col gap-12 justify-center items-center">
        {/* Personal Info Section */}
        <div className="flex items-center">
          <img src="./personal-info.png" alt="Thông tin cá nhân" className="w-64 mr-24" />
          
          {/* Edit Profile Form */}
          <div className="relative">
            {/* Background layers */}
            <div className="absolute top-[10px] left-[10px] w-full h-full border-4 border-pink-600 bg-white -z-10"></div>
            <div className="absolute top-[20px] left-[20px] w-full h-full border-4 border-pink-600 bg-white -z-20"></div>
            
            <section className="bg-white border-4 border-pink-600 p-4 shadow-lg relative z-10 w-[600px]">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <img 
                    src={profile.avatar || "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/8bdfa6d4-4e32-4fb3-9bb4-fd481caffea7.png"} 
                    alt="Avatar người dùng" 
                    className="w-20 h-20 object-cover border-4 border-pink-600"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/eee6c775-effe-4ac7-8113-2f7615934a37.png';
                    }}
                  />
                  <label htmlFor="avatar-input" className="absolute bottom-0 right-0 bg-pink-600 p-1 cursor-pointer" title="Chỉnh sửa ảnh đại diện">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l5 5L20.5 9.5a2.121 2.121 0 00-3-3L9 11z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-3a4 4 0 014-4h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01-1.414 1.414l-5.414-5.414A1 1 0 0012 14.586V19a4 4 0 01-4 4H3z" />
                    </svg>
                  </label>
                  <input 
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username */}
                <div>
                  <label htmlFor="firstname" className="inline-flex items-center text-pink-600 font-semibold text-sm mb-1 select-none">
                    <span className="text-pink-600 font-bold text-base mr-2">+</span>
                    Tên người dùng
                  </label>
                  <div className="relative">
                    <input 
                      id="firstname" 
                      name="firstname" 
                      type="text" 
                      value={profile.firstname || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 border border-pink-600 text-gray-900 font-medium caret-pink-600 tracking-wide focus:ring-0 focus:outline-none focus:border-pink-600 focus:shadow-[0_0_0_2px_rgb(230_0_86_/_0.3)]"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="inline-flex items-center text-pink-600 font-semibold text-sm mb-1 select-none">
                    <span className="text-pink-600 font-bold text-base mr-2">+</span>
                    Mail
                  </label>
                  <div className="relative">
                    <input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={profile.email || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 border border-pink-600 text-gray-900 font-medium caret-pink-600 tracking-wide focus:ring-0 focus:outline-none focus:border-pink-600 focus:shadow-[0_0_0_2px_rgb(230_0_86_/_0.3)]"
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <label htmlFor="socialLinks" className="inline-flex items-center text-pink-600 font-semibold text-sm mb-1 select-none">
                    <span className="text-pink-600 font-bold text-base mr-2">+</span>
                    Liên kết mạng xã hội
                  </label>
                  <div className="relative">
                    <input 
                      id="socialLinks" 
                      name="socialLinks" 
                      type="url" 
                      value={profile.socialLinks || ''}
                      onChange={handleInputChange}
                      placeholder="https://www.facebook.com/your-profile"
                      className="w-full px-3 py-1.5 border border-pink-600 text-gray-900 font-medium caret-pink-600 tracking-wide focus:ring-0 focus:outline-none focus:border-pink-600 focus:shadow-[0_0_0_2px_rgb(230_0_86_/_0.3)]"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <button 
                    type="submit"
                    disabled={updating}
                    className="bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
        
        {/* Account & Privacy Section */}
        <div className="flex items-center">
          <img src="/privacy.png" alt="Quyền riêng tư và cá nhân" className="w-64 mr-24" />
          
          {/* Account Management Form */}
          <div className="relative">
            {/* Background layers */}
            <div className="absolute top-[10px] left-[10px] w-full h-full border-4 border-pink-600 bg-white -z-10"></div>
            <div className="absolute top-[20px] left-[20px] w-full h-full border-4 border-pink-600 bg-white -z-20"></div>
            
            <section className="bg-white border-4 border-pink-600 p-4 shadow-lg relative z-10 w-[600px] space-y-3">
              
              {/* Đổi mật khẩu */}
              <div className="flex items-center justify-between border border-pink-500 p-3">
                <div className="flex items-center">
                  <span className="text-pink-500 mr-2 text-lg font-bold select-none">+</span>
                  <span className="text-gray-800 font-medium">Đổi mật khẩu</span>
                </div>
                <button className="text-gray-500 hover:text-pink-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M15 12H9m6 0l-3 3m3-3l-3-3" />
                  </svg>
                </button>
              </div>

              {/* Kết nối tài khoản Facebook */}
              <div className="flex items-center justify-between border border-pink-500 p-3">
                <div className="flex items-center">
                  <span className="text-pink-500 mr-2 text-lg font-bold select-none">+</span>
                  <span className="text-gray-800 font-medium">Kết nối tài khoản Facebook của bạn</span>
                </div>
                <button className="flex items-center bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
                  {/* Icon Facebook */}
                  <svg className="h-4 w-4 mr-1.5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22 12a10 10 0 10-11.5 9.9v-7h-2v-2.9h2V9.8c0-2 1.2-3.1 3-3.1.9 0 1.9.2 1.9.2v2.1h-1.1c-1 0-1.3.6-1.3 1.2v1.5h2.3l-.4 2.9h-1.9v7A10 10 0 0022 12z" />
                  </svg>
                  Liên kết
                </button>
              </div>

              {/* Xóa tài khoản */}
              <div className="flex items-center justify-between border border-pink-500 p-3">
                <div className="flex items-center">
                  <span className="text-pink-500 mr-2 text-lg font-bold select-none">+</span>
                  <span className="text-gray-800 font-medium">Xóa tài khoản của bạn</span>
                </div>
                <button className="flex items-center bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700">
                  {/* Icon Thùng rác */}
                  <svg className="h-4 w-4 mr-1.5 text-white" fill="none" stroke="currentColor" strokeWidth="2"
                    viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-6 0V5a2 2 0 012-2h2a2 2 0 012 2v2" />
                  </svg>
                  Xóa tài khoản
                </button>
              </div>

            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile 