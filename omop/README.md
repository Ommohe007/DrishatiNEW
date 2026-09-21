# Project Drishti — Digital Twin for Antarctic Research Stations
### SIH 2026 | PS-26060 | Ministry of Earth Sciences (MoES)

> **"Drishti"** (दृष्टि) — Sanskrit for *Vision* / *God's Eye*

A real-time Digital Twin platform for India's Antarctic Research Stations **Maitri** (Queen Maud Land) and **Bharati** (Larsemann Hills), enabling MoES officials to remotely monitor, predict risks, and manage critical subsystems from a single unified dashboard.

---

## Architecture

`
[IoT Simulator]    ──WebSocket──►  [FastAPI Backend (Uvicorn)]
[CV Pipeline]      ──────────────►        │              │
[ML Risk Engine]   ─────────────►   [MongoDB]     [WS Broadcast]
                                                         │
                                              ┌──────────┴──────────┐
                                      [React Web Dashboard]   [Android App]
                                       (3D God's Eye View)   (Kotlin/Compose)
`

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB 7+ (optional — falls back to in-memory store)

### One-Click Launch
`at
start_drishti.bat
`
This installs all dependencies and starts both servers.

### Manual Setup
`ash
# Backend
pip install -r backend/requirements.txt
python backend/run_drishti.py

# Frontend (new terminal)
cd frontend
npm install --legacy-peer-deps
npm run dev
`

**Dashboard**: http://localhost:5173  
**API Docs**: http://localhost:8000/docs  
**WebSocket**: ws://localhost:8000/socket.io

---

## Features

| Module | Description |
|--------|-------------|
| **3D God's Eye View** | Interactive WebGL scene of Maitri & Bharati with live status color-coding |
| **IoT Simulator** | Physics-based generator RPM, voltage, fuel, water, rations & blizzard simulation |
| **CCTV CV Pipeline** | OpenCV synthetic frames + YOLOv8 person/pallet/smoke detection |
| **AI Risk Engine** | RandomForest (blizzard), LogisticRegression (fuel), GradientBoosting (pipe freeze) |
| **Live Dashboard** | Recharts telemetry trends, subsystem status grid, AI risk gauges |
| **Android App** | Kotlin/Compose with SceneView 3D + same WebSocket stream |

---

## Stations Monitored

| Parameter | Maitri | Bharati |
|-----------|--------|---------|
| Location | Queen Maud Land | Larsemann Hills |
| Summer Crew | 70 | 70 |
| Winter Crew | 25 | 25 |
| Special System | Met Mast | RO Plant |
| Coordinates | 70.8°S, 11.7°E | 69.4°S, 76.2°E |

---

## Project Structure

`
med-waste-system/ (renamed → drishti/)
├── backend/
│   ├── drishti/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI app + WebSocket hub
│   │   ├── db.py            # MongoDB async client + in-memory fallback
│   │   ├── iot_simulator.py # AntarcticStationSimulator
│   │   ├── cv_pipeline.py   # OpenCV + YOLOv8 CCTV pipeline
│   │   └── risk_engine.py   # ML predictive risk models
│   ├── requirements.txt
│   └── run_drishti.py
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── components/
│       │   ├── GodsEyeView.jsx   # Three.js 3D scene
│       │   ├── Dashboard.jsx     # Telemetry + charts
│       │   ├── InfoPanel.jsx     # Telemetry sidebar
│       │   └── RiskPanel.jsx     # AI risk gauges
│       └── hooks/
│           └── useTelemetry.js   # Socket.io hook
├── mobile/
│   └── README.md                 # Android Kotlin/Compose specs
└── start_drishti.bat             # One-click launcher
`

---

## SIH 2026 Submission Details

- **PS ID**: PS-26060
- **Domain**: Software / Smart Automation
- **Sponsor**: Ministry of Earth Sciences (MoES)
- **Deadline**: September 30, 2026
- **Team**: Project Drishti
