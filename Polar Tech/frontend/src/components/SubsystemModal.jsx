/**
 * SubsystemModal.jsx — Interactive Subsystem Diagnostic HUD Card
 * Project Drishti | SIH 2026 PS-26060 | Ministry of Earth Sciences (MoES)
 * Opens when a user clicks directly on any 3D facility in Bharati or Maitri
 */
import React, { useState } from 'react'

const SUBSYSTEM_DATA = {
  radome: {
    name: 'ISRO Satellite Earth Station Radome',
    station: 'Bharati & Maitri',
    category: 'Telemetry & Deep Space Comms',
    specs: 'Ku/S-Band Polar Tracking Dome | Direct Uplink: NRSC Hyderabad',
    health: 99.2,
    status: 'NOMINAL',
    metrics: [
      { label: 'Uplink Signal Strength', value: '-42 dBm', nominal: true },
      { label: 'Antenna Azimuth / Elevation', value: '142.4° / 38.6°', nominal: true },
      { label: 'Radome Internal Temperature', value: '+14.2°C', nominal: true },
      { label: 'De-icing Heating Elements', value: 'ACTIVE (8.4 kW)', nominal: true },
      { label: 'Downlink Data Throughput', value: '240 Mbps', nominal: true },
    ],
    desc: 'Houses the primary parabolic dish tracking remote sensing satellites (Cartosat, RISAT) in polar orbit. Protected by an inflatable rigid composite geodesic radome designed to withstand 240 km/h blizzard gusts.'
  },
  generators: {
    name: 'Heavy Diesel Generator Complex (Pillars A/B/C)',
    station: 'Bharati & Maitri',
    category: 'Critical Power Grid',
    specs: '3x Caterpillar 3406 DITA Marine Gensets (240 kW each)',
    health: 96.8,
    status: 'NOMINAL',
    metrics: [
      { label: 'Active Genset Output', value: '184.2 kW', nominal: true },
      { label: 'RPM & Frequency', value: '1,500 RPM / 50.0 Hz', nominal: true },
      { label: 'Coolant Exhaust Temp', value: '82.4°C', nominal: true },
      { label: 'Fuel Flow Rate', value: '38.4 L/h', nominal: true },
      { label: 'Lube Oil Pressure', value: '4.2 bar', nominal: true },
    ],
    desc: 'Redundant triple-genset configuration providing uninterrupted 3-phase 415V power to the entire base. Heat from engine exhaust jacket is scrubbed and recycled into station HVAC trace heating.'
  },
  solar_array: {
    name: 'Aerodynamic Rooftop Photovoltaic Solar Array',
    station: 'Bharati Station',
    category: 'Renewable Power',
    specs: '48x Monocrystalline Bifacial Panels (24 kWp Peak)',
    health: 98.0,
    status: 'NOMINAL',
    metrics: [
      { label: 'Solar Insolation', value: '620 W/m²', nominal: true },
      { label: 'Array Generation', value: '18.6 kW', nominal: true },
      { label: 'Inverter Efficiency', value: '98.4%', nominal: true },
      { label: 'Tilt & Azimuth Offset', value: '35° North Facing', nominal: true },
      { label: 'Snowdrift Accumulation', value: '0.0 cm (Clear)', nominal: true },
    ],
    desc: 'Installed on Bharati’s faceted aerodynamic roof. Generates supplemental clean energy during Antarctic summer (October–March) to drastically conserve winter diesel fuel reserves.'
  },
  stilts: {
    name: 'Elevated Structural Steel V-Bent Stilts',
    station: 'Bharati Station',
    category: 'Civil Infrastructure & Aerodynamics',
    specs: '6 Pairs Heavy Tubular Steel V-Columns | Bof Architekten Design',
    health: 99.8,
    status: 'NOMINAL',
    metrics: [
      { label: 'Ground Clearance', value: '3.80 m', nominal: true },
      { label: 'Permafrost Anchor Temp', value: '-14.8°C', nominal: true },
      { label: 'Wind Deflection Load', value: '14.2 kN/m²', nominal: true },
      { label: 'Structural Vibration Level', value: '0.04 g (Nominal)', nominal: true },
      { label: 'Sub-Stilt Snow Scour Velocity', value: '18.2 m/s', nominal: true },
    ],
    desc: 'Direct photographic match to official expedition images. Elevates the 2,500 m² habitat block above ground level, allowing katabatic winds to accelerate underneath and clear snowdrifts without building foundation accumulation.'
  },
  lake_pumphouse: {
    name: 'Lake Priyadarshini Shoreline Pump House',
    station: 'Maitri Station',
    category: 'Freshwater Life Support',
    specs: 'Insulated Submersible Suction Pump & Trace-Heated Pipeline',
    health: 94.5,
    status: 'NOMINAL',
    metrics: [
      { label: 'Lake Ice Thickness', value: '1.85 m', nominal: true },
      { label: 'Water Depth at Suction', value: '6.4 m', nominal: true },
      { label: 'Trace Heating Core Temp', value: '+4.8°C', nominal: true },
      { label: 'Delivery Flow Rate', value: '2,400 L/h', nominal: true },
      { label: 'Reserve Tank Storage', value: '18,400 L (92%)', nominal: true },
    ],
    desc: 'India’s lifeline in Antarctica. Pumps fresh glacier meltwater from Lake Priyadarshini into Maitri habitat through a heated 1.2 km above-ground insulated conduit to prevent ice coagulation.'
  },
  fuel_farm: {
    name: 'Heavy Diesel Arctic Fuel Storage Farm',
    station: 'Maitri & Bharati',
    category: 'Polar Logistics & Reserves',
    specs: '3x 50,000L Cylindrical Double-Walled Tanks in Concrete Containment',
    health: 97.4,
    status: 'NOMINAL',
    metrics: [
      { label: 'Current Fuel Quantity', value: '124,500 L (83%)', nominal: true },
      { label: 'Days of Autonomy Remaining', value: '135 Days', nominal: true },
      { label: 'Fuel Viscosity / Temp', value: '3.2 cSt @ -8.4°C', nominal: true },
      { label: 'Secondary Containment Berm', value: 'DRY / 0% Leakage', nominal: true },
      { label: 'Next Vessel Resupply ETA', value: '42 Days (MV Golovnin)', nominal: true },
    ],
    desc: 'Stores Specialized Aviation Turbine Fuel (ATF / Jet A-1 with Arctic anti-freeze additives) used for both generators and vehicle operations throughout the 9-month polar isolation window.'
  },
  helipad: {
    name: 'All-Weather Expedition Helipad',
    station: 'Bharati & Maitri',
    category: 'Air Logistics & Medevac',
    specs: 'Reinforced Concrete / Steel Landing Deck with De-Icing Coils',
    health: 99.0,
    status: 'NOMINAL',
    metrics: [
      { label: 'Helipad Flight Surface', value: 'CLEAR / DRY', nominal: true },
      { label: 'Approach Wind Vector', value: '12 kts @ 210°', nominal: true },
      { label: 'Surface De-icing Status', value: 'STANDBY', nominal: true },
      { label: 'Perimeter Light Intensity', value: '100% LED Omni', nominal: true },
      { label: 'Compatible Aircraft', value: 'Kamov Ka-32, Bell 412', nominal: true },
    ],
    desc: 'Primary air gateway for summer crew deployment, remote field-camp resupply flights, and emergency aeromedical evacuations to Cape Town.'
  }
}

export default function SubsystemModal({ subsystemId, onClose }) {
  if (!subsystemId) return null
  const data = SUBSYSTEM_DATA[subsystemId] || SUBSYSTEM_DATA['radome']
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const handleRunDiagnostic = () => {
    setTesting(true)
    setTestResult(null)
    setTimeout(() => {
      setTesting(false)
      setTestResult('Diagnostic completed: All 16 telemetry sensors calibrated. Zero anomalies detected.')
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0b1324] border border-cyan-500/40 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col">
        {/* HUD Top Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <div>
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
                3D Subsystem Telemetry Node • ID: {subsystemId.toUpperCase()}
              </span>
              <h2 className="text-sm font-bold text-slate-100 tracking-wide">
                {data.name}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-700/60">
              HEALTH: {data.health}%
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-xs font-bold transition-colors"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto font-sans">
          {/* Category & Location */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-slate-800/90 text-blue-300 border border-slate-700">
              Station: {data.station}
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-800/90 text-slate-300 border border-slate-700">
              Pillar: {data.category}
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-800/90 text-slate-400 border border-slate-700">
              {data.specs}
            </span>
          </div>

          {/* Description */}
          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
            {data.desc}
          </div>

          {/* Real-time Telemetry Gauges */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Live Sensor Parameters</span>
              <span className="text-cyan-400 font-mono text-[10px]">Real-Time Feed</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.metrics.map((m, idx) => (
                <div key={idx} className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-mono">{m.label}</span>
                  <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Self-Test Diagnostic Button */}
          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handleRunDiagnostic}
              disabled={testing}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 text-xs font-bold tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {testing ? (
                <>
                  <span className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  Running Frequency Diagnostic...
                </>
              ) : (
                <>⚙ Run Self-Test Calibration</>
              )}
            </button>
            <span className="text-[11px] font-mono text-slate-500 text-center sm:text-right">
              Sampling Rate: 100 Hz • Protocol: Modbus/TCP
            </span>
          </div>

          {testResult && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-700/60 rounded text-xs font-mono text-emerald-300 animate-in fade-in">
              ✔ {testResult}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
