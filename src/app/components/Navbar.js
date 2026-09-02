"use client";
import Image from "next/image";

export default function Navbar({ userEmail, userName, onLogout }) {
  const displayName = userName || process.env.NEXT_PUBLIC_USER_NAME || "Synergy Global";

  // Generate initials from display name
  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="bg-white text-slate-900 sticky top-0 z-40 shadow-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center py-1">
              <Image
              width={200}
              height={30}
                src="/synergy-logo.png"
                alt="Synergy Logo"
                className="h-7 sm:h-8 w-auto object-contain"
                
              />
            </div>

            <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
              Query Portal
            </span>
          </div>

          {/* User Avatar & Logout */}
          {onLogout && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold tracking-wide">
                  {initials}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:block">
                  {displayName}
                </span>
              </div>

              <button
                onClick={onLogout}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition shadow-sm cursor-pointer"
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