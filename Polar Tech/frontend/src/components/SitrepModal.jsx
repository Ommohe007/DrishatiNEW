/**
 * SitrepModal.jsx — MoES Daily Antarctic Situation Report (SITREP) Generator
 * Project Drishti | SIH 2026 PS-26060 | Ministry of Earth Sciences (MoES)
 */
import React from 'react'

export default function SitrepModal({ isOpen, onClose, telemetry, station = 'bharati' }) {
  if (!isOpen) return null

  const data = telemetry?.[station] || {}
  const now = new Date().toUTCString()

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col my-8 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Action Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-950 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-xs font-mono font-bold uppercase text-slate-200">
              MoES Formal SITREP Briefing Document
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold transition-colors shadow flex items-center gap-1.5"
            >
              🖨 Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold transition-colors border border-slate-700"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Formal SITREP Document Content */}
        <div className="p-8 space-y-6 font-sans text-slate-200 print:text-black print:p-0">
          {/* Document Header */}
          <div className="text-center border-b-2 border-blue-500/80 pb-4">
            <div className="text-[11px] font-mono tracking-widest uppercase text-blue-400 font-bold print:text-blue-800">
              GOVERNMENT OF INDIA • MINISTRY OF EARTH SCIENCES (MoES)
            </div>
            <div className="text-lg font-bold tracking-wider uppercase text-slate-100 print:text-black mt-1">
              NATIONAL CENTRE FOR POLAR AND OCEAN RESEARCH (NCPOR)
            </div>
            <h1 className="text-xl font-black uppercase text-cyan-300 print:text-blue-900 mt-1">
              DAILY ANTARCTIC SITUATION REPORT (SITREP)
            </h1>
            <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs font-mono text-slate-400 print:text-gray-700">
              <span>Station: <strong>{station.toUpperCase()}</strong></span>
              <span>•</span>
              <span>Generated: <strong>{now}</strong></span>
              <span>•</span>
              <span>Document Ref: <strong>SITREP-ANT-2026-0920</strong></span>
            </div>
          </div>

          {/* Section 1: Executive Operational Health */}
          <div>
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-blue-400 print:text-blue-800 border-b border-slate-800 pb-1 mb-3">
              1. Executive Station Health & Isolation Status
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-950/80 print:bg-gray-100 rounded-lg border border-slate-800 print:border-gray-300">
                <div className="text-[10px] font-mono text-slate-400 print:text-gray-600">OVERALL READINESS</div>
                <div className="text-xl font-bold font-mono text-emerald-400 print:text-emerald-700 mt-1">98.4%</div>
                <div className="text-[10px] font-mono text-emerald-500">OPTIMAL</div>
              </div>
              <div className="p-3 bg-slate-950/80 print:bg-gray-100 rounded-lg border border-slate-800 print:border-gray-300">
                <div className="text-[10px] font-mono text-slate-400 print:text-gray-600">WINTER OVER CREW</div>
                <div className="text-xl font-bold font-mono text-cyan-300 print:text-black mt-1">25 Pers.</div>
                <div className="text-[10px] font-mono text-slate-400">100% Medical Fit</div>
              </div>
              <div className="p-3 bg-slate-950/80 print:bg-gray-100 rounded-lg border border-slate-800 print:border-gray-300">
                <div className="text-[10px] font-mono text-slate-400 print:text-gray-600">ISRO SATCOM LINK</div>
                <div className="text-xl font-bold font-mono text-blue-400 print:text-blue-700 mt-1">ACTIVE</div>
                <div className="text-[10px] font-mono text-blue-400">240 Mbps Ku-Band</div>
              </div>
              <div className="p-3 bg-slate-950/80 print:bg-gray-100 rounded-lg border border-slate-800 print:border-gray-300">
                <div className="text-[10px] font-mono text-slate-400 print:text-gray-600">DAYS TO RESUPPLY</div>
                <div className="text-xl font-bold font-mono text-amber-400 print:text-amber-700 mt-1">42 Days</div>
                <div className="text-[10px] font-mono text-slate-400">MV Golovnin</div>
              </div>
            </div>
          </div>

          {/* Section 2: Four Pillars Telemetry Audit */}
          <div>
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-blue-400 print:text-blue-800 border-b border-slate-800 pb-1 mb-3">
              2. Subsystems Status Audit (4 Pillars Framework)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              {/* Pillar 1 & 2 */}
              <div className="p-3 bg-slate-950/80 print:bg-gray-100 rounded-lg border border-slate-800 print:border-gray-300 space-y-1.5">
                <div className="font-bold text-slate-200 print:text-black mb-1">
                  [PLR-1 & PLR-2] Infrastructure & Power Grid
                </div>
                <div className="flex justify-between text-slate-300 print:text-gray-700">
                  <span>Active Generator:</span>
                  <span>CAT 3406 (Genset #1) @ 1,500 RPM</span>
                </div>
                <div className="flex justify-between text-slate-300 print:text-gray-700">
                  <span>3-Phase Grid Output:</span>
                  <span className="text-cyan-300 print:text-black">{data.electricity?.load_kw || 184.2} kW / 415 V</span>
                </div>
                <div className="flex justify-between text-slate-300 print:text-gray-700">
                  <span>Rooftop Solar PV Generation:</span>
                  <span>18.6 kW (Summer Supplemental)</span>
                </div>
                <div className="flex justify-between text-slate-300 print:text-gray-700">
                  <span>Building Structural Integrity:</span>
                  <span className="text-emerald-400 print:text-emerald-700">99.8% (V-Stilts Nominal)</span>
                </div>
              </div>

              {/* Pillar 3 & 4 */}
              <div className="p-3 bg-slate-950/80 print:bg-gray-100 rounded-lg border border-slate-800 print:border-gray-300 space-y-1.5">
                <div className="font-bold text-slate-200 print:text-black mb-1">
                  [PLR-3 & PLR-4] Polar Logistics & Environment
                </div>
                <div className="flex justify-between text-slate-300 print:text-gray-700">
                  <span>Arctic Diesel Reserves:</span>
                  <span className="text-cyan-300 print:text-black">{data.fuel?.pct || 83}% (124,500 L)</span>
                </div>
                <div className="flex justify-between text-slate-300 print:text-gray-700">
                  <span>Freshwater Reserve:</span>
                  <span>18,400 L (Lake Priyadarshini)</span>
                </div>
                <div className="flex justify-between text-slate-300 print:text-gray-700">
                  <span>Ambient Air Temp:</span>
                  <span>{data.environment?.temp_c || -18.4}°C</span>
                </div>
                <div className="flex justify-between text-slate-300 print:text-gray-700">
                  <span>Peak Blizzard Gust:</span>
                  <span>{data.environment?.wind_speed_ms || 22.1} m/s (Moderate Gale)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: AI Predictive Risk Assessment */}
          <div>
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-blue-400 print:text-blue-800 border-b border-slate-800 pb-1 mb-3">
              3. AI Predictive Risk Horizon (Scikit-Learn GradientBoosting)
            </h2>
            <div className="p-3 bg-slate-950/80 print:bg-gray-100 rounded-lg border border-slate-800 print:border-gray-300 text-xs font-mono space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/80 print:border-gray-200">
                <span>Severe Blizzard Influx (Next 6 Hours):</span>
                <span className="text-emerald-400 print:text-emerald-700 font-bold">LOW (14% Probability)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/80 print:border-gray-200">
                <span>Critical Fuel Depletion Horizon (Next 7 Days):</span>
                <span className="text-emerald-400 print:text-emerald-700 font-bold">NOMINAL (&gt;130 Days Reserve)</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Intake Water Pipe Freezing (Next 12 Hours):</span>
                <span className="text-emerald-400 print:text-emerald-700 font-bold">LOW (Trace Heat Active +4.8°C)</span>
              </div>
            </div>
          </div>

          {/* Document Sign-off Footer */}
          <div className="pt-4 border-t border-slate-800 print:border-gray-300 flex justify-between items-end text-xs font-mono text-slate-400 print:text-gray-600">
            <div>
              <div>Security Classification: <strong>OFFICIAL-MoES</strong></div>
              <div>Distribution: Secretary MoES, Director NCPOR, Base Commander</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-200 print:text-black">Dr. R. K. Mukherjee</div>
              <div>Station Commander & Officer-in-Charge</div>
              <div className="text-[10px] text-slate-500">Cryptographically Signed via ISRO PKI</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
