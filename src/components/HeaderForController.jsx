// src/components/HeaderForController.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const HeaderForController = () => {
  const navigate = useNavigate()

  return (
    <div className="topcontrols-bar fixed top-0 left-0 w-full h-14 bg-black/90 border-b border-gray-700 px-6 py-3 flex items-center gap-5 shadow-lg z-30">
      {/* Nút quay lại */}
      <button
        onClick={() => navigate(-1)}
        aria-label="Quay lại"
        className="flex items-center justify-center"
      >
        <img src="/return_button.png" alt="Quay lại" className="w-7 h-7" />
      </button>

      {/* Nút kết thúc */}
      <button
          className="ml-auto px-4 py-2 bg-[var(--pink)] rounded-lg text-white text-sm font-content font-semibold hover:shadow-lg hover:scale-105 transition-transform ease-in-out"      >
        Kết thúc
      </button>
    </div>
  )
}

export default HeaderForController