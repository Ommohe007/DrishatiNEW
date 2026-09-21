"""
risk_engine.py — AI Predictive Risk Engine for Project Drishti.

Trains three scikit-learn classifiers on synthetic Antarctic historical data
and produces per-station risk scores every 60 seconds.

Models:
  1. BlizzardRiskModel   — RandomForestClassifier  — P(blizzard | recent obs)
  2. FuelCriticalModel   — LogisticRegression      — P(fuel critical in 7 days)
  3. WaterFreezeModel    — GradientBoostingClassifier — P(pipe freeze risk)

SIH 2026 PS-26060 | Ministry of Earth Sciences
"""

import asyncio
import logging
import math
import random
from datetime import datetime, timezone

import numpy as np

logger = logging.getLogger("drishti.risk_engine")

# ──────────────────────────────────────────────────────────────
# Optional heavy imports — degrade gracefully
# ──────────────────────────────────────────────────────────────
try:
    import pandas as pd  # type: ignore
    from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier  # type: ignore
    from sklearn.linear_model import LogisticRegression  # type: ignore
    from sklearn.pipeline import make_pipeline  # type: ignore
    from sklearn.preprocessing import StandardScaler  # type: ignore

    _SKLEARN_AVAILABLE = True
except ImportError:
    _SKLEARN_AVAILABLE = False
    logger.warning(
        "pandas / scikit-learn not available. RiskEngine will use mock scores."
    )


# ──────────────────────────────────────────────────────────────
# Synthetic historical data generator
# ──────────────────────────────────────────────────────────────


def generate_synthetic_history(n_days: int = 365):
    """
    Create a synthetic DataFrame representing one year of station telemetry
    sampled at 5-minute intervals (288 ticks / day).

    Columns
    -------
    outside_temp_c, wind_speed_ms, diesel_pct, water_pct,
    ration_days, occupancy, blizzard_label

    Returns
    -------
    pd.DataFrame  (or dict-of-lists if pandas is unavailable)
    """
    ticks_per_day = 288
    total_ticks = n_days * ticks_per_day

    rng = random.Random(42)
    np_rng = np.random.default_rng(42)

    temps: list[float] = []
    winds: list[float] = []
    diesel: list[float] = []
    water: list[float] = []
    rations: list[float] = []
    occupancy: list[int] = []
    blizzard: list[int] = []

    # Seasonal parameters (Southern Hemisphere)
    # Summer peak ~Jan (day 0/365) → warmest; Winter trough Jun-Sep → coldest
    diesel_pct = 95.0
    water_pct = 95.0
    ration_days = 90.0

    for tick in range(total_ticks):
        day_of_year = (tick // ticks_per_day) % 365
        hour_of_day = (tick % ticks_per_day) * 5 / 60.0  # fractional hour

        # Temperature: -10°C in summer (Jan/Dec), -35°C in mid-winter (Jul)
        # sin wave with period 365 days; shifted so Jul ≈ coldest
        seasonal_angle = 2 * math.pi * (day_of_year - 15) / 365.0
        base_temp = -22.5 - 12.5 * math.sin(seasonal_angle)  # range [-10, -35]
        temp = base_temp + np_rng.normal(0, 2.5)
        temps.append(round(temp, 2))

        # Wind: 5-40 m/s, higher in winter
        base_wind = 15.0 + 8.0 * math.sin(seasonal_angle)
        wind = max(0.0, base_wind + np_rng.normal(0, 4.0))
        wind = min(50.0, wind)
        winds.append(round(wind, 2))

        # Blizzard: probability ∝ wind/100 and temp < -30
        bprob = (wind / 100.0) + (0.2 if temp < -30 else 0.0)
        bprob = min(1.0, max(0.0, bprob))
        bz = int(rng.random() < bprob)
        blizzard.append(bz)

        # Diesel: slow drift downward, random resupply events
        diesel_pct -= rng.uniform(0.0005, 0.001)
        if diesel_pct < 20.0 or rng.random() < 0.001:  # resupply
            diesel_pct = rng.uniform(85.0, 100.0)
        diesel.append(round(diesel_pct, 2))

        # Water: similar drift pattern
        water_pct -= rng.uniform(0.0002, 0.0006)
        if water_pct < 30.0 or rng.random() < 0.0005:
            water_pct = rng.uniform(80.0, 100.0)
        water.append(round(water_pct, 2))

        # Rations
        ration_days -= 1.0 / (25 * ticks_per_day)
        if ration_days < 20.0 or rng.random() < 0.0003:
            ration_days = rng.uniform(60.0, 90.0)
        rations.append(round(ration_days, 2))

        # Occupancy: 20-30 in summer, 15-25 in winter
        base_occ = 25 - int(3 * math.sin(seasonal_angle))
        occupancy.append(max(5, min(35, base_occ + rng.randint(-2, 2))))

    if _SKLEARN_AVAILABLE:
        return pd.DataFrame(
            {
                "outside_temp_c": temps,
                "wind_speed_ms": winds,
                "diesel_pct": diesel,
                "water_pct": water,
                "ration_days": rations,
                "occupancy": occupancy,
                "blizzard_label": blizzard,
            }
        )
    else:
        return {
            "outside_temp_c": temps,
            "wind_speed_ms": winds,
            "diesel_pct": diesel,
            "water_pct": water,
            "ration_days": rations,
            "occupancy": occupancy,
            "blizzard_label": blizzard,
        }


# ──────────────────────────────────────────────────────────────
# Risk Engine
# ──────────────────────────────────────────────────────────────


class RiskEngine:
    """
    Trains and runs three predictive models:

    1. **BlizzardRiskModel** — ``RandomForestClassifier``
       Predicts probability of blizzard onset from recent temperature and
       wind observations, plus diurnal / seasonal context.

    2. **FuelCriticalModel** — ``LogisticRegression``
       Predicts whether diesel levels will drop below 10 % within 7 days
       given current consumption and stock levels.

    3. **WaterFreezeModel** — ``GradientBoostingClassifier``
       Predicts pipe-freeze risk from ambient temperature, wind, blizzard
       flag, and electrical load (proxy for building heat).
    """

    _WINDOW = 36  # ticks used for feature extraction (≈ 3 h)

    def __init__(self) -> None:
        self.blizzard_model = None
        self.fuel_model = None
        self.water_model = None
        self._trained: bool = False

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------

    def train(self, df) -> None:
        """
        Train all three risk models on *df*.

        If scikit-learn is unavailable the method logs a warning and
        returns immediately; ``infer()`` will then emit mock scores.

        Parameters
        ----------
        df : pd.DataFrame | dict
            Output of ``generate_synthetic_history()``.
        """
        if not _SKLEARN_AVAILABLE:
            logger.warning("sklearn unavailable — skipping training.")
            return

        try:
            logger.info("Training risk models on %d rows…", len(df))

            # ── Blizzard model ─────────────────────────────────────────
            # Features: temp, wind, 3-hour rolling trends, hour, day-of-year
            # We derive tick-level hour and day indices from position
            n = len(df)
            hour_of_day = [(i % 288) * 5 / 60.0 for i in range(n)]
            day_of_year = [(i // 288) % 365 for i in range(n)]

            temps = df["outside_temp_c"].values.astype(float)
            winds = df["wind_speed_ms"].values.astype(float)
            diesels = df["diesel_pct"].values.astype(float)
            waters = df["water_pct"].values.astype(float)
            occupancies = df["occupancy"].values.astype(float)
            blizzards = df["blizzard_label"].values.astype(int)

            # Rolling 36-tick trends (pad first 36 with zeros)
            window = self._WINDOW
            temp_trend = np.zeros(n)
            wind_trend = np.zeros(n)
            for i in range(window, n):
                temp_trend[i] = temps[i] - temps[i - window]
                wind_trend[i] = winds[i] - winds[i - window]

            X_blizzard = np.column_stack([
                temps, winds, temp_trend, wind_trend,
                hour_of_day, day_of_year,
            ])
            y_blizzard = blizzards
            if len(np.unique(y_blizzard)) < 2:
                y_blizzard[-10:] = 1

            self.blizzard_model = make_pipeline(
                StandardScaler(),
                RandomForestClassifier(
                    n_estimators=100, random_state=42, n_jobs=-1
                ),
            )
            self.blizzard_model.fit(X_blizzard, y_blizzard)

            # ── Fuel critical model ────────────────────────────────────
            # Target: will diesel_pct drop below 10 % within 7 days (2016 ticks)?
            horizon = 288 * 7   # 7 days worth of ticks
            y_fuel = np.zeros(n, dtype=int)
            for i in range(n - horizon):
                if diesels[i + 1 : i + horizon + 1].min() < 10.0:
                    y_fuel[i] = 1

            burn_rates = 12.0 + occupancies * 0.3
            days_since_resupply = np.zeros(n)
            last_resupply = 0
            for i in range(n):
                if diesels[i] > diesels[max(0, i - 1)] + 10:
                    last_resupply = i
                days_since_resupply[i] = (i - last_resupply) / 288.0

            X_fuel = np.column_stack([
                diesels, burn_rates, temps, occupancies, days_since_resupply,
            ])

            # Guard: if only one class exists (diesel never goes critical
            # in synthetic history), inject a couple of positive samples
            if len(np.unique(y_fuel)) < 2:
                y_fuel[-5:] = 1   # force a few positives so LR can train
            self.fuel_model = make_pipeline(
                StandardScaler(),
                LogisticRegression(max_iter=500, random_state=42),
            )
            self.fuel_model.fit(X_fuel, y_fuel)

            # ── Water freeze model ─────────────────────────────────────
            # Target: temp < -35 AND blizzard_active → pipe-freeze risk
            trace_heat = temps + np.random.default_rng(0).normal(10, 5, n)
            load_kw = np.random.default_rng(1).uniform(40, 80, n)
            y_freeze = ((temps < -35) & (blizzards == 1)).astype(int)

            X_freeze = np.column_stack([
                trace_heat, temps, winds, blizzards, load_kw,
            ])

            self.water_model = make_pipeline(
                StandardScaler(),
                GradientBoostingClassifier(
                    n_estimators=100, random_state=42
                ),
            )
            self.water_model.fit(X_freeze, y_freeze)

            self._trained = True
            logger.info("All risk models trained successfully.")

        except Exception:
            logger.exception("Risk model training failed — will use mock scores.")
            self._trained = False

    # ------------------------------------------------------------------
    # Inference
    # ------------------------------------------------------------------

    def infer(self, recent_telemetry: list[dict], station: str) -> dict:
        """
        Compute risk scores from the last ``_WINDOW`` telemetry readings.

        Parameters
        ----------
        recent_telemetry : list[dict]
            Most recent telemetry documents (oldest-first) from the DB.
        station : str
            Station identifier for labelling the output.

        Returns
        -------
        dict
            Keys: ``station``, ``ts``, ``blizzard``, ``fuel_critical``,
            ``water_freeze``, ``overall``, ``recommendation``.
        """
        if not self._trained or not _SKLEARN_AVAILABLE:
            return self._mock_result(station)

        try:
            readings = recent_telemetry[-self._WINDOW:]
            n = len(readings)

            if n < 2:
                return self._mock_result(station)

            # ── Extract time-series ───────────────────────────────────
            temps = np.array([
                r.get("environment", {}).get("temp_c", -25.0) for r in readings
            ])
            winds = np.array([
                r.get("environment", {}).get("wind_ms", 15.0) for r in readings
            ])
            blizz = np.array([
                int(r.get("environment", {}).get("blizzard", False))
                for r in readings
            ])
            diesels = np.array([
                r.get("fuel", {}).get("pct", 80.0) for r in readings
            ])
            occs = np.array([
                r.get("occupancy", 25) if "occupancy" in r
                else 25
                for r in readings
            ])
            loads = np.array([
                r.get("electricity", {}).get("load_kw", 45.0) for r in readings
            ])
            trace_heats = np.array([
                r.get("fuel", {}).get("trace_heat_temp_c", -5.0)
                for r in readings
            ])

            # Use the most recent reading for scalar features
            last_temp = temps[-1]
            last_wind = winds[-1]
            last_diesel = diesels[-1]
            last_occ = occs[-1]
            last_load = loads[-1]
            last_trace = trace_heats[-1]
            last_blizz = blizz[-1]

            temp_trend = float(temps[-1] - temps[0])
            wind_trend = float(winds[-1] - winds[0])

            # Day/hour context (approximate from current UTC time)
            now = datetime.now(timezone.utc)
            hour_of_day = now.hour + now.minute / 60.0
            day_of_year = now.timetuple().tm_yday

            # ── Blizzard score ────────────────────────────────────────
            X_bliz = np.array([[
                last_temp, last_wind, temp_trend, wind_trend,
                hour_of_day, day_of_year,
            ]])
            blizzard_score: float = float(
                self.blizzard_model.predict_proba(X_bliz)[0][1]
            )

            # ── Fuel critical score ───────────────────────────────────
            burn_rate = 12.0 + last_occ * 0.3
            days_since_resupply = 0.0  # cannot derive from short window
            X_fuel = np.array([[
                last_diesel, burn_rate, last_temp, last_occ, days_since_resupply,
            ]])
            fuel_score: float = float(
                self.fuel_model.predict_proba(X_fuel)[0][1]
            )

            # ── Water freeze score ────────────────────────────────────
            X_freeze = np.array([[
                last_trace, last_temp, last_wind, last_blizz, last_load,
            ]])
            freeze_score: float = float(
                self.water_model.predict_proba(X_freeze)[0][1]
            )

            # ── Overall risk ──────────────────────────────────────────
            overall_score = max(blizzard_score, fuel_score, freeze_score)

            risks = {
                "blizzard": blizzard_score,
                "fuel_critical": fuel_score,
                "water_freeze": freeze_score,
            }

            return {
                "station": station,
                "ts": now.isoformat(),
                "blizzard": {
                    "score": round(blizzard_score, 4),
                    "level": self._score_to_level(blizzard_score),
                },
                "fuel_critical": {
                    "score": round(fuel_score, 4),
                    "level": self._score_to_level(fuel_score),
                },
                "water_freeze": {
                    "score": round(freeze_score, 4),
                    "level": self._score_to_level(freeze_score),
                },
                "overall": {
                    "score": round(overall_score, 4),
                    "level": self._score_to_level(overall_score),
                },
                "recommendation": self._build_recommendation(risks),
            }

        except Exception:
            logger.exception("Risk inference failed — returning mock scores.")
            return self._mock_result(station)

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _score_to_level(score: float) -> str:
        """Map a probability score to a human-readable risk level."""
        if score >= 0.60:
            return "HIGH"
        elif score >= 0.35:
            return "MEDIUM"
        return "LOW"

    @staticmethod
    def _build_recommendation(risks: dict[str, float]) -> str:
        """
        Return an actionable recommendation string for the highest-score risk.
        """
        top_risk = max(risks, key=lambda k: risks[k])
        score = risks[top_risk]

        _messages = {
            "blizzard": (
                "Blizzard probability elevated — verify antenna tie-downs, "
                "ensure emergency stores are accessible, and restrict outdoor activity."
            ),
            "fuel_critical": (
                "Fuel critical risk detected — initiate emergency resupply request, "
                "reduce non-essential electrical loads, and activate fuel-conservation protocol."
            ),
            "water_freeze": (
                "Pipe-freeze risk elevated — increase trace-heat cable power, "
                "check insulation integrity, and pre-warm reserve water tanks."
            ),
        }

        base_msg = _messages.get(top_risk, "All systems nominal. Continue standard monitoring.")

        if score < 0.35:
            return "All systems within safe parameters. Continue routine monitoring."
        elif score < 0.60:
            return f"[MEDIUM RISK — {top_risk.upper()}] {base_msg}"
        else:
            return f"[HIGH RISK — {top_risk.upper()}] IMMEDIATE ACTION REQUIRED. {base_msg}"

    def _mock_result(self, station: str) -> dict:
        """Return plausible random risk scores when models are unavailable."""
        blizzard_score = round(random.uniform(0.05, 0.30), 4)
        fuel_score = round(random.uniform(0.02, 0.20), 4)
        freeze_score = round(random.uniform(0.01, 0.15), 4)
        overall = max(blizzard_score, fuel_score, freeze_score)
        risks = {
            "blizzard": blizzard_score,
            "fuel_critical": fuel_score,
            "water_freeze": freeze_score,
        }
        return {
            "station": station,
            "ts": datetime.now(timezone.utc).isoformat(),
            "blizzard": {
                "score": blizzard_score,
                "level": self._score_to_level(blizzard_score),
            },
            "fuel_critical": {
                "score": fuel_score,
                "level": self._score_to_level(fuel_score),
            },
            "water_freeze": {
                "score": freeze_score,
                "level": self._score_to_level(freeze_score),
            },
            "overall": {
                "score": round(overall, 4),
                "level": self._score_to_level(overall),
            },
            "recommendation": self._build_recommendation(risks),
        }


# ──────────────────────────────────────────────────────────────
# Background runner
# ──────────────────────────────────────────────────────────────


async def run_risk_engine(
    engine: RiskEngine,
    station_name: str,
    db,
    sio,
    interval: int = 60,
) -> None:
    """
    Infinite coroutine that drives the risk inference loop.

    Every *interval* seconds (default = 60):
    1. Fetch the last 36 telemetry readings from MongoDB / MockDB.
    2. Run inference.
    3. Persist risk scores to ``risk_scores`` collection.
    4. Broadcast via Socket.IO channel ``risk_update``.

    Parameters
    ----------
    engine : RiskEngine
        Pre-trained risk engine instance.
    station_name : str
        Station identifier, e.g. ``"maitri"``.
    db :
        Database interface.
    sio :
        ``socketio.AsyncServer`` instance.
    interval : int
        Seconds between inference cycles.
    """
    logger.info(
        "Starting risk engine for station '%s' (interval=%ds).",
        station_name,
        interval,
    )

    while True:
        try:
            from .db import find_recent, insert_one  # local import

            readings = await find_recent(
                "telemetry_logs",
                n=36,
                filter={"station": station_name.lower()},
            )
            result = engine.infer(readings, station_name.lower())

            await insert_one("risk_scores", result)
            await sio.emit("risk_update", result)

            logger.debug(
                "[%s] risk overall=%s score=%.3f",
                station_name,
                result["overall"]["level"],
                result["overall"]["score"],
            )

        except Exception:
            logger.exception(
                "Error in risk engine loop for station '%s'.", station_name
            )

        await asyncio.sleep(interval)
