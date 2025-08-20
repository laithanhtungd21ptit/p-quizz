// src/components/RankingTable.jsx
import React from 'react';

export default function RankingTable({ data = [], totalQuestions = 4 }) {
  const sorted = [...data].sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-full p-2 box-border">
      <div className="flex justify-center">
        <h2 className="m-0 text-xl bg-[rgba(237,0,93,0.5)] text-white font-md font-content rounded-t-lg inline-block px-8 py-4">
          BẢNG XẾP HẠNG
        </h2>
      </div>

      {/* Participant count with icon */}
      <div className="flex items-center bg-[rgba(237,0,93,0.4)] rounded-tl-lg rounded-tr-lg px-8 py-3 text-base">
        <img
          src="/users_icon.png"
          alt="Users icon"
          className="w-5 h-5 mr-3 inline-block filter invert"
        />
        <span className="text-white">{sorted.length} người tham gia</span>
      </div>

      {/* Column headers */}
      <div className="flex p-3 font-md bg-[rgba(237,0,93,0.2)] border-secondary-400 border-b text-base">
        <div className="w-[15%] text-center">Thứ hạng</div>
        <div className="w-[30%] text-center">Tên</div>
        <div className="w-[15%] text-center">Điểm</div>
        <div className="w-[40%] text-center">Câu đúng/sai</div>
      </div>

      {/* Data rows wrapper with hidden scrollbar */}
      <div
        className="overflow-y-auto hide-scrollbar"
        style={{ maxHeight: '285px', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        {sorted.map((item, index) => {
          // Sử dụng correctCount từ backend thay vì correct
          const correctCount = item.correctCount || 0;
          const correctPct = (correctCount / totalQuestions) * 100;
          const wrongPct = ((totalQuestions - correctCount) / totalQuestions) * 100;
          const leftoverPct = 100 - correctPct - wrongPct;

          return (
            <div
              key={index}
              className={`flex items-center p-3 text-sm ${
                index % 2 === 0
                  ? 'bg-[rgba(237,0,93,0.4)]'
                  : 'bg-[rgba(237,0,93,0.2)]'
              }`}
            >
              <div className="w-[15%] text-center text-white">{index + 1}</div>
              <div className="w-[30%] flex items-center text-white pl-12">
                <img
                  src={item.avatar || '/avatar/avatar_1.png'}
                  alt="avatar"
                  className="w-6 h-auto mr-4"
                />
                <span className="truncate">{item.firstName || 'Unknown'}</span>
              </div>
              <div className="w-[15%] text-center text-white">{item.score}</div>
              <div className="w-[40%] px-2 relative">
                <div className="flex h-6 rounded overflow-hidden bg-[#D2D2D2] w-full">
                  <div
                    className="h-full bg-green-600 flex items-center justify-start relative"
                    style={{ width: `${correctPct}%` }}
                  >
                    <span className="absolute left-1 text-sm text-white pl-1">
                      {correctCount}
                    </span>
                  </div>
                  <div
                    className="h-full bg-red-600 flex items-center justify-start relative"
                    style={{ width: `${wrongPct}%` }}
                  >
                    <span className="absolute left-1 text-sm text-white pl-1">
                      {totalQuestions - correctCount}
                    </span>
                  </div>
                  {/* leftover gray segment */}
                  <div
                    className="h-full bg-[#D2D2D2]"
                    style={{ width: `${leftoverPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}