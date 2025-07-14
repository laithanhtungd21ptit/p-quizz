import React, { useState } from "react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleEmailChange = (e) => setEmail(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Forgot password email:", email);
    // TODO: Implement send reset link logic
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start pt-4 px-4 font-content">
      {/* H1 giữ P-QUIZZ */}
      <h1 className="mt-4 mb-6 text-[var(--pink)] text-7xl font-title font-bold text-center">
        P-QUIZZ
      </h1>

      <div className="w-full max-w-md bg-[var(--white)] border-8 border-[var(--pink)] shadow-[0_4px_30px_var(--shadow-pink)] p-6 rounded-lg">
        {/* Instruction inside white box */}
        <p className="mb-4 text-xl font-bold text-[var(--pink)]">
          Vui lòng nhập email của bạn
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email input */}
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

          {/* Submit button */}
          <button
            type="submit"
            className="w-full h-12 bg-[var(--pink)] rounded-lg text-white text-xl font-semibold hover:shadow-lg hover:scale-105 transition-transform ease-in-out"
          >
            Gửi link đổi mật khẩu tới email
          </button>
        </form>

        {/* Back to login text with arrow */}
        <div className="mt-6 text-center">
          <p className="text-black text-base inline-flex items-center">
            {/* <img src="/arrow-left.png" alt="Back" className="inline-block align-middle w-4 h-4 mr-2" /> */}
            Quay lại <Link to="/login" className="text-[var(--pink)] font-semibold hover:underline transition ease-in-out ml-1">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
