import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleUsernameChange = (e) => setUsername(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleConfirmChange = (e) => setConfirmPassword(e.target.value);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmVisibility = () => setShowConfirm((prev) => !prev);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu không khớp.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
          confirmPassword: confirmPassword,
        }),
      });

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        console.log("Server response:", textResponse);
        
        if (response.ok) {
          try {
            data = JSON.parse(textResponse);
          } catch (parseError) {
            data = { message: textResponse };
          }
        } else {
          data = { message: textResponse };
        }
      }

      if (response.ok) {
        // Đăng ký thành công
        alert("Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.");
        navigate("/login");
      } else {
        // Xử lý các lỗi đăng ký
        switch (response.status) {
          case 400:
            setError(data.message || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
            break;
          case 409:
            setError(data.message || "Tên đăng nhập hoặc email đã tồn tại.");
            break;
          default:
            setError(data.message || "Đăng ký thất bại. Vui lòng thử lại sau.");
        }
      }
    } catch (error) {
      console.error("Register error:", error);
      
      if (error.message.includes("Failed to fetch") || error.message.includes("ERR_CONNECTION_REFUSED")) {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Server backend đã chạy chưa?\n2. Server có đang chạy trên port 8080 không?\n3. CORS đã được cấu hình chưa?");
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Remove any global background class on mount
  useEffect(() => {
    document.body.classList.remove("bg-[url('/background2.png')]");
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 font-content">
      <h1 className="mb-6 text-[var(--pink)] text-7xl font-title font-bold text-center">
        P-QUIZZ
      </h1>

      <div className="w-full max-w-xl bg-[var(--white)] border-8 border-[var(--pink)] shadow-[0_0_30px_var(--shadow-pink)] px-10 py-6 rounded-lg relative">
        <h2 className="text-center text-3xl font-bold text-[var(--pink)] mb-6 font-content">
          ĐĂNG KÝ
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="whitespace-pre-line">{error}</div>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-xl font-semibold text-[var(--pink)] mb-1 font-content">
              Tên đăng nhập
            </label>
            <div className="relative bg-[#f7f8f9] rounded-lg border border-[var(--pink)] h-12">
              <input
                id="username"
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Nhập tên đăng nhập"
                className="w-full h-full px-6 bg-transparent border-none outline-none placeholder:text-gray-500 text-black focus:ring-2 focus:ring-[var(--pink)] focus:bg-white"
                required
                disabled={isLoading}
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
                onChange={handleEmailChange}
                placeholder="Nhập email"
                className="w-full h-full px-6 bg-transparent border-none outline-none placeholder:text-gray-500 text-black focus:ring-2 focus:ring-[var(--pink)] focus:bg-white"
                required
                disabled={isLoading}
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
                onChange={handlePasswordChange}
                placeholder="Nhập mật khẩu"
                className="w-full h-full px-6 pr-12 bg-transparent border-none outline-none placeholder:text-gray-500 text-black focus:ring-2 focus:ring-[var(--pink)] focus:bg-white"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isLoading}
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
                onChange={handleConfirmChange}
                placeholder="Nhập lại mật khẩu"
                className="w-full h-full px-6 pr-12 bg-transparent border-none outline-none placeholder:text-gray-500 text-black focus:ring-2 focus:ring-[var(--pink)] focus:bg-white"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={toggleConfirmVisibility}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 focus:outline-none"
                aria-label={showConfirm ? "Hide password" : "Show password"}
                disabled={isLoading}
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
            disabled={isLoading}
            className="w-full h-12 bg-[var(--pink)] rounded-lg text-white text-xl font-semibold hover:shadow-lg hover:scale-105 transition-transform ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Đang đăng ký..." : "Đăng ký"}
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
