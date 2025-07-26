// src/components/ParticipantCard.jsx
import React from "react";

const ParticipantCard = ({ avatar, name }) => {
  return (
    <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow">
      {/* Avatar: giữ tỉ lệ gốc, width cố định, height tự động */}
      <img
        src={`/avatar/${avatar}`}
        alt={name}
        className="w-6 h-auto object-contain mr-3"
      />
      <span className="text-black text-sm font-content">{name}</span>
    </div>
  );
};

export default ParticipantCard;
