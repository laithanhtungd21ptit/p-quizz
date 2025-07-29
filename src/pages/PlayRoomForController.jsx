import React from 'react';
import RankingTable from '../components/RankingTable';
import Chat from "../components/Chat"

// Fake data: 10 participants
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

export default function PlayRoomForController({ joinCode = '682868' }) {
  return (
    <div className="h-[calc(100vh-56px)] flex flex-col items-center pt-8 px-4 font-content space-y-6">
      {/* Mã tham gia */}
      <div className="bg-white border-2 border-[var(--pink)] rounded-lg px-4 py-2 text-black text-2xl text-center">
        {joinCode}
      </div>

      {/* Bảng xếp hạng */}
      <div className="w-full max-w-4xl">
        <RankingTable data={fakeParticipants} totalQuestions={15} />
      </div>

      <div className="w-full max-w-3xl mx-auto">
        <Chat />
      </div>
    </div>
  );
}