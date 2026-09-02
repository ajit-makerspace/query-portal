"use client";

export default function Navbar({ userEmail, userName, onLogout }) {
  const displayName = userName || process.env.NEXT_PUBLIC_USER_NAME || "Synergy Global";

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
          </div>

          {/* User Name & Logout */}
          {onLogout && (
            <div className="flex items-center space-x-3.5">
              <div className="flex items-center space-x-2 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="text-xs font-extrabold text-slate-800 tracking-tight">
                  {displayName}
                </span>
              </div>

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
