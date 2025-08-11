// src/components/HeaderForController.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { deleteRoom } from '../services/api'

const HeaderForController = () => {
  const navigate = useNavigate()
  const { roomId } = useParams()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmPopup, setShowConfirmPopup] = useState(false)
  const [participants, setParticipants] = useState([])
  const [currentUser, setCurrentUser] = useState(null)

  // Lấy thông tin user hiện tại và participants để kiểm tra quyền
  useEffect(() => {
    const fetchUserAndParticipants = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        // Lấy thông tin user hiện tại
        const userResponse = await fetch('http://localhost:8080/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setCurrentUser(userData)
        }

        // Lấy danh sách participants
        const participantsResponse = await fetch(`http://localhost:8080/rooms/participants?roomId=${roomId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (participantsResponse.ok) {
          const participantsData = await participantsResponse.json()
          setParticipants(participantsData)
        }
      } catch (error) {
        console.error('Error fetching user and participants:', error)
      }
    }

    if (roomId) {
      fetchUserAndParticipants()
    }
  }, [roomId])

  // Kiểm tra xem user hiện tại có phải là host không
  const isCurrentUserHost = () => {
    if (!currentUser || !participants.length) return false
    
    // Tìm participant có username trùng với user hiện tại và isHost = true
    return participants.some(participant => 
      (participant.username === currentUser.username || participant.userId === currentUser.id) && 
      participant.isHost === true
    )
  }

  const handleEndRoom = async () => {
    if (!roomId) {
      console.error('Không có roomId')
      return
    }

    // Kiểm tra quyền host
    if (!isCurrentUserHost()) {
      alert('Chỉ host mới có thể kết thúc phòng!')
      return
    }

    // Hiển thị popup xác nhận
    setShowConfirmPopup(true)
  }

  const confirmDeleteRoom = async () => {
    try {
      setIsDeleting(true)
      setShowConfirmPopup(false)
      await deleteRoom(roomId)
      console.log('Phòng đã được xóa thành công')
      
      // Quay về trang chủ (dashboard)
      navigate('/dashboard')
    } catch (error) {
      console.error('Lỗi khi xóa phòng:', error)
      
      // Hiển thị thông báo lỗi
      if (error.response?.status === 403) {
        alert('Bạn không có quyền xóa phòng này')
      } else if (error.response?.status === 404) {
        alert('Phòng không tồn tại')
      } else {
        alert('Có lỗi xảy ra khi xóa phòng. Vui lòng thử lại.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDeleteRoom = () => {
    setShowConfirmPopup(false)
  }

  return (
    <>
      <div className="topcontrols-bar fixed top-0 left-0 w-full h-14 bg-black/90 border-b border-gray-700 px-6 py-3 flex items-center gap-5 shadow-lg z-30">
        {/* Nút quay lại */}
        <button
          onClick={() => navigate(-1)}
          aria-label="Quay lại"
          className="flex items-center justify-center"
        >
          <img src="/return_button.png" alt="Quay lại" className="w-7 h-7" />
        </button>

        {/* Nút kết thúc */}
        <button
          onClick={handleEndRoom}
          disabled={isDeleting}
          className="ml-auto px-4 py-2 bg-[var(--pink)] rounded-lg text-white text-sm font-content font-semibold hover:shadow-lg hover:scale-105 transition-transform ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? 'Đang xóa...' : 'Kết thúc'}
        </button>
      </div>

      {/* Popup xác nhận xóa phòng */}
      {showConfirmPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              {/* Icon cảnh báo */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              {/* Tiêu đề */}
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Xác nhận kết thúc phòng
              </h3>
              
              {/* Nội dung */}
              <p className="text-sm text-gray-500 mb-6">
                Bạn có chắc chắn muốn kết thúc phòng này? Hành động này không thể hoàn tác.
              </p>
              
              {/* Nút hành động */}
              <div className="flex space-x-3">
                <button
                  onClick={cancelDeleteRoom}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--pink)]"
                >
                  Hủy
                </button>
                                 <button
                   onClick={confirmDeleteRoom}
                   disabled={isDeleting}
                   className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-[var(--pink)] hover:bg-[var(--pink)]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--pink)] disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isDeleting ? 'Đang xóa...' : 'Kết thúc phòng'}
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default HeaderForController