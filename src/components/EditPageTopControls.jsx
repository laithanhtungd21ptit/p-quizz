import React, { useState } from 'react'
import { ArrowLeft, Settings, Save, SkipForward } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import QuizSettingsModal from './QuizSettingsModal'

const EditPageTopControls = ({ 
  title = "Bộ câu hỏi không có tiêu đề", 
  onTitleChange, 
  onSave,
  onSaveDraft, // Thêm prop để lưu bản nháp
  onPreview,
  showPreview = true,
  onTopicChange,
  onVisibilityChange,
  onImageUrlChange,
  onBack,
  initialTopic = '',
  initialVisibility = true,
  initialImageUrl = '',
  isSaving = false
}) => {
  const navigate = useNavigate()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave()
    }
  }

  const handleSettingsClick = () => {
    setIsSettingsOpen(true)
  }

  const handleSettingsClose = () => {
    setIsSettingsOpen(false)
  }

  const handleSettingsSave = (settingsData) => {
    // Handle settings save logic here
    console.log('Settings saved:', settingsData)
    
    // Cập nhật title nếu có
    if (onTitleChange && settingsData.quizName) {
      onTitleChange(settingsData.quizName)
    }
    
    // Cập nhật topic
    if (onTopicChange) {
      let finalTopic = ''
      if (settingsData.topic === 'khac') {
        finalTopic = settingsData.customTopic || ''
      } else {
        finalTopic = settingsData.topic
      }
      onTopicChange(finalTopic)
    }
    
    // Cập nhật visibility
    if (onVisibilityChange) {
      onVisibilityChange(settingsData.visibility === 'public')
    }

    // Cập nhật image URL
    if (onImageUrlChange && settingsData.coverImage) {
      onImageUrlChange(settingsData.coverImage)
    }
  }

  return (
    <div className="fixed top-0 left-0 w-full h-14 bg-black/90 border-b border-gray-700 px-6 py-3 flex items-center justify-between shadow-lg z-30">
      {/* Left side - Back button, topic, and title */}
      <div className="flex items-center space-x-4">
        {/* Nút trở lại */}
        <button 
          onClick={handleBack}
          className="bg-white rounded-[10px] p-2 shadow-md hover:bg-gray-100 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </button>

        {/* Hiển thị chủ đề (chỉ đọc) */}
        <div className="w-60">
          <div className="bg-gray-200 rounded-[10px] p-2 w-full text-gray-800">
            {initialTopic || "Chưa chọn chủ đề"}
          </div>
        </div>

        {/* Hiển thị tiêu đề (chỉ đọc) */}
        <div className="w-80">
          <div className="bg-gray-200 rounded-[10px] p-2 w-full text-gray-800">
            {title || "Bộ câu hỏi không có tiêu đề"}
          </div>
        </div>
      </div>

      {/* Right side - Action buttons */}
      <div className="flex items-center space-x-4">
        {/* Nút cài đặt */}
        <button 
          onClick={handleSettingsClick}
          className="bg-transparent text-white flex items-center space-x-1 hover:bg-gray-800/50 rounded-lg p-2 transition-colors duration-200"
        >
          <Settings className="w-5 h-5 text-gray-400" />
          <span className="text-gray-400">Cài đặt</span>
        </button>



        {/* Nút xem trước */}
        {showPreview && (
          <button 
            onClick={onPreview}
            className="bg-transparent text-white flex items-center space-x-1 hover:bg-gray-800/50 rounded-lg p-2 transition-colors duration-200"
          >
            <SkipForward className="w-5 h-5" />
            <span className="text-gray-400">Xem trước</span>
          </button>
        )}



        {/* Nút lưu */}
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`bg-[#ED005D] hover:bg-[#d10052] text-white rounded-[10px] px-4 py-2 font-medium transition-all duration-300 shadow-lg hover:shadow-[#ED005D]/25 ${
            isSaving ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className="flex items-center gap-2">
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu</span>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Settings Modal */}
      <QuizSettingsModal
        isOpen={isSettingsOpen}
        onClose={handleSettingsClose}
        onSave={handleSettingsSave}
        availableTopics={[
          "Toán học",
          "Văn học", 
          "Tiếng Anh",
          "Vật lý",
          "Hóa học",
          "Sinh học",
          "Lịch sử",
          "Địa lý",
          "GDCD",
          "Khác"
        ]}
        initialData={{
          quizName: title,
          topic: initialTopic || 'khac',
          customTopic: initialTopic || '',
          visibility: initialVisibility ? 'public' : 'private',
          coverImage: initialImageUrl || null
        }}
      />
    </div>
  )
}

export default EditPageTopControls
