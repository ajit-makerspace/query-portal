"use client";

import { useState, useMemo, useRef, useEffect } from 'react';

export default function DataTable({ data, activeTab, setActiveTab, onSelectRow }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const sourceDropdownRef = useRef(null);
  const itemsPerPage = 10;

  useEffect(() => {
    function handleClickOutside(e) {
      if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(e.target)) {
        setIsSourceOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper: merge the source-specific "raw" fields onto the normalized item
  // so the detail modal always has both shapes available, regardless of
  // which tab (All Data vs a specific source) the row was clicked from.
  const withRaw = (item) => ({ ...item, ...(item.raw || {}) });

  // Filter data based on search query AND date range
  const filteredData = useMemo(() => {
    let result = data;

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) => {
        const name = (item.full_name || `${item.first_name || ''} ${item.last_name || ''}`).toLowerCase();
        const email = (item.email || '').toLowerCase();
        const phone = (item.phone_number || item.phone || '').toLowerCase();
        const company = (item.company_name || item.institution || item.company_or_institution || '').toLowerCase();
        const city = (item.city || '').toLowerCase();
        const designation = (item.designation || item.role || '').toLowerCase();
        const message = (item.help_message || item.comment || item.message || '').toLowerCase();

        return (
          name.includes(query) ||
          email.includes(query) ||
          phone.includes(query) ||
          company.includes(query) ||
          city.includes(query) ||
          designation.includes(query) ||
          message.includes(query)
        );
      });
    }

    // Start Date Filter (From)
    if (startDate) {
      const startMs = new Date(startDate).setHours(0, 0, 0, 0);
      result = result.filter(item => {
        const itemDateMs = item.created_at ? new Date(item.created_at).getTime() : 0;
        return itemDateMs >= startMs;
      });
    }

    // End Date Filter (To)
    if (endDate) {
      const endMs = new Date(endDate).setHours(23, 59, 59, 999);
      result = result.filter(item => {
        const itemDateMs = item.created_at ? new Date(item.created_at).getTime() : 0;
        return itemDateMs <= endMs;
      });
    }

    return result;
  }, [data, searchQuery, startDate, endDate]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  // Number of columns for the current tab (used for the empty-state colSpan)
  const columnCount = activeTab === 'all' ? 6 : 8;

  // Helper: pull the common fields out of any record shape (qonevo / makerspace / labs)
  const getCommonFields = (item) => ({
    fullName: item.full_name || `${item.first_name || ''} ${item.last_name || ''}`.trim(),
    email: item.email || '',
    phone: item.phone_number || item.phone || '',
    company: item.company_name || item.institution || item.company_or_institution || '',
    message: item.help_message || item.comment || item.message || '',
  });

  // Export CSV function
  const handleExportCSV = () => {
    if (!filteredData.length) return;

    let headers = [];
    let rows = [];

    if (activeTab === 'qonevo') {
      headers = ['ID', 'Full Name', 'Email', 'Phone Number', 'Company Name', 'Website URL', 'Help Message', 'Submitted Date'];
      rows = filteredData.map(item => [
        item.id,
        `"${item.full_name || ''}"`,
        `"${item.email || ''}"`,
        `"${item.phone_number || ''}"`,
        `"${item.company_name || ''}"`,
        `"${item.website_url || ''}"`,
        `"${(item.help_message || '').replace(/"/g, '""')}"`,
        `"${item.created_at || ''}"`
      ]);
    } else if (activeTab === 'makerspace') {
      headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Role', 'Institution', 'Org Type', 'Location', 'Students', 'Solution Interest', 'Implementation Time', 'Comment', 'Submitted Date'];
      rows = filteredData.map(item => [
        item.id,
        `"${item.first_name || ''}"`,
        `"${item.last_name || ''}"`,
        `"${item.email || ''}"`,
        `"${item.phone || ''}"`,
        `"${item.role || ''}"`,
        `"${item.institution || ''}"`,
        `"${item.organization_type || ''}"`,
        `"${item.location || ''}"`,
        `"${item.students || ''}"`,
        `"${item.solution_interest || ''}"`,
        `"${item.implementation_time || ''}"`,
        `"${(item.comment || '').replace(/"/g, '""')}"`,
        `"${item.created_at || ''}"`
      ]);
    } else if (activeTab === 'labs') {
      headers = ['ID', 'Full Name', 'Email', 'Phone', 'School/Institution', 'City', 'Designation', 'Message / Space Details', 'Submitted Date'];
      rows = filteredData.map(item => [
        item.id,
        `"${item.full_name || ''}"`,
        `"${item.email || ''}"`,
        `"${item.phone || ''}"`,
        `"${item.institution || ''}"`,
        `"${item.city || ''}"`,
        `"${item.designation || ''}"`,
        `"${(item.message || '').replace(/"/g, '""')}"`,
        `"${item.created_at || ''}"`
      ]);
    } else {
      headers = ['Full Name', 'Email', 'Phone', 'Company / Institution', 'Message / Comment', 'Date'];
      rows = filteredData.map(item => {
        const f = getCommonFields(item);
        return [
          `"${f.fullName}"`,
          `"${f.email}"`,
          `"${f.phone}"`,
          `"${f.company}"`,
          `"${f.message.replace(/"/g, '""')}"`,
          `"${item.created_at || ''}"`
        ];
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeTab}_submissions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

      {/* Table Header Actions Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col xl:flex-row gap-3 items-center justify-between">

        {/* Left Side: Search Input & Entry Counter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <span className="text-xs text-slate-500 font-medium hidden lg:inline-block">
            Showing <strong className="text-slate-800">{filteredData.length}</strong> entries
          </span>
        </div>

        {/* Right Side: Date Range Filter, Source Filter & Export CSV */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-between xl:justify-end">

          {/* Date Range Filter (From & To) */}
          <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider select-none pr-1">
              Date:
            </span>
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-slate-500 font-semibold text-[11px]">From</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-300 font-bold text-xs text-slate-800 rounded-md px-2 py-0.5 focus:outline-none cursor-pointer"
              />
              <span className="text-slate-500 font-semibold text-[11px]">To</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-300 font-bold text-xs text-slate-800 rounded-md px-2 py-0.5 focus:outline-none cursor-pointer"
              />
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setCurrentPage(1);
                  }}
                  className="px-1.5 py-0.5 text-[10px] font-extrabold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md transition"
                  title="Clear dates"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Select Source Dropdown Filter */}
          {setActiveTab && (
            <div className="relative" ref={sourceDropdownRef}>
              <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap select-none">
                  Sites:
                </span>

                <button
                  type="button"
                  onClick={() => setIsSourceOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 font-bold text-xs text-slate-800 rounded-md px-2.5 py-1 transition-colors cursor-pointer"
                >
                 <span className="block max-w-[78px] truncate">
  {activeTab === "all" && "All Data"}
  {activeTab === "qonevo" && "Qonevo Site"}
  {activeTab === "makerspace" && "Makerspace Site"}
  {activeTab === "labs" && "Labs Site"}
</span>
                  <svg
                    className={`w-3.5 h-3.5 text-slate-700 transition-transform duration-200 ${isSourceOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Dropdown Menu */}
              {isSourceOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
                  {[
                    { value: "all", label: "All Data" },
                    { value: "qonevo", label: "Qonevo Site" },
                    { value: "makerspace", label: "Makerspace Site" },
                    { value: "labs", label: "Labs Site" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.value);
                        setIsSourceOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3.5 py-2 text-left text-xs font-semibold transition-colors ${
                        activeTab === item.value
                          ? "bg-slate-100 font-extrabold text-slate-900"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="w-4 flex justify-center">
                        {activeTab === item.value && (
                          <svg className="w-3.5 h-3.5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-2xs transition flex items-center space-x-1.5 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>

      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-slate-700">

          {/* Dynamic Table Column Headers */}
          <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
            {activeTab === 'qonevo' ? (
              <tr>
                <th className="py-3.5 px-4">Full Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Phone Number</th>
                <th className="py-3.5 px-4">Company Name</th>
                <th className="py-3.5 px-4">Website URL</th>
                <th className="py-3.5 px-4">How Can We Help?</th>
                <th className="py-3.5 px-4">Submitted Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            ) : activeTab === 'makerspace' ? (
              <tr>
                <th className="py-3.5 px-4">Full Name</th>
                <th className="py-3.5 px-4">Email & Phone</th>
                <th className="py-3.5 px-4">Role & Institution</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Solution Interest</th>
                <th className="py-3.5 px-4">Timeframe</th>
                <th className="py-3.5 px-4">Submitted Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            ) : activeTab === 'labs' ? (
              <tr>
                <th className="py-3.5 px-4">Full Name</th>
                <th className="py-3.5 px-4">Email & Phone</th>
                <th className="py-3.5 px-4">School / Institution</th>
                <th className="py-3.5 px-4">City</th>
                <th className="py-3.5 px-4">Designation</th>
                <th className="py-3.5 px-4">Message / Details</th>
                <th className="py-3.5 px-4">Submitted Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            ) : (
              // "All Data" view: only the 5 common fields + action
              <tr>
                <th className="py-3.5 px-4">Full Name</th>
                <th className="py-3.5 px-4">Email / Phone</th>
                <th className="py-3.5 px-4">Company / Institution</th>
                <th className="py-3.5 px-4">Message </th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            )}
          </thead>

          {/* Table Rows */}
          <tbody className="divide-y divide-slate-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="py-12 text-center text-slate-400">
                  <svg className="w-10 h-10 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-medium text-slate-600">No matching submissions found</p>
                  <p className="text-xs text-slate-400 mt-0.5">Try searching with a different date range or keyword</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => {
                return (
                  <tr
                    key={item.id || idx}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectRow(withRaw(item))}
                  >

                    {/* View: Qonevo Specific */}
                    {activeTab === 'qonevo' && (
                      <>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{item.full_name}</td>
                        <td className="py-3.5 px-4 text-blue-600 font-medium">{item.email}</td>
                        <td className="py-3.5 px-4 text-slate-700">{item.phone_number || item.phone}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">{item.company_name || 'N/A'}</td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-[150px] truncate">
                          {item.website_url ? (
                            <a href={item.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {item.website_url.replace(/^https?:\/\//, '')}
                            </a>
                          ) : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-[250px] truncate" title={item.help_message}>
                          {item.help_message}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </>
                    )}

                    {/* View: Makerspace Specific */}
                    {activeTab === 'makerspace' && (
                      <>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {item.first_name ? `${item.first_name} ${item.last_name}` : item.full_name}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-blue-600">{item.email}</div>
                          <div className="text-xs text-slate-500">{item.phone}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">{item.institution}</div>
                          <div className="text-xs text-slate-500">{item.role}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">{item.location || 'N/A'}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2 py-0.5 rounded-md font-medium">
                            {item.solution_interest || 'General'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{item.implementation_time || 'N/A'}</td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </>
                    )}

                    {/* View: Labs Specific */}
                    {activeTab === 'labs' && (
                      <>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{item.full_name}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-blue-600">{item.email}</div>
                          <div className="text-xs text-slate-500">{item.phone}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">{item.institution || 'N/A'}</td>
                        <td className="py-3.5 px-4 text-slate-700">{item.city || 'N/A'}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block bg-purple-50 text-purple-700 border border-purple-200 text-xs px-2 py-0.5 rounded-md font-medium">
                            {item.designation || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-[250px] truncate" title={item.message}>
                          {item.message || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </>
                    )}

                    {/* View: Combined "All Data" — only the 5 common fields */}
                    {activeTab === 'all' && (() => {
                      const f = getCommonFields(item);
                      return (
                        <>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">{f.fullName || 'N/A'}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-blue-600">{f.email || 'N/A'}</div>
                            <div className="text-xs text-slate-500">{f.phone}</div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-800">{f.company || 'N/A'}</td>
                          <td className="py-3.5 px-4 text-slate-600 max-w-[260px] truncate" title={f.message}>
                            {f.message || 'N/A'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                        </>
                      );
                    })()}

                    {/* Action button column */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRow(withRaw(item));
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 transition"
                      >
                        View
                      </button>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>

          <span className="text-xs text-slate-500">
            Page <strong className="text-slate-800">{currentPage}</strong> of <strong className="text-slate-800">{totalPages}</strong>
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
}