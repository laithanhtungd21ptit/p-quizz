import React, { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Login attempt:", { email, password });
  };

  const handleGoogleLogin = () => console.log("Google login attempt");

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 font-content">
      <h1 className="mt-4 mb-6 text-[var(--pink)] text-7xl font-title font-bold text-center">
        P-QUIZZ
      </h1>

      <div className="w-full max-w-md bg-[var(--white)] border-8 border-[var(--pink)] shadow-[0_4px_30px_var(--shadow-pink)] p-6 rounded-lg relative">
        <h2 className="text-center text-3xl font-bold text-[var(--pink)] mb-6">
          ĐĂNG NHẬP
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-xl font-semibold text-[var(--pink)] mb-1">
              Email
            </label>
            <div className="relative bg-[#f7f8f9] rounded-lg border border-[var(--pink)] h-12">
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Nhập email"
                className="w-full h-full px-6 bg-transparent border-none outline-none placeholder:text-gray-500 text-black focus:ring-2 focus:ring-[var(--pink)] focus:bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xl font-semibold text-[var(--pink)] mb-1">
              Mật khẩu
            </label>
            <div className="relative bg-[#f7f8f9] rounded-lg border border-[var(--pink)] h-12">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Nhập mật khẩu"
                className="w-full h-full px-6 pr-12 bg-transparent border-none outline-none placeholder:text-gray-500 text-black focus:ring-2 focus:ring-[var(--pink)] focus:bg-white"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <img
                  className="w-6 h-6 object-contain"
                  src={showPassword ? "/eye-on.png" : "/eye-off.png"}
                  alt={showPassword ? "Hide password" : "Show password"}
                />
              </button>
            </div>
          </div>

          <div className="flex justify-end items-center gap-2">
            <Link
              to="/forgot-password"
              className="text-[var(--pink)] font-semibold hover:underline hover:scale-105 transition-transform ease-in-out"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-[var(--pink)] rounded-lg text-white text-xl font-semibold hover:shadow-lg hover:scale-105 transition-transform ease-in-out"
          >
            Đăng nhập
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-12 mt-2 flex items-center justify-center gap-3 rounded-lg border border-[var(--pink)] text-black hover:bg-[var(--pink)] hover:text-white transition ease-in-out"
          >
            <img className="w-6 h-6 object-contain" src="/google-icon.png" alt="Google" />
            <span className="font-semibold">Đăng nhập bằng google</span>
          </button>
        </form>

        <div className="mt-6 flex justify-center items-center gap-2">
          <p className="text-black text-base">Bạn chưa có tài khoản?</p>
          <Link
            to="/register"
            className="text-base font-semibold text-[var(--pink)] hover:underline hover:scale-105 transition-transform ease-in-out"
          >
            ĐĂNG KÝ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
