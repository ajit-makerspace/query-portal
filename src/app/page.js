"use client";

import { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import DataTable from './components/DataTable';
import DetailModal from './components/DetailModal';
import LoginPage from './components/LoginPage';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  const [activeTab, setActiveTab] = useState('all');
  const [allData, setAllData] = useState([]);
  const [qonevoData, setQonevoData] = useState([]);
  const [makerspaceData, setMakerspaceData] = useState([]);
  const [labsData, setLabsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const sourceDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(e.target)) {
        setIsSourceOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check auth session on mount
  useEffect(() => {
    const session = localStorage.getItem('synergy_auth_session');
    const storedEmail = localStorage.getItem('synergy_auth_user');
    if (session === 'true') {
      setIsAuthenticated(true);
      setUserEmail(storedEmail || 'synergyglobal@yopmail.com');
    }
    setCheckingAuth(false);
  }, []);

  // Fetch submissions data when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetchData() {
      setLoading(true);
      try {
        const [resAll, resQonevo, resMakerspace, resLabs] = await Promise.all([
          fetch('/api/all-submissions').then(res => res.json()),
          fetch('/api/qonevo').then(res => res.json()),
          fetch('/api/makerspace').then(res => res.json()),
          fetch('/api/labs').then(res => res.json())
        ]);

        if (resAll.success) setAllData(resAll.data);
        if (resQonevo.success) setQonevoData(resQonevo.data);
        if (resMakerspace.success) setMakerspaceData(resMakerspace.data);
        if (resLabs.success) setLabsData(resLabs.data);
      } catch (err) {
        console.error("Failed to load submissions data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isAuthenticated]);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("synergy_auth_session");
    localStorage.removeItem("synergy_auth_user");
    setIsAuthenticated(false);
    setUserEmail("");
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setUserEmail(localStorage.getItem('synergy_auth_user') || 'synergyglobal@yopmail.com');
  };

  // Show loading spinner while checking local auth session
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render Login Page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Determine current active list to pass to DataTable
  const currentData = activeTab === 'qonevo' 
    ? qonevoData 
    : activeTab === 'makerspace' 
      ? makerspaceData 
      : activeTab === 'labs'
        ? labsData
        : allData;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      
      {/* Top Header Navigation */}
      <Navbar
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Heading & Source Filter Controls */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-700">
              Contact & Enquiry Submissions
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Centralized tabular view for <strong className="text-indigo-600 font-semibold">Qonevo</strong>, <strong className="text-emerald-600 font-semibold">Makerspace</strong> & <strong className="text-purple-600 font-semibold">Labs</strong> databases.
            </p>
          </div>

          {/* Filter Dropdown */}
          <div className="relative self-start md:self-auto" ref={sourceDropdownRef}>
            <div className="flex items-center space-x-2.5 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap select-none">
                Select Source:
              </span>

              <button
                type="button"
                onClick={() => setIsSourceOpen((prev) => !prev)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 font-semibold text-xs sm:text-sm text-slate-700 rounded-lg pl-3 pr-2.5 py-1.5 transition-colors cursor-pointer focus:outline-hidden"
              >
                <span>
                  {activeTab === "all" && "All Data"}
                  {activeTab === "qonevo" && "Qonevo Site"}
                  {activeTab === "makerspace" && "Makerspace Site"}
                  {activeTab === "labs" && "Labs Site"}
                </span>
                <svg
                  className={`w-4 h-4 text-slate-700 transition-transform duration-200 ${isSourceOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Dropdown menu */}
            {isSourceOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-full min-w-[180px] bg-gray-100 border border-gray-200 rounded-xl shadow-lg py-1.5 z-50">
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
                    className={`w-full flex items-center gap-2 px-3.5 py-2 text-left text-xs sm:text-sm transition-colors ${
                      activeTab === item.value
                        ? "bg-gray-200 font-bold text-slate-700"
                        : "font-medium text-slate-700 hover:bg-gray-200/70"
                    }`}
                  >
                    <span className="w-4 flex justify-center">
                      {activeTab === item.value && (
                        <svg className="w-3.5 h-3.5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        </div>

        {/* Overview KPI Stats Cards */}
        <StatsCards
          totalCount={allData.length}
          qonevoCount={qonevoData.length}
          makerspaceCount={makerspaceData.length}
          labsCount={labsData.length}
          data={allData}
        />

        {/* Tabular Data View */}
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-16 text-center shadow-xs">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-600 mb-3"></div>
            <p className="text-sm font-medium text-slate-600">Loading submissions dataset...</p>
          </div>
        ) : (
          <DataTable
            data={currentData}
            activeTab={activeTab}
            onSelectRow={(item) => setSelectedItem(item)}
          />
        )}

      </main>

      {/* Detail Drawer Modal */}
      <DetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-800">
              Confirm Logout
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Are you sure you want to log out? You will need to sign in again to
              access the dashboard.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={cancelLogout}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400 mt-auto">
        Synergy | Qonevo, Makerspace & Labs Data Dashboard &copy; 2026
      </footer>

    </div>
  );
}
