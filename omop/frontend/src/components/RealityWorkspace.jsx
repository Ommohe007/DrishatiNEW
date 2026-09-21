/**
 * RealityWorkspace.jsx — Core Interactive Reality & Analytics Workspace
 * Project Drishti | SIH 2026 PS-26060 | Ministry of Earth Sciences (MoES)
 */
import React from 'react'
import GodsEyeView from './GodsEyeView.jsx'
import Dashboard from './Dashboard.jsx'
import CctvVisionPanel from './CctvVisionPanel.jsx'
import GisRadarPanel from './GisRadarPanel.jsx'
import MaintenancePanel from './MaintenancePanel.jsx'
import ScientistsPanel from './ScientistsPanel.jsx'

export default function RealityWorkspace({
  view,
  telemetry,
  alerts,
  activeStation,
  setActiveStation,
  connected,
  cctvMetrics,
  riskData,
  chartHistory,
  onOpenGallery,
  onOpenDrill,
  onInspectSubsystem
}) {
  return (
    <div className="flex-1 relative overflow-hidden bg-[#050a14] recessed-display">
      {view === '3d' && (
        <GodsEyeView
          telemetry={telemetry}
          alerts={alerts}
          activeStation={activeStation}
          setActiveStation={setActiveStation}
          connected={connected}
          onOpenGallery={onOpenGallery}
          onOpenDrill={onOpenDrill}
          onInspectSubsystem={onInspectSubsystem}
        />
      )}

      {view === 'dashboard' && (
        <Dashboard
          activeStation={activeStation}
          telemetry={telemetry}
          cctvMetrics={cctvMetrics}
          riskData={riskData}
          chartHistory={chartHistory}
          onOpenGallery={onOpenGallery}
          onOpenDrill={onOpenDrill}
        />
      )}

      {view === 'cctv' && (
        <CctvVisionPanel />
      )}

      {view === 'gis' && (
        <GisRadarPanel />
      )}

      {view === 'maintenance' && (
        <MaintenancePanel />
      )}

      {view === 'scientists' && (
        <ScientistsPanel activeStation={activeStation} />
      )}
    </div>
  )
}
