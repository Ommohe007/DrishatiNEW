/**
 * TelemetrySidebar.jsx — Hardware Brutalism Operations Telemetry Sidebar
 * Project Drishti | SIH 2026 PS-26060 | Ministry of Earth Sciences (MoES)
 */
import React from 'react'
import InfoPanel from './InfoPanel.jsx'

export default function TelemetrySidebar({
  activeStation,
  setActiveStation,
  telemetry,
  cctvMetrics
}) {
  return (
    <aside className="w-72 flex-none flex flex-col border-l border-cyan-500/20 bg-[#090f1e] overflow-hidden shadow-2xl hardware-panel">
      {/* Station Selector Tabs */}
      <div className="flex-none flex border-b border-slate-800 bg-[#060b17] p-1 gap-1">
        {['maitri', 'bharati'].map(s => (
          <button
            key={s}
            onClick={() => setActiveStation(s)}
            className={`flex-1 py-1.5 text-xs font-bold font-header tracking-wider uppercase transition-all rounded ${
              activeStation === s
                ? 'text-cyan-300 bg-[#0e1a33] border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {s} Station
          </button>
        ))}
      </div>

      {/* Live Telemetry Info Stream */}
      <div className="flex-1 overflow-hidden p-1">
        <InfoPanel
          station={activeStation}
          telemetry={telemetry?.[activeStation]}
          cctvMetrics={cctvMetrics?.[activeStation]}
        />
      </div>
    </aside>
  )
}
