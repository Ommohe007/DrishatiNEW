"""
main.py — FastAPI application entry-point for Project Drishti.
         Antarctic Research Station Digital Twin — SIH 2026 PS-26060
         Ministry of Earth Sciences

Architecture
------------
* FastAPI  — REST API (JSON)
* Socket.IO (python-socketio AsyncServer) — real-time push to browser/app
* Asyncio background tasks — IoT sim, CV pipeline, risk engine per station
* MongoDB (Motor) — time-series storage, with MockDB fallback
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone

import socketio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .cv_pipeline import CVPipeline, run_cv_pipeline
from .db import find_recent, get_db, insert_one
from .iot_simulator import AntarcticStationSimulator, run_simulator
from .risk_engine import RiskEngine, generate_synthetic_history, run_risk_engine

# ──────────────────────────────────────────────────────────────
# Logging
# ──────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger("drishti.main")

# ──────────────────────────────────────────────────────────────
# Stations managed by this backend
STATIONS: list[str] = ["maitri", "bharati"]
station_simulators: dict[str, "AntarcticStationSimulator"] = {}
station_cv_pipelines: dict[str, "CVPipeline"] = {}

# ──────────────────────────────────────────────────────────────
# Socket.IO — async ASGI server
# ──────────────────────────────────────────────────────────────
sio = socketio.AsyncServer(
    cors_allowed_origins="*",
    async_mode="asgi",
    logger=False,
    engineio_logger=False,
)


@sio.event
async def connect(sid: str, environ: dict) -> None:
    logger.info("Socket.IO client connected: %s", sid)


@sio.event
async def disconnect(sid: str) -> None:
    logger.info("Socket.IO client disconnected: %s", sid)


@sio.event
async def trigger_drill(sid: str, data: dict) -> None:
    station = data.get("station", "bharati").lower()
    drill_id = data.get("drill_id", "")
    sim = station_simulators.get(station)
    if sim:
        sim.inject_fault(drill_id)
        payload = sim.get_payload()
        await sio.emit("telemetry", payload)
        logger.info("Broadcasted immediate fault telemetry for %s (%s)", station, drill_id)


# ──────────────────────────────────────────────────────────────
# WebSocket connection manager
# ──────────────────────────────────────────────────────────────


class ConnectionManager:
    """
    Tracks active WebSocket connections and provides a ``broadcast``
    helper that fans out a JSON-serialisable dict to all connected clients.
    """

    def __init__(self) -> None:
        self._active: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self._active.append(websocket)
        logger.debug("WS connected. Total: %d", len(self._active))

    def disconnect(self, websocket: WebSocket) -> None:
        self._active = [ws for ws in self._active if ws is not websocket]
        logger.debug("WS disconnected. Total: %d", len(self._active))

    async def broadcast(self, data: dict) -> None:
        """Send *data* to every connected WebSocket client (best-effort)."""
        dead: list[WebSocket] = []
        for ws in list(self._active):
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


ws_manager = ConnectionManager()

# ──────────────────────────────────────────────────────────────
# Background task registry (for graceful shutdown)
# ──────────────────────────────────────────────────────────────
_bg_tasks: list[asyncio.Task] = []


def _spawn(coro) -> asyncio.Task:
    """Create and register a persistent background asyncio Task."""
    task = asyncio.create_task(coro)
    _bg_tasks.append(task)
    return task


# ──────────────────────────────────────────────────────────────
# Application lifespan
# ──────────────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup / shutdown hook.

    Startup
    -------
    1. Initialise database connection (MongoDB or MockDB fallback).
    2. Instantiate simulators, CV pipelines, and risk engines per station.
    3. Train risk models on synthetic historical data.
    4. Launch all background coroutines.

    Shutdown
    --------
    Cancel all background tasks cleanly.
    """
    logger.info("═══ Project Drishti — startup ═══")

    # 1. Database
    db = await get_db()
    logger.info("Database backend: %s", type(db).__name__)

    # 2. Per-station components
    risk_engines: dict[str, RiskEngine] = {}

    for station in STATIONS:
        station_simulators[station] = AntarcticStationSimulator(station)
        station_cv_pipelines[station] = CVPipeline()
        risk_engines[station] = RiskEngine()

    # 3. Train risk models (runs in executor to avoid blocking the event loop)
    logger.info("Generating synthetic training data…")
    loop = asyncio.get_event_loop()
    history_df = await loop.run_in_executor(
        None, generate_synthetic_history, 365
    )
    for station in STATIONS:
        await loop.run_in_executor(None, risk_engines[station].train, history_df)

    # 4. Launch background tasks
    for station in STATIONS:
        _spawn(run_simulator(station_simulators[station], db, sio, interval=5))
        _spawn(run_cv_pipeline(station_cv_pipelines[station], station, db, sio, interval=2))
        _spawn(run_risk_engine(risk_engines[station], station, db, sio, interval=60))

    logger.info("All background tasks started for stations: %s", STATIONS)
    logger.info("═══ Project Drishti — ready ═══")

    yield  # Application runs here

    # ── Shutdown ──────────────────────────────────────────────
    logger.info("Cancelling background tasks…")
    for task in _bg_tasks:
        task.cancel()
    await asyncio.gather(*_bg_tasks, return_exceptions=True)
    logger.info("Project Drishti — shutdown complete.")


# ──────────────────────────────────────────────────────────────
# FastAPI application
# ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="Project Drishti",
    description=(
        "Antarctic Research Station Digital Twin — "
        "SIH 2026 PS-26060 | Ministry of Earth Sciences"
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS (permissive for development) ─────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount Socket.IO ASGI sub-application ──────────────────────
sio_app = socketio.ASGIApp(sio, other_asgi_app=app)


# ──────────────────────────────────────────────────────────────
# REST endpoints
# ──────────────────────────────────────────────────────────────


@app.get("/api/status", tags=["Health"])
async def get_status() -> JSONResponse:
    """
    Health-check endpoint.

    Returns
    -------
    JSON with server status, current UTC timestamp, and active station list.
    """
    return JSONResponse(
        content={
            "status": "ok",
            "ts": datetime.now(timezone.utc).isoformat(),
            "stations": STATIONS,
            "version": app.version,
        }
    )


@app.get("/api/telemetry/{station}", tags=["Telemetry"])
async def get_telemetry(station: str, n: int = 50) -> JSONResponse:
    """
    Retrieve the last *n* telemetry records for *station*.

    Parameters
    ----------
    station : str
        Station name, e.g. ``maitri`` or ``bharati``.
    n : int
        Number of records to return (default 50, max 500).
    """
    station = station.lower()
    if station not in STATIONS:
        return JSONResponse(
            status_code=404,
            content={"error": f"Unknown station '{station}'. Valid: {STATIONS}"},
        )
    n = min(n, 500)
    docs = await find_recent("telemetry_logs", n=n, filter={"station": station})
    return JSONResponse(content={"station": station, "count": len(docs), "data": docs})


@app.get("/api/risks/{station}", tags=["Risk"])
async def get_risks(station: str) -> JSONResponse:
    """
    Return the most recent risk assessment for *station*.

    Parameters
    ----------
    station : str
        Station name.
    """
    station = station.lower()
    if station not in STATIONS:
        return JSONResponse(
            status_code=404,
            content={"error": f"Unknown station '{station}'. Valid: {STATIONS}"},
        )
    docs = await find_recent("risk_scores", n=1, filter={"station": station})
    if not docs:
        return JSONResponse(
            content={"station": station, "message": "No risk scores yet."}
        )
    return JSONResponse(content=docs[-1])


@app.get("/api/cctv/{station}", tags=["CCTV"])
async def get_cctv_events(station: str, n: int = 10) -> JSONResponse:
    """
    Return the last *n* CCTV analysis events for *station*.

    The ``frame_b64`` field is stripped from responses to keep payload sizes
    manageable; retrieve individual frames via the Socket.IO ``cctv_metrics``
    channel for real-time streaming.

    Parameters
    ----------
    station : str
        Station name.
    n : int
        Number of records to return (default 10, max 100).
    """
    station = station.lower()
    if station not in STATIONS:
        return JSONResponse(
            status_code=404,
            content={"error": f"Unknown station '{station}'. Valid: {STATIONS}"},
        )
    n = min(n, 100)
    docs = await find_recent("cctv_events", n=n, filter={"station": station})
    # Strip large binary fields from REST response
    stripped = [
        {k: v for k, v in doc.items() if k != "frame_b64"} for doc in docs
    ]
    return JSONResponse(content={"station": station, "count": len(stripped), "data": stripped})


@app.post("/api/drill/{station}", tags=["Emergency"])
async def trigger_drill_endpoint(station: str, payload: dict) -> JSONResponse:
    """
    Inject an emergency drill fault into a station simulator and broadcast
    immediate telemetry to all connected clients.
    """
    station = station.lower()
    if station not in STATIONS:
        return JSONResponse(
            status_code=404,
            content={"error": f"Unknown station '{station}'. Valid: {STATIONS}"},
        )
    sim = station_simulators.get(station)
    if not sim:
        return JSONResponse(
            status_code=500,
            content={"error": "Simulator not initialised"},
        )
    drill_id = payload.get("drill_id", "")
    res = sim.inject_fault(drill_id)
    immediate_payload = sim.get_payload()
    from .db import insert_one
    await insert_one("telemetry_logs", immediate_payload)
    await sio.emit("telemetry", immediate_payload)
    return JSONResponse(
        content={
            "station": station,
            "drill_id": drill_id,
            "result": res,
            "telemetry": immediate_payload,
        }
    )


# ──────────────────────────────────────────────────────────────
# WebSocket endpoint
# ──────────────────────────────────────────────────────────────

_KEEPALIVE_INTERVAL = 30  # seconds


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    """
    Generic WebSocket endpoint.

    Clients that connect here will:
    * Receive a ``{"type": "connected", ...}`` welcome message.
    * Receive a ``{"type": "ping"}`` keepalive every 30 seconds.
    * Remain connected until they disconnect or the server shuts down.

    Real-time telemetry, CV metrics, and risk updates are pushed via
    Socket.IO (``/socket.io/`` path) rather than this endpoint.
    """
    await ws_manager.connect(websocket)
    try:
        await websocket.send_json(
            {
                "type": "connected",
                "ts": datetime.now(timezone.utc).isoformat(),
                "message": "Project Drishti WebSocket ready.",
                "stations": STATIONS,
            }
        )
        while True:
            # Keepalive ping — also allows detection of dead connections
            await asyncio.sleep(_KEEPALIVE_INTERVAL)
            await websocket.send_json(
                {
                    "type": "ping",
                    "ts": datetime.now(timezone.utc).isoformat(),
                }
            )
    except WebSocketDisconnect:
        logger.debug("WebSocket client disconnected cleanly.")
    except Exception as exc:
        logger.debug("WebSocket connection error: %s", exc)
    finally:
        ws_manager.disconnect(websocket)
