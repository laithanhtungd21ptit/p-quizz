import React from 'react';
import RankingTable from '../components/RankingTable';
import Chat from "../components/Chat"

// Fake data: participants including top3
const fakeParticipants = [
  { avatar: '/avatar/avatar_1.png', name: 'Nguyễn Văn A', score: 3200, correct: 12, wrong: 3 },
  { avatar: '/avatar/avatar_2.png', name: 'Trần Thị B', score: 3000, correct: 11, wrong: 2 },
  { avatar: '/avatar/avatar_3.png', name: 'Lê Văn C', score: 2800, correct: 10, wrong: 4 },
  { avatar: '/avatar/avatar_4.png', name: 'Phạm Thị D', score: 2600, correct: 9, wrong: 5 },
  { avatar: '/avatar/avatar_5.png', name: 'Hoàng Văn E', score: 2400, correct: 8, wrong: 6 },
  { avatar: '/avatar/avatar_6.png', name: 'Đỗ Thị F', score: 2200, correct: 7, wrong: 7 },
  { avatar: '/avatar/avatar_7.png', name: 'Vũ Văn G', score: 2000, correct: 6, wrong: 8 },
  { avatar: '/avatar/avatar_1.png', name: 'Bùi Thị H', score: 1800, correct: 5, wrong: 9 },
  { avatar: '/avatar/avatar_2.png', name: 'Đặng Văn I', score: 1600, correct: 4, wrong: 10 },
  { avatar: '/avatar/avatar_3.png', name: 'Ngô Thị K', score: 1400, correct: 3, wrong: 11 }
];

export default function GameResult({ joinCode = '682868' }) {
  // sort participants by score desc
  const sorted = [...fakeParticipants].sort((a, b) => b.score - a.score);
  const [first, second, third] = sorted;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 font-content">
      {/* Join Code */}
      <div
        className="mt-8 mb-6 bg-white rounded-lg px-4 py-2 text-black text-2xl text-center z-10"
        style={{ border: '2px solid var(--pink)' }}
      >
        {joinCode}
      </div>

      {/* Podium wrapper (relative) */}
      <div className="relative w-full max-w-4xl flex justify-center items-end">
        {/* Podium image */}
        <img
          src="/top3.png"
          alt="Podium"
          className="relative z-10 w-[70%] h-auto max-w-[760px] mt-[140px]"
        />

        {/* Avatars: name (bold) + score + avatar below */}
        {second && (
          <div
            className="absolute z-20 flex flex-col items-center text-center"
            style={{ left: '22%', top: '20%' }}
          >
            <span className="text-white font-bold truncate w-28 block">{second.name}</span>
            <span className="text-white">{second.score}</span>
            {/* avatar nằm dưới name & score, không bo tròn, giữ tỉ lệ (h-auto) */}
            <img src={second.avatar} alt={second.name} className="w-24 h-auto mt-2" />
          </div>
        )}

        {first && (
          <div
            className="absolute z-20 flex flex-col items-center text-center"
            style={{ left: '50%', top: '3%', transform: 'translateX(-50%)' }}
          >
            <span className="text-white font-bold truncate w-36 block">{first.name}</span>
            <span className="text-white text-lg">{first.score}</span>

            <div className="relative mt-2">
              <img src={first.avatar} alt={first.name} className="w-28 h-auto" />
              {/* Crown nếu dùng, kích thước có thể tinh chỉnh ở đây */}
              {/* <img
                src="/top1_crown.png"
                alt="Crown"
                className="absolute -top-10 left-1/2 transform -translate-x-1/2"
                style={{ width: '96px', height: 'auto' }} // tăng kích thước crown
              /> */}
            </div>
          </div>
        )}

        {third && (
          <div
            className="absolute z-20 flex flex-col items-center text-center"
            style={{ left: '65%', top: '27%' }}
          >
            <span className="text-white font-bold truncate w-28 block">{third.name}</span>
            <span className="text-white">{third.score}</span>
            <img src={third.avatar} alt={third.name} className="w-24 h-auto mt-2" />
          </div>
        )}
      </div>

      {/* Detailed ranking table */}
      <div className="w-full max-w-4xl mt-12">
        <RankingTable data={fakeParticipants} totalQuestions={15} />
      </div>

      {/* Buttons: Lưu kết quả & Thoát */}
      <div className="w-full max-w-4xl my-6 flex justify-center gap-4">
        <button
          type="button"
          className="px-6 py-2 rounded-md text-white font-medium bg-[var(--pink)]"
          onClick={() => {
            // TODO: thêm logic lưu kết quả ở đây
            console.log('Lưu kết quả clicked');
          }}
        >
          Lưu kết quả
        </button>
        <button
          type="button"
          className="px-6 py-2 rounded-md text-gray-800 font-medium bg-gray-200"
          onClick={() => {
            // TODO: thêm logic thoát/đóng ở đây
            console.log('Thoát clicked');
          }}
        >
          Thoát
        </button>
      </div>

      <div className="w-full max-w-3xl mx-auto">
        <Chat />
      </div>
    </div>
  );
}
