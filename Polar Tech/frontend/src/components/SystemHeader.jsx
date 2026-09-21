/**
 * SystemHeader.jsx — Bespoke Antarctic Mission Control Top Bar
 * Project Drishti | SIH 2026 PS-26060 | Ministry of Earth Sciences (MoES)
 * Anti-Boilerplate Hardware Brutalism Aesthetic
 */
import React from 'react'

export default function SystemHeader({
  clocks,
  telemetry,
  connected,
  view,
  setView,
  onOpenSitrep,
  onOpenGallery,
  onOpenDrill
}) {
  return (
    <header className="flex-none bg-[#090f1e] border-b border-cyan-500/20 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-[0_4px_25px_rgba(0,0,0,0.7)] clip-chamfer-top">
      {/* Left: Brand Identity & Live Clocks */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3 border-r border-slate-800/80 pr-4">
          <div className="relative">
            <span className="dot-ok" />
          </div>
          <div>
            <div className="text-[10px] tracking-widest text-cyan-400 font-mono font-bold uppercase leading-none mb-1">
              MoES Govt of India • SIH PS-26060
            </div>
            <h1 className="text-base font-bold font-header text-slate-100 tracking-wider uppercase leading-none">
              PROJECT DRISHTI <span className="text-xs font-normal text-slate-400 font-mono">| Mission Control</span>
            </h1>
          </div>
        </div>

        {/* Live Synchronized Clocks & Weather Badges */}
        <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
          {/* IST Clock */}
          <div className="px-2.5 py-1 rounded bg-[#0b1426] border border-slate-800 flex items-center gap-1.5 shadow-inner">
            <span className="text-amber-400 font-bold">🇮🇳 IST:</span>
            <span className="text-slate-100 font-bold tabular-nums">{clocks.ist || '15:30:00'}</span>
          </div>

          {/* Bharati Station */}
          <div className="px-2.5 py-1 rounded bg-[#0b1426] border border-cyan-900/40 flex items-center gap-2 shadow-inner">
            <span className="text-cyan-400 font-bold">🇦🇶 BHARATI:</span>
            <span className="text-slate-100 font-bold tabular-nums">{clocks.bharati || '15:00:00'}</span>
            <span className="text-cyan-300 font-bold bg-cyan-950/70 px-1.5 py-0.2 rounded border border-cyan-800/50 tabular-nums">
              {telemetry?.bharati?.environment?.temp_c !== undefined ? `${telemetry.bharati.environment.temp_c}°C` : '-18.4°C'}
            </span>
          </div>

          {/* Maitri Station */}
          <div className="px-2.5 py-1 rounded bg-[#0b1426] border border-emerald-900/40 flex items-center gap-2 shadow-inner">
            <span className="text-emerald-400 font-bold">🇦🇶 MAITRI:</span>
            <span className="text-slate-100 font-bold tabular-nums">{clocks.maitri || '10:00:00'}</span>
            <span className="text-emerald-300 font-bold bg-emerald-950/70 px-1.5 py-0.2 rounded border border-emerald-800/50 tabular-nums">
              {telemetry?.maitri?.environment?.temp_c !== undefined ? `${telemetry.maitri.environment.temp_c}°C` : '-22.1°C'}
            </span>
          </div>

          {/* ISRO Satcom Link */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded bg-[#0b1426] border border-slate-800 text-[11px]">
            <span className={connected ? 'dot-ok' : 'dot-crit'} />
            <span className="font-bold text-slate-300">
              {connected ? 'ISRO LINK UP (240 Mbps)' : 'COMMS OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Bespoke Segmented View Selector & Tactical Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Main Segmented Control */}
        <div className="flex bg-[#060b17] p-1 rounded-lg border border-slate-800 font-mono text-xs gap-1 shadow-inner">
          {[
            ['3d','🌐 3D Reality'],
            ['dashboard','📊 Operations'],
            ['cctv','📹 Vision AI'],
            ['gis','🛰 GIS Radar'],
            ['maintenance','🛠 Work Orders'],
            ['scientists','👨‍🔬 Scientists']
          ].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded font-bold transition-all tactical-btn ${
                view === v
                  ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(0,229,255,0.4)] border border-cyan-400'
                  : 'text-slate-400 hover:text-slate-100'
              }`}>{label}</button>
          ))}
        </div>

        {/* Tactical Actions */}
        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={onOpenSitrep}
            className="text-xs px-3 py-1.5 rounded bg-blue-950/90 hover:bg-blue-900 text-blue-200 font-bold border border-blue-600/70 tactical-btn shadow-sm"
          >
            📄 SITREP
          </button>
          <button
            onClick={onOpenGallery}
            className="text-xs px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold border border-slate-700 tactical-btn shadow-sm"
          >
            📷 Gallery
          </button>
          <button
            onClick={onOpenDrill}
            className="text-xs px-3 py-1.5 rounded bg-rose-950/90 hover:bg-rose-900 text-rose-200 font-bold border border-rose-700/80 tactical-btn shadow-sm"
          >
            ⚠ Drill
          </button>
        </div>
      </div>
    </header>
  )
}
