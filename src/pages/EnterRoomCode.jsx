// src/pages/EnterRoomCode.jsx
import React, { useState } from "react";

const EnterRoomCode = () => {
  const [code, setCode] = useState("");

  const handleChange = (e) => setCode(e.target.value);
  const handleJoin = (e) => {
    e.preventDefault();
    console.log("Joining room with code:", code);
    // TODO: thực hiện logic tham gia phòng
  };

  return (
    <div className="h-[calc(100vh-56px)] w-full flex flex-col items-center justify-center px-4 font-content">
      {/* H1 giữ P-QUIZZ */}
      <h1 className="mb-6 text-[var(--pink)] text-7xl font-title font-bold text-center">
        P-QUIZZ
      </h1>

      {/* Form nhập mã */}
      <form
        onSubmit={handleJoin}
        className="w-full max-w-md bg-white rounded-xl border border-gray-300 shadow-[0_0_30px_var(--shadow-pink)] p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <input
          id="roomCode"
          type="text"
          value={code}
          onChange={handleChange}
          placeholder="Nhập mã tham gia"
          className="w-full flex-1 h-12 px-3 bg-transparent border border-gray-300 rounded-lg outline-none placeholder:text-gray-500 text-black focus:ring-2 focus:ring-[var(--pink)] focus:bg-white transition"
          required
        />
        <button
          type="submit"
          className="w-full sm:w-auto h-12 bg-[var(--pink)] rounded-lg text-white text-base font-semibold px-4 py-2 hover:shadow-lg hover:scale-105 transition-transform ease-in-out"
        >
          Tham gia
        </button>
      </form>
    </div>
  );
};

export default EnterRoomCode;
