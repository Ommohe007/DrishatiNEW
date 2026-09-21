/**
 * ScientistsPanel.jsx — Expedition Scientists & Research Personnel Roster
 * Project Drishti | SIH 2026 PS-26060 | Ministry of Earth Sciences (MoES)
 * 44th Indian Scientific Expedition to Antarctica (ISEA)
 */
import React, { useState } from 'react'

const SCIENTISTS = [
  {
    id: 'SCI-01',
    name: 'Dr. Anandita Sengupta',
    role: 'Station Leader & Chief Glaciologist',
    org: 'NCPOR Goa (MoES)',
    station: 'bharati',
    discipline: 'Glaciology',
    expedition: '44th ISEA (Winter-Over)',
    location: 'Bharati Level 2 — Cryo Physics Lab',
    project: 'Ice Shelf Mass Balance & Meltwater Runoff Dynamics in Prydz Bay',
    vitals: { hr: 72, spo2: 99, temp: '36.8°C', status: 'FIT' },
    activity: 'Analyzing ice core stratigraphy samples',
    status: 'IN LAB',
    avatarBg: 'from-blue-600 to-cyan-700'
  },
  {
    id: 'SCI-02',
    name: 'Dr. Vikramaditya Joshi',
    role: 'Lead Telemetry Scientist (ISRO Earth Station)',
    org: 'NRSC / ISRO Hyderabad',
    station: 'bharati',
    discipline: 'Satellite Telemetry',
    expedition: '44th ISEA (Winter-Over)',
    location: 'ISRO Radome Control Room',
    project: 'Cartosat-3 & RISAT High-Throughput Polar Orbit Downlink Relays',
    vitals: { hr: 68, spo2: 98, temp: '36.7°C', status: 'FIT' },
    activity: 'Calibrating S-band antenna feedhorn alignment',
    status: 'RADOME OPS',
    avatarBg: 'from-amber-600 to-orange-700'
  },
  {
    id: 'SCI-03',
    name: 'Dr. Meenakshi Sundaram',
    role: 'Senior Polar Meteorologist',
    org: 'India Meteorological Department (IMD)',
    station: 'maitri',
    discipline: 'Meteorology',
    expedition: '44th ISEA (Winter-Over)',
    location: 'Maitri Met Observation Deck',
    project: 'Schirmacher Oasis Boundary Layer Katabatic Wind Profiling',
    vitals: { hr: 74, spo2: 98, temp: '36.9°C', status: 'FIT' },
    activity: 'Launching 12:00 UTC GPS Radiosonde weather balloon',
    status: 'OBSERVATION',
    avatarBg: 'from-emerald-600 to-teal-700'
  },
  {
    id: 'SCI-04',
    name: 'Lt. Col. Dr. Raghavendra Singh',
    role: 'Expedition Medical Officer & Surgeon',
    org: 'Armed Forces Medical College (AFMC / AIIMS)',
    station: 'bharati',
    discipline: 'Polar Medicine',
    expedition: '44th ISEA (Winter-Over)',
    location: 'Bharati Level 1 — Medical ICU Suite',
    project: 'Human Circadian Rhythm & Hypobaric Hypoxia in Polar Night Isolation',
    vitals: { hr: 70, spo2: 99, temp: '36.8°C', status: 'FIT' },
    activity: 'Conducting bi-weekly biometric screening of winter crew',
    status: 'MED CLINIC',
    avatarBg: 'from-rose-600 to-pink-700'
  },
  {
    id: 'SCI-05',
    name: 'Dr. Sourav Banerjee',
    role: 'Principal Geomagnetism Investigator',
    org: 'Indian Institute of Geomagnetism (IIG Mumbai)',
    station: 'maitri',
    discipline: 'Geomagnetism',
    expedition: '44th ISEA (Winter-Over)',
    location: 'Maitri Magnetic Quiet Hut (Non-Magnetic)',
    project: 'Auroral Electrojet & Solar Wind Interplanetary Magnetic Field Coupling',
    vitals: { hr: 76, spo2: 98, temp: '36.6°C', status: 'FIT' },
    activity: 'Monitoring fluxgate magnetometer recordings during solar storm',
    status: 'IN LAB',
    avatarBg: 'from-purple-600 to-indigo-700'
  },
  {
    id: 'SCI-06',
    name: 'Er. Rajesh Kumar Rawat',
    role: 'Chief Mechanical & Electrical Engineer',
    org: 'Corps of Engineers / NCPOR',
    station: 'bharati',
    discipline: 'Engineering & Grid',
    expedition: '44th ISEA (Winter-Over)',
    location: 'Bharati Ground Tier — Genset Room',
    project: 'Zero-Emission Hydrogen & Solar-Diesel Microgrid Integration',
    vitals: { hr: 82, spo2: 97, temp: '37.0°C', status: 'FIT' },
    activity: 'Routine injector pressure balancing on CAT Generator #1',
    status: 'MAINTENANCE',
    avatarBg: 'from-slate-600 to-slate-800'
  },
  {
    id: 'SCI-07',
    name: 'Dr. Harini Krishnan',
    role: 'Marine Biologist & Limnologist',
    org: 'National Institute of Oceanography (CSIR-NIO)',
    station: 'maitri',
    discipline: 'Marine & Lake Biology',
    expedition: '44th ISEA (Winter-Over)',
    location: 'Lake Priyadarshini Research Station',
    project: 'Cyanobacterial Mats & Extremophile Microbiomes in Perennially Frozen Lakes',
    vitals: { hr: 71, spo2: 99, temp: '36.7°C', status: 'FIT' },
    activity: 'Spectrophotometric analysis of microbial lipid biomarkers',
    status: 'IN LAB',
    avatarBg: 'from-cyan-600 to-blue-700'
  },
  {
    id: 'SCI-08',
    name: 'Dr. Pradeep Nair',
    role: 'Solid Earth Seismologist',
    org: 'National Geophysical Research Institute (CSIR-NGRI)',
    station: 'bharati',
    discipline: 'Seismology',
    expedition: '44th ISEA (Winter-Over)',
    location: 'Bharati Seismological Vault (Bedrock)',
    project: 'Broadband Teleseismic Velocity Structure of East Antarctic Craton',
    vitals: { hr: 69, spo2: 98, temp: '36.8°C', status: 'FIT' },
    activity: 'Calibrating Guralp CMG-3T ultra-broadband seismometer',
    status: 'IN LAB',
    avatarBg: 'from-amber-700 to-yellow-800'
  }
]

export default function ScientistsPanel({ activeStation = 'both' }) {
  const [stationFilter, setStationFilter] = useState('ALL')
  const [disciplineFilter, setDisciplineFilter] = useState('ALL')
  const [selectedScientist, setSelectedScientist] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const disciplines = ['ALL', 'Glaciology', 'Satellite Telemetry', 'Meteorology', 'Polar Medicine', 'Geomagnetism', 'Engineering & Grid', 'Marine & Lake Biology', 'Seismology']

  const filtered = SCIENTISTS.filter(s => {
    const matchStation = stationFilter === 'ALL' || s.station === stationFilter
    const matchDiscipline = disciplineFilter === 'ALL' || s.discipline === disciplineFilter
    const matchSearch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.org.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.project.toLowerCase().includes(searchQuery.toLowerCase())
    return matchStation && matchDiscipline && matchSearch
  })

  return (
    <div className="w-full h-full flex flex-col p-4 bg-[#080d1a] overflow-y-auto">
      {/* Top Header */}
      <div className="flex-none flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
            44th Indian Scientific Expedition to Antarctica (ISEA) • NCPOR / MoES
          </span>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>Station Scientists & Winter-Over Crew Manifest</span>
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              {filtered.length} Personnel Registered
            </span>
          </h2>
        </div>

        {/* Station Filter Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {['ALL', 'bharati', 'maitri'].map(st => (
              <button
                key={st}
                onClick={() => setStationFilter(st)}
                className={`px-3 py-1 rounded transition-all uppercase font-bold ${
                  stationFilter === st
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Stations' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex-none py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
          <span className="text-slate-500 mr-1 font-semibold">Discipline:</span>
          {disciplines.map(d => (
            <button
              key={d}
              onClick={() => setDisciplineFilter(d)}
              className={`px-2.5 py-0.5 rounded-full border transition-all ${
                disciplineFilter === d
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search scientist, institute, topic..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Scientists Cards Grid */}
      <div className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(sci => (
          <div
            key={sci.id}
            onClick={() => setSelectedScientist(sci)}
            className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 hover:border-cyan-500/60 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] flex flex-col justify-between group"
          >
            <div>
              {/* Card Header: Avatar & Station */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${sci.avatarBg} flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-slate-800`}>
                    {sci.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors leading-snug">
                      {sci.name}
                    </h3>
                    <div className="text-[11px] font-mono text-cyan-400 font-medium">
                      {sci.org}
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                  sci.station === 'bharati'
                    ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                    : 'bg-amber-950/80 text-amber-300 border-amber-800'
                }`}>
                  {sci.station}
                </span>
              </div>

              {/* Role & Research Discipline */}
              <div className="text-xs font-semibold text-slate-300 mb-2">
                {sci.role}
              </div>

              {/* Research Project Brief */}
              <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed mb-3">
                <span className="text-slate-300 font-semibold block mb-0.5">Project:</span>
                {sci.project}
              </div>
            </div>

            {/* Bottom Status & Biometrics */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 font-bold">{sci.status}</span>
              </div>
              <div className="text-slate-400">
                HR: <strong className="text-slate-200">{sci.vitals.hr}</strong> • SpO2: <strong className="text-slate-200">{sci.vitals.spo2}%</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Inspector Modal */}
      {selectedScientist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-xl bg-[#0b1324] border border-cyan-500/50 rounded-xl overflow-hidden shadow-2xl p-6 font-sans">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedScientist.avatarBg} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  {selectedScientist.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">{selectedScientist.name}</h2>
                  <div className="text-xs font-mono text-cyan-400 font-bold">{selectedScientist.role}</div>
                  <div className="text-xs text-slate-400">{selectedScientist.org} • {selectedScientist.expedition}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedScientist(null)}
                className="text-slate-400 hover:text-white px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold border border-slate-700"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Approved Antarctic Research Investigation</span>
                <p className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-slate-200 leading-relaxed font-sans text-xs">
                  {selectedScientist.project}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-2.5 bg-slate-950/80 rounded border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Deployment Station:</span>
                  <span className="font-bold text-cyan-300 uppercase">{selectedScientist.station} Station</span>
                </div>
                <div className="p-2.5 bg-slate-950/80 rounded border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Operating Laboratory:</span>
                  <span className="font-bold text-slate-200">{selectedScientist.location}</span>
                </div>
                <div className="p-2.5 bg-slate-950/80 rounded border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Current Field Status:</span>
                  <span className="font-bold text-emerald-400">{selectedScientist.status} ({selectedScientist.activity})</span>
                </div>
                <div className="p-2.5 bg-slate-950/80 rounded border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Medical Clearance:</span>
                  <span className="font-bold text-emerald-400">Class 1 Polar Fit (AFMC Cleared)</span>
                </div>
              </div>

              {/* Biometrics */}
              <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px] block mb-2">
                  Live Tele-Medicine Biometric Telemetry (Smart Polar Suit)
                </span>
                <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                  <div>
                    <div className="text-slate-500">Heart Rate</div>
                    <div className="font-bold text-slate-100 text-sm mt-0.5">{selectedScientist.vitals.hr} bpm</div>
                  </div>
                  <div>
                    <div className="text-slate-500">SpO2 Oxygen</div>
                    <div className="font-bold text-emerald-400 text-sm mt-0.5">{selectedScientist.vitals.spo2}%</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Core Temp</div>
                    <div className="font-bold text-slate-100 text-sm mt-0.5">{selectedScientist.vitals.temp}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Vitals State</div>
                    <div className="font-bold text-emerald-400 text-sm mt-0.5">{selectedScientist.vitals.status}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
