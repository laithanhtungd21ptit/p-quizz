import React from 'react';
import HistoryStat from '../components/HistoryStat';

const HistoryStatTest = () => {
  return (
    <div className="p-4">
      <HistoryStat
        topic="TIẾNG NHẬT"
        title="Từ vựng Mina no Nihongo bài 25"
        name="Nguyễn Quỳnh"
        time="19h30, 10/07/2025"
        rankValue="3/39"
        scoreValue="3250"
        progressNow={80}
        rightCount={8}
        wrongCount={2}
        avgTime={8.6}
      />
    </div>
  );
};

export default HistoryStatTest