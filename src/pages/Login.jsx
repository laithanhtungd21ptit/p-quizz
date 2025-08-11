import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleUsernameChange = (e) => setUsername(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      // Kiểm tra content-type để xử lý response phù hợp
      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        // Nếu không phải JSON, đọc như text
        const textResponse = await response.text();
        console.log("Server response:", textResponse);
        
        if (response.ok) {
          // Thử parse JSON từ text response
          try {
            data = JSON.parse(textResponse);
          } catch (parseError) {
            // Nếu không parse được JSON, tạo object với message
            data = { message: textResponse };
          }
        } else {
          data = { message: textResponse };
        }
      }

      if (response.ok) {
        // Lưu token vào localStorage
        if (data.token) {
          localStorage.setItem("token", data.token);

          // Giải mã token để lấy thông tin vai trò
          const base64Url = data.token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );
          const decodedToken = JSON.parse(jsonPayload);

          // Debug: Log decoded token
          console.log("Decoded token:", decodedToken);

          // Tạo user object từ token data nếu server không trả về user
          if (!data.user && decodedToken.sub) {
            const userFromToken = {
              username: decodedToken.sub,
              role: decodedToken.role
            };
            localStorage.setItem("user", JSON.stringify(userFromToken));
            console.log("Created user object from token:", userFromToken);
          } else if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            console.log("User data from server saved:", data.user);
          }

          // Kiểm tra vai trò của người dùng
          if (decodedToken.role === "ROLE_ADMIN") {
            navigate("/admin/accounts");
          } else {
            navigate("/dashboard");
          }
        }
      } else {
        // Xử lý các status code khác nhau
        switch (response.status) {
          case 401:
            setError(data.message || "Sai mật khẩu hoặc tài khoản không tồn tại.");
            break;
          case 403:
            if (data.message?.includes("chưa kích hoạt")) {
              setError("Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email.");
            } else {
              setError("Tài khoản đã bị khóa. Vui lòng liên hệ admin.");
            }
            break;
          default:
            setError(data.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Kiểm tra loại lỗi để hiển thị thông báo phù hợp
      if (error.message.includes("Failed to fetch") || error.message.includes("ERR_CONNECTION_REFUSED")) {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Server backend đã chạy chưa?\n2. Server có đang chạy trên port 8080 không?\n3. CORS đã được cấu hình chưa?");
      } else if (error.message.includes("Unexpected token")) {
        setError("Server trả về response không đúng định dạng. Vui lòng kiểm tra backend.");
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => console.log("Google login attempt");

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 font-content">
      <h1 className="mt-4 mb-6 text-[var(--pink)] text-7xl font-title font-bold text-center">
        P-QUIZZ
      </h1>

      <div className="w-full max-w-xl bg-[var(--white)] border-8 border-[var(--pink)] shadow-[0_0_30px_var(--shadow-pink)] px-10 py-6 rounded-lg relative">
        <h2 className="text-center text-3xl font-bold text-[var(--pink)] mb-6">
          ĐĂNG NHẬP
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="whitespace-pre-line">{error}</div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-xl font-semibold text-[var(--pink)] mb-1">
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
            disabled={isLoading}
            className="w-full h-12 bg-[var(--pink)] rounded-lg text-white text-xl font-semibold hover:shadow-lg hover:scale-105 transition-transform ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-12 mt-2 flex items-center justify-center gap-3 rounded-lg border border-[var(--pink)] text-black hover:bg-[var(--pink)] hover:text-white transition ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img className="w-6 h-6 object-contain" src="/google-icon.png" alt="Google" />
            <span className="font-semibold">Đăng nhập bằng Google</span>
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
