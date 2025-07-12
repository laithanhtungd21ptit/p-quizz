import React from 'react'

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
     // Nếu có cards array, render grid layout
   if (cards && Array.isArray(cards)) {

         return (
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 justify-items-center">
         {cards.map((card, index) => (
           <div key={index} className="max-w-lg bg-white border-2 border-pink-600 rounded-xl shadow-lg flex p-5 gap-4">
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
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                       d="M8 7V3m8 4V3M3 10h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                     onClick={card.onDelete}
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
         ))}
       </div>
     )
  }

  // Render single card như cũ
  return (
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
              onClick={onDelete}
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
  )
}

export default PQuizzCard 