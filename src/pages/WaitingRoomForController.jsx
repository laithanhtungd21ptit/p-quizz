import React, { useRef, useState } from "react";
import ParticipantCard from "../components/ParticipantCard";
import Chat from "../components/Chat"

const WaitingRoomForController = () => {
  const websiteRef = useRef(null);
  const codeRef = useRef(null);
  
  // const [isChatOpen, setIsChatOpen] = useState(false);
  const [copiedField, setCopiedField] = useState(null); // "website" | "code" | null

  const handleCopy = (ref, field) => {
    if (ref.current) {
      const text = ref.current.innerText;
      navigator.clipboard.writeText(text).then(() => {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000); // 2s ẩn
      });
    }
  };

  const handleStart = () => {
    console.log("Bắt đầu");
    // TODO: thêm logic bắt đầu tại đây
  };

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col items-center pt-8 px-4 font-content">
      {/* Tiêu đề */}
      <h1 className="text-[var(--pink)] text-5xl md:text-7xl font-title font-bold text-center mb-8">
        P-QUIZZ
      </h1>

      {/* Card chứa Steps + QR */}
      <div className="w-full max-w-2xl bg-[var(--white)] border-4 border-[var(--pink)] shadow-[0_0_30px_var(--shadow-pink)] rounded-lg overflow-hidden">
        <div className="flex items-center gap-x-4">
          {/* Steps */}
          <div className="flex-1 space-y-6 pl-4">
            {/* Step 1 */}
            <div className="flex items-center relative">
              <div className="flex-shrink-0 flex items-center justify-center bg-[var(--pink)] rounded-full w-9 h-9">
                <span className="text-white font-medium">1</span>
              </div>
              <div className="flex-1 flex items-center justify-between bg-gray-100 border border-[var(--pink)] rounded-md px-4 py-2 ml-4 relative">
                <div className="flex items-center space-x-2 whitespace-nowrap leading-tight">
                  <span className="text-gray-500 text-base">Truy cập</span>
                  <span ref={websiteRef} className="text-black text-lg">pquizz.com</span>
                </div>
                <div className="relative flex items-center">
                  {copiedField === "website" && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm bg-gray-100 text-black px-2 py-0.5 rounded shadow whitespace-nowrap">
                      Đã sao chép
                    </div>
                  )}
                  <button
                    className="flex-shrink-0 px-2 focus:outline-none"
                    onClick={() => handleCopy(websiteRef, "website")}
                  >
                    <img src="/copy_icon.png" alt="Copy" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center relative">
              <div className="flex-shrink-0 flex items-center justify-center bg-[var(--pink)] rounded-full w-9 h-9">
                <span className="text-white font-medium">2</span>
              </div>
              <div className="flex-1 flex items-center justify-between bg-gray-100 border border-[var(--pink)] rounded-md px-4 py-2 ml-4 relative">
                <div className="flex items-center space-x-2 whitespace-nowrap leading-tight">
                  <span className="text-gray-500 text-base">Nhập mã tham gia</span>
                  <span ref={codeRef} className="text-black text-lg">682868</span>
                </div>
                <div className="relative flex items-center">
                  {copiedField === "code" && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm bg-gray-100 text-black px-2 py-0.5 rounded shadow whitespace-nowrap">
                      Đã sao chép
                    </div>
                  )}
                  <button
                    className="flex-shrink-0 px-2 focus:outline-none"
                    onClick={() => handleCopy(codeRef, "code")}
                  >
                    <img src="/copy_icon.png" alt="Copy" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex-shrink-0 flex justify-end">
            <img
              src="/QR_code.png"
              alt="QR Code"
              className="w-44 h-44 object-cover"
            />
          </div>
        </div>
      </div>

      {/* Nút Bắt đầu */}
      <button
        onClick={handleStart}
        className="mt-6 px-4 py-2 bg-[var(--pink)] rounded-lg text-white text-sm font-content font-semibold hover:shadow-lg hover:scale-105 transition-transform ease-in-out"
      >
        Bắt đầu
      </button>

      {/* Div chờ người tham gia */}
      <div className="mt-4 flex items-center bg-white rounded-lg px-4 py-2 shadow">
        <img
          src="/users_icon.png"
          alt="Users"
          className="w-6 h-6 object-contain mr-3"
        />
        <span className="text-black text-sm font-content">
          Đang chờ người tham gia...
        </span>
      </div>
      
      {/* Các hàng ParticipantCard */}
      <div className="mt-6 w-full flex flex-col items-center space-y-6">
        {/* Hàng 1: 4 cột, shrink‑wrap đúng width */}
        <div className="inline-grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <ParticipantCard
              key={`r1-${idx}`}
              avatar="avatar_1.png"
              name="Ngô Quốc Anh"
            />
          ))}
        </div>

        {/* Hàng 2: 5 cột */}
        <div className="inline-grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <ParticipantCard
              key={`r2-${idx}`}
              avatar="avatar_1.png"
              name="Ngô Quốc Anh"
            />
          ))}
        </div>

        {/* Hàng 3: 4 cột */}
        {/* <div className="inline-grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <ParticipantCard
              key={`r3-${idx}`}
              avatar="avatar_1.png"
              name="Ngô Quốc Anh"
            />
          ))}
        </div> */}
      </div>         

      <div className="w-full max-w-3xl mx-auto">
        <Chat />
      </div>

    </div>
  );
};

export default WaitingRoomForController;
