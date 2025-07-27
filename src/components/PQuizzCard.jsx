import React, { useState } from 'react'

const DeleteConfirmModal = ({ open, onClose, onConfirm }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="max-w-md w-full bg-white rounded-3xl relative shadow-2xl ring-8 ring-pink-600 ring-opacity-90 px-8 pt-10 pb-8">
        {/* Close icon top right */}
        <button aria-label="Close modal" className="absolute top-3 right-4 text-gray-800 hover:text-gray-600 focus:outline-none" onClick={onClose}>
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
        <p className="text-center font-sans font-medium text-gray-800 text-lg leading-relaxed select-none">Xác nhận xóa bộ<br />câu hỏi đã chơi</p>
        {/* Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button className="px-6 py-2 rounded-md bg-pink-600 text-white font-sans text-sm hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-400 transition" onClick={onConfirm}>Xác nhận</button>
          <button className="px-6 py-2 rounded-md bg-gray-300 text-gray-600 font-sans text-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition" onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
};

const PQuizzCard = ({ 
  topic = "Tiếng Nhật",
  description = "Từ vựng Mina no Nihongo bài 25",
  questionCount = 10,
  dateTime = "19h30, 10/07/2025",
  onViewDetails,
  onDelete,
  isDeletable = false,
  cards = null // Thêm prop cards để xử lý grid
}) => {
  const [showDelete, setShowDelete] = useState(false);
  // Nếu có cards array, render grid layout
  if (cards && Array.isArray(cards)) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 justify-items-center">
        {cards.map((card, index) => {
          const [showDeleteModal, setShowDeleteModal] = useState(false);
          return (
            <React.Fragment key={index}>
              <div className="max-w-lg bg-white border-2 border-pink-600 rounded-xl shadow-lg flex p-5 gap-4">
                {/* Left block */}
                <div className="flex flex-col justify-center items-center min-w-[160px] max-w-md bg-gray-200 rounded-lg relative select-none" style={{aspectRatio: '3 / 2'}}>
                  <span className="font-extrabold text-pink-600 text-3xl">P-QUIZZ</span>
                  <button title="Số câu hỏi" className="flex items-center gap-1 bg-pink-600 text-white text-xs rounded-full px-3 py-1 mt-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M12 14c0-1.5 2-1.5 2-3a2 2 0 10-4 0"/>
                      <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2"/>
                    </svg>
                    {card.questionCount || 10} câu hỏi
                  </button>
                  <svg aria-hidden="true" focusable="false" className="absolute top-3 left-3 opacity-10 w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#ED005D" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="18" r="15" />
                    <path d="M18 7v11M29 18H7"/>
                  </svg>
                </div>
                {/* Right block */}
                <div className="flex flex-col justify-start grow gap-2 max-w-full max-w-md">
                  <div>
                    <h3 className="font-semibold text-black text-lg mb-1">
                      CHỦ ĐỀ: <span className="uppercase text-black">{card.topic || "Tiếng Nhật"}</span>
                    </h3>
                    <p className="text-gray-700 line-clamp-1">{card.description || "Từ vựng Mina no Nihongo bài 25"}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M3 10h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{card.dateTime || "19h30, 10/07/2025"}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <button 
                        onClick={card.onViewDetails}
                        className="bg-pink-600 text-white text-sm px-6 py-2 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:ring-offset-1 transition-colors"
                      >
                        Xem chi tiết
                      </button>
                      <button 
                        onClick={() => setShowDeleteModal(true)}
                        disabled={!card.isDeletable}
                        className={`text-sm px-6 py-2 rounded-md transition-colors ${
                          card.isDeletable 
                            ? 'bg-gray-300 text-gray-600 hover:bg-gray-400 cursor-pointer' 
                            : 'bg-gray-300 text-gray-600 cursor-not-allowed select-none'
                        }`}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <DeleteConfirmModal
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={() => {
                  setShowDeleteModal(false);
                  card.onDelete && card.onDelete();
                }}
              />
            </React.Fragment>
          );
        })}
      </div>
    )
  }
  // Render single card như cũ
  return (
    <>
      <div className="max-w-lg bg-white border-2 border-pink-600 rounded-xl shadow-lg flex p-5 gap-4">
        {/* Left block */}
        <div className="flex flex-col justify-center items-center min-w-[160px] max-w-md bg-gray-200 rounded-lg relative select-none" style={{aspectRatio: '3 / 2'}}>
          <span className="font-extrabold text-pink-600 text-3xl">P-QUIZZ</span>
          <button title="Số câu hỏi" className="flex items-center gap-1 bg-pink-600 text-white text-xs rounded-full px-3 py-1 mt-6">
            {/* Icon dấu hỏi */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M12 14c0-1.5 2-1.5 2-3a2 2 0 10-4 0"/>
              <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2"/>
            </svg>
            {questionCount} câu hỏi
          </button>
          {/* Icon nền mờ */}
          <svg aria-hidden="true" focusable="false" className="absolute top-3 left-3 opacity-10 w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#ED005D" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="18" r="15" />
            <path d="M18 7v11M29 18H7"/>
          </svg>
        </div>
        {/* Right block */}
        <div className="flex flex-col justify-start grow gap-2 max-w-full max-w-md">
          <div>
            <h3 className="font-semibold text-black text-lg mb-1">
              CHỦ ĐỀ: <span className="uppercase text-black">{topic}</span>
            </h3>
            <p className="text-gray-700 line-clamp-1">{description}</p>
          </div>
          <div className="flex flex-col gap-2">
            {/* Dòng ngày giờ */}
            <div className="flex items-center gap-2 text-gray-700 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M8 7V3m8 4V3M3 10h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{dateTime}</span>
            </div>
            {/* Dòng nút */}
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={onViewDetails}
                className="bg-pink-600 text-white text-sm px-6 py-2 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:ring-offset-1 transition-colors"
              >
                Xem chi tiết
              </button>
              <button 
                onClick={() => setShowDelete(true)}
                disabled={!isDeletable}
                className={`text-sm px-6 py-2 rounded-md transition-colors ${
                  isDeletable 
                    ? 'bg-gray-300 text-gray-600 hover:bg-gray-400 cursor-pointer' 
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed select-none'
                }`}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
      <DeleteConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => {
          setShowDelete(false);
          onDelete && onDelete();
        }}
      />
    </>
  )
}

export default PQuizzCard 