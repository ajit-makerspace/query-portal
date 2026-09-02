"use client";

export default function Navbar({ userEmail, onLogout }) {
  return (
    <header className="bg-white text-slate-900 sticky top-0 z-40 shadow-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center py-1">
              <img
                src="/synergy-logo.png"
                alt="Synergy Logo"
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </div>

            <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
              Query Portal
            </span>

            <span className="hidden md:inline-block text-xs font-bold px-3 py-1 bg-slate-900 text-slate-200 rounded-full border border-slate-800">
              Makerspace, Qonevo & Labs Portal
            </span>
          </div>

          {/* User Email & Logout */}
          {onLogout && (
            <div className="flex items-center space-x-3">
              {userEmail && (
                <span className="hidden sm:inline-block text-xs text-slate-600 font-semibold max-w-[200px] truncate" title={userEmail}>
                  {userEmail}
                </span>
              )}
              <button
                onClick={onLogout}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
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
