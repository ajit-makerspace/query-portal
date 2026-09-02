"use client";

import { useState, useEffect, useMemo } from "react";

// Custom hook for smooth animated number counting (Ease-Out Quad)
function useAnimatedCount(targetValue, duration = 2500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const endVal = Number(targetValue) || 0;

    if (endVal === 0) {
      setCount(0);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOutQuad = progress * (2 - progress);
      const currentCount = Math.floor(easeOutQuad * endVal);

      setCount(currentCount);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(endVal);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [targetValue, duration]);

  return count;
}

// Custom hook for smooth candle growth animation (Ease-Out Quad 0 to 1)
function useChartProgress(triggerData, duration = 2500) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    setProgress(0);

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easeOut = rawProgress * (2 - rawProgress);

      setProgress(easeOut);

      if (rawProgress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setProgress(1);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [triggerData, duration]);

  return progress;
}

export default function StatsCards({
  totalCount = 0,
  qonevoCount = 0,
  makerspaceCount = 0,
  labsCount = 0,
  data = []
}) {
  const [hoveredBar, setHoveredBar] = useState(null);
  
  // Chart-specific active filter tab (Independent of table down side data)
  const [chartTab, setChartTab] = useState("all");

  // Animated counters for KPI cards
  const animatedTotal = useAnimatedCount(totalCount, 2500);
  const animatedQonevo = useAnimatedCount(qonevoCount, 2500);
  const animatedMakerspace = useAnimatedCount(makerspaceCount, 2500);
  const animatedLabs = useAnimatedCount(labsCount, 2500);

  // Animated progress (0 -> 1) for growing chart candles
  const chartProgress = useChartProgress(`${data.length}-${chartTab}`, 2500);

  // Synergy Dark Navy Logo Colors styling helper for selected cards
  // Outline: #1F314C (Synergy Dark Navy) | Shadow: rgba(31, 49, 76, 0.35)
const getCardStyle = (tabKey, paddingClass = "p-4") => {
  const isSelected = chartTab === tabKey;

  if (isSelected) {
    return {
      style: {
        borderColor: "#E2E8F0",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
        transform: "translateY(-3px)"
      },
      className: `
        ${paddingClass}
        rounded-2xl
        border
        cursor-pointer
        transition-all
        duration-200
      `
    };
  }

  return {
    style: {},
    className: `
      ${paddingClass}
      rounded-2xl
      border
      border-slate-200
      bg-white
      shadow-xs
      cursor-pointer
      transition-all
      duration-200
    `
  };
};

  // Compute month-wise breakdown dynamically filtered strictly for the chart
  const monthlyStackedData = useMemo(() => {
    const monthMap = new Map();

    if (data && data.length > 0) {
      data.forEach(item => {
        const src = item.source || (item.company_name ? 'Qonevo' : item.designation ? 'Labs Site' : 'Makerspace Site');
        
        // Filter dataset based on internal chartTab selection
        if (chartTab === 'qonevo' && src !== 'Qonevo') return;
        if (chartTab === 'makerspace' && src !== 'Makerspace Site') return;
        if (chartTab === 'labs' && src !== 'Labs Site') return;

        const date = item.created_at ? new Date(item.created_at) : null;
        if (!date || isNaN(date.getTime())) return;

        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });

        if (!monthMap.has(key)) {
          monthMap.set(key, {
            key,
            month: label,
            dateObj: new Date(date.getFullYear(), date.getMonth(), 1),
            qonevo: 0,
            makerspace: 0,
            labs: 0,
            total: 0
          });
        }

        const m = monthMap.get(key);
        if (src === 'Qonevo') m.qonevo += 1;
        else if (src === 'Makerspace Site') m.makerspace += 1;
        else if (src === 'Labs Site') m.labs += 1;
        m.total += 1;
      });
    }

    // Convert map to array and sort chronologically ascending
    let sortedMonths = Array.from(monthMap.values()).sort((a, b) => a.dateObj - b.dateObj);

    // Fallback default months if loading
    if (sortedMonths.length === 0) {
      const now = new Date();
      for (let i = 2; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        sortedMonths.push({
          key: `${d.getFullYear()}-${d.getMonth()}`,
          month: label,
          dateObj: d,
          qonevo: 0,
          makerspace: 0,
          labs: 0,
          total: 0
        });
      }
    }

    return sortedMonths.slice(-4);
  }, [data, chartTab]);

  // Clean Y-axis scale rounded to nearest 10 with 35% headroom
  const rawMax = Math.max(...monthlyStackedData.map(m => m.total), 10);
  const maxVal = Math.ceil((rawMax * 1.35) / 10) * 10 || 40;

  const yTicks = [
    maxVal,
    Math.round(maxVal * 0.75),
    Math.round(maxVal * 0.5),
    Math.round(maxVal * 0.25),
    0
  ];

  const svgWidth = 520;
  const svgHeight = 200;
  const leftMargin = 45;
  const rightMargin = 15;
  const baselineY = 150;
  const plotHeight = 110;

  const calcH = (val) => (val / maxVal) * plotHeight;

  const totalCard = getCardStyle('all', 'p-5');
  const qonevoCard = getCardStyle('qonevo', 'p-4');
  const makerspaceCard = getCardStyle('makerspace', 'p-4');
  const labsCard = getCardStyle('labs', 'p-4');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
      
      {/* LEFT SECTION: Total Submissions Header & 3 Portal Share Cards */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        
        {/* Total Submissions Main Card (Icon Removed) */}
        <div
          onClick={() => setChartTab('all')}
          style={totalCard.style}
          className={`${totalCard.className} flex items-center justify-between`}
          title="Click to view total submissions chart"
        >
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Submissions
            </p>
            <div className="flex items-baseline space-x-2.5 mt-1">
              <span className="text-3xl font-black text-slate-900 tracking-tight transition-all">
                {animatedTotal}
              </span>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Live Database Stream
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Aggregated live across Qonevo, Makerspace & Labs Site databases
            </p>
          </div>
        </div>

        {/* Sub-sections: Qonevo, Makerspace & Labs Cards (Icons Removed, Centered) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          
          {/* Qonevo Sub-section (Centered) */}
          <div
            onClick={() => setChartTab('qonevo')}
            style={qonevoCard.style}
            className={`${qonevoCard.className} flex flex-col justify-between text-center`}
            title="Click to view Qonevo monthly chart"
          >
            <div className="text-center mb-1">
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                Qonevo
              </span>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 text-center transition-all">{animatedQonevo}</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${totalCount > 0 ? (animatedQonevo / totalCount) * 100 : 0}%`,
                  }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 flex justify-between font-medium">
                <span>Share</span>
                <span className="font-bold text-slate-700">
                  {totalCount > 0 ? ((qonevoCount / totalCount) * 100).toFixed(0) : 0}%
                </span>
              </p>
            </div>
          </div>

          {/* Makerspace Sub-section (Centered) */}
          <div
            onClick={() => setChartTab('makerspace')}
            style={makerspaceCard.style}
            className={`${makerspaceCard.className} flex flex-col justify-between text-center`}
            title="Click to view Makerspace monthly chart"
          >
            <div className="text-center mb-1">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                Makerspace
              </span>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 text-center transition-all">{animatedMakerspace}</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${totalCount > 0 ? (animatedMakerspace / totalCount) * 100 : 0}%`,
                  }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 flex justify-between font-medium">
                <span>Share</span>
                <span className="font-bold text-slate-700">
                  {totalCount > 0 ? ((makerspaceCount / totalCount) * 100).toFixed(0) : 0}%
                </span>
              </p>
            </div>
          </div>

          {/* Labs Sub-section (Centered) */}
          <div
            onClick={() => setChartTab('labs')}
            style={labsCard.style}
            className={`${labsCard.className} flex flex-col justify-between text-center`}
            title="Click to view Labs Site monthly chart"
          >
            <div className="text-center mb-1">
              <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
                Labs Site
              </span>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 text-center transition-all">{animatedLabs}</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${totalCount > 0 ? (animatedLabs / totalCount) * 100 : 0}%`,
                  }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 flex justify-between font-medium">
                <span>Share</span>
                <span className="font-bold text-slate-700">
                  {totalCount > 0 ? ((labsCount / totalCount) * 100).toFixed(0) : 0}%
                </span>
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* RIGHT SECTION: Dynamic 100% Perfectly Aligned Stacked Chart */}
      <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        
        {/* Header & Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
              <span>
                {chartTab === 'all' && 'Monthly Submissions Breakdown'}
                {chartTab === 'qonevo' && 'Qonevo Monthly Breakdown'}
                {chartTab === 'makerspace' && 'Makerspace Monthly Breakdown'}
                {chartTab === 'labs' && 'Labs Site Monthly Breakdown'}
              </span>
              <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                Live Stream
              </span>
              {chartTab !== 'all' && (
                <button
                  onClick={() => setChartTab('all')}
                  className="text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2 py-0.5 rounded-md transition cursor-pointer"
                  title="Reset chart to All Data"
                >
                  Reset Filter ✕
                </button>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {chartTab === 'all'
                ? 'Live submission growth categorized per database source'
                : `Showing monthly submissions specifically for ${chartTab.toUpperCase()}`}
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-4 text-xs font-semibold">
            {(chartTab === 'all' || chartTab === 'qonevo') && (
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-xs bg-indigo-600 inline-block shadow-2xs"></span>
                <span className="text-slate-700 font-medium">Qonevo</span>
              </div>
            )}
            {(chartTab === 'all' || chartTab === 'makerspace') && (
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block shadow-2xs"></span>
                <span className="text-slate-700 font-medium">Makerspace</span>
              </div>
            )}
            {(chartTab === 'all' || chartTab === 'labs') && (
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-xs bg-purple-600 inline-block shadow-2xs"></span>
                <span className="text-slate-700 font-medium">Labs</span>
              </div>
            )}
          </div>
        </div>

        {/* 100% SVG Self-Contained Aligned Plot */}
        <div className="relative my-2">
          <svg className="w-full h-[200px]" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
            
            {/* SVG ClipPaths for Animated Growing Candles (Top-Only Rounding, Flat Bottom) */}
            <defs>
              {monthlyStackedData.map((item, index) => {
                const colWidth = 52;
                const usableWidth = svgWidth - leftMargin - rightMargin;
                const spacing = usableWidth / monthlyStackedData.length;
                const centerX = leftMargin + spacing * index + spacing / 2;
                const xPos = centerX - colWidth / 2;
                
                const fullTotalH = calcH(item.total);
                const animatedTotalH = fullTotalH * chartProgress;
                const r = Math.min(6, animatedTotalH / 2);

                return (
                  <clipPath id={`candle-clip-${index}`} key={`clip-${index}`}>
                    {animatedTotalH > 0 && (
                      <path
                        d={`
                          M ${xPos},${baselineY}
                          V ${baselineY - animatedTotalH + r}
                          a ${r},${r} 0 0 1 ${r},-${r}
                          H ${xPos + colWidth - r}
                          a ${r},${r} 0 0 1 ${r},${r}
                          V ${baselineY}
                          Z
                        `}
                      />
                    )}
                  </clipPath>
                );
              })}
            </defs>

            {/* Grid Lines & Y-Axis Scale Labels */}
            {yTicks.map((val, idx) => {
              const yPos = baselineY - calcH(val);
              return (
                <g key={idx}>
                  <line
                    x1={leftMargin}
                    y1={yPos}
                    x2={svgWidth - rightMargin}
                    y2={yPos}
                    stroke={idx === yTicks.length - 1 ? "#cbd5e1" : "#f1f5f9"}
                    strokeWidth={idx === yTicks.length - 1 ? "1.5" : "1"}
                    strokeDasharray={idx === yTicks.length - 1 ? undefined : "4 4"}
                  />
                  <text
                    x={leftMargin - 8}
                    y={yPos + 3.5}
                    textAnchor="end"
                    className="text-[10px] font-semibold fill-slate-400 font-sans"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Stacked Columns & Aligned Month Labels */}
            {monthlyStackedData.map((item, index) => {
              const colWidth = 52;
              const usableWidth = svgWidth - leftMargin - rightMargin;
              const spacing = usableWidth / monthlyStackedData.length;
              const centerX = leftMargin + spacing * index + spacing / 2;
              const xPos = centerX - colWidth / 2;

              // Animated segment heights & positions based on chartProgress
              const fullQonevoH = calcH(item.qonevo);
              const fullMakerspaceH = calcH(item.makerspace);
              const fullLabsH = calcH(item.labs);
              const fullTotalH = calcH(item.total);

              const animatedQonevoH = fullQonevoH * chartProgress;
              const animatedMakerspaceH = fullMakerspaceH * chartProgress;
              const animatedLabsH = fullLabsH * chartProgress;
              const animatedTotalH = fullTotalH * chartProgress;

              const qonevoY = baselineY - animatedQonevoH;
              const makerspaceY = qonevoY - animatedMakerspaceH;
              const labsY = makerspaceY - animatedLabsH;

              const currentPillCount = Math.floor(item.total * chartProgress);
              const isHovered = hoveredBar?.month === item.month;

              return (
                <g
                  key={index}
                  className="cursor-pointer group transition-all duration-200"
                  onMouseEnter={() => setHoveredBar(item)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Invisible Hover Target Box */}
                  <rect
                    x={xPos - 10}
                    y={15}
                    width={colWidth + 20}
                    height={svgHeight - 15}
                    fill="transparent"
                  />

                  {/* Growing Stacked Candle Column Group */}
                  <g
                    clipPath={animatedTotalH > 0 ? `url(#candle-clip-${index})` : undefined}
                    className="transition-opacity duration-200 group-hover:opacity-90"
                  >
                    
                    {/* Bottom Stack: Qonevo */}
                    {item.qonevo > 0 && (
                      <rect
                        x={xPos}
                        y={qonevoY}
                        width={colWidth}
                        height={animatedQonevoH + 0.5}
                        fill="#4F46E5"
                      />
                    )}

                    {/* Middle Stack: Makerspace */}
                    {item.makerspace > 0 && (
                      <rect
                        x={xPos}
                        y={makerspaceY}
                        width={colWidth}
                        height={animatedMakerspaceH + 0.5}
                        fill="#10B981"
                      />
                    )}

                    {/* Top Stack: Labs */}
                    {item.labs > 0 && (
                      <rect
                        x={xPos}
                        y={labsY}
                        width={colWidth}
                        height={animatedLabsH + 0.5}
                        fill="#9333EA"
                      />
                    )}
                  </g>

                  {/* Count Pill Badge Floating & Rising Above Growing Candle */}
                  {item.total > 0 && animatedTotalH > 3 && (
                    <g transform={`translate(${centerX}, ${baselineY - animatedTotalH - 12})`}>
                      <rect
                        x="-16"
                        y="-10"
                        width="32"
                        height="16"
                        rx="8"
                        fill="#0F172A"
                        className="transition-transform duration-200 group-hover:scale-110"
                      />
                      <text
                        x="0"
                        y="1.5"
                        textAnchor="middle"
                        className="text-[10px] font-extrabold fill-white font-sans"
                      >
                        {currentPillCount}
                      </text>
                    </g>
                  )}

                  {/* 100% PERFECTLY ALIGNED Month Pill Badge Below Baseline */}
                  <g transform={`translate(${centerX}, ${baselineY + 24})`}>
                    <rect
                      x="-38"
                      y="-11"
                      width="76"
                      height="22"
                      rx="11"
                      fill={isHovered ? "#0F172A" : "#F8FAFC"}
                      stroke={isHovered ? "#0F172A" : "#E2E8F0"}
                      strokeWidth="1"
                      className="transition-all duration-200"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      className={`text-[11px] font-extrabold font-sans transition-colors duration-200 ${
                        isHovered ? "fill-white" : "fill-slate-700"
                      }`}
                    >
                      {item.month}
                    </text>
                  </g>

                </g>
              );
            })}
          </svg>
        </div>

        {/* Footer Interaction Bar */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {hoveredBar ? (
            <div className="flex items-center space-x-3 text-xs font-semibold text-slate-700 animate-fadeIn">
              <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {hoveredBar.month}
              </span>
              <span>
                Month Total: <strong className="text-slate-900">{hoveredBar.total}</strong>
              </span>
              <span className="text-slate-300">|</span>
              {(chartTab === 'all' || chartTab === 'qonevo') && (
                <span className="text-indigo-600 font-bold">
                  Qonevo: {hoveredBar.qonevo}
                </span>
              )}
              {(chartTab === 'all' || chartTab === 'makerspace') && (
                <span className="text-emerald-600 font-bold">
                  Makerspace: {hoveredBar.makerspace}
                </span>
              )}
              {(chartTab === 'all' || chartTab === 'labs') && (
                <span className="text-purple-600 font-bold">
                  Labs: {hoveredBar.labs}
                </span>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="text-slate-500 font-medium">
                  {chartTab === 'all'
                    ? 'Click any portal card to isolate monthly chart breakdown'
                    : `Filtered chart view for ${chartTab.toUpperCase()} (Click card or Reset to view all)`}
                </span>
              </div>
              <span className="text-slate-400 font-medium">Strict Live Stream</span>
            </>
          )}
        </div>

      </div>

    </div>
  );
}
