/**
 * CrisisDrillCorner.jsx — Live Emergency Alert Toasts & Crisis Overlay
 * Project Drishti | SIH 2026 PS-26060 | Ministry of Earth Sciences (MoES)
 */
import React from 'react'

export default function CrisisDrillCorner({ alerts, dismissAlert }) {
  if (!alerts || alerts.length === 0) return null

  return (
    <div className="fixed top-16 right-4 lg:right-76 z-50 flex flex-col gap-2 pointer-events-none font-mono">
      {alerts.slice(0, 3).map(alert => (
        <div
          key={alert.id}
          className="pointer-events-auto bg-[#1a070f] border border-rose-600/90 rounded p-3 text-xs text-rose-100 font-bold shadow-[0_0_25px_rgba(255,42,95,0.4)] cursor-pointer transition-transform hover:scale-102 flex items-center justify-between gap-3 clip-chamfer"
          onClick={() => dismissAlert(alert.id)}
          title="Click to dismiss alert"
        >
          <div className="flex items-center gap-2">
            <span className="dot-crit" />
            <span>⚠ {alert.station?.toUpperCase()} CRITICAL: {alert.subsystems?.join(', ').toUpperCase()}</span>
          </div>
          <span className="text-[10px] text-rose-400 border border-rose-800 px-1.5 py-0.5 rounded bg-rose-950">
            DISMISS
          </span>
        </div>
      ))}
    </div>
  )
}
