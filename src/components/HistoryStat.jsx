import React from "react";

/**
 * HistoryStat Component
 * Props:
 * - topic: string
 * - title: string
 * - name: string
 * - time: string
 * - rankValue: string
 * - scoreValue: string
 * - progressNow: number
 * - rightCount: number
 * - wrongCount: number
 * - avgTime: number
 */
const HistoryStat = ({
  topic,
  title,
  name,
  time,
  rankValue,
  scoreValue,
  progressNow,
  rightCount,
  wrongCount,
  avgTime,
}) => {
  const progressWidth = `${progressNow}%`;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6 flex flex-col gap-6">
      {/* Chủ đề và tiêu đề */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-black font-content">
          CHỦ ĐỀ: <span>{topic}</span>
        </h1>
        <p className="text-lg text-black font-content">{title}</p>
        <div className="mt-1 flex items-center gap-2">
          <img
            src="/calendar_icon.png"
            alt="Calendar icon"
            className="w-5 h-5 object-contain"
          />
          <time className="text-sm text-black font-content">{time}</time>
        </div>
      </div>

      {/* Tên người dùng */}
      <div className="flex justify-between items-center bg-[var(--pink)] rounded-[10px] px-10 py-4">
        <p className="text-xl font-content text-white">{name}</p>
        <img
            src="/girl.png"
            alt="Girl"
            className="h-36 object-contain"
        />
      </div>

      {/* Thẻ Thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Thứ hạng */}
        <div className="flex justify-center items-center p-4 bg-pink-light rounded-[10px]">
          <img
            src="/rank_icon.png"
            alt="Rank icon"
            className="w-12 h-12 object-contain mr-6"
          />
          <div>
            <div className="text-sm text-black font-content">Thứ hạng</div>
            <div className="text-lg text-black font-semibold font-content">
              {rankValue}
            </div>
          </div>
        </div>
        {/* Điểm số */}
        <div className="flex justify-center items-center p-4 bg-pink-light rounded-[10px]">
          <img
            src="/score_icon.png"
            alt="Score icon"
            className="w-12 h-12 object-contain mr-6"
          />
          <div>
            <div className="text-sm text-black font-content">Điểm số</div>
            <div className="text-lg text-black font-semibold font-content">
              {scoreValue}
            </div>
          </div>
        </div>
      </div>

      {/* Progress + Performance wrapper */}
      <div className="bg-pink-light rounded-[10px] p-4 flex flex-col gap-4">
        {/* Progress Bar */}
        <div className="mt-4">
          <div
            className="w-full h-2 bg-gray-200 rounded overflow-hidden"
            role="progressbar"
            aria-valuenow={progressNow}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-[var(--pink)]"
              style={{ width: progressWidth }}
            />
          </div>
          <div className="text-right text-sm text-black font-content">
            {progressNow}%
          </div>
        </div>

        {/* Hiệu suất trả lời */}
        <div className="grid grid-cols-3 gap-4 text-center">
          {/* Câu đúng */}
          <div className="space-y-1 p-2">
            <img
              src="/right_icon.png"
              alt="Right answers icon"
              className="w-8 h-8 object-contain mx-auto"
            />
            <div className="font-content text-black">
              {rightCount} câu đúng
            </div>
          </div>
          {/* Câu sai */}
          <div className="space-y-1 p-2">
            <img
              src="/wrong_icon.png"
              alt="Wrong answers icon"
              className="w-8 h-8 object-contain mx-auto"
            />
            <div className="font-content text-black">
              {wrongCount} câu sai
            </div>
          </div>
          {/* Thời gian trung bình */}
          <div className="space-y-1 p-2">
            <img
              src="/clock_icon.png"
              alt="Avg time icon"
              className="w-8 h-8 object-contain mx-auto"
            />
            <div className="font-content text-black">
              {avgTime}s/câu
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryStat;
