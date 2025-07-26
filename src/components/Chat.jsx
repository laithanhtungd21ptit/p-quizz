// src/components/Chat.jsx
import React, { useState } from 'react'

// 1. Lấy động tất cả PNG trong public/stickers/{folder}/*.png
const modules = import.meta.globEager('/src/assets/stickers/*/*.png')

// 2. Gom nhóm theo folder
const stickerFoldersMap = {}
for (const path in modules) {
  // path = '/src/assets/stickers/heart_emoji/heart_emoji_1.png'
  const parts = path.split('/')
  const folder = parts[parts.length - 2]
  if (!stickerFoldersMap[folder]) stickerFoldersMap[folder] = []
  stickerFoldersMap[folder].push(modules[path].default)
}

// 3. Lấy danh sách tên folder, thiết lập folder mặc định
const folderNames = Object.keys(stickerFoldersMap)
const defaultFolder = folderNames[0] || ''

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [showStickers, setShowStickers] = useState(false)
  const [activeFolder, setActiveFolder] = useState(defaultFolder)

  const toggleChat = () => {
    setIsOpen(open => !open)
    setShowStickers(false)
  }
  const toggleStickers = () => setShowStickers(v => !v)
  const handleSend = () => {
    if (message.trim()) {
      console.log('Sending message:', message)
      setMessage('')
    }
  }

  return (
    <div className="fixed z-15 right-4 top-[72px] font-content">
      {/* Nút mở/đóng chat */}
      <button
        onClick={toggleChat}
        className={`
          w-12 h-12 bg-white border-2 border-[var(--pink)] rounded-lg shadow-md
          flex items-center justify-center transition-transform duration-300
          ${isOpen ? 'translate-x-full' : 'translate-x-0'}
        `}
      >
        <img src="/open_chat.png" alt="Open chat" className="w-6 h-6" />
      </button>

      {/* Khung chat */}
      <div
        className={`
          fixed top-[56px] right-0 z-20
          w-[300px] max-w-[90vw] bg-white shadow-xl flex flex-col
          h-[calc(100vh-56px)]
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex justify-end p-2">
          <button onClick={toggleChat}>
            <img src="/close_chat.png" alt="Close chat" className="w-6 h-6" />
          </button>
        </div>

        {/* Nội dung */}
        <div className="flex-1 overflow-y-auto px-4 text-center text-sm text-black"
        onClick={() => showStickers && setShowStickers(false)}
        >
          <p>Chưa có tin nhắn nào</p>
        </div>

        {/* Input + Sticker Picker */}
        <div className="bg-white">
          {/* ô nhập */}
          <div className="p-3">
            <div className="flex items-center border border-gray-400 rounded-lg px-3 py-2
                            focus-within:ring-2 focus-within:ring-[var(--pink)] transition-all w-full">
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Soạn tin nhắn..."
                className="flex-1 min-w-0 outline-none text-gray-700 placeholder-gray-500 text-sm"
              />
              <div className="flex items-center gap-2 text-gray-400 shrink-0">
                <button onClick={toggleStickers} className="shrink-0">
                  <img src="/choose_emoji.png" alt="Emoji" className="w-5 h-5" />
                </button>

                <span>|</span>

                <button onClick={handleSend} className="shrink-0">
                  <img src="/send.png" alt="Send" className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* picker hiện khi showStickers===true */}
          {showStickers && (
            <div className="w-full bg-white px-3 py-1 ">
              {/* Tabs: hiển thị icon folder (file đầu tiên) */}
              <div className="flex justify-start gap-2 mb-3">
                {folderNames.map(folder => (
                  <button
                    key={folder}
                    onClick={() => setActiveFolder(folder)}
                    className={`
                      p-1 rounded-lg border
                      ${activeFolder === folder ? 'border-[var(--pink)]' : 'border-transparent'}
                    `}
                  >
                    <img
                      src={stickerFoldersMap[folder][0]}
                      alt={folder}
                      className="w-4 h-4 object-contain"
                    />
                  </button>
                ))}
              </div>

              <div className="w-full h-px bg-gray-300 mb-2" />

              {/* Grid các sticker của folder đang chọn */}
              <div className="relative">
                <div className="grid grid-cols-5 gap-2 max-h-28 overflow-y-auto overflow-x-visible mb-2">
                  {stickerFoldersMap[activeFolder].map(src => (
                    <div
                      key={src}
                      className="group relative w-12 h-12 flex items-center justify-center overflow-visible cursor-pointer"
                      onClick={() => {
                        console.log('Send sticker', src)
                        setShowStickers(false)
                      }}
                    >
                      <img
                        src={src}
                        alt="sticker"
                        className="max-w-full max-h-full"
                      />
                      {/* Viền hover */}
                      <div className="absolute inset-0 border-2 border-transparent hover:border-[var(--pink)] rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat
