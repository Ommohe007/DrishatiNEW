/**
 * CctvVisionPanel.jsx — Synthetic Polar CCTV Vision AI & Object Detection
 * Project Drishti | SIH 2026 PS-26060 | Ministry of Earth Sciences (MoES)
 */
import React, { useState, useEffect, useRef } from 'react'

const CAMERAS = [
  { id: 'cam1', name: 'CAM-01: Bharati North Cantilever (Prydz Bay)', station: 'Bharati', fps: 24, resolution: '1080p 60fps IR' },
  { id: 'cam2', name: 'CAM-02: Maitri Convoy Gate (Lake Priyadarshini)', station: 'Maitri', fps: 24, resolution: '1080p 60fps IR' },
  { id: 'cam3', name: 'CAM-03: ISRO Satellite Mast & Radome Deck', station: 'Bharati', fps: 30, resolution: '4K Ultra-HD PTZ' },
]

export default function CctvVisionPanel() {
  const [activeCam, setActiveCam] = useState('cam1')
  const [thermalMode, setThermalMode] = useState(false)
  const [showBoxes, setShowBoxes] = useState(true)
  const [whiteoutLevel, setWhiteoutLevel] = useState(14)
  const [eventLogs, setEventLogs] = useState([
    { id: 1, time: '15:40:12', msg: 'PistenBully 300 snowcat tracked entering Container Depot', conf: '94%' },
    { id: 2, time: '15:41:45', msg: 'Personnel in Cold Suit detected near Stilt Bent #3', conf: '98%' },
    { id: 3, time: '15:43:02', msg: 'ISRO Radome structural edge contrast verified nominal', conf: '99%' },
  ])

  const canvasRef = useRef(null)

  // Canvas drawing loop (simulating live polar CCTV stream with particles, HUD, and YOLO boxes)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let frameId
    let t = 0

    const render = () => {
      t += 0.05
      const w = canvas.width
      const h = canvas.height

      // Background
      if (thermalMode) {
        // Infrared FLIR Thermal palette (dark purple to hot yellow/white)
        const grad = ctx.createLinearGradient(0, 0, 0, h)
        grad.addColorStop(0, '#0a0326')
        grad.addColorStop(0.5, '#1e0847')
        grad.addColorStop(1, '#380e54')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
      } else {
        // Normal Polar Camera (icy cold blue / grey)
        const grad = ctx.createLinearGradient(0, 0, 0, h)
        grad.addColorStop(0, '#0d1829')
        grad.addColorStop(0.6, '#14233c')
        grad.addColorStop(1, '#1b2d4b')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
      }

      // Distant Antarctic Horizon & Mountain Silhouettes
      ctx.fillStyle = thermalMode ? '#150630' : '#08101d'
      ctx.beginPath()
      ctx.moveTo(0, h * 0.65)
      ctx.lineTo(w * 0.25, h * 0.52)
      ctx.lineTo(w * 0.55, h * 0.6)
      ctx.lineTo(w * 0.85, h * 0.48)
      ctx.lineTo(w, h * 0.62)
      ctx.lineTo(w, h)
      ctx.lineTo(0, h)
      ctx.fill()

      // Station Facility Silhouette
      ctx.fillStyle = thermalMode ? '#f59e0b' : '#22324e' // Heat source in thermal mode
      ctx.fillRect(w * 0.35, h * 0.48, w * 0.32, h * 0.22)
      // Cantilever Overhang
      ctx.fillStyle = thermalMode ? '#ef4444' : '#2d4163'
      ctx.beginPath()
      ctx.moveTo(w * 0.32, h * 0.48)
      ctx.lineTo(w * 0.7, h * 0.48)
      ctx.lineTo(w * 0.66, h * 0.42)
      ctx.lineTo(w * 0.36, h * 0.42)
      ctx.closePath()
      ctx.fill()

      // Radome Sphere
      ctx.fillStyle = thermalMode ? '#fbbf24' : '#dbeafe'
      ctx.beginPath()
      ctx.arc(w * 0.28, h * 0.46, 26, 0, Math.PI * 2)
      ctx.fill()

      // Rotating beacon light on radome mast
      const beaconAlpha = (Math.sin(t * 3) + 1) / 2
      ctx.fillStyle = `rgba(239, 68, 68, ${beaconAlpha * 0.9})`
      ctx.beginPath()
      ctx.arc(w * 0.28, h * 0.46 - 28, 4, 0, Math.PI * 2)
      ctx.fill()

      // Blizzard wind snow particles
      ctx.fillStyle = thermalMode ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.5)'
      for (let i = 0; i < 70; i++) {
        const sx = ((i * 37 + t * 450) % (w + 100)) - 50
        const sy = (i * 23 + t * 80) % h
        ctx.fillRect(sx, sy, 2 + (i % 3), 1)
      }

      // YOLO Object Detection Overlays
      if (showBoxes) {
        // Box 1: PistenBully Snowcat
        const b1x = w * 0.58 + Math.sin(t * 0.4) * 8
        const b1y = h * 0.68
        const b1w = 110
        const b1h = 55

        ctx.strokeStyle = '#06b6d4'
        ctx.lineWidth = 1.8
        ctx.strokeRect(b1x, b1y, b1w, b1h)
        ctx.fillStyle = 'rgba(6, 182, 212, 0.15)'
        ctx.fillRect(b1x, b1y, b1w, b1h)

        // Label Tag
        ctx.fillStyle = '#06b6d4'
        ctx.fillRect(b1x, b1y - 18, 135, 18)
        ctx.fillStyle = '#0b0f19'
        ctx.font = 'bold 10px monospace'
        ctx.fillText('PistenBully 300 [94%]', b1x + 4, b1y - 5)

        // Box 2: Expedition Personnel
        const b2x = w * 0.42 + Math.cos(t * 0.3) * 6
        const b2y = h * 0.70
        const b2w = 26
        const b2h = 52

        ctx.strokeStyle = '#10b981'
        ctx.lineWidth = 1.8
        ctx.strokeRect(b2x, b2y, b2w, b2h)
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)'
        ctx.fillRect(b2x, b2y, b2w, b2h)

        ctx.fillStyle = '#10b981'
        ctx.fillRect(b2x, b2y - 18, 122, 18)
        ctx.fillStyle = '#0b0f19'
        ctx.font = 'bold 10px monospace'
        ctx.fillText('Crew (Cold Suit) [98%]', b2x + 3, b2y - 5)

        // Box 3: ISRO Radome Sphere
        ctx.strokeStyle = '#f59e0b'
        ctx.lineWidth = 1.5
        ctx.strokeRect(w * 0.28 - 32, h * 0.46 - 32, 64, 64)
        ctx.fillStyle = '#f59e0b'
        ctx.fillRect(w * 0.28 - 32, h * 0.46 - 48, 115, 16)
        ctx.fillStyle = '#0b0f19'
        ctx.fillText('ISRO Radome [99%]', w * 0.28 - 28, h * 0.46 - 36)
      }

      // Camera HUD Scanlines & Timecode
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
      for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 1)
      }

      // HUD Crosshairs in center
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(w / 2 - 15, h / 2)
      ctx.lineTo(w / 2 + 15, h / 2)
      ctx.moveTo(w / 2, h / 2 - 15)
      ctx.lineTo(w / 2, h / 2 + 15)
      ctx.stroke()

      // Timecode overlay
      ctx.fillStyle = '#f8fafc'
      ctx.font = 'bold 11px monospace'
      ctx.fillText(`REC ● LIVE  ${new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC`, 14, 22)
      ctx.fillText(`CAM: ${activeCam.toUpperCase()} | IR: ${thermalMode ? 'FLIR ON' : 'OPTICAL'} | FPS: 24.1`, 14, 38)

      frameId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(frameId)
  }, [thermalMode, showBoxes, activeCam])

  return (
    <div className="w-full h-full flex flex-col p-4 bg-[#080d1a] overflow-hidden">
      {/* Top Controls Bar */}
      <div className="flex-none flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            Antarctic Optical & Thermal CCTV Vision AI
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Camera switcher */}
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
            {CAMERAS.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCam(c.id)}
                className={`text-xs px-2.5 py-1 rounded font-mono font-medium transition-all ${
                  activeCam === c.id
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {c.name.split(':')[0]}
              </button>
            ))}
          </div>

          {/* Thermal Mode Toggle */}
          <button
            onClick={() => setThermalMode(!thermalMode)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-mono font-bold transition-all ${
              thermalMode
                ? 'bg-amber-950 text-amber-300 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {thermalMode ? '🔥 FLIR Thermal ACTIVE' : '📷 Optical View'}
          </button>

          {/* YOLO Bounding Boxes Toggle */}
          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-mono font-bold transition-all ${
              showBoxes
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            {showBoxes ? '✔ YOLO Bounding Boxes ON' : '✕ Bounding Boxes OFF'}
          </button>
        </div>
      </div>

      {/* Main Vision Body */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 pt-4 overflow-hidden">
        {/* Left: Live Video Canvas */}
        <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-700/80 bg-black flex items-center justify-center shadow-2xl">
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            className="w-full h-full object-contain"
          />

          {/* Overlay Corner Badges */}
          <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded border border-slate-800 text-[11px] font-mono text-cyan-300 flex items-center gap-3">
            <span>YOLOv8s-Antarctic Model</span>
            <span className="text-slate-500">|</span>
            <span>Latency: 18ms</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400 font-bold">Inference: 55.6 FPS</span>
          </div>

          <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-2">
            <span>Whiteout Optical Index:</span>
            <span className={`font-bold ${whiteoutLevel > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {whiteoutLevel}% (Clear Visibility)
            </span>
          </div>
        </div>

        {/* Right: Vision AI Telemetry & Events */}
        <div className="w-full lg:w-80 flex flex-col space-y-3">
          {/* Active Camera Specs Card */}
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg">
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-1">
              Camera Specifications
            </span>
            <div className="text-xs font-bold text-slate-200 mb-1">
              {CAMERAS.find(c => c.id === activeCam)?.name}
            </div>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>Stream: 1080p H.264 / RTSP over ISRO Satcom</div>
              <div>Thermal Sensor: Uncooled VOx Microbolometer</div>
              <div>Operating Ambient: -42.0°C (Internal Heating ON)</div>
            </div>
          </div>

          {/* Real-Time Detection Feed Log */}
          <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                Live AI Detection Log
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                Auto-Tracking
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {eventLogs.map(log => (
                <div key={log.id} className="p-2 bg-slate-950/80 border border-slate-800/80 rounded text-xs font-mono">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                    <span>{log.time} UTC</span>
                    <span className="text-cyan-400 font-bold">{log.conf}</span>
                  </div>
                  <div className="text-slate-200 text-[11px] leading-snug">
                    {log.msg}
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
