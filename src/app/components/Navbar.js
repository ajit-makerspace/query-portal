"use client";

export default function Navbar({ activeTab, setActiveTab, totalCount, qonevoCount, makerspaceCount }) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white px-3.5 py-1.5 rounded-xl shadow-xs">
              <img
                src="/synergy-logo.png"
                alt="Synergy Logo"
                className="h-6 sm:h-7 object-contain"
              />
            </div>

            <span className="font-bold text-base sm:text-lg text-white tracking-tight">
              Query Hub
            </span>

            <span className="hidden md:inline-block text-xs font-semibold px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full border border-slate-700">
              Makerspace & Qonevo Portal
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>All Data</span>
              <span className={`ml-1.5 text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'all' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {totalCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('qonevo')}
              className={`px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'qonevo'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>Qonevo Site</span>
              <span className={`ml-1.5 text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'qonevo' ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {qonevoCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('makerspace')}
              className={`px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'makerspace'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>Makerspace Site</span>
              <span className={`ml-1.5 text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'makerspace' ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {makerspaceCount}
              </span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
