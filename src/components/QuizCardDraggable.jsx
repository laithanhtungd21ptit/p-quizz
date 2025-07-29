import React from 'react'

const QuizCardDraggable = ({
  index = 1,
  onDelete,
  onCopy,
  imageSrc = 'history.png',
  frameSrc = 'Frame 1171275867.png',
  infoText = 'Thêm thông tin ở đây...',
  dragHandleProps = {},
  draggableProps = {},
  innerRef
}) => {
  return (
    <div
      className="relative w-[260px] h-[150px] mb-4"
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
    >
      {/* Nền khung quiz */}
      <img
        src={frameSrc}
        alt="Quiz Card Frame"
        className="absolute inset-0 w-full h-full object-contain z-0"
      />

      {/* Nút chức năng bên trái */}
      <div className="absolute top-4 left-3 flex flex-col items-center space-y-4 text-white z-20 select-none cursor-pointer">
        <span className="font-bold text-base cursor-move" {...dragHandleProps}>{index}</span>
        {/* Nút Xóa */}
        <div className="relative group">
          <button aria-label="Xóa" className="p-1 rounded-full hover:bg-gray-700 transition" onClick={onDelete}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
          <div className="absolute left-8 top-1 z-50 hidden group-hover:block">
            <div className="bg-[#ED005D] text-white font-semibold py-1 px-2 rounded flex items-center shadow-lg transition duration-200 select-none cursor-default text-xs whitespace-nowrap min-w-max">
              <span>Xóa câu hỏi</span>
            </div>
          </div>
        </div>
        {/* Nút Sao chép */}
        <div className="relative group">
          <button aria-label="Sao chép" className="p-1 rounded-full hover:bg-gray-700 transition" onClick={onCopy}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          </button>
          <div className="absolute left-8 top-1 z-50 hidden group-hover:block">
            <div className="bg-[#ED005D] text-white font-semibold py-1 px-2 rounded flex items-center shadow-lg transition duration-200 select-none cursor-default text-xs whitespace-nowrap min-w-max">
              <span>Nhân đôi câu hỏi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nội dung quiz */}
      <div className="absolute inset-0 z-10 p-2 text-[#ED005D] flex flex-col justify-between">
        <div className="flex flex-col items-center justify-center w-full">
          <img 
            src={imageSrc} 
            alt="Quiz Main" 
            className="my-1 mt-2 opacity-70" 
            style={{
              width: 130, 
              height: 100, 
              objectFit: 'contain', // Thay đổi về 'contain' để ảnh hiển thị đầy đủ không bị cắt
              marginLeft: 30,
              borderRadius: '8px' // Thêm bo góc cho đẹp
            }} 
          />
        </div>
        <div className="absolute bottom-7 left-[55%] transform -translate-x-1/2 opacity-70 w-[140px] max-w-[80%] whitespace-nowrap overflow-hidden text-ellipsis text-white text-xs">
          {infoText}
        </div>
      </div>
    </div>
  )
}

export default QuizCardDraggable 