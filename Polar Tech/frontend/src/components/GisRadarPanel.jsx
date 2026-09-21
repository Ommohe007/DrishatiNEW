/**
 * GisRadarPanel.jsx — Antarctic Geospatial Satellite Radar & Maritime Logistics
 * Project Drishti | SIH 2026 PS-26060 | Ministry of Earth Sciences (MoES)
 */
import React, { useState } from 'react'

export default function GisRadarPanel() {
  const [selectedStation, setSelectedStation] = useState('bharati')

  const STATIONS_GIS = [
    {
      id: 'bharati',
      name: 'Bharati Station',
      region: 'Larsemann Hills, Princess Elizabeth Land',
      coords: '69°24′29″ S, 76°11′14″ E',
      elevation: '35 m ASL',
      iceCondition: 'Fast-Ice Breakup Observed in Prydz Bay',
      weather: 'Wind 22 m/s @ 190° • Temp -18.4°C • Visibility 6.2 km',
      isolation: 'Winter Over Crew (25 Personnel) • Zero Surface Exit'
    },
    {
      id: 'maitri',
      name: 'Maitri Station',
      region: 'Schirmacher Oasis, Queen Maud Land',
      coords: '70°45′58″ S, 11°43′56″ E',
      elevation: '117 m ASL',
      iceCondition: 'Permafrost Plateau • Priyadarshini Ice Cap 1.85m',
      weather: 'Wind 14 m/s @ 120° • Temp -22.1°C • Visibility 10.0 km',
      isolation: 'Annual Convoy Route Closed until November'
    }
  ]

  return (
    <div className="w-full h-full flex flex-col p-4 bg-[#080d1a] overflow-y-auto">
      {/* Header */}
      <div className="flex-none flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
            MoES Antarctic Satellite GIS & Logistics Corridor
          </span>
          <h2 className="text-base font-bold text-slate-100">
            East Antarctic Maritime Radar & Polar Storm Tracking
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
            Satellite Link: Cartosat-3 / RISAT-2BR1
          </span>
          <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-bold">
            GIS Downlink: NOMINAL
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="pt-4 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Tactical Radar Canvas */}
        <div className="lg:col-span-2 flex flex-col space-y-3">
          <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-cyan-500/30 bg-[#07101f] shadow-2xl flex flex-col items-center justify-center p-4">
            {/* Radar Grid Circles */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-[85%] h-[85%] rounded-full border border-cyan-400" />
              <div className="w-[60%] h-[60%] rounded-full border border-cyan-400" />
              <div className="w-[35%] h-[35%] rounded-full border border-cyan-400" />
              <div className="absolute w-full h-[1px] bg-cyan-400" />
              <div className="absolute h-full w-[1px] bg-cyan-400" />
            </div>

            {/* Radar Sweep Line */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-1/2 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-cyan-300 origin-left animate-spin" style={{ animationDuration: '8s' }} />
            </div>

            {/* Interactive Station Markers on Map */}
            {/* Bharati Marker */}
            <div
              onClick={() => setSelectedStation('bharati')}
              className="absolute top-[48%] right-[32%] cursor-pointer group flex flex-col items-center z-10"
            >
              <div className="relative">
                <span className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center text-[9px] font-bold text-black ring-4 ring-cyan-500/30 group-hover:scale-125 transition-transform">
                  ★
                </span>
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="mt-1 px-2 py-0.5 rounded bg-slate-950/90 border border-cyan-500/50 text-[10px] font-mono font-bold text-cyan-300 whitespace-nowrap shadow">
                BHARATI STATION (69°S)
              </div>
            </div>

            {/* Maitri Marker */}
            <div
              onClick={() => setSelectedStation('maitri')}
              className="absolute bottom-[36%] left-[28%] cursor-pointer group flex flex-col items-center z-10"
            >
              <div className="relative">
                <span className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[9px] font-bold text-black ring-4 ring-amber-500/30 group-hover:scale-125 transition-transform">
                  ★
                </span>
              </div>
              <div className="mt-1 px-2 py-0.5 rounded bg-slate-950/90 border border-amber-500/50 text-[10px] font-mono font-bold text-amber-300 whitespace-nowrap shadow">
                MAITRI STATION (70°S)
              </div>
            </div>

            {/* Resupply Ship Marker */}
            <div className="absolute top-[32%] right-[22%] flex flex-col items-center z-10 animate-bounce">
              <div className="w-3.5 h-3.5 rounded bg-blue-500 flex items-center justify-center text-[9px] text-white font-bold ring-4 ring-blue-500/30">
                🚢
              </div>
              <div className="mt-1 px-1.5 py-0.5 rounded bg-blue-950/90 border border-blue-400 text-[9px] font-mono text-blue-200 whitespace-nowrap shadow">
                MV Vasiliy Golovnin (ETA 42h)
              </div>
            </div>

            {/* Tactical Map Overlays */}
            <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded border border-slate-800 text-[11px] font-mono text-cyan-300">
              POLAR PROJECTION: Lambert Azimuthal Equal-Area
            </div>
            <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Katabatic Wind Stream: S/SE Corridor (Vector 180° @ 28 m/s)</span>
            </div>
          </div>

          {/* Selected Station Deep-Dive */}
          {(() => {
            const st = STATIONS_GIS.find(s => s.id === selectedStation)
            return (
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-sm font-bold text-cyan-300">{st.name} — {st.region}</span>
                  <span className="text-slate-400">{st.coords}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300 text-[11px]">
                  <div><strong className="text-slate-400">Elevation:</strong> {st.elevation}</div>
                  <div><strong className="text-slate-400">Ice Cap:</strong> {st.iceCondition}</div>
                  <div><strong className="text-slate-400">Surface Weather:</strong> {st.weather}</div>
                  <div><strong className="text-slate-400">Isolation Status:</strong> {st.isolation}</div>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Right Col: Expedition Vessel Logistics Card */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Expedition Resupply Vessel Tracker
          </div>

          <div className="bg-slate-900/90 border border-blue-500/40 rounded-xl p-4 space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <div className="text-sm font-bold text-slate-100">MV Vasiliy Golovnin</div>
                <div className="text-[10px] text-blue-400">Polar Class Icebreaking Cargo Vessel</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700 text-[10px] font-bold">
                EN ROUTE
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Current Position:</span>
                <span className="text-slate-200 font-bold">67°12′ S, 74°28′ E</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Cruising Speed:</span>
                <span className="text-cyan-300 font-bold">11.4 Knots (Ice Escort)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Distance to Fast-Ice:</span>
                <span className="text-slate-200 font-bold">78 Nautical Miles</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Estimated Arrival (ETA):</span>
                <span className="text-emerald-400 font-bold">42 Hours (Oct 22, 14:00)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Sea-Ice Thickness:</span>
                <span className="text-amber-300 font-bold">1.40 m (Traversable)</span>
              </div>
            </div>

            {/* Cargo Manifest */}
            <div className="mt-3 p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1.5 text-[11px]">
              <div className="text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
                Cargo Manifest Aboard:
              </div>
              <div className="text-slate-300">• 380,000 Litres Special Arctic Jet A-1 Fuel</div>
              <div className="text-slate-300">• 42 Metric Tons Winterization Food Rations</div>
              <div className="text-slate-300">• 2x PistenBully 300 Polar Track Tractors</div>
              <div className="text-slate-300">• 24x Replacement Solar PV Modules & Inverters</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
