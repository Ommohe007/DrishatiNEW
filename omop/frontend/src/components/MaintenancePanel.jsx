/**
 * MaintenancePanel.jsx — AI Predictive Maintenance & Digital Work Orders
 * Project Drishti | SIH 2026 PS-26060 | Ministry of Earth Sciences (MoES)
 */
import React, { useState } from 'react'

const INITIAL_WORK_ORDERS = [
  {
    id: 'WO-8821',
    title: 'Replace Primary Diesel Fuel Filter Cartridge (Genset #2)',
    subsystem: 'Energy Grid / Diesel Genset #2',
    station: 'Bharati',
    priority: 'HIGH',
    horizon: 'Within 72 Hours',
    assignee: 'Chief Engineer Sharma',
    status: 'PENDING',
    sparePart: 'Fleetguard Arctic Filter FS-1000 (Bin C-14)',
    aiReason: 'Differential fuel pressure drop detected (+0.8 bar above nominal).'
  },
  {
    id: 'WO-8822',
    title: 'Inspect Trace Heating Resistance on Priyadarshini Conduit',
    subsystem: 'Life Support / Water Intake Pipeline',
    station: 'Maitri',
    priority: 'CRITICAL',
    horizon: 'Immediate (Next 12 Hours)',
    assignee: 'Tech Officer Verma',
    status: 'IN PROGRESS',
    sparePart: 'Raychem Arctic Trace Cable 30W/m (Yard Cont-04)',
    aiReason: 'GradientBoosting model flagged 41% water freeze risk due to temp drop.'
  },
  {
    id: 'WO-8823',
    title: 'ISRO Radome De-Icing Heating Coils Impedance Verification',
    subsystem: 'Satellite Communications / Radome',
    station: 'Bharati',
    priority: 'ROUTINE',
    horizon: 'Within 7 Days',
    assignee: 'ISRO Comm Eng Patel',
    status: 'COMPLETED',
    sparePart: 'Ceramic Heating Element 2.5 kW (Depot A-02)',
    aiReason: 'Scheduled bi-weekly polar storm preparation check.'
  },
  {
    id: 'WO-8824',
    title: 'Lubricate PistenBully 300 Track Tensioners & Sprockets',
    subsystem: 'Heavy Logistics / Ground Convoy Fleet',
    station: 'Maitri',
    priority: 'HIGH',
    horizon: 'Within 48 Hours',
    assignee: 'Vehicle Specialist Rawat',
    status: 'PENDING',
    sparePart: 'Mobil Arctic SHC 007 Synthetic Grease (Drum 3)',
    aiReason: 'Track hydraulic tension sensor recorded 12% pressure relaxation.'
  }
]

const SPARE_PARTS = [
  { name: 'Genset Oil & Fuel Filter Elements', qty: '48 units', status: 'SUFFICIENT (14 Mo)', location: 'Bharati Cont-08' },
  { name: 'Water Pipe Self-Regulating Trace Cables', qty: '350 meters', status: 'SUFFICIENT (22 Mo)', location: 'Maitri Depot-2' },
  { name: 'Arctic Engine Synthetic Lubricant (0W-30)', qty: '1,200 Litres', status: 'OPTIMAL (18 Mo)', location: 'Fuel Farm Yard' },
  { name: 'ISRO Satellite Feedhorn & LNB Spares', qty: '6 units', status: 'CRITICAL RESERVE', location: 'Radome Avionics Bay' },
  { name: 'PistenBully Bogie Wheels & Rubber Tracks', qty: '4 sets', status: 'SUFFICIENT (8 Mo)', location: 'Convoy Workshop' },
]

export default function MaintenancePanel() {
  const [orders, setOrders] = useState(INITIAL_WORK_ORDERS)
  const [filter, setFilter] = useState('ALL')

  const toggleStatus = (id) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== id) return order
      const nextStatus = order.status === 'PENDING'
        ? 'IN PROGRESS'
        : order.status === 'IN PROGRESS'
          ? 'COMPLETED'
          : 'PENDING'
      return { ...order, status: nextStatus }
    }))
  }

  const filteredOrders = orders.filter(o => filter === 'ALL' || o.status === filter)

  return (
    <div className="w-full h-full flex flex-col p-4 bg-[#080d1a] overflow-y-auto">
      {/* Header */}
      <div className="flex-none flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
            Predictive Lifecycle Management • SIH PS-26060
          </span>
          <h2 className="text-base font-bold text-slate-100">
            Automated Station Work Orders & Spare Parts Matrix
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700/60 flex items-center gap-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-bold">Readiness Index: 96.4%</span>
          </div>
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {['ALL', 'PENDING', 'IN PROGRESS', 'COMPLETED'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded transition-all ${
                  filter === f ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="pt-4 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Work Orders List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Active Predictive Work Orders ({filteredOrders.length})</span>
            <span className="text-[11px] font-mono text-cyan-400">ML Failure Prediction Triggered</span>
          </div>

          {filteredOrders.map(order => (
            <div
              key={order.id}
              className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-slate-700 transition-all shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                    {order.id}
                  </span>
                  <span className="text-xs font-mono text-blue-400 font-semibold">
                    [{order.station}] {order.subsystem}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    order.priority === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-300 border-rose-700'
                      : order.priority === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border-amber-700'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {order.priority}
                  </span>
                  <button
                    onClick={() => toggleStatus(order.id)}
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border transition-all ${
                      order.status === 'COMPLETED'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                        : order.status === 'IN PROGRESS'
                          ? 'bg-blue-950 text-blue-300 border-blue-600 animate-pulse'
                          : 'bg-slate-800 text-amber-300 border-amber-800/80 hover:bg-slate-700'
                    }`}
                  >
                    STATUS: {order.status} ✎
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-100 mb-2">
                {order.title}
              </h3>

              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800/80 text-xs font-mono space-y-1 mb-3">
                <div className="text-slate-300">
                  <span className="text-cyan-400 font-bold">AI Diagnostics:</span> {order.aiReason}
                </div>
                <div className="text-slate-400">
                  <span className="text-slate-500">Action Horizon:</span> {order.horizon} • <span className="text-slate-500">Assigned:</span> {order.assignee}
                </div>
                <div className="text-slate-400">
                  <span className="text-slate-500">Required Part:</span> <span className="text-emerald-300">{order.sparePart}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Col: ISO Container Spare Parts Inventory */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            134 ISO Container Spares Depot
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time audit of critical spares stored within the heated modular shipping container arrays at Bharati and Maitri.
            </p>

            <div className="space-y-2.5">
              {SPARE_PARTS.map((item, idx) => (
                <div key={idx} className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg font-mono text-xs">
                  <div className="text-slate-200 font-semibold mb-1">{item.name}</div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Stock: <strong className="text-cyan-300">{item.qty}</strong></span>
                    <span className="text-emerald-400">{item.status}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Location: {item.location}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
