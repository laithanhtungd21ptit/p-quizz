import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const topicSuggestions = [
  'Từ vựng tiếng Anh',
  'Ngữ pháp tiếng Nhật',
  'Lịch sử Việt Nam',
  'Toán học cơ bản',
]
const questionSetSuggestions = [
  { name: 'Từ vựng Nihongo bài 25', author: 'Vũ Văn Toàn', avatar: 'https://i.pravatar.cc/24?img=1' },
  { name: 'Từ vựng Nihongo bài 25', author: 'Bạn', avatar: 'https://i.pravatar.cc/24?img=2' },
  { name: 'Từ vựng Nihongo bài 25', author: 'Bạn', avatar: 'https://i.pravatar.cc/24?img=3' },
]

const CreateRoom = ({ onClose }) => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('')
  const [showTopicDropdown, setShowTopicDropdown] = useState(false)
  const [search, setSearch] = useState('')
  const [showSuggestDropdown, setShowSuggestDropdown] = useState(false)
  const topicInputRef = useRef(null)
  const searchInputRef = useRef(null)

  return (
    <div className="flex items-center justify-center min-h-screen w-full fixed inset-0 z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      {/* Popup */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative z-50">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-black text-xl font-bold"
          onClick={() => onClose ? onClose() : navigate('/dashboard')}
          aria-label="Đóng"
        >
          &times;
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-[#ED005D] text-xl font-semibold">➕ Tạo phòng</span>
        </div>

        {/* Chủ đề */}
        <div className="mb-4 relative" id="topic-block">
          <label className="block text-sm font-semibold text-[#ED005D] mb-1">Chủ đề</label>
          <input
            type="text"
            ref={topicInputRef}
            value={topic}
            onChange={e => { setTopic(e.target.value); setShowTopicDropdown(true); }}
            onFocus={() => setShowTopicDropdown(true)}
            onBlur={() => setTimeout(() => setShowTopicDropdown(false), 100)}
            placeholder="Nhập/chọn chủ đề..."
            className="w-full border border-[#ED005D] rounded-md py-2 pl-10 pr-8 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#ED005D] text-black"
          />
          {/* Icon bên trái */}
          <div className="absolute top-1/2 left-3 transform -translate-y-1/2 text-[#ED005D] select-none pointer-events-none">📄</div>
          {/* Mũi tên */}
          <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
          {/* Dropdown gợi ý chủ đề */}
          {showTopicDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md max-h-40 overflow-y-auto scrollbar-thin shadow">
              {topicSuggestions.filter(s => s.toLowerCase().includes(topic.toLowerCase())).map((s, i) => (
                <div
                  key={i}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
                  onMouseDown={e => { setTopic(s); setShowTopicDropdown(false); e.preventDefault(); }}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tìm kiếm bộ câu hỏi */}
        <div className="mb-4 relative" id="search-block">
          <label className="block text-sm font-semibold text-[#ED005D] mb-1">
            Nhập tên bộ câu hỏi <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            ref={searchInputRef}
            value={search}
            onChange={e => { setSearch(e.target.value); setShowSuggestDropdown(e.target.value.trim() !== ''); }}
            onFocus={() => { if (search.trim() !== '') setShowSuggestDropdown(true); }}
            onBlur={() => setTimeout(() => setShowSuggestDropdown(false), 100)}
            placeholder="Từ vựng..."
            className="w-full border border-[#ED005D] rounded-md py-2 px-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ED005D] text-black"
          />
          {/* Dropdown gợi ý */}
          {showSuggestDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md max-h-40 overflow-y-auto scrollbar-thin shadow">
              {questionSetSuggestions.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
                  onMouseDown={e => { setSearch(s.name); setShowSuggestDropdown(false); e.preventDefault(); }}
                >
                  <span>{s.name}</span>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <img src={s.avatar} alt="avatar" className="w-5 h-5 rounded-full" />
                    {s.author}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nút tạo phòng */}
        <button className="bg-[#ED005D] hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-md w-full mt-2">
          Tạo phòng
        </button>
      </div>
    </div>
  )
}

export default CreateRoom 