// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword((p) => !p);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login({ username, password });
      const user = res?.user || (res?.success && res.user) || null;
      // roles check from localStorage/getCurrentUser()
      // ✅ CHUẨN HÓA: Dùng 'user' thay vì 'currentUser'
      const stored = JSON.parse(localStorage.getItem('user') || 'null');
      const roles = (stored?.roles || []).map(r => String(r).toUpperCase());
      const isAdmin = roles.some(r => r.includes('ADMIN') || r.includes('ROLE_ADMIN'));

      if (isAdmin) navigate('/admin/accounts', { replace: true });
      else navigate('/', { replace: true });
    } catch (err) {
      setPassword('');
      setError(err.message || 'Lỗi đăng nhập');
    }
  };

  const handleGoogleLogin = () => {
    const googleLoginUrl = `${import.meta.env.VITE_API_URL || ''}/auth/google`;
    window.location.href = googleLoginUrl;
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 font-content">
      <h1 className="mt-4 mb-6 text-[var(--pink)] text-7xl font-title font-bold text-center">
        P-QUIZZ
      </h1>

      <div className="w-full max-w-xl bg-[var(--white)] border-8 border-[var(--pink)] shadow-[0_0_30px_var(--shadow-pink)] px-10 py-6 rounded-lg relative">
        <h2 className="text-center text-3xl font-bold text-[var(--pink)] mb-6">ĐĂNG NHẬP</h2>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && <div className="text-red-600 font-medium">{error}</div>}

          <div>
            <label htmlFor="username" className="block text-xl font-semibold text-[var(--pink)] mb-1">
              Tên đăng nhập
            </label>
            <div className="relative bg-[#f7f8f9] rounded-lg border border-[var(--pink)] h-12">
              <input id="username" type="text" value={username}
                onChange={(e) => setUsername(e.target.value)} placeholder="Nhập username"
                className="w-full h-full px-6 bg-transparent border-none outline-none placeholder:text-gray-500 text-black focus:ring-2 focus:ring-[var(--pink)] focus:bg-white"
                required />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xl font-semibold text-[var(--pink)] mb-1">Mật khẩu</label>
            <div className="relative bg-[#f7f8f9] rounded-lg border border-[var(--pink)] h-12">
              <input id="password" type={showPassword ? "text" : "password"}
                value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu"
                className="w-full h-full px-6 pr-12 bg-transparent border-none outline-none placeholder:text-gray-500 text-black focus:ring-2 focus:ring-[var(--pink)] focus:bg-white"
                required />
              <button type="button" onClick={togglePasswordVisibility}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 focus:outline-none"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
                <img className="w-6 h-6 object-contain" src={showPassword ? "/eye-on.png" : "/eye-off.png"} alt="" />
              </button>
            </div>
          </div>

          <div className="flex justify-end items-center gap-2">
            <Link to="/forgot-password" className="text-[var(--pink)] font-semibold hover:underline">Quên mật khẩu?</Link>
          </div>

          <button type="submit" disabled={loading}
            className="w-full h-12 bg-[var(--pink)] rounded-lg text-white text-xl font-semibold">
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <button type="button" onClick={handleGoogleLogin}
            className="w-full h-12 mt-2 flex items-center justify-center gap-3 rounded-lg border border-[var(--pink)] text-black">
            <img className="w-6 h-6 object-contain" src="/google-icon.png" alt="Google" />
            <span className="font-semibold">Đăng nhập bằng Google</span>
          </button>
        </form>

        <div className="mt-6 flex justify-center items-center gap-2">
          <p className="text-black text-base">Bạn chưa có tài khoản?</p>
          <Link to="/register" className="text-base font-semibold text-[var(--pink)] hover:underline">ĐĂNG KÝ</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;