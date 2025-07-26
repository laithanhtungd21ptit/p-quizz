import React, { useState } from 'react'

/**
 * SupportCardButton Component
 *
 * Props:
 * - detail:   string   // mô tả trợ giúp
 * - icon:     string   // đường dẫn tới icon
 * - bgColor:  string   // màu nền chính phía sau frame
 * list 4 card: {"Loại bỏ 2 đáp án sai, tăng xác suất lựa chọn đúng", "/50_50_icon.png", "#FF6D00"  }
 *              {"Tăng thêm 10 giây cho câu hỏi hiện tại", "/increase_time_icon.png", "#2FA124" }
 *              {"Nếu trả lời đúng, bạn nhận gấp đôi điểm ở câu này", "/x2_points_icon.png", "#B1B1F2" }
 *              {"Phao cứu sinh cho những pha chọn sai, cho phép chọn lại nếu lần đầu chọn sai", "retry_icon.png", "#FAD63D"  }
 */

const SupportCardButton = ({ detail, icon, bgColor }) => {
  const [showCard, setShowCard] = useState(false)
  const [used, setUsed] = useState(false) // true sau khi đã dùng

  const handleClick = () => {
    if (used) return // không cho dùng lại nếu đã dùng

    setShowCard(true)
    setTimeout(() => {
      setShowCard(false)
      setUsed(true)
    }, 3000)
  }

  return (
    <>
      {/* Nút hình tròn */}
      <button
        onClick={handleClick}
        className="w-14 h-14 rounded-full border-4 p-2 bg-transparent flex items-center justify-center transition-transform active:scale-95"
        style={{
          borderColor: used ? '#aaa' : bgColor, // viền đen/trắng sau khi dùng
          filter: used ? 'grayscale(100%)' : 'none', // làm xám icon
          cursor: used ? 'not-allowed' : 'pointer',
        }}
        disabled={used}
      >
        <img src={icon} alt="icon" className="w-6 h-6 object-contain" />
      </button>

      {/* Card hiển thị giữa màn hình */}
      {showCard && (
        <div className="fixed top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300">
          <div className="scale-100">
            <div
              className="relative w-[250px] overflow-hidden rounded-3xl"
              style={{
                aspectRatio: '400/540',
                transform: 'rotate(8deg)',
              }}
            >
              <div
                className="absolute inset-0 rounded-3xl"
                style={{ backgroundColor: bgColor }}
              />

              <img
                src="/support_card_frame.png"
                alt="support card frame"
                className="absolute top-1/2 left-1/2 object-contain"
                style={{
                  width: '100%',
                  height: 'auto',
                  transform: 'translate(-50%, -50%)',
                }}
              />

              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <div className="w-24 h-24 mb-2 flex-shrink-0">
                  <img
                    src={icon}
                    alt="icon"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="w-32 text-center text-xs font-content font-semibold text-black break-words">
                  {detail}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SupportCardButton