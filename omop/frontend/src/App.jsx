/**
 * App.jsx — Project Drishti Root Architecture
 * SIH 2026 PS-26060 | Ministry of Earth Sciences (MoES)
 * Bespoke Anti-Boilerplate Naval Mission Control System
 */
import React, { useState, useEffect } from 'react'
import SystemHeader from './components/SystemHeader.jsx'
import RealityWorkspace from './components/RealityWorkspace.jsx'
import TelemetrySidebar from './components/TelemetrySidebar.jsx'
import CrisisDrillCorner from './components/CrisisDrillCorner.jsx'
import SubsystemModal from './components/SubsystemModal.jsx'
import SitrepModal from './components/SitrepModal.jsx'
import { useTelemetry } from './hooks/useTelemetry.js'

// ─── Real Station Photos & Media Gallery Modal ──────────────────────────────
const STATION_PHOTOS = [
  {
    src: '/assets/stations/bharati_ground_v_stilts_twilight.jpg',
    title: 'Bharati Station — Cantilever Lounge on Heavy V-Stilts',
    station: 'Bharati (Larsemann Hills)',
    desc: 'Ground-level perspective highlighting the dramatic cantilevered upper floor supported by heavy structural steel V-columns. Behind the V-stilts, warm yellow light floods from the panoramic lounge windows into the Antarctic twilight.',
    specs: 'Structural Frame: Y/V-shaped Tubular Steel Bents | Recessed Lower Service Tier'
  },
  {
    src: '/assets/stations/bharati_facade_day_night.jpg',
    title: 'Bharati Station — Day & Polar Night Views',
    station: 'Bharati (Larsemann Hills)',
    desc: 'The iconic aerodynamic modular envelope designed by bof architekten (Hamburg). Constructed from 134 prefabricated shipping containers encased in a faceted, insulated metal skin.',
    specs: 'Elevation: 35m ASL | Area: 2,500 m² | Capacity: 47 summer, 25 winter'
  },
  {
    src: '/assets/stations/bharati_aerial_bay.jpg',
    title: 'Bharati Overlooking Prydz Bay & Southern Ocean',
    station: 'Bharati (Larsemann Hills)',
    desc: 'Aerial perspective showing the station positioned on a rocky promontory with the deep blue waters of Prydz Bay behind.',
    specs: 'Coordinates: 69°24′29″S 76°11′14″E | Ocean: Prydz Bay, East Antarctica'
  },
  {
    src: '/assets/stations/maitri_aerial_official.jpg',
    title: 'Maitri Research Station — Schirmacher Oasis',
    station: 'Maitri (Queen Maud Land)',
    desc: 'Official aerial view of India’s second permanent polar station, established in 1989. Situated on the ice-free rocky plateau of Schirmacher Oasis next to freshwater Lake Priyadarshini.',
    specs: 'Coordinates: 70°45′58″S 11°43′56″E | Lake Priyadarshini Water Supply | Commissioned: 1989'
  }
]

function MediaGalleryModal({ isOpen, onClose }) {
  const [activeIdx, setActiveIdx] = useState(0)
  if (!isOpen) return null
  const photo = STATION_PHOTOS[activeIdx]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-4xl bg-[#090f1e] border border-cyan-500/40 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950">
          <h2 className="text-sm font-bold font-header tracking-wider text-slate-100 uppercase">
            Official Antarctic Station Gallery & Architectural Archive
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded font-mono text-xs">
            ✕ Close
          </button>
        </div>
        <div className="p-4 flex flex-col md:flex-row gap-4 overflow-y-auto">
          <div className="flex-1 bg-black rounded p-2 flex flex-col items-center justify-center">
            <img src={photo.src} alt={photo.title} className="max-h-[50vh] object-contain rounded" />
          </div>
          <div className="w-full md:w-72 space-y-3 font-sans text-xs">
            <h3 className="font-bold text-slate-100">{photo.title}</h3>
            <p className="text-slate-300 leading-relaxed">{photo.desc}</p>
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800 font-mono text-[11px] text-cyan-300">
              {photo.specs}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DrillControlModal({ isOpen, onClose, onTriggerDrill }) {
  if (!isOpen) return null
  const drills = [
    { id: 'power_failure', title: 'Power Trip (Phase B Drop)', desc: 'Simulates generator voltage drop to 204V.' },
    { id: 'blizzard_surge', title: 'Severe Blizzard Surge', desc: 'Simulates 38 m/s wind gale and visibility drop.' },
    { id: 'fuel_pipe_freeze', title: 'Fuel Trace Heat Failure', desc: 'Simulates trace heating temp plummeting to -17.2°C.' },
  ]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-[#090f1e] border border-rose-600/50 rounded-xl overflow-hidden shadow-2xl p-4 font-mono text-xs space-y-3">
        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span className="font-bold text-rose-400 uppercase">MoES Antarctic Emergency Simulation Center</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕ Close</button>
        </div>
        <div className="space-y-2">
          {drills.map(d => (
            <div key={d.id} className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-100">{d.title}</div>
                <div className="text-[11px] text-slate-400">{d.desc}</div>
              </div>
              <button
                onClick={() => { onTriggerDrill(d.id); onClose() }}
                className="px-3 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-200 rounded font-bold"
              >
                Inject
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { connected, telemetry, cctvMetrics, riskData, alerts, dismissAlert } = useTelemetry()
  const [activeStation, setActiveStation] = useState('maitri')
  const [view, setView] = useState('3d')
  const [chartHistory, setChartHistory] = useState({ maitri: [], bharati: [] })
  const [showGallery, setShowGallery] = useState(false)
  const [showDrill, setShowDrill] = useState(false)
  const [showSitrep, setShowSitrep] = useState(false)
  const [inspectSubsystem, setInspectSubsystem] = useState(null)

  // Live Clocks (IST, Bharati, Maitri, UTC)
  const [clocks, setClocks] = useState({ ist: '', bharati: '', maitri: '', utc: '' })

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date()
      const istStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      const utcStr = now.toISOString().slice(11, 19)
      const bharatiDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (5 * 3600000))
      const bharatiStr = bharatiDate.toTimeString().slice(0, 8)
      setClocks({ ist: istStr, bharati: bharatiStr, maitri: utcStr, utc: utcStr })
    }
    updateClocks()
    const timer = setInterval(updateClocks, 1000)
    return () => clearInterval(timer)
  }, [])

  // Rolling chart history
  useEffect(() => {
    if (!telemetry) return
    for (const st of ['maitri', 'bharati']) {
      const t = telemetry[st]
      if (!t) continue
      setChartHistory(prev => {
        const point = {
          t:          new Date(t.ts || Date.now()).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          diesel_pct: t.fuel?.pct,
          load_kw:    t.electricity?.load_kw,
          temp_c:     t.environment?.temp_c,
        }
        return { ...prev, [st]: [...(prev[st] || []), point].slice(-30) }
      })
    }
  }, [telemetry])

  const handleTriggerDrill = async (drillId) => {
    const target = activeStation === 'both' ? 'bharati' : activeStation
    try {
      await fetch(`/api/drill/${target}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drill_id: drillId }),
      })
    } catch (err) {
      console.warn('Drill trigger dispatch note:', err)
    }
  }

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-[#050a14] text-slate-100 font-sans">
      {/* 1. Modular System Header */}
      <SystemHeader
        clocks={clocks}
        telemetry={telemetry}
        connected={connected}
        view={view}
        setView={setView}
        onOpenSitrep={() => setShowSitrep(true)}
        onOpenGallery={() => setShowGallery(true)}
        onOpenDrill={() => setShowDrill(true)}
      />

      {/* 2. Primary Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Core Workspace Switcher */}
        <RealityWorkspace
          view={view}
          telemetry={telemetry}
          alerts={alerts}
          activeStation={activeStation}
          setActiveStation={setActiveStation}
          connected={connected}
          cctvMetrics={cctvMetrics}
          riskData={riskData}
          chartHistory={chartHistory}
          onOpenGallery={() => setShowGallery(true)}
          onOpenDrill={() => setShowDrill(true)}
          onInspectSubsystem={setInspectSubsystem}
        />

        {/* Modular Telemetry Sidebar (3D Reality & Operations views) */}
        {(view === '3d' || view === 'dashboard') && (
          <TelemetrySidebar
            activeStation={activeStation}
            setActiveStation={setActiveStation}
            telemetry={telemetry}
            cctvMetrics={cctvMetrics}
          />
        )}
      </div>

      {/* 3. Floating Emergency Alert Corner */}
      <CrisisDrillCorner alerts={alerts} dismissAlert={dismissAlert} />

      {/* 4. Modals */}
      <MediaGalleryModal isOpen={showGallery} onClose={() => setShowGallery(false)} />
      <DrillControlModal isOpen={showDrill} onClose={() => setShowDrill(false)} onTriggerDrill={handleTriggerDrill} />
      <SitrepModal isOpen={showSitrep} onClose={() => setShowSitrep(false)} telemetry={telemetry} station={activeStation} />
      <SubsystemModal subsystemId={inspectSubsystem} onClose={() => setInspectSubsystem(null)} />
    </div>
  )
}
