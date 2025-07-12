import React from 'react'

const DateArrow = ({ date = new Date() }) => {
  // Format date to Vietnamese format
  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    }).replace('/', ' tháng ').replace('/', ' năm ')
  }

  return (
    <div className="flex items-center w-full max-w-5xl my-4">
      <span className="text-white text-xl font-light whitespace-nowrap mr-4">
        Ngày {formatDate(date)}
      </span>
      <div className="flex items-center flex-1">
        {/* Arrow line */}
        <div className="flex-grow h-0.5 bg-pink-600"></div>
        {/* Arrow head */}
        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[12px] border-l-pink-600"></div>
      </div>
    </div>
  )
}

export default DateArrow 