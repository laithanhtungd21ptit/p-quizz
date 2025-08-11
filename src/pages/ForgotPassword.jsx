import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPasswordApi } from "../api/auth";

const ForgotPassword = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleUsernameChange = (e) => setUsername(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError("Vui lòng nhập tên đăng nhập.");
      return;
    }

    setLoading(true);
    try {
      // gọi API đã được định nghĩa trong src/api/auth.js
      const res = await forgotPasswordApi({ username });

      // res có thể chứa thông tin (tuỳ backend). Ở đây ta chỉ điều hướng sang VerifyCode
      // kèm username để prefill form nhập mã
      navigate("/verify-code", { state: { username } });
    } catch (err) {
      console.error("forgot-password error:", err);
      const msg = err?.message || "Yêu cầu thất bại. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start pt-4 px-4 font-content">
      <h1 className="mt-4 mb-6 text-[var(--pink)] text-7xl font-title font-bold text-center">
        P-QUIZZ
      </h1>

      <div className="w-full max-w-xl bg-[var(--white)] h-[75vh] border-8 border-[var(--pink)] shadow-[0_0_30px_var(--shadow-pink)] px-10 py-6 rounded-lg flex flex-col justify-center">
        <p className="mb-4 text-xl font-bold text-[var(--pink)]">
          Vui lòng nhập tên đăng nhập của bạn
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-xl font-semibold text-[var(--pink)] mb-1"
            >
              Tên đăng nhập
            </label>
            <div className="relative bg-[#f7f8f9] rounded-lg border border-[var(--pink)] h-12">
              <input
                id="username"
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Nhập username"
                className="w-full h-full px-6 bg-transparent border-none outline-none placeholder:text-gray-500 text-black focus:ring-2 focus:ring-[var(--pink)] focus:bg-white"
                required
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full h-12 bg-[var(--pink)] rounded-lg text-white text-xl font-semibold hover:shadow-lg hover:scale-105 transition-transform ease-in-out disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Đang gửi..." : "Gửi mã xác minh tới email"}
          </button>
        </form>

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

export default ForgotPassword;