"use client";

export default function DetailModal({ item, onClose }) {
  if (!item) return null;

  const isQonevo = item.source === 'Qonevo' || !!item.company_name;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-fadeIn">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
              isQonevo ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-white'
            }`}>
              {item.source || (isQonevo ? 'Qonevo' : 'Makerspace Site')}
            </span>
            <h3 className="text-lg font-bold">Submission Details</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-md hover:bg-slate-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Main Info Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <p className="text-base font-semibold text-slate-900 mt-0.5">
                  {item.full_name || `${item.first_name || ''} ${item.last_name || ''}`}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <p className="text-sm font-medium text-blue-600 mt-0.5">{item.email}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                <p className="text-sm text-slate-800 mt-0.5">{item.phone_number || item.phone || 'N/A'}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted On</label>
                <p className="text-sm text-slate-800 mt-0.5">
                  {item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Specific Fields depending on source */}
          {isQonevo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 pt-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company Name</label>
                <p className="text-sm font-medium text-slate-800 mt-0.5">{item.company_name || 'N/A'}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Website URL</label>
                <p className="text-sm text-slate-800 mt-0.5">
                  {item.website_url ? (
                    <a href={item.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {item.website_url}
                    </a>
                  ) : 'N/A'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 pt-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Institution / School</label>
                <p className="text-sm font-medium text-slate-800 mt-0.5">{item.institution || 'N/A'}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Role</label>
                <p className="text-sm text-slate-800 mt-0.5">{item.role || 'N/A'}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Organization Type</label>
                <p className="text-sm text-slate-800 mt-0.5">{item.organization_type || 'N/A'}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</label>
                <p className="text-sm text-slate-800 mt-0.5">{item.location || 'N/A'}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Students Count</label>
                <p className="text-sm text-slate-800 mt-0.5">{item.students || 'N/A'}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Implementation Timeframe</label>
                <p className="text-sm text-slate-800 mt-0.5">{item.implementation_time || 'N/A'}</p>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Solution Interest</label>
                <p className="text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 mt-1 inline-block">
                  {item.solution_interest || 'N/A'}
                </p>
              </div>
            </div>
          )}

          {/* Message / Comment Section */}
          <div className="border-t border-slate-200 pt-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isQonevo ? "How Can We Help?" : "Enquiry Comment"}
            </label>
            <div className="mt-1.5 p-4 bg-slate-50 rounded-xl text-sm text-slate-800 leading-relaxed border border-slate-200">
              {item.help_message || item.comment || item.message || "No message provided."}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition shadow-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
