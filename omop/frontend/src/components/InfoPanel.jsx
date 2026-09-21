/**
 * InfoPanel.jsx — 4-Pillar Polar Telemetry Operations Sidebar
 * Ministry of Earth Sciences (MoES) | SIH 2026 PS-26060
 * Structured explicitly across: Infrastructure, Energy, Logistics & Environment
 */
import React from 'react'

function StatusPill({ status }) {
  const styles = {
    NORMAL:   'bg-emerald-950/80 text-emerald-300 border-emerald-700/70',
    WARNING:  'bg-amber-950/80 text-amber-300 border-amber-700/70',
    CRITICAL: 'bg-rose-950/80 text-rose-300 border-rose-700/70 animate-pulse',
  }
  return (
    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${styles[status] || styles.NORMAL}`}>
      {status || 'NORMAL'}
    </span>
  )
}

function PillarCard({ title, code, status, children }) {
  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-3 mb-3 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-blue-400 border border-slate-700">
            {code}
          </span>
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">{title}</span>
        </div>
        <StatusPill status={status} />
      </div>
      <div className="space-y-1.5 text-xs font-mono">
        {children}
      </div>
    </div>
  )
}

function MetricRow({ label, value, unit = '', alert = false }) {
  return (
    <div className="flex justify-between items-center py-0.5 border-b border-slate-800/40 last:border-0">
      <span className="text-slate-400 text-[11px]">{label}</span>
      <span className={`font-semibold ${alert ? 'text-rose-400 font-bold' : 'text-slate-100'}`}>
        {value !== undefined && value !== null ? `${value}${unit}` : '—'}
      </span>
    </div>
  )
}

export default function InfoPanel({ station, telemetry, cctvMetrics }) {
  if (!station || !telemetry) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 text-xs px-4 text-center">
        Select a facility in the 3D twin or toggle stations to inspect telemetry
      </div>
    )
  }

  const t = telemetry
  const isBharati = station === 'bharati'
  const ts = t.ts ? new Date(t.ts).toUTCString().slice(5, 25) : '—'

  return (
    <div className="h-full overflow-y-auto p-3 space-y-1 bg-[#0d1527] border-l border-slate-800">
      {/* Station Header */}
      <div className="mb-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-slate-100 font-bold text-sm tracking-wider uppercase">
            {station.toUpperCase()} BASE
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
            {isBharati ? '69°24′S' : '70°46′S'}
          </span>
        </div>
        <div className="text-slate-400 text-[11px] font-mono mt-0.5">{ts} UTC</div>
      </div>

      {/* ── PILLAR 1: INFRASTRUCTURE ─────────────────────────────────────── */}
      <PillarCard title="Infrastructure" code="PLR-1" status={t.water?.status}>
        <MetricRow label="Structural Design" value={isBharati ? '134 Modular Containers' : 'Stilted Steel Pylons'} />
        <MetricRow label="Stilt Clearance" value="3.6 m (Aerodynamic)" />
        <MetricRow label="Lifeline Water Source" value={isBharati ? 'RO Desalination Plant' : 'Lake Priyadarshini'} />
        <MetricRow label="Pumping Module" value={t.water?.pump_active ? 'NOMINAL' : 'OFFLINE'} alert={!t.water?.pump_active} />
        <MetricRow label="Trace Heating Conduit" value={t.fuel?.trace_heat_temp_c?.toFixed(1)} unit="°C" alert={t.fuel?.trace_heat_temp_c < -12} />
      </PillarCard>

      {/* ── PILLAR 2: ENERGY SYSTEMS ────────────────────────────────────── */}
      <PillarCard title="Energy Grid" code="PLR-2" status={t.electricity?.status}>
        <MetricRow label="Diesel Gen 1 RPM" value={t.electricity?.rpm?.toFixed(0)} />
        <MetricRow label="Total Power Load" value={t.electricity?.load_kw?.toFixed(1)} unit=" kW" />
        <MetricRow label="Phase A Voltage" value={t.electricity?.voltages?.[0]?.toFixed(1)} unit=" V" />
        <MetricRow label="Phase B Voltage" value={t.electricity?.voltages?.[1]?.toFixed(1)} unit=" V" />
        <MetricRow label="Phase C Voltage" value={t.electricity?.voltages?.[2]?.toFixed(1)} unit=" V" />
        <MetricRow label="Fuel Burn Rate" value={t.fuel?.burn_rate_lph?.toFixed(1)} unit=" L/hr" />
        <MetricRow label="Rooftop Solar PV" value={isBharati ? '24 kW Array (Active)' : 'N/A (Generator Pri)'} />
      </PillarCard>

      {/* ── PILLAR 3: LOGISTICS & SUPPLY ────────────────────────────────── */}
      <PillarCard title="Logistics & Supply" code="PLR-3" status={t.fuel?.status}>
        <MetricRow label="Diesel Fuel Reserve" value={t.fuel?.tank_liters?.toFixed(0)} unit=" L" />
        <MetricRow label="Fuel Tank Level" value={t.fuel?.pct?.toFixed(1)} unit="%" alert={t.fuel?.pct < 20} />
        <MetricRow label="Estimated Autonomy" value={t.fuel?.time_to_empty_hrs ? (t.fuel.time_to_empty_hrs / 24).toFixed(0) : '—'} unit=" Days" />
        <MetricRow label="Water Storage Tank" value={t.water?.tank_liters?.toFixed(0)} unit=" L" />
        <MetricRow label="Rations Buffer" value={t.rations?.days_left?.toFixed(0)} unit=" Days" alert={t.rations?.days_left < 15} />
        <MetricRow label="Cargo Units Stored" value="4 ISO Shipping Depot" />
      </PillarCard>

      {/* ── PILLAR 4: ENVIRONMENTAL MONITORING ──────────────────────────── */}
      <PillarCard title="Environmental" code="PLR-4" status={t.environment?.blizzard ? 'CRITICAL' : 'NORMAL'}>
        <MetricRow label="Ambient Temperature" value={t.environment?.temp_c?.toFixed(1)} unit="°C" alert={t.environment?.temp_c < -35} />
        <MetricRow label="Surface Wind Speed" value={t.environment?.wind_ms?.toFixed(1)} unit=" m/s" alert={t.environment?.wind_ms > 25} />
        <MetricRow label="Optical Visibility" value={t.environment?.visibility_m?.toFixed(0)} unit=" m" alert={t.environment?.visibility_m < 500} />
        <MetricRow label="Blizzard Advisory" value={t.environment?.blizzard ? 'GALE WARNING ACTIVE' : 'CLEAR CONDITIONS'} alert={t.environment?.blizzard} />
      </PillarCard>

      {/* Optical Surveillance Subsystem */}
      {cctvMetrics && (
        <PillarCard title="Personnel & Hazards" code="OPT-CV" status={cctvMetrics.hazards?.length > 0 ? 'WARNING' : 'NORMAL'}>
          <MetricRow label="Station Occupancy" value={cctvMetrics.occupancy} unit=" Crew" />
          <MetricRow label="Cargo Pallets Count" value={cctvMetrics.pallet_count} />
          <MetricRow label="Active Hazards" value={cctvMetrics.hazards?.length > 0 ? cctvMetrics.hazards.join(', ') : 'None Detected'} alert={cctvMetrics.hazards?.length > 0} />
        </PillarCard>
      )}
    </div>
  )
}

