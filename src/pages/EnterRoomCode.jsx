// src/pages/EnterRoomCode.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const EnterRoomCode = () => {
  const [roomCode, setRoomCode] = useState('')
  const navigate = useNavigate()

  const handleJoinRoom = () => {
    if (roomCode.trim()) {
      // Xử lý logic tham gia phòng ở đây
      console.log('Joining room with code:', roomCode)
      // Có thể chuyển hướng đến trang phòng chơi
      // navigate('/play-room')
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
          <h1 className="text-6xl font-black text-[#ED005D] tracking-wider mb-2">
            P-QUIZZ
          </h1>
        </div>

        {/* Form nhập mã phòng */}
        <div className="flex justify-center">
          <div className="group flex items-center bg-white rounded-xl shadow border px-8 py-2 w-[1300px] max-w-full transition-colors border-gray-300 group-focus-within:border-[#ED005D]">
            {/* Ô nhập mã */}
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập mã tham gia"
              className="flex-grow text-lg text-black outline-none bg-transparent placeholder:text-black"
            />

            {/* Nút tham gia */}
            <button 
              onClick={handleJoinRoom}
              disabled={!roomCode.trim()}
              className="ml-6 bg-[#ED005D] text-white text-lg px-8 py-1 rounded-lg hover:bg-[#d60052] disabled:bg-gray-400 disabled:cursor-not-allowed transition whitespace-nowrap"
            >
              Tham gia
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
