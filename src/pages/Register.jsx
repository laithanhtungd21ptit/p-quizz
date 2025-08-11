import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../api/auth"; // 👈 import API

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

const handleRegister = async (e) => {
  e.preventDefault();
  if (password !== confirmPassword) {
    alert("Mật khẩu và xác nhận mật khẩu không khớp.");
    return;
  }
  setLoading(true);
  try {
    await registerApi({ username, email, password, confirmPassword });

    // Chuyển sang trang gửi link kích hoạt kèm email
    navigate("/sent-activate-link", {
      state: { email }
    });

  } catch (err) {
    alert(`Lỗi: ${err.message}`);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 font-content">
      <div className="w-full max-w-xl bg-[var(--white)] border-8 border-[var(--pink)] shadow-[0_0_30px_var(--shadow-pink)] px-10 py-6 rounded-lg relative">
        <h2 className="text-center text-3xl font-bold text-[var(--pink)] mb-6 font-content">
          ĐĂNG KÝ
        </h2>

        <form onSubmit={handleRegister} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-xl font-semibold text-[var(--pink)] mb-1 font-content">
              Tên người dùng
            </label>
            <div className="relative bg-[#f7f8f9] rounded-lg border border-[var(--pink)] h-12">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập username"
                className="w-full h-full px-6 bg-transparent border-none outline-none placeholder:text-gray-500 text-black focus:ring-2 focus:ring-[var(--pink)] focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xl font-semibold text-[var(--pink)] mb-1 font-content">
              Email
            </label>
            <div className="relative bg-[#f7f8f9] rounded-lg border border-[var(--pink)] h-12">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email"
                className="w-full h-full px-6 bg-transparent border-none outline-none placeholder:text-gray-500 text-black focus:ring-2 focus:ring-[var(--pink)] focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xl font-semibold text-[var(--pink)] mb-1 font-content">
              Mật khẩu
            </label>
            <div className="relative bg-[#f7f8f9] rounded-lg border border-[var(--pink)] h-12">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full h-full px-6 pr-12 bg-transparent border-none outline-none placeholder:text-gray-500 text-black focus:ring-2 focus:ring-[var(--pink)] focus:bg-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 focus:outline-none"
              >
                <img
                  className="w-6 h-6 object-contain"
                  src={showPassword ? "/eye-on.png" : "/eye-off.png"}
                  alt={showPassword ? "Hide password" : "Show password"}
                />
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirm" className="block text-xl font-semibold text-[var(--pink)] mb-1 font-content">
              Xác nhận mật khẩu
            </label>
            <div className="relative bg-[#f7f8f9] rounded-lg border border-[var(--pink)] h-12">
              <input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className="w-full h-full px-6 pr-12 bg-transparent border-none outline-none placeholder:text-gray-500 text-black focus:ring-2 focus:ring-[var(--pink)] focus:bg-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 focus:outline-none"
              >
                <img
                  className="w-6 h-6 object-contain"
                  src={showConfirm ? "/eye-on.png" : "/eye-off.png"}
                  alt={showConfirm ? "Hide password" : "Show password"}
                />
              </button>
            </div>
          </div>

          {/* Register button */}
          <button
            type="submit"
            className="w-full h-12 bg-[var(--pink)] rounded-lg text-white text-xl font-semibold hover:shadow-lg hover:scale-105 transition-transform ease-in-out disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        {/* Link to Login */}
        <div className="mt-6 flex justify-center items-center gap-2">
          <p className="text-black text-base font-content">Đã có tài khoản?</p>
          <Link
            to="/login"
            className="text-base font-semibold text-[var(--pink)] hover:underline hover:scale-105 transition-transform ease-in-out"
          >
            ĐĂNG NHẬP
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
