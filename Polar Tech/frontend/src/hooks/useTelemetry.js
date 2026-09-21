/**
 * useTelemetry — Socket.io real-time telemetry hook
 * Project Drishti | SIH 2026 PS-26060
 * Connects to FastAPI backend and streams live telemetry, CCTV metrics, and risk predictions.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export function useTelemetry() {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [telemetry, setTelemetry] = useState({ maitri: null, bharati: null })
  const [cctvMetrics, setCctvMetrics] = useState({ maitri: null, bharati: null })
  const [riskData, setRiskData] = useState({ maitri: null, bharati: null })
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
    })
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('telemetry', (data) => {
      const station = data.station
      setTelemetry(prev => ({ ...prev, [station]: data }))
      const critSubsystems = ['electricity', 'fuel', 'water', 'rations'].filter(
        s => data[s]?.status === 'CRITICAL'
      )
      if (critSubsystems.length > 0) {
        setAlerts(prev => [
          { id: Date.now(), station, subsystems: critSubsystems, ts: data.ts },
          ...prev.slice(0, 9)
        ])
      }
    })

    socket.on('cctv_metrics', (data) => {
      const station = data.station
      setCctvMetrics(prev => ({ ...prev, [station]: data }))
    })

    socket.on('risk_update', (data) => {
      const station = data.station
      setRiskData(prev => ({ ...prev, [station]: data }))
    })

    return () => { socket.disconnect() }
  }, [])

  const dismissAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }, [])

  return { connected, telemetry, cctvMetrics, riskData, alerts, dismissAlert }
}

export default useTelemetry
