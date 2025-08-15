// src/pages/EnterRoomCode.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const EnterRoomCode = () => {
  const [roomCode, setRoomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setError('Vui lòng nhập mã phòng')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Bạn cần đăng nhập để tham gia phòng')
        navigate('/login')
        return
      }

      // Test token trước khi join room
      console.log('Testing token validity...')
      const testResponse = await fetch('http://localhost:8080/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Token test response status:', testResponse.status)
      
      if (!testResponse.ok) {
        console.error('Token validation failed:', testResponse.status)
        if (testResponse.status === 401 || testResponse.status === 403) {
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          navigate('/login')
          return
        }
      } else {
        console.log('Token is valid, proceeding with join room...')
      }

      // Gọi API join room với query parameter
      const pinCode = roomCode.trim()
      const response = await fetch(`http://localhost:8080/rooms/join?pin=${encodeURIComponent(pinCode)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Join room response status:', response.status)
      console.log('Request details:', {
        pin: roomCode.trim(),
        token: token ? `${token.substring(0, 20)}...` : 'null'
      })

      if (response.ok) {
        // Log response headers và content type
        console.log('Response headers:', Object.fromEntries(response.headers.entries()))
        console.log('Content-Type:', response.headers.get('content-type'))
        
        let roomData
        try {
          roomData = await response.json()
          console.log('Joined room successfully:', roomData)
        } catch (parseError) {
          console.error('Lỗi parse JSON:', parseError)
          const rawText = await response.text()
          console.log('Raw response text:', rawText)
          throw new Error('Không thể parse response JSON')
        }
        console.log('Room data structure:', {
          roomId: roomData.roomId,
          id: roomData.id,
          pinCode: roomData.pinCode,
          clientSessionId: roomData.clientSessionId,
          hasClientSessionId: !!roomData.clientSessionId
        })
        
        // Log toàn bộ response để debug
        console.log('Full response data:', JSON.stringify(roomData, null, 2))
        console.log('Response keys:', Object.keys(roomData))
        console.log('clientSessionId type:', typeof roomData.clientSessionId)
        console.log('clientSessionId value:', roomData.clientSessionId)
        
        // Join room API luôn tạo participant với isHost = false
        // Nếu host muốn vào room của chính họ, họ sẽ navigate trực tiếp
        // từ create room hoặc sử dụng flow khác
        
        const roomId = roomData.roomId || roomData.id
        console.log('Join successful, room ID:', roomId)
        
        // Lưu thông tin room vào localStorage
        localStorage.setItem('currentRoom', JSON.stringify(roomData))
        localStorage.setItem('roomId', roomId.toString())
        
        // Lưu clientSessionId riêng biệt để sử dụng sau này
        if (roomData.clientSessionId) {
          localStorage.setItem('clientSessionId', roomData.clientSessionId)
          console.log('ClientSessionId saved:', roomData.clientSessionId)
        } else {
          console.warn('Không có clientSessionId trong response!')
          console.log('Toàn bộ roomData:', roomData)
        }
        
        console.log('Room data saved to localStorage:', {
          currentRoom: roomData,
          roomId: roomId,
          clientSessionId: roomData.clientSessionId
        })
        
        // Sau khi join thành công, có thể check host bằng API riêng
        // Nhưng thông thường join room là cho participants
        let isHost = false
        
        try {
          // Optional: Gọi API kiểm tra host nếu cần
          const checkHostResponse = await fetch(`http://localhost:8080/rooms/participants?roomId=${roomId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (checkHostResponse.ok) {
            const participants = await checkHostResponse.json()
            console.log('Room participants:', participants)
            
                    // Lấy thông tin user hiện tại từ token  
        const tokenPayload = JSON.parse(atob(token.split('.')[1]))
        const currentUsername = tokenPayload.sub
        
        // Check nếu user hiện tại là host (có isHost = true trong participants)
        const currentParticipant = participants.find(p => 
          p.username === currentUsername || 
          p.name === currentUsername ||
          p.firstname === currentUsername
        )
        
        isHost = currentParticipant?.isHost || false
        console.log('Current user is host:', isHost)
        
        // CẬP NHẬT: Lưu participants vào currentRoom
        const updatedRoomData = {
          ...roomData,
          participants: participants
        }
        localStorage.setItem('currentRoom', JSON.stringify(updatedRoomData))
        console.log('✅ Đã cập nhật currentRoom với participants:', updatedRoomData)
          }
        } catch (error) {
          console.warn('Could not check host status:', error)
          
          // Nếu không thể lấy participants từ API, ít nhất cũng lưu roomData cơ bản
          console.log('⚠️ Không thể lấy participants, chỉ lưu roomData cơ bản')
        }
        
        // Điều hướng dựa trên role
        if (isHost) {
          console.log('User is host, navigating to controller room')
          navigate(`/waiting-room-for-controller/${roomId}`)
        } else {
          console.log('User is participant, navigating to player room')  
          navigate(`/waiting-room-for-player/${roomId}`)
        }

      } else {
        // Xử lý các lỗi cụ thể
        let errorData = ''
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const jsonError = await response.json()
            errorData = jsonError.message || JSON.stringify(jsonError)
          } else {
            errorData = await response.text()
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError)
          errorData = 'Unknown error'
        }
        
        console.log('Join room error:', errorData)
        console.log('Response headers:', Object.fromEntries(response.headers.entries()))
        
        if (response.status === 404) {
          setError('Mã phòng không tồn tại hoặc phòng đã kết thúc')
        } else if (response.status === 400) {
          setError('Mã phòng không hợp lệ')
        } else if (response.status === 403) {
          // Nếu error message trống, có thể do user đang ở phòng khác
          if (!errorData || errorData.trim() === '') {
            setError('🚫 Không thể tham gia phòng.\n\n💡 Có thể bạn đang ở trong phòng khác. Thử refresh trang và join lại.')
          } else if (errorData.includes('đã bắt đầu')) {
            setError('Phòng đã bắt đầu, không thể tham gia')
          } else if (errorData.includes('phòng khác')) {
            setError('Bạn đang ở trong phòng khác. Vui lòng thoát phòng hiện tại trước')
          } else {
            setError(`Không có quyền tham gia phòng này: ${errorData}`)
          }
        } else {
          setError(errorData || 'Không thể tham gia phòng. Vui lòng thử lại')
        }
      }
    } catch (error) {
      console.error('Error joining room:', error)
      setError('Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoinRoom()
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: 'url(/background2.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full max-w-md" style={{ marginTop: '-10%' }}>
        {/* P-QUIZZ Logo ở giữa */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black text-[#ED005D] tracking-wider mb-2 font-title">
            P-QUIZZ
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-center">
            <div className="whitespace-pre-line">{error}</div>
            {error.includes('đang ở trong phòng khác') && (
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                🔄 Refresh trang
              </button>
            )}
          </div>
        )}

        {/* Form nhập mã phòng */}
        <div className="flex justify-center">
          <div className="group flex items-center bg-white rounded-xl shadow border px-8 py-2 w-[1300px] max-w-full transition-colors border-gray-300 group-focus-within:border-[#ED005D]">
            {/* Ô nhập mã */}
            <input
              type="text"
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value)
                setError('') // Clear error when typing
              }}
              onKeyPress={handleKeyPress}
              placeholder="Nhập mã tham gia"
              disabled={loading}
              className="flex-grow text-lg text-black outline-none bg-transparent placeholder:text-black disabled:opacity-50"
            />

            {/* Nút tham gia */}
            <button 
              onClick={handleJoinRoom}
              disabled={!roomCode.trim() || loading}
              className="ml-6 bg-[#ED005D] text-white text-lg px-8 py-1 rounded-lg hover:bg-[#d60052] disabled:bg-gray-400 disabled:cursor-not-allowed transition whitespace-nowrap min-w-[100px] flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Đang kết nối...</span>
                </div>
              ) : (
                'Tham gia'
              )}
            </button>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-base">
            Mã phòng thường có 6 ký tự
          </p>
        </div>

        {/* Back to dashboard option */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white transition-colors duration-300 text-base underline"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    </div>
  )
}

export default EnterRoomCode
