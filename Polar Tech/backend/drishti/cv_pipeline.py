"""
cv_pipeline.py — CCTV Computer Vision Pipeline for Project Drishti.

Generates synthetic video frames and analyses them using either YOLO
(if available) or a deterministic mock detector.  Frames are encoded
as base-64 JPEG strings for transport over Socket.IO / REST.

SIH 2026 PS-26060 | Ministry of Earth Sciences
"""

import asyncio
import base64
import logging
import random
from datetime import datetime, timezone

import numpy as np

# Optional OpenCV import — degrade gracefully if headless build is unavailable
try:
    import cv2  # type: ignore

    _CV2_AVAILABLE = True
except ImportError:
    _CV2_AVAILABLE = False

logger = logging.getLogger("drishti.cv_pipeline")


# ──────────────────────────────────────────────────────────────
# Frame generator
# ──────────────────────────────────────────────────────────────


class VideoSimulator:
    """
    Generates synthetic 640 × 480 BGR frames that mimic a station
    interior camera feed.

    The synthesised scene contains:
    * A dark-grey background representing the station interior.
    * Stick-figure humans at random positions.
    * Yellow ``PALLET`` rectangles.
    * Optional white smoke blobs.
    """

    FRAME_W: int = 640
    FRAME_H: int = 480
    BG_COLOUR: tuple[int, int, int] = (45, 45, 45)   # dark grey BGR

    # ------------------------------------------------------------------

    def generate_frame(
        self,
        occupancy_hint: int = 3,
        include_smoke: bool = False,
        pallet_count: int = 2,
    ) -> np.ndarray:
        """
        Render a synthetic BGR frame.

        Parameters
        ----------
        occupancy_hint : int
            Number of stick figures to draw.
        include_smoke : bool
            Whether to superimpose smoke blobs.
        pallet_count : int
            Number of pallet rectangles to draw.

        Returns
        -------
        np.ndarray
            640 × 480 uint8 BGR image.
        """
        frame = np.full(
            (self.FRAME_H, self.FRAME_W, 3),
            self.BG_COLOUR,
            dtype=np.uint8,
        )

        if not _CV2_AVAILABLE:
            # Pure-numpy fallback: return a plain dark frame
            return frame

        # ── Floor line ────────────────────────────────────────────────
        cv2.line(frame, (0, 380), (self.FRAME_W, 380), (80, 80, 80), 2)

        # ── Stick figures ─────────────────────────────────────────────
        rng = random.Random()
        for i in range(occupancy_hint):
            cx = rng.randint(60, 580)
            # Head
            cv2.circle(frame, (cx, 160), 15, (200, 180, 160), -1)
            # Torso
            cv2.line(frame, (cx, 175), (cx, 290), (180, 180, 180), 2)
            # Arms
            cv2.line(frame, (cx - 25, 220), (cx + 25, 220), (180, 180, 180), 2)
            # Legs
            cv2.line(frame, (cx, 290), (cx - 20, 360), (180, 180, 180), 2)
            cv2.line(frame, (cx, 290), (cx + 20, 360), (180, 180, 180), 2)

        # ── Pallets ───────────────────────────────────────────────────
        for i in range(pallet_count):
            px = 80 + i * 130
            py = 310
            cv2.rectangle(frame, (px, py), (px + 90, py + 60), (0, 200, 200), 2)
            if _CV2_AVAILABLE:
                cv2.putText(
                    frame, "PALLET",
                    (px + 5, py + 35),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                    (0, 200, 200), 1,
                )

        # ── Smoke blobs ───────────────────────────────────────────────
        if include_smoke:
            for _ in range(3):
                sx = rng.randint(200, 440)
                sy = rng.randint(80, 180)
                axes = (rng.randint(30, 70), rng.randint(20, 45))
                colour = (
                    rng.randint(180, 230),
                    rng.randint(180, 230),
                    rng.randint(180, 230),
                )
                cv2.ellipse(frame, (sx, sy), axes, 0, 0, 360, colour, -1)
            cv2.putText(
                frame, "SMOKE DETECTED",
                (220, 70),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6,
                (0, 0, 255), 2,
            )

        # ── Timestamp overlay ─────────────────────────────────────────
        ts_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        cv2.putText(
            frame, ts_str,
            (10, 20),
            cv2.FONT_HERSHEY_SIMPLEX, 0.4,
            (160, 160, 160), 1,
        )

        return frame


# ──────────────────────────────────────────────────────────────
# CV Pipeline
# ──────────────────────────────────────────────────────────────


class CVPipeline:
    """
    Analyses synthetic camera frames and produces structured detection
    reports including an annotated base-64 JPEG.

    YOLOv8n is loaded lazily; if it is unavailable the pipeline falls
    back to a deterministic mock detector that reads metadata directly.
    """

    def __init__(self) -> None:
        self.video_sim: VideoSimulator = VideoSimulator()
        self.model = None  # lazy-loaded
        self._load_model()

    # ------------------------------------------------------------------
    # Model loading
    # ------------------------------------------------------------------

    def _load_model(self) -> None:
        """Attempt to load YOLOv8n; swallow all errors if unavailable."""
        try:
            from ultralytics import YOLO  # type: ignore

            self.model = YOLO("yolov8n.pt")
            logger.info("YOLOv8n loaded successfully.")
        except Exception as exc:
            logger.warning("YOLO unavailable (%s). Using mock detector.", exc)
            self.model = None

    # ------------------------------------------------------------------
    # Frame analysis
    # ------------------------------------------------------------------

    def analyze_frame(self, frame: np.ndarray, metadata: dict) -> dict:
        """
        Annotate *frame* with bounding boxes and return a detection
        report including a base-64 JPEG of the annotated frame.

        Because synthetic frames contain no real-world texture, YOLO
        detections are unreliable.  Instead we use the caller-supplied
        *metadata* as ground truth and draw deterministic mock boxes.

        Parameters
        ----------
        frame : np.ndarray
            Raw BGR frame from ``VideoSimulator.generate_frame()``.
        metadata : dict
            Keys: ``occupancy_hint``, ``include_smoke``, ``pallet_count``.

        Returns
        -------
        dict
            Keys: ``occupancy``, ``hazards``, ``pallet_count``,
            ``frame_b64`` (str | None).
        """
        occupancy: int = int(metadata.get("occupancy_hint", 3))
        include_smoke: bool = bool(metadata.get("include_smoke", False))
        pallet_count: int = int(metadata.get("pallet_count", 2))

        annotated = frame.copy()
        hazards: list[str] = []

        if _CV2_AVAILABLE:
            # ── Person bounding boxes (mock) ──────────────────────────
            for i in range(occupancy):
                x1 = int(50 + i * 80) % 580
                cv2.rectangle(
                    annotated, (x1, 100), (x1 + 40, 200), (0, 255, 0), 2
                )
                cv2.putText(
                    annotated, f"person 0.92",
                    (x1, 95),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.4,
                    (0, 255, 0), 1,
                )

            # ── Pallet bounding boxes (mock) ──────────────────────────
            for i in range(pallet_count):
                x1 = int(100 + i * 120) % 500
                cv2.rectangle(
                    annotated, (x1, 300), (x1 + 80, 380), (0, 255, 255), 2
                )
                cv2.putText(
                    annotated, "pallet 0.85",
                    (x1, 295),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.4,
                    (0, 255, 255), 1,
                )

            # ── Smoke annotation ──────────────────────────────────────
            if include_smoke:
                cv2.ellipse(
                    annotated, (320, 150), (60, 40), 0, 0, 360,
                    (200, 200, 200), -1,
                )
                cv2.putText(
                    annotated, "smoke 0.91",
                    (270, 120),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                    (0, 0, 255), 2,
                )
                hazards.append("smoke")

            # ── Encode to base-64 JPEG ────────────────────────────────
            ok, buf = cv2.imencode(
                ".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 70]
            )
            frame_b64: str | None = (
                base64.b64encode(buf.tobytes()).decode("utf-8") if ok else None
            )
        else:
            # OpenCV not available — return minimal payload
            if include_smoke:
                hazards.append("smoke")
            frame_b64 = None

        return {
            "occupancy": occupancy,
            "hazards": hazards,
            "pallet_count": pallet_count,
            "frame_b64": frame_b64,
        }


# ──────────────────────────────────────────────────────────────
# Background runner
# ──────────────────────────────────────────────────────────────


async def run_cv_pipeline(
    pipeline: CVPipeline,
    station_name: str,
    db,
    sio,
    interval: int = 2,
) -> None:
    """
    Infinite coroutine that drives the CV inference loop.

    Each iteration:
    1. Randomise scene parameters.
    2. Generate a synthetic frame.
    3. Run analysis (mock detector with bounding-box overlay).
    4. Persist the event to ``cctv_events``.
    5. Broadcast via Socket.IO channel ``cctv_metrics``.
    6. Sleep for *interval* seconds (default = 2).

    Parameters
    ----------
    pipeline : CVPipeline
        Pre-initialised pipeline instance.
    station_name : str
        Station identifier, e.g. ``"maitri"``.
    db :
        Database interface.
    sio :
        ``socketio.AsyncServer`` instance.
    interval : int
        Seconds between analysis cycles.
    """
    logger.info(
        "Starting CV pipeline for station '%s' (interval=%ds).",
        station_name,
        interval,
    )

    while True:
        try:
            # ── Scene parameters ──────────────────────────────────────
            occupancy_hint = random.randint(3, 8)
            include_smoke = random.random() < 0.05   # 5 % probability
            pallet_count = random.randint(2, 6)

            metadata = {
                "occupancy_hint": occupancy_hint,
                "include_smoke": include_smoke,
                "pallet_count": pallet_count,
            }

            # ── Generate & analyse ────────────────────────────────────
            frame = pipeline.video_sim.generate_frame(
                occupancy_hint=occupancy_hint,
                include_smoke=include_smoke,
                pallet_count=pallet_count,
            )
            result = pipeline.analyze_frame(frame, metadata)

            # ── Build transport payload ───────────────────────────────
            payload = {
                "station": station_name.lower(),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "occupancy": result["occupancy"],
                "hazards": result["hazards"],
                "pallet_count": result["pallet_count"],
                "frame_b64": result["frame_b64"],
            }

            # ── Persist & broadcast ───────────────────────────────────
            from .db import insert_one  # local import to avoid circular dep

            await insert_one("cctv_events", payload)
            await sio.emit("cctv_metrics", payload)

            logger.debug(
                "[%s] occupancy=%d hazards=%s pallets=%d",
                station_name,
                result["occupancy"],
                result["hazards"],
                result["pallet_count"],
            )

        except Exception:
            logger.exception(
                "Error in CV pipeline loop for station '%s'.", station_name
            )

        await asyncio.sleep(interval)
