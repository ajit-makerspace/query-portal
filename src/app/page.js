"use client";

import { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

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
        const [resAll, resQonevo, resMakerspace] = await Promise.all([
          fetch('/api/all-submissions').then(res => res.json()),
          fetch('/api/qonevo').then(res => res.json()),
          fetch('/api/makerspace').then(res => res.json())
        ]);

        if (resAll.success) setAllData(resAll.data);
        if (resQonevo.success) setQonevoData(resQonevo.data);
        if (resMakerspace.success) setMakerspaceData(resMakerspace.data);
      } catch (err) {
        console.error("Failed to load submissions data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('synergy_auth_session');
    localStorage.removeItem('synergy_auth_user');
    setIsAuthenticated(false);
    setUserEmail('');
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Contact & Enquiry Submissions
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Centralized tabular view for <strong className="text-indigo-600 font-semibold">Qonevo</strong> & <strong className="text-emerald-600 font-semibold">Makerspace Site</strong> databases.
            </p>
          </div>

          {/* Filter Tabs in Component Section */}
          <div className="flex items-center space-x-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs self-start md:self-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>All Data</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'all' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {allData.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('qonevo')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'qonevo'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>Qonevo Site</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'qonevo' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {qonevoData.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('makerspace')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'makerspace'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>Makerspace Site</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'makerspace' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {makerspaceData.length}
              </span>
            </button>
          </div>
        </div>

        {/* Overview KPI Stats Cards */}
        <StatsCards
          totalCount={allData.length}
          qonevoCount={qonevoData.length}
          makerspaceCount={makerspaceData.length}
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

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400 mt-auto">
        Synergy | Qonevo & Makerspace Data Dashboard &copy; 2026
      </footer>

    </div>
  );
}
