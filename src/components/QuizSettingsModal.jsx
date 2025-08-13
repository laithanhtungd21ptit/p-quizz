import React, { useState, useEffect } from 'react'
import { X, Plus, Eye, Lock } from 'lucide-react'

const QuizSettingsModal = ({ isOpen, onClose, onSave, initialData = {}, availableTopics = [] }) => {
  // Danh sách topics mặc định nếu không có availableTopics
  const defaultTopics = [
    "Toán học",
    "Văn học", 
    "Tiếng Anh",
    "Vật lý",
    "Hóa học",
    "Sinh học",
    "Lịch sử",
    "Địa lý",
    "GDCD"
  ]
  
  const topics = availableTopics.length > 0 ? availableTopics : defaultTopics

  const [formData, setFormData] = useState({
    quizName: initialData.quizName || 'Bộ câu hỏi không có tiêu đề',
    topic: initialData.topic || 'khac',
    customTopic: initialData.customTopic || '',
    visibility: initialData.visibility || 'public',
    description: initialData.description || '',
    coverImage: null
  })

  // Cập nhật formData khi initialData thay đổi
  useEffect(() => {
    console.log('QuizSettingsModal: initialData changed:', initialData)
    
    // Xác định topic và customTopic dựa trên initialData
    let topicValue = 'khac'
    let customTopicValue = ''
    
    if (initialData.topic && initialData.topic !== 'khac') {
      // Kiểm tra xem topic có trong danh sách topics có sẵn không
      if (topics.includes(initialData.topic)) {
        topicValue = initialData.topic
      } else {
        topicValue = 'khac'
        customTopicValue = initialData.topic
      }
    } else if (initialData.customTopic) {
      customTopicValue = initialData.customTopic
    }
    
    const newFormData = {
      quizName: initialData.quizName || 'Bộ câu hỏi không có tiêu đề',
      topic: topicValue,
      customTopic: customTopicValue,
      visibility: initialData.visibility || 'public',
      description: initialData.description || '',
      coverImage: (() => {
        // Xử lý coverImage từ initialData
        if (initialData.coverImage instanceof File) {
          console.log('QuizSettingsModal: coverImage is File object, will handle in form');
          return initialData.coverImage; // Giữ nguyên File object để user có thể thay đổi
        } else if (typeof initialData.coverImage === 'string' && initialData.coverImage.startsWith('data:')) {
          console.log('QuizSettingsModal: coverImage is base64 string');
          return initialData.coverImage;
        } else {
          console.log('QuizSettingsModal: No valid coverImage found');
          return null;
        }
      })()
    }
    console.log('QuizSettingsModal: Setting new formData:', newFormData)
    setFormData(newFormData)
  }, [initialData, topics])

  // Debug khi modal mở
  useEffect(() => {
    if (isOpen) {
      console.log('QuizSettingsModal: Modal opened with:')
      console.log('- initialData:', initialData)
      console.log('- availableTopics:', availableTopics)
      console.log('- formData:', formData)
    }
  }, [isOpen, initialData, availableTopics, formData])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        coverImage: file
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSave) {
      onSave(formData)
    }
    onClose()
  }

  const handleTopicChange = (value) => {
    setFormData(prev => ({
      ...prev,
      topic: value,
      customTopic: value === 'khac' ? prev.customTopic : ''
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-[0_0_20px_rgba(237,0,93,0.7)] max-w-3xl w-full px-6 py-6 md:py-8 flex flex-col md:flex-row md:space-x-6 relative transform translate-x-32">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-600 hover:text-gray-900 focus:outline-none"
          aria-label="Đóng cửa sổ"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Left Form Section */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-6">
          <div className="flex items-center space-x-2 font-semibold text-lg select-none text-[#ED005D]">
            <div className="bg-[#ED005D] rounded-full p-1.5 flex items-center justify-center">
              <Plus className="w-6 h-6 text-white stroke-2" />
            </div>
            <span>Cài đặt quiz</span>
          </div>

          {/* Tên */}
          <div className="flex flex-col space-y-1 max-w-sm">
            <label htmlFor="quizName" className="font-semibold text-[#ED005D]">Tên</label>
            <input
              id="quizName"
              name="quizName"
              type="text"
              value={formData.quizName}
              onChange={(e) => handleInputChange('quizName', e.target.value)}
              placeholder="Bộ câu hỏi không có tiêu đề"
              className="border border-[#ED005D] rounded-md px-3 py-2 text-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ED005D] focus:ring-opacity-40"
            />
          </div>



          {/* Chủ đề */}
          <div className="flex flex-col space-y-1 max-w-sm">
            <label htmlFor="topic" className="font-semibold flex items-center space-x-2 text-[#ED005D]">
              <span>Chủ đề</span>
            </label>
            <div className="relative border border-[#ED005D] rounded-md">
              <select
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={(e) => handleTopicChange(e.target.value)}
                className="appearance-none w-full px-3 pl-10 py-2 pr-10 text-gray-600 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ED005D] focus:ring-opacity-40"
              >
                <option value="">Chọn chủ đề</option>
                {topics.map((topic, index) => (
                  <option key={index} value={topic}>
                    {topic}
                  </option>
                ))}
                <option value="khac">Khác</option>
              </select>
              <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#ED005D]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6" />
                </svg>
              </div>
              <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Ô nhập chủ đề */}
            {formData.topic === 'khac' && (
              <input
                type="text"
                id="customTopic"
                name="customTopic"
                value={formData.customTopic}
                onChange={(e) => handleInputChange('customTopic', e.target.value)}
                placeholder="Nhập chủ đề tùy chọn"
                className="mt-2 border border-[#ED005D] rounded-md px-3 py-2 text-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ED005D] focus:ring-opacity-40"
              />
            )}
          </div>

          {/* Hiển thị */}
          <fieldset className="max-w-sm border border-[#ED005D] rounded-md p-1.5 space-y-2">
            <legend className="font-semibold px-2 text-[#ED005D]">Hiển thị</legend>

            <label htmlFor="public" className="flex items-center justify-between cursor-pointer border border-[#ED005D] rounded-md px-3 py-2 hover:bg-pink-50 focus-within:ring-2 focus-within:ring-[#ED005D] focus-within:ring-opacity-40">
              <div className="flex items-center space-x-3">
                <input
                  id="public"
                  name="visibility"
                  type="radio"
                  checked={formData.visibility === 'public'}
                  onChange={() => handleInputChange('visibility', 'public')}
                  className="accent-[#ED005D] cursor-pointer w-5 h-5 border-[#ED005D]"
                />
                <span className="font-medium select-none text-[#ED005D]">Công khai</span>
              </div>
              <Eye className="w-6 h-6 text-[#ED005D] flex-shrink-0" />
            </label>

            <label htmlFor="private" className="flex items-center justify-between cursor-pointer border border-[#ED005D] rounded-md px-3 py-2 hover:bg-pink-50 focus-within:ring-2 focus-within:ring-[#ED005D] focus-within:ring-opacity-40">
              <div className="flex items-center space-x-3">
                <input
                  id="private"
                  name="visibility"
                  type="radio"
                  checked={formData.visibility === 'private'}
                  onChange={() => handleInputChange('visibility', 'private')}
                  className="accent-[#ED005D] cursor-pointer w-5 h-5 border-[#ED005D]"
                />
                <span className="font-medium select-none text-[#ED005D]">Riêng tư</span>
              </div>
              <Lock className="w-6 h-6 text-[#ED005D] flex-shrink-0" />
            </label>
          </fieldset>

          {/* Save button */}
          <div>
            <button
              type="submit"
              className="bg-[#ED005D] text-white rounded-md px-8 py-2 font-semibold hover:bg-[#c6004c] focus:outline-none focus:ring-4 focus:ring-[#ED005D] focus:ring-opacity-40 transition"
            >
              Lưu
            </button>
          </div>
        </form>

        {/* Right: Upload ảnh */}
        <div className="flex-1 flex items-center justify-center">
          {formData.coverImage ? (
            // Hiển thị ảnh đã chọn
            <div className="relative w-48 h-48 md:w-56 md:h-56 group">
              <img 
                src={formData.coverImage instanceof File ? URL.createObjectURL(formData.coverImage) : formData.coverImage} 
                alt="Ảnh bìa" 
                className="w-full h-full object-cover rounded-md border border-[#ED005D]"
              />
              {/* Nút xóa ảnh - hiện khi hover */}
              <button
                onClick={() => handleInputChange('coverImage', null)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                type="button"
                title="Xóa ảnh"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ) : (
            // Giao diện thêm ảnh
            <label htmlFor="coverImage" className="group cursor-pointer w-48 h-48 md:w-56 md:h-56 border border-[#ED005D] rounded-md flex flex-col items-center justify-center space-y-3 text-[#ED005D] font-medium hover:bg-pink-50 transition relative select-none">
              <input 
                type="file" 
                id="coverImage" 
                name="coverImage" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
              <div className="bg-[#ED005D] text-white rounded-lg p-2.5 group-hover:bg-[#c6004c] transition flex items-center justify-center shadow-md">
                <Plus className="w-6 h-6 stroke-current" />
              </div>
              <span>Thêm ảnh bìa</span>
            </label>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuizSettingsModal 