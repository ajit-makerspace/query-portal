"use client";

export default function Navbar({ userEmail, onLogout }) {
  return (
    <header className="bg-[#f8f9fa]  bg-[#f8f9fa] text-blue-900 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center  px-3.5 py-1.5">
              <img
                src="/synergy-logo.png"
                alt="Synergy Logo"
                className="h-6 sm:h-7 object-contain"
              />
            </div>

            <span className="font-bold text-base sm:text-lg text-slate-800 bg-[#f8f9fa] tracking-tight">
              Query Hub
            </span>

            <span className="hidden md:inline-block text-xs font-semibold px-2.5 py-1 bg-slate-900 text-slate-300 rounded-full border border-slate-700">
              Makerspace & Qonevo Portal
            </span>
          </div>

          {/* User Email & Logout */}
          {onLogout && (
            <div className="flex items-center space-x-3">
              {/* {userEmail && (
                <span className="hidden sm:inline-block text-xs text-slate-900 font-semibold max-w-[180px] truncate" title={userEmail}>
                  {userEmail}
                </span>
              )} */}
              <button
                onClick={onLogout}
                className="px-3.5 py-1.5 text-slate-900 hover:bg-slate-900 text-slate-900 cursor-pointer hover:text-white border border-blue-900 rounded-lg text-xs font-semibold transition shadow-xs h-8 w-20"
                title="Sign out of dashboard"
              >
                Logout
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
