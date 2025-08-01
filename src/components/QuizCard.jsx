import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit, Star, MoreHorizontal, Users, FileText, Settings, Trash2, Globe } from 'lucide-react'

const QuizCard = ({ 
  title = "TIẾNG NHẬT",
  subtitle = "Từ vựng Mina no Nihongo bài 25",
  questionCount = "10",
  playCount = "2",
  author = "Bạn",
  authorAvatar = "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/e6aad9ee-7272-4c1d-a2a9-a273e9bdda28.png"
}) => {
  const navigate = useNavigate()
  const [showPopup, setShowPopup] = useState(false)
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [accessLevel, setAccessLevel] = useState('private') // 'private' or 'public'
  const popupRef = useRef(null)
  const modalRef = useRef(null)
  const deleteModalRef = useRef(null)

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowAccessModal(false)
      }
      if (deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
        setShowDeleteModal(false)
      }
    }

    if (showAccessModal || showDeleteModal) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAccessModal, showDeleteModal])

  const handleEditClick = (e) => {
    e.stopPropagation()
    navigate('/edit')
  }

  const handleMoreClick = (e) => {
    e.stopPropagation()
    setShowPopup(!showPopup)
  }

  const handleEditAccess = (e) => {
    e.stopPropagation()
    setShowPopup(false)
    setShowAccessModal(true)
  }

  const handleDeleteQuiz = (e) => {
    e.stopPropagation()
    setShowPopup(false)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    // TODO: Implement delete quiz functionality
    console.log('Delete quiz confirmed')
    setShowDeleteModal(false)
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
  }

  const handleAccessChange = (level) => {
    setAccessLevel(level)
  }

  const handleSaveAccess = () => {
    // TODO: Save access level to backend
    console.log('Access level changed to:', accessLevel)
    setShowAccessModal(false)
  }

  const handleCancelAccess = () => {
    setShowAccessModal(false)
  }
  return (
    <>
      <div className="max-w-xl w-full bg-white rounded-lg shadow-lg flex gap-6 p-6 relative mx-auto mt-8 border-2 border-[#ED005D]"
           role="region" aria-label={`Thông tin bài quiz P-Quizz chủ đề ${title}`}>

        {/* Left block */}
        <div className="flex-shrink-0 w-40 h-28 bg-gray-300 rounded-md relative flex flex-col justify-center items-center select-none">
          <span className="text-4xl font-extrabold text-[#ED005D] mb-1" style={{fontFamily: 'Poppins, sans-serif'}}>P-QUIZZ</span>
          <div className="bg-[#ED005D] text-white rounded-full text-xs px-3 py-1 flex items-center gap-1 select-none">
            <FileText className="h-4 w-4" />
            {questionCount} câu hỏi
          </div>
        </div>

        {/* Right content block */}
        <div className="flex-1 flex flex-col justify-between leading-relaxed select-text">

          {/* Title and icons */}
          <div className="flex justify-between items-center gap-3 flex-wrap">
            <h2 className="text-lg font-semibold text-gray-900">
              CHỦ ĐỀ: <span className="uppercase">{title}</span>
            </h2>
            <div className="flex items-center gap-4 text-gray-600">
              {/* Edit */}
              <button 
                onClick={handleEditClick}
                aria-label="Chỉnh sửa bài quiz" 
                className="hover:text-[#ED005D] focus-visible:outline-[#ED005D] transition-colors"
              >
                <Edit className="h-5 w-5" />
              </button>
              {/* Star */}
              <button aria-label="Yêu thích bài quiz" className="hover:text-[#ED005D] focus-visible:outline-[#ED005D]">
                <Star className="h-5 w-5" />
              </button>
              {/* More */}
              <div className="relative" ref={popupRef}>
                <button 
                  onClick={handleMoreClick}
                  aria-label="Thêm tùy chọn" 
                  className="hover:text-[#ED005D] focus-visible:outline-[#ED005D] transition-colors"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
                
                {/* Popup Menu */}
                {showPopup && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <button
                        onClick={handleEditAccess}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Chỉnh sửa quyền truy cập
                      </button>
                      <button
                        onClick={handleDeleteQuiz}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa bộ câu hỏi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subtitle and author */}
          <p className="mt-1 text-gray-700 font-normal text-base tracking-wide">{subtitle}</p>
          <div className="flex items-center mt-2 gap-2 text-gray-600 text-sm">
            <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-300 flex justify-center items-center bg-gray-100">
              <img 
                src={authorAvatar}
                alt={`Ảnh đại diện người dùng ${author}`}
                className="object-cover w-full h-full" 
                onError={(e) => e.target.style.display = 'none'} 
              />
            </div>
            <span>{author}</span>
          </div>

          {/* Buttons and stats */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 mt-3">
            <button type="button"
              className="bg-[#ED005D] text-white text-xs font-semibold px-4 py-1 rounded-full hover:bg-[#d10052] focus-visible:outline-[#ED005D] focus-visible:outline-2">
              Bắt đầu quiz trực tiếp
            </button>

            {/* Số lượt chơi + icon */}
            <div className="flex items-center gap-2">
              <div className="bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded-full select-none">
                {playCount} lượt chơi
              </div>
              {accessLevel === 'private' ? (
                <Users className="h-4 w-4 text-gray-600" />
              ) : (
                <Globe className="h-4 w-4 text-gray-600" />
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Access Level Modal */}
      {showAccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg p-6 w-96 max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Chỉnh sửa quyền truy cập
            </h3>
            
            <div className="space-y-3 mb-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="accessLevel"
                  value="private"
                  checked={accessLevel === 'private'}
                  onChange={() => handleAccessChange('private')}
                  className="w-4 h-4 text-[#ED005D] border-gray-300 focus:ring-[#ED005D]"
                />
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">Chỉ mình tôi</span>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="accessLevel"
                  value="public"
                  checked={accessLevel === 'public'}
                  onChange={() => handleAccessChange('public')}
                  className="w-4 h-4 text-[#ED005D] border-gray-300 focus:ring-[#ED005D]"
                />
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">Với mọi người</span>
                </div>
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelAccess}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveAccess}
                className="px-4 py-2 bg-[#ED005D] text-white rounded-lg hover:bg-[#d10052] transition-colors"
              >
                Lưu
              </button>
            </div>
          </div>
                 </div>
       )}

       {/* Delete Confirmation Modal */}
       {showDeleteModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
           <div 
             ref={deleteModalRef}
             className="max-w-md w-full bg-white rounded-3xl relative shadow-2xl ring-8 ring-pink-600 ring-opacity-90 px-8 pt-10 pb-8"
           >
             {/* Close icon top right */}
             <button 
               aria-label="Close modal" 
               className="absolute top-3 right-4 text-gray-800 hover:text-gray-600 focus:outline-none" 
               onClick={handleCancelDelete}
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
             {/* Trash icon centered */}
             <div className="mb-6 flex justify-center">
               {/* Heroicons Trash icon */}
               <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
               </svg>
             </div>
             {/* Text content */}
             <p className="text-center font-sans font-medium text-gray-800 text-lg leading-relaxed select-none">
               Xác nhận xóa bộ<br />câu hỏi đã tạo
             </p> 
             {/* Buttons */}
             <div className="mt-8 flex justify-center gap-4">
               <button 
                 className="px-6 py-2 rounded-md bg-pink-600 text-white font-sans text-sm hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-400 transition" 
                 onClick={handleConfirmDelete}
               >
                 Xác nhận
               </button>
               <button 
                 className="px-6 py-2 rounded-md bg-gray-300 text-gray-600 font-sans text-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition" 
                 onClick={handleCancelDelete}
               >
                 Hủy
               </button>
             </div>
           </div>
         </div>
       )}
     </>
   )
 }

export default QuizCard 