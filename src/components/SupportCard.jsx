// src/components/SupportCard.jsx
import React from 'react'

/**
 * SupportCard Component
 * Props:
 * - name: string           // ví dụ: "50:50"
 * - detail: string         // ví dụ: "Loại bỏ 2 đáp án sai..."
 * - icon: string           // đường dẫn đến ảnh icon
 * - bgColor: string        // ví dụ: ''#FFE2CC'
 * - borderColor: string    // ví dụ: '#FF6D00'
 * list 4 card: {"50:50", "Loại bỏ 2 đáp án sai, tăng xác suất lựa chọn đúng", "/50_50_icon.png", "#FFE2CC", "#FF6D00"  }
 *              {"Tăng thời gian", "Tăng thêm 10 giây cho câu hỏi hiện tại", "/increase_time_icon.png", "#D5ECD3", "#2FA124" }
 *              {"Nhân đôi điểm", "Nếu trả lời đúng, bạn nhận gấp đôi điểm ở câu này", "/x2_points_icon.png", "#E0E0ED", "#B1B1F2" }
 *              {"Thử lại", "Phao cứu sinh cho những pha chọn sai, cho phép chọn lại nếu lần đầu chọn sai", "retry_icon.png", "#EFE8C9", "#FAD63D"  }
 */
const SupportCard = ({
  name,
  detail,
  icon,
  bgColor = '#FFE2CC',
  borderColor = '#FF6D00',
}) => {
  return (
    <div
      className="inline-flex items-center justify-start w-60 h-32 gap-6 p-4 rounded-lg overflow-hidden"
      style={{
        background: bgColor,
        outline: `1px ${borderColor} solid`,
        outlineOffset: '-1px',
      }}
    >
      {/* Icon */}
      <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden">
        <img src={icon} alt="" className="w-full h-full object-contain" />
      </div>

      {/* Nội dung */}
      <div className="inline-flex flex-col justify-start items-start gap-2 w-40">
        <div className="w-full text-black font-content font-semibold text-sm tracking-wide break-words">
          {name}
        </div>
        <div className="w-full text-black font-content font-normal text-xs tracking-wide break-words">
          {detail}
        </div>
      </div>
    </div>
  )
}

export default SupportCard