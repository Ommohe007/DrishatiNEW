/**
 * Dashboard.jsx — Polar Telemetry Operations Dashboard
 * Project Drishti | SIH 2026 PS-26060 | Ministry of Earth Sciences (MoES)
 * Structured directly around the 4 Pillars of Antarctic Remote Management:
 *   1. Infrastructure (PLR-1)
 *   2. Energy Grid (PLR-2)
 *   3. Logistics & Supply (PLR-3)
 *   4. Environmental Monitoring (PLR-4)
 */
import React, { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from 'recharts'
import RiskPanel from './RiskPanel.jsx'

// ─── Custom Tooltip (Defense Slate Style) ──────────────────────────────────────
const ChartTooltip = ({ active, payload, unit }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded shadow text-xs font-mono">
      <span className="text-slate-100 font-bold">{payload[0]?.value?.toFixed(1)}{unit}</span>
    </div>
  )
}

// ─── Area Chart Card (Institutional Theme) ────────────────────────────────────
function MetricChart({ data, dataKey, color, label, unit = '' }) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 shadow-sm">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">{label}</span>
        <span className="text-[10px] font-mono text-slate-500">Live Telemetry</span>
      </div>
      <ResponsiveContainer width="100%" height={70}>
        <AreaChart data={data} margin={{ top: 2, right: 2, left: -26, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="t" tick={false} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} width={34} />
          <Tooltip content={<ChartTooltip unit={unit} />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fill={`url(#grad-${dataKey})`}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Status Pill Badge ─────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const styles = {
    NORMAL:   'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
    WARNING:  'bg-amber-950/80 text-amber-300 border-amber-800/60',
    CRITICAL: 'bg-rose-950/80 text-rose-300 border-rose-800/60 animate-pulse',
  }
  return (
    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${styles[status] || styles.NORMAL}`}>
      {status || 'NORMAL'}
    </span>
  )
}

// ─── Metric Box ───────────────────────────────────────────────────────────────
function MetricBox({ label, value, unit = '', alert = false, subtext = null }) {
  return (
    <div className="p-2.5 bg-slate-900/90 rounded border border-slate-800 flex flex-col justify-between">
      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{label}</span>
      <div className={`text-sm font-bold font-mono mt-0.5 ${alert ? 'text-rose-400' : 'text-slate-100'}`}>
        {value !== undefined && value !== null ? `${value}${unit}` : '—'}
      </div>
      {subtext && <span className="text-[9px] text-slate-500 font-mono mt-0.5">{subtext}</span>}
    </div>
  )
}

// ─── Real Station Photographic Snapshot Card ─────────────────────────────────
function RealPhotosPreview({ station, onOpenGallery }) {
  const isBharati = station === 'bharati'
  const imgPath = isBharati
    ? '/assets/stations/bharati_facade_day_night.jpg'
    : '/assets/stations/maitri_aerial_official.jpg'
  const title = isBharati
    ? 'Bharati Station (Larsemann Hills)'
    : 'Maitri Base (Schirmacher Oasis)'
  const details = isBharati
    ? '134 ISO Prefabricated Modules on Aerodynamic V-Stilts'
    : 'Stilted Habitat Block with Lake Priyadarshini Lifeline'

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-3 shadow-sm">
      <div className="flex justify-between items-center mb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Authentic Polar Architecture Reference
          </span>
        </div>
        <button
          onClick={onOpenGallery}
          className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-medium transition-colors"
        >
          View Photo Archive (11 Photos) →
        </button>
      </div>
      <div className="flex gap-3.5 items-center">
        <img
          src={imgPath}
          alt={title}
          onClick={onOpenGallery}
          className="w-32 h-20 object-cover rounded border border-slate-700 cursor-pointer hover:opacity-90 shadow"
        />
        <div className="flex-1">
          <div className="text-xs font-bold text-slate-100">{title}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{details}</div>
          <div className="mt-2 flex gap-1.5 text-[10px] font-mono text-slate-300">
            <span className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">MoES Expedition</span>
            <span className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">NCPOR Standard</span>
            <span className="px-1.5 py-0.5 bg-blue-950 text-blue-300 rounded border border-blue-800">
              {isBharati ? '69°24′S 76°11′E' : '70°46′S 11°44′E'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── CCTV & Optical Feed ──────────────────────────────────────────────────────
function CCTVFeed({ cctv, onOpenGallery }) {
  const [feedMode, setFeedMode] = useState('ai') // 'ai' | 'timelapse'

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-200 tracking-wider uppercase">
            Polar Optical Surveillance (OPT-CV)
          </span>
        </div>
        <div className="flex gap-1 text-[10px]">
          <button
            onClick={() => setFeedMode('ai')}
            className={`px-2.5 py-0.5 rounded font-medium transition-colors ${
              feedMode === 'ai' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200 bg-slate-800'
            }`}
          >
            YOLOv8 AI Stream
          </button>
          <button
            onClick={() => setFeedMode('timelapse')}
            className={`px-2.5 py-0.5 rounded font-medium transition-colors ${
              feedMode === 'timelapse' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200 bg-slate-800'
            }`}
          >
            Station Cam
          </button>
        </div>
      </div>

      {feedMode === 'ai' ? (
        cctv?.frame_b64 ? (
          <img
            src={`data:image/jpeg;base64,${cctv.frame_b64}`}
            alt="CCTV annotated feed"
            className="w-full rounded border border-slate-700 mb-2"
          />
        ) : (
          <div className="bg-slate-950 rounded h-32 mb-2 flex items-center justify-center text-xs text-slate-500 font-mono">
            Optical feed active · awaiting next frame capture...
          </div>
        )
      ) : (
        <img
          src="/assets/stations/bharati_radome_twilight.jpg"
          alt="Real Camera Feed"
          onClick={onOpenGallery}
          className="w-full h-36 object-cover rounded border border-slate-700 mb-2 cursor-pointer shadow"
        />
      )}

      <div className="flex gap-4 text-xs font-mono text-slate-300">
        <span>Crew Occupancy: <strong className="text-slate-100">{cctv?.occupancy ?? 4}</strong></span>
        <span>Cargo Units: <strong className="text-slate-100">{cctv?.pallet_count ?? 3}</strong></span>
        {cctv?.hazards?.length > 0 && (
          <span className="text-rose-400 font-bold animate-pulse">
            🚨 Hazard: {cctv.hazards.join(', ')}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Main Operations Dashboard Export ─────────────────────────────────────────
export default function Dashboard({
  activeStation,
  telemetry,
  cctvMetrics,
  riskData,
  chartHistory,
  onOpenGallery,
  onOpenDrill
}) {
  const station = activeStation === 'both' ? 'bharati' : activeStation
  const isBharati = station === 'bharati'
  const t    = telemetry?.[station]
  const cctv = cctvMetrics?.[station]
  const risk = riskData?.[station]
  const hist = chartHistory?.[station] || []

  const elec = t?.electricity
  const fuel = t?.fuel
  const water = t?.water
  const rations = t?.rations
  const env = t?.environment

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 bg-[#0b0f19]">
      {/* Real station snapshot preview */}
      <RealPhotosPreview station={station} onOpenGallery={onOpenGallery} />

      {/* Station Control Banner */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            {station.toUpperCase()} BASE — Comprehensive 4-Pillar Digital Twin
          </h2>
        </div>
        <button
          onClick={onOpenDrill}
          className="text-xs font-semibold px-3 py-1.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/60 transition-colors shadow-sm"
        >
          ⚠ Trigger Crisis Drill
        </button>
      </div>

      {/* ── PILLAR 1: INFRASTRUCTURE (PLR-1) ─────────────────────────────────── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
              PLR-1
            </span>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              Infrastructure Operations & Structural Integrity
            </h3>
          </div>
          <StatusPill status={water?.status} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <MetricBox
            label="Hull Architecture"
            value={isBharati ? '134 ISO Modules' : 'Stilted Steel Pylons'}
            subtext={isBharati ? '3.6m V-Stilts clearance' : 'Schirmacher rock chassis'}
          />
          <MetricBox
            label="Water Lifeline"
            value={isBharati ? 'RO Desalination' : 'Lake Priyadarshini'}
            subtext={water?.pump_active ? 'Nominal pumping' : 'Pump offline'}
            alert={!water?.pump_active}
          />
          <MetricBox
            label="Trace Heating"
            value={fuel?.trace_heat_temp_c?.toFixed(1)}
            unit="°C"
            subtext="Freeze protection line"
            alert={fuel?.trace_heat_temp_c < -12}
          />
          <MetricBox
            label="Structural Wind Load"
            value={env?.wind_ms ? `${(env.wind_ms * 3.6).toFixed(0)} km/h` : '50 km/h'}
            subtext="Rated limit: 200 km/h"
            alert={env?.wind_ms > 30}
          />
        </div>
      </div>

      {/* ── PILLAR 2: ENERGY SYSTEMS (PLR-2) ──────────────────────────────────── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
              PLR-2
            </span>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              Energy Systems & 3-Phase Power Distribution
            </h3>
          </div>
          <StatusPill status={elec?.status} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-3">
          <MetricBox
            label="Diesel Gen 1"
            value={elec?.rpm?.toFixed(0)}
            unit=" RPM"
            subtext="Nominal: 1500 RPM (50Hz)"
            alert={elec?.rpm < 1420 || elec?.rpm > 1580}
          />
          <MetricBox
            label="Total Station Load"
            value={elec?.load_kw?.toFixed(1)}
            unit=" kW"
            subtext="Active draw"
          />
          <MetricBox
            label="3-Phase AC Voltages"
            value={`${elec?.voltages?.[0]?.toFixed(0)} / ${elec?.voltages?.[1]?.toFixed(0)} / ${elec?.voltages?.[2]?.toFixed(0)}`}
            unit=" V"
            subtext="Phase A / B / C"
            alert={elec?.voltages?.some(v => v < 215 || v > 245)}
          />
          <MetricBox
            label="Renewable Solar PV"
            value={isBharati ? '24 kW Array' : 'Auxiliary Grid'}
            subtext={isBharati ? 'Rooftop bifacial panels' : 'Thermal cogeneration'}
          />
        </div>
        <MetricChart
          data={hist}
          dataKey="load_kw"
          color="#3b82f6"
          label="Power Consumption Trend (kW)"
          unit=" kW"
        />
      </div>

      {/* ── PILLAR 3: LOGISTICS & SUPPLY (PLR-3) ──────────────────────────────── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
              PLR-3
            </span>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              Logistics, Fuel Autonomy & Consumables
            </h3>
          </div>
          <StatusPill status={fuel?.status} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-3">
          <MetricBox
            label="Diesel Reserve"
            value={fuel?.pct?.toFixed(1)}
            unit="%"
            subtext={fuel?.tank_liters ? `${fuel.tank_liters.toFixed(0)} / 50,000 L` : '50,000 L tank'}
            alert={fuel?.pct < 25}
          />
          <MetricBox
            label="Mission Autonomy"
            value={fuel?.time_to_empty_hrs ? (fuel.time_to_empty_hrs / 24).toFixed(0) : '—'}
            unit=" Days"
            subtext="Fuel autonomy horizon"
            alert={fuel?.time_to_empty_hrs < 30 * 24}
          />
          <MetricBox
            label="Water Storage"
            value={water?.pct?.toFixed(1)}
            unit="%"
            subtext={water?.tank_liters ? `${water.tank_liters.toFixed(0)} / 20,000 L` : '20,000 L tank'}
          />
          <MetricBox
            label="Rations Buffer"
            value={rations?.days_left?.toFixed(0)}
            unit=" Days"
            subtext="Expedition food buffer"
            alert={rations?.days_left < 21}
          />
        </div>
        <MetricChart
          data={hist}
          dataKey="diesel_pct"
          color="#f59e0b"
          label="Diesel Fuel Reserve Trajectory (%)"
          unit="%"
        />
      </div>

      {/* ── PILLAR 4: ENVIRONMENTAL MONITORING (PLR-4) ────────────────────────── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
              PLR-4
            </span>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              Polar Microclimate & Environmental Monitoring
            </h3>
          </div>
          <StatusPill status={env?.blizzard ? 'CRITICAL' : 'NORMAL'} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-3">
          <MetricBox
            label="Outside Temperature"
            value={env?.temp_c?.toFixed(1)}
            unit="°C"
            subtext="Surface meteorological mast"
            alert={env?.temp_c < -35}
          />
          <MetricBox
            label="Wind Speed"
            value={env?.wind_ms?.toFixed(1)}
            unit=" m/s"
            subtext="Surface anemometer"
            alert={env?.wind_ms > 25}
          />
          <MetricBox
            label="Optical Visibility"
            value={env?.visibility_m?.toFixed(0)}
            unit=" m"
            subtext="Transmissometer sensor"
            alert={env?.visibility_m < 500}
          />
          <MetricBox
            label="Storm Advisory"
            value={env?.blizzard ? 'GALE ACTIVE' : 'CLEAR'}
            subtext="MoES early warning"
            alert={env?.blizzard}
          />
        </div>
        <MetricChart
          data={hist}
          dataKey="temp_c"
          color="#60a5fa"
          label="Outside Ambient Temperature (°C)"
          unit="°C"
        />
      </div>

      {/* AI Predictive Risk Engine */}
      <RiskPanel riskData={risk} />

      {/* CCTV & Optical Surveillance Feed */}
      <CCTVFeed cctv={cctv} onOpenGallery={onOpenGallery} />
    </div>
  )
}

