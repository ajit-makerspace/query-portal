"use client";

import { useState } from "react";

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 500, y: 300 });

  const VALID_EMAIL = (process.env.NEXT_PUBLIC_LOGIN_EMAIL || "synergyglobal@yopmail.com").trim().toLowerCase();
  const VALID_PASSWORD = process.env.NEXT_PUBLIC_LOGIN_PASSWORD || "synergy@1234";

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    setTimeout(() => {
      if (
        email.trim().toLowerCase() === VALID_EMAIL &&
        password === VALID_PASSWORD
      ) {
        localStorage.setItem("synergy_auth_session", "true");
        localStorage.setItem("synergy_auth_user", VALID_EMAIL);
        onLoginSuccess();
      } else {
        setError("Invalid email address or password. Please try again.");
      }
      setSubmitting(false);
    }, 400);
  };

  return (
    <div
      className="relative min-h-screen bg-[#F7F7F7] flex flex-col justify-center items-center p-4 font-sans overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Interactive Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            WebkitMaskImage: `radial-gradient(350px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`,
            maskImage: `radial-gradient(350px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`,
          }}
        />
      </div>

      <div className="login-box p-6 border border-gray-200 rounded-[24px] shadow-md bg-white relative z-10 w-full max-w-[430px]">
        <div className="w-full max-w-[420px] z-10 animate-fadeIn flex flex-col">
          
          {/* Header Branding */}
          <div className="flex flex-col items-center mb-8 text-center">
            <img
              src="/synergy-logo.png"
              alt="Synergy Global Logo"
              className="h-10 sm:h-12 w-auto object-contain mb-4"
            />
            <h2 className="font-black text-[28px] tracking-tight font-medium leading-none text-slate-800 mb-2">
              Query Portal Login
            </h2>
            <p className="text-[13px] text-gray-500 font-medium max-w-[300px]">
              Access centralized Qonevo, Makerspace & Labs site submissions
            </p>
          </div>

          {/* Login Form Body */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center space-x-2">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="relative">
              <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="synergyglobal@yopmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-[12px] text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-slate-800 focus:bg-white transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <label className="block text-[12px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-gray-200 rounded-[12px] text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-slate-800 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg
                      className="w-[18px] h-[18px]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 012.122-.363c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-[18px] h-[18px]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3.5 bg-slate-900 hover:bg-slate-800 cursor-pointer active:scale-[0.99] text-white font-bold rounded-[12px] text-[15px] shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:active:scale-100"
            >
              {submitting ? (
                <>
                  <div className="w-[18px] h-[18px] border-[2.5px] border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 text-center text-[12px] text-gray-400 font-medium">
            Synergy Global Portal &copy; 2026
          </div>
        </div>
      </div>
    </div>
  );
}
