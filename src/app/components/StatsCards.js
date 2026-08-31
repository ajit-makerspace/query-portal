"use client";

export default function StatsCards({ totalCount, qonevoCount, makerspaceCount }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      
      {/* Total Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Submissions</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</p>
          <p className="text-xs text-slate-500 mt-1">Across Qonevo & Makerspace</p>
        </div>
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
      </div>

      {/* Qonevo Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Qonevo Contacts</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{qonevoCount}</p>
          <p className="text-xs text-slate-500 mt-1">Let's Connect Form Entries</p>
        </div>
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      </div>

      {/* Makerspace Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Makerspace Site Enquiries</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{makerspaceCount}</p>
          <p className="text-xs text-slate-500 mt-1">Institutional & Lab Requests</p>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>

    </div>
  );
}
