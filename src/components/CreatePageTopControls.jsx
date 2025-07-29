import React, { useState, useEffect } from 'react'
import { ArrowLeft, Settings, Eye, Save, SkipForward } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import QuizSettingsModal from './QuizSettingsModal'

const CreatePageTopControls = ({ 
  title = "Bộ câu hỏi không có tiêu đề", 
  onTitleChange, 
  onSave,
  onPreview,
  showPreview = true 
}) => {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [tempTitle, setTempTitle] = useState(title)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Update tempTitle when title prop changes
  useEffect(() => {
    setTempTitle(title)
  }, [title])

  const handleBack = () => {
    navigate(-1)
  }

  const handleTitleClick = () => {
    setIsEditing(true)
  }

  const handleTitleBlur = () => {
    setIsEditing(false)
    if (onTitleChange) {
      onTitleChange(tempTitle)
    }
  }

  const handleTitleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTitleBlur()
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
    // You can pass this data up to parent component if needed
    if (onTitleChange && settingsData.quizName) {
      onTitleChange(settingsData.quizName)
      // Also update the tempTitle to keep it in sync
      setTempTitle(settingsData.quizName)
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

        {/* Ô chọn/nhập chủ đề */}
        <div className="w-60">
          <input
            type="text"
            placeholder="Chọn/nhập chủ đề"
            className="bg-gray-200 rounded-[10px] p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#ED005D] text-gray-800"
            list="topics"
          />
          <datalist id="topics">
            <option value="Toán học" />
            <option value="Văn học" />
            <option value="Tiếng Anh" />
            <option value="Vật lý" />
            <option value="Hóa học" />
            <option value="Sinh học" />
            <option value="Lịch sử" />
            <option value="Địa lý" />
            <option value="GDCD" />
            <option value="Khác" />
          </datalist>
        </div>

        {/* Textbox tiêu đề */}
        <div className="w-80">
          {isEditing ? (
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyPress={handleTitleKeyPress}
              className="bg-gray-200 rounded-[10px] p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#ED005D] text-gray-800"
              autoFocus
            />
          ) : (
            <button
              onClick={handleTitleClick}
              className="bg-gray-200 rounded-[10px] p-2 w-full text-left text-gray-800 hover:bg-gray-300 transition-colors duration-200"
            >
              {title || "Bộ câu hỏi không có tiêu đề"}
            </button>
          )}
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
        <button 
          onClick={onPreview}
          className="bg-transparent text-white flex items-center space-x-1 hover:bg-gray-800/50 rounded-lg p-2 transition-colors duration-200"
        >
          <SkipForward className="w-5 h-5 text-gray-400" />
          <span className="text-gray-400">Xem trước</span>
        </button>

        {/* Nút lưu thay đổi */}
        <button 
          onClick={handleSave}
          className="bg-[#ED005D] hover:bg-[#d10052] text-white rounded-[10px] px-4 py-2 font-medium transition-all duration-300 shadow-lg hover:shadow-[#ED005D]/25"
        >
          <div className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Lưu thay đổi
          </div>
        </button>
      </div>

      {/* Settings Modal */}
      <QuizSettingsModal
        isOpen={isSettingsOpen}
        onClose={handleSettingsClose}
        onSave={handleSettingsSave}
        initialData={{
          quizName: title,
          topic: 'khac',
          customTopic: '',
          visibility: 'public'
        }}
      />
    </div>
  )
}

export default CreatePageTopControls 