import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { verifyCodeApi } from "../api/auth";

const VerifyCode = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Nếu route được chuyển từ ForgotPassword, sẽ có state.username
  const initialUsername = location.state?.username || "";
  const [username, setUsername] = useState(initialUsername);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // nếu có username từ state thì focus hoặc xử lý thêm nếu muốn
  }, [initialUsername]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !code.trim() || !password) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);
    try {
      // Gọi API verify-code đã định nghĩa
      await verifyCodeApi({ username, code, newPassword: password });

      // Nếu thành công, điều hướng tới trang login hoặc activated page
      // Nếu backend muốn redirect tới ActivatedSuccessfully, bạn có thể navigate tới đó
      alert("Xác thực thành công. Bạn có thể đăng nhập bằng mật khẩu mới.");
      navigate("/login");
    } catch (err) {
      console.error("verify-code error:", err);
      const msg = err?.message || "Xác thực thất bại. Vui lòng thử lại.";
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

      <div className="w-full max-w-xl bg-[var(--white)] h-auto border-8 border-[var(--pink)] shadow-[0_0_30px_var(--shadow-pink)] px-10 py-8 rounded-lg flex flex-col justify-center">
        <p className="mb-4 text-xl font-bold text-[var(--pink)]">Xác thực & Đặt lại mật khẩu</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-xl font-semibold text-[var(--pink)] mb-1">
              Tên đăng nhập
            </label>
            <div className="relative bg-[#f7f8f9] rounded-lg border border-[var(--pink)] h-12">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                className="w-full h-full px-6 bg-transparent border-none outline-none placeholder:text-gray-500 text-black focus:ring-2 focus:ring-[var(--pink)] focus:bg-white"
                required
              />
            </div>
          </div>

          {/* OTP code */}
          <div>
            <label htmlFor="code" className="block text-xl font-semibold text-[var(--pink)] mb-1">
              Mã OTP
            </label>
            <div className="relative bg-[#f7f8f9] rounded-lg border border-[var(--pink)] h-12">
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Nhập mã OTP"
                className="w-full h-full px-6 bg-transparent border-none outline-none placeholder:text-gray-500 text-black focus:ring-2 focus:ring-[var(--pink)] focus:bg-white"
                required
              />
            </div>
          </div>

          {/* New password */}
          <div>
            <label htmlFor="password" className="block text-xl font-semibold text-[var(--pink)] mb-1">
              Mật khẩu mới
            </label>
            <div className="relative bg-[#f7f8f9] rounded-lg border border-[var(--pink)] h-12">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="w-full h-full px-6 pr-12 bg-transparent border-none outline-none placeholder:text-gray-500 text-black focus:ring-2 focus:ring-[var(--pink)] focus:bg-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
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

          {/* Error message */}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            className="w-full h-12 bg-[var(--pink)] rounded-lg text-white text-xl font-semibold hover:shadow-lg hover:scale-105 transition-transform ease-in-out disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Đang xác nhận..." : "Xác nhận"}
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

export default VerifyCode;