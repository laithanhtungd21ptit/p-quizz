// src/pages/ActivatedSuccessfully.jsx
import React from "react";
import { Link } from "react-router-dom";

const ActivatedSuccessfully = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start pt-4 px-4 font-content">
      {/* H1 giữ P-QUIZZ */}
      <h1 className="mt-4 mb-6 text-[var(--pink)] text-7xl font-title font-bold text-center">
        P-QUIZZ
      </h1>

      <div className="w-full max-w-xl bg-[var(--white)] h-[75vh] border-8 border-[var(--pink)] shadow-[0_0_30px_var(--shadow-pink)] px-10 py-6 rounded-lg flex flex-col justify-center items-center text-center">
        {/* Icon check */}
        <img
          src="/check-circle.png"
          alt="Success"
          className="w-16 h-16 mb-4 object-contain"
        />

        {/* Thông báo thành công */}
        <p className="text-xl font-bold text-[var(--pink)] mb-4">
          KÍCH HOẠT THÀNH CÔNG
        </p>

        {/* Nội dung chi tiết */}
        <p className="text-base text-black font-content mb-6 leading-relaxed">
          Chúc mừng bạn đã kích hoạt tài khoản thành công.<br />
          <span className="font-semibold">Đăng nhập ngay</span> để trải nghiệm P‑QUIZZ
        </p>

        {/* Quay lại Đăng nhập */}
        <div className="mt-6 text-center">
          <p className="text-black text-base inline-flex items-center">
            Quay lại{" "}
            <Link
              to="/login"
              className="text-[var(--pink)] font-semibold hover:underline transition ease-in-out ml-1"
            >
              ĐĂNG NHẬP
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActivatedSuccessfully;