import React, { useState, useRef, useEffect } from "react";
import SupportCard from "../components/SupportCard";
import Chat from "../components/Chat"

const AVAILABLE_AVATARS = [
  "/avatar/avatar_1.png",
  "/avatar/avatar_2.png",
  "/avatar/avatar_3.png",
  "/avatar/avatar_4.png",
  "/avatar/avatar_5.png",
  "/avatar/avatar_6.png",
  "/avatar/avatar_7.png",
];

const SUPPORT_OPTIONS = [
  { name: "50:50", detail: "Loại bỏ 2 đáp án sai, tăng xác suất lựa chọn đúng", icon: "/50_50_icon.png", bgColor: "#FFE2CC", borderColor: "#FF6D00" },
  { name: "Tăng thời gian", detail: "Tăng thêm 10 giây cho câu hỏi hiện tại", icon: "/increase_time_icon.png", bgColor: "#D5ECD3", borderColor: "#2FA124" },
  { name: "Nhân đôi điểm", detail: "Nếu trả lời đúng, bạn nhận gấp đôi điểm ở câu này", icon: "/x2_points_icon.png", bgColor: "#E0E0ED", borderColor: "#B1B1F2" },
  { name: "Thử lại", detail: "Phao cứu sinh cho pha chọn sai, cho phép chọn lại nếu lần đầu chọn sai", icon: "/retry_icon.png", bgColor: "#EFE8C9", borderColor: "#FAD63D" },
];

function getRandomPair() {
  const indices = SUPPORT_OPTIONS.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return [SUPPORT_OPTIONS[indices[0]], SUPPORT_OPTIONS[indices[1]]];
}

const WaitingRoomForPlayer = ({
  joinCode = "682868",
  name = "Ngô Quốc Anh",
  avatar: initialAvatar = "/avatar/avatar_1.png",
}) => {
  const [avatar, setAvatar] = useState(initialAvatar);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef(null);
  const buttonRef = useRef(null);
  const [supportPair, setSupportPair] = useState(() => getRandomPair());

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsPopupOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const togglePopup = () => setIsPopupOpen((prev) => !prev);
  const selectAvatar = (src) => {
    setAvatar(src);
    setIsPopupOpen(false);
  };
  const swapSupport = () => setSupportPair(getRandomPair());

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col items-center pt-8 px-4 font-content space-y-6">
      {/* Mã tham gia */}
              <div className="bg-white border-2 border-[var(--pink)] rounded-lg px-4 py-2 text-black text-2xl font-base text-center font-content">
        {joinCode}
      </div>

      {/* Panel bao quanh */}
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-[0_0_30px_var(--shadow-pink)] p-6">
        {/* Row tên và avatar */}
        <div className="w-full flex flex-col sm:flex-row gap-4 relative">
          <div className="flex-1 bg-[var(--pink)] rounded-[10px] p-6 flex items-center justify-start">
            <span className="text-lg text-white font-content font-medium">
              {name}
            </span>
          </div>
          <div className="relative bg-[var(--pink)] rounded-[10px] p-6 w-40 h-32 flex-shrink-0">
            <img
              src={avatar}
              alt="Avatar"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-auto"
            />
            <button
              ref={buttonRef}
              onClick={togglePopup}
              className="absolute top-0 right-0 p-2 rounded-md focus:outline-none bg-white bg-opacity-75 hover:bg-opacity-60 transition-colors"
            >
              <img src="/edit_icon.png" alt="Edit icon" className="w-4 h-4 object-contain" />
            </button>
            {isPopupOpen && (
              <div
                ref={popupRef}
                className="absolute top-0 right-0 mt-10 bg-white border border-gray-200 rounded-sm shadow-lg z-10 p-2 grid grid-cols-4 gap-2"
              >
                {AVAILABLE_AVATARS.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt="avatar option"
                    className="w-12 h-auto cursor-pointer rounded-lg hover:ring-2 hover:ring-[var(--pink)]"
                    onClick={() => selectAvatar(src)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row Chế độ trợ giúp */}
        <div className="w-full flex justify-between items-center px-2 py-6 bg-white">
          <span className="text-base text-black font-content">Chế độ trợ giúp</span>
          <div className="flex items-center gap-2">
            <img
              src="/alert_icon.png"
              alt="Alert icon"
              className="w-5 h-5 object-contain"
            />
            <span className="text-sm text-black font-content">Còn 2 lượt xáo trộn</span>
          </div>
        </div>

        {/* Row SupportCard + Swap */}
        <div className="w-full flex items-center justify-start gap-4">
          <SupportCard {...supportPair[0]} />
          <SupportCard {...supportPair[1]} />
          <button
            onClick={swapSupport}
            className="w-28 h-32 flex flex-col items-center justify-center p-4 bg-[#F6E6E4] border border-[#D48479] rounded-lg hover:shadow-lg hover:scale-105 transition-transform ease-in-out"
          >
            <img src="/swap_icon.png" alt="Swap" className="w-6 h-6 object-contain" />
            <div className="mt-2 text-black text-sm font-content">
              Xáo trộn
            </div>
          </button>
        </div>
      </div>

              <div className="text-white text-center mt-10 text-base font-content">
        Đang chờ người điều khiển bắt đầu...
      </div>
      

      <div className="w-full max-w-3xl mx-auto">
        <Chat />
      </div>

    </div>
  );
};

export default WaitingRoomForPlayer;