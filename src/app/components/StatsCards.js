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

export default function StatsCards({ totalCount = 0, qonevoCount = 0, makerspaceCount = 0, labsCount = 0, data = [] }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  // Animated counters for KPI cards
  const animatedTotal = useAnimatedCount(totalCount, 2500);
  const animatedQonevo = useAnimatedCount(qonevoCount, 2500);
  const animatedMakerspace = useAnimatedCount(makerspaceCount, 2500);
  const animatedLabs = useAnimatedCount(labsCount, 2500);

  // Animated progress (0 -> 1) for growing chart candles
  const chartProgress = useChartProgress(data, 2500);

  // Compute month-wise breakdown dynamically from live dataset
  const monthlyStackedData = useMemo(() => {
    const monthMap = new Map();

    if (data && data.length > 0) {
      data.forEach(item => {
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
        const src = item.source || (item.company_name ? 'Qonevo' : item.designation ? 'Labs Site' : 'Makerspace Site');
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
  }, [data]);

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
      
      {/* LEFT SECTION: Total Submissions Header & 3 Portal Share Cards */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        
        {/* Total Submissions Main Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
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
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shadow-2xs">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
        </div>

        {/* Sub-sections: Qonevo, Makerspace & Labs Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          
          {/* Qonevo Sub-section */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                Qonevo
              </span>
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 transition-all">{animatedQonevo}</p>
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

          {/* Makerspace Sub-section */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-200 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                Makerspace
              </span>
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 transition-all">{animatedMakerspace}</p>
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

          {/* Labs Sub-section */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-purple-200 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
                Labs Site
              </span>
              <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.605 15.13a1.996 1.996 0 01-1.022-.547M19 12a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 transition-all">{animatedLabs}</p>
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

      {/* RIGHT SECTION: 100% Perfectly Aligned Executive-Grade Stacked Chart */}
      <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        
        {/* Header & Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
              <span>Monthly Submissions Breakdown</span>
              <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                Live Stream
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live submission growth categorized per database source
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-4 text-xs font-semibold">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-xs bg-indigo-600 inline-block shadow-2xs"></span>
              <span className="text-slate-700 font-medium">Qonevo</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block shadow-2xs"></span>
              <span className="text-slate-700 font-medium">Makerspace</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-xs bg-purple-600 inline-block shadow-2xs"></span>
              <span className="text-slate-700 font-medium">Labs</span>
            </div>
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
              <span className="text-indigo-600 font-bold">
                Qonevo: {hoveredBar.qonevo}
              </span>
              <span className="text-emerald-600 font-bold">
                Makerspace: {hoveredBar.makerspace}
              </span>
              <span className="text-purple-600 font-bold">
                Labs: {hoveredBar.labs}
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="text-slate-500 font-medium">Hover columns to inspect source breakdown</span>
              </div>
              <span className="text-slate-400 font-medium">Strict Live Stream</span>
            </>
          )}
        </div>

      </div>

    </div>
  );
}
