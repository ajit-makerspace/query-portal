"use client";

import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import DataTable from './components/DataTable';
import DetailModal from './components/DetailModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState('all');
  const [allData, setAllData] = useState([]);
  const [qonevoData, setQonevoData] = useState([]);
  const [makerspaceData, setMakerspaceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
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
  }, []);

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
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalCount={allData.length}
        qonevoCount={qonevoData.length}
        makerspaceCount={makerspaceData.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Heading & Intro */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Contact & Enquiry Submissions
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Centralized tabular view for <strong className="text-indigo-600 font-semibold">Qonevo</strong> & <strong className="text-emerald-600 font-semibold">Makerspace Site</strong> databases.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-600 font-medium">DB Connection Status: Ready (Mock/Active)</span>
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
