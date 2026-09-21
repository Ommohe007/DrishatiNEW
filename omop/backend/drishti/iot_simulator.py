"""
iot_simulator.py — Physics-based IoT Subsystem Simulator for Project Drishti.

Models real-time telemetry for Antarctic research stations (Maitri & Bharati).
Each tick() call represents 1 simulated minute (driven by a 5-second real-time loop).

SIH 2026 PS-26060 | Ministry of Earth Sciences
"""

import asyncio
import logging
import random
from datetime import datetime, timezone

import numpy as np

logger = logging.getLogger("drishti.iot_simulator")


class AntarcticStationSimulator:
    """
    Physics-inspired state machine that simulates all major subsystems of an
    Antarctic research station: electricity generation, fuel logistics, water
    supply, rations, and environmental conditions.

    Parameters
    ----------
    station_name : str
        Human-readable station identifier, e.g. ``"maitri"`` or ``"bharati"``.
    """

    # ------------------------------------------------------------------
    # Construction & state initialisation
    # ------------------------------------------------------------------

    def __init__(self, station_name: str) -> None:
        self.station_name: str = station_name.lower()

        # ── Electricity ───────────────────────────────────────────────
        self.generator_rpm: float = 1500.0
        self.voltage_phase_a: float = 230.0
        self.voltage_phase_b: float = 230.0
        self.voltage_phase_c: float = 230.0
        self.load_kw: float = 45.0
        self.fuel_burn_rate_lph: float = 12.0

        # ── Fuel logistics ────────────────────────────────────────────
        self.diesel_tank_liters: float = 50_000.0
        self.diesel_capacity: float = 50_000.0
        self.trace_heat_temp_c: float = -5.0

        # ── Water & rations ───────────────────────────────────────────
        self.water_tank_liters: float = 20_000.0
        self.water_capacity: float = 20_000.0
        self.water_pump_active: bool = True
        self.ro_plant_active: bool = True          # Bharati only
        self.ration_days_left: float = 90.0

        # ── Environment ───────────────────────────────────────────────
        self.outside_temp_c: float = -25.0
        self.wind_speed_ms: float = 15.0
        self.visibility_m: float = 5_000.0
        self.blizzard_active: bool = False

        # ── Internal ──────────────────────────────────────────────────
        self.occupancy: int = 25
        self.tick_count: int = 0

    # ------------------------------------------------------------------
    # Simulation step
    # ------------------------------------------------------------------

    def tick(self) -> None:
        """
        Advance the simulator by one simulated minute (5 real-seconds).

        All state mutations happen here; no I/O is performed.
        """

        # 1. Fuel consumption — 12 L/hr → 0.2 L per simulated minute
        self.diesel_tank_liters -= self.fuel_burn_rate_lph / 60.0
        self.diesel_tank_liters = max(0.0, self.diesel_tank_liters)

        # 2. Water consumption — 80 L/person/day, spread over 1440 min/day
        daily_water_use = self.occupancy * 80.0          # litres / day
        self.water_tank_liters -= daily_water_use / 1440.0
        self.water_tank_liters = max(0.0, self.water_tank_liters)

        # 3. Rations — one tick is 1/1440 of a person-day
        self.ration_days_left -= 1.0 / (self.occupancy * 1440.0)
        self.ration_days_left = max(0.0, self.ration_days_left)

        # 4. Mechanical Governor maintains 1500 RPM with ±2 RPM jitter
        self.generator_rpm += (1500.0 - self.generator_rpm) * 0.12 + random.gauss(0, 1.8)
        self.generator_rpm = max(1_400.0, min(1_600.0, self.generator_rpm))

        # Automatic Voltage Regulator (AVR) maintains 230V balanced across 3 phases
        self.voltage_phase_a += (230.0 - self.voltage_phase_a) * 0.15 + random.gauss(0, 0.7)
        self.voltage_phase_b += (230.0 - self.voltage_phase_b) * 0.15 + random.gauss(0, 0.7)
        self.voltage_phase_c += (230.0 - self.voltage_phase_c) * 0.15 + random.gauss(0, 0.7)

        # Keep voltages in a physically plausible range
        for attr in ("voltage_phase_a", "voltage_phase_b", "voltage_phase_c"):
            setattr(self, attr, max(195.0, min(265.0, getattr(self, attr))))

        # 5. Load drift ±0.5 kW per tick, clipped to [35, 65]
        self.load_kw += (48.0 - self.load_kw) * 0.05 + random.uniform(-0.6, 0.6)
        self.load_kw = max(30.0, min(80.0, self.load_kw))

        # 6. Trace-heat pipeline temperature maintains -4°C with active thermal element
        self.trace_heat_temp_c += (-4.0 - self.trace_heat_temp_c) * 0.1 + random.gauss(0, 0.2)
        self.trace_heat_temp_c = max(-20.0, min(10.0, self.trace_heat_temp_c))

        # 7. Blizzard toggle: storms last 15-35 ticks, clear spells last 40-100 ticks
        if self.tick_count % 40 == 0:
            if not self.blizzard_active and random.random() < 0.20:
                self.blizzard_active = True
            elif self.blizzard_active and random.random() < 0.35:
                self.blizzard_active = False

        # 8. Environmental dynamics
        if self.blizzard_active:
            # Blizzard storm regime: -30°C to -38°C, winds 26-42 m/s, visibility 150-500m
            target_temp = -34.0
            target_vis = 300.0
            target_wind = 32.0
        else:
            # Antarctic coastal baseline: -24°C, winds 12-18 m/s, visibility 4500-5000m
            target_temp = -24.0
            target_vis = 4800.0
            target_wind = 14.0

        self.outside_temp_c += (target_temp - self.outside_temp_c) * 0.08 + random.gauss(0, 0.5)
        self.visibility_m += (target_vis - self.visibility_m) * 0.1 + random.gauss(0, 40)
        self.visibility_m = max(100.0, min(5000.0, self.visibility_m))

        self.wind_speed_ms += (target_wind - self.wind_speed_ms) * 0.1 + random.gauss(0, 1.2)
        self.wind_speed_ms = max(2.0, min(55.0, self.wind_speed_ms))

        # 10. Derived — time to empty (hours)
        self.time_to_empty_hrs = (
            self.diesel_tank_liters / self.fuel_burn_rate_lph
            if self.fuel_burn_rate_lph > 0
            else 0.0
        )

        # 11. Update burn rate (occupancy-dependent load)
        self.fuel_burn_rate_lph = 12.0 + (self.occupancy * 0.3)

        # 12. Advance tick counter
        self.tick_count += 1

    def inject_fault(self, fault_type: str) -> dict:
        """
        Inject an emergency scenario for drills or verification.
        """
        logger.warning("[%s] Injected fault scenario: %s", self.station_name, fault_type)
        if fault_type == "power_failure":
            self.voltage_phase_b = 204.0
            return {"fault": "power_failure", "status": "Phase B dropped to 204V (CRITICAL)"}
        elif fault_type == "blizzard_surge":
            self.blizzard_active = True
            self.wind_speed_ms = 38.5
            self.visibility_m = 180.0
            self.outside_temp_c = -36.5
            return {"fault": "blizzard_surge", "status": "Blizzard storm surge active (38.5 m/s)"}
        elif fault_type == "fuel_pipe_freeze":
            self.trace_heat_temp_c = -17.2
            return {"fault": "fuel_pipe_freeze", "status": "Trace heating dropped to -17.2°C (CRITICAL)"}
        elif fault_type == "water_pump_fail":
            self.water_pump_active = False
            return {"fault": "water_pump_fail", "status": "Water pump offline"}
        return {"fault": fault_type, "status": "Acknowledged"}

    # ------------------------------------------------------------------
    # Status classification
    # ------------------------------------------------------------------

    def get_status(self) -> dict[str, str]:
        """
        Return a per-subsystem status string: ``"CRITICAL"``, ``"WARNING"``,
        or ``"NORMAL"``.
        """
        voltages = [
            self.voltage_phase_a,
            self.voltage_phase_b,
            self.voltage_phase_c,
        ]
        diesel_pct = self.diesel_tank_liters / self.diesel_capacity
        water_pct = self.water_tank_liters / self.water_capacity

        # ── Electricity ───────────────────────────────────────────────
        if any(v < 210 or v > 250 for v in voltages):
            electricity_status = "CRITICAL"
        elif any(v < 220 or v > 240 for v in voltages):
            electricity_status = "WARNING"
        else:
            electricity_status = "NORMAL"

        # ── Fuel ─────────────────────────────────────────────────────
        if diesel_pct < 0.10 or self.trace_heat_temp_c < -15.0:
            fuel_status = "CRITICAL"
        elif diesel_pct < 0.25:
            fuel_status = "WARNING"
        else:
            fuel_status = "NORMAL"

        # ── Water ─────────────────────────────────────────────────────
        if water_pct < 0.05:
            water_status = "CRITICAL"
        else:
            water_status = "NORMAL"

        # ── Rations ───────────────────────────────────────────────────
        if self.ration_days_left < 7:
            ration_status = "CRITICAL"
        elif self.ration_days_left < 21:
            ration_status = "WARNING"
        else:
            ration_status = "NORMAL"

        return {
            "electricity": electricity_status,
            "fuel": fuel_status,
            "water": water_status,
            "rations": ration_status,
        }

    # ------------------------------------------------------------------
    # Telemetry payload
    # ------------------------------------------------------------------

    def get_payload(self) -> dict:
        """
        Build and return a structured telemetry dict suitable for
        JSON serialisation, Socket.IO broadcast, and MongoDB storage.
        """
        status = self.get_status()
        diesel_pct = round(
            (self.diesel_tank_liters / self.diesel_capacity) * 100, 2
        )
        water_pct = round(
            (self.water_tank_liters / self.water_capacity) * 100, 2
        )
        time_to_empty = round(
            self.diesel_tank_liters / self.fuel_burn_rate_lph
            if self.fuel_burn_rate_lph > 0
            else 0.0,
            2,
        )

        return {
            "station": self.station_name,
            "ts": datetime.now(timezone.utc).isoformat(),
            "electricity": {
                "rpm": round(self.generator_rpm, 1),
                "load_kw": round(self.load_kw, 2),
                "voltages": [
                    round(self.voltage_phase_a, 2),
                    round(self.voltage_phase_b, 2),
                    round(self.voltage_phase_c, 2),
                ],
                "status": status["electricity"],
            },
            "fuel": {
                "tank_liters": round(self.diesel_tank_liters, 2),
                "capacity": self.diesel_capacity,
                "pct": diesel_pct,
                "burn_rate_lph": round(self.fuel_burn_rate_lph, 2),
                "time_to_empty_hrs": time_to_empty,
                "trace_heat_temp_c": round(self.trace_heat_temp_c, 2),
                "status": status["fuel"],
            },
            "water": {
                "tank_liters": round(self.water_tank_liters, 2),
                "capacity": self.water_capacity,
                "pct": water_pct,
                "pump_active": self.water_pump_active,
                "status": status["water"],
            },
            "rations": {
                "days_left": round(self.ration_days_left, 2),
                "status": status["rations"],
            },
            "environment": {
                "temp_c": round(self.outside_temp_c, 2),
                "wind_ms": round(self.wind_speed_ms, 2),
                "visibility_m": round(self.visibility_m, 1),
                "blizzard": self.blizzard_active,
            },
        }


# ──────────────────────────────────────────────────────────────
# Background runner
# ──────────────────────────────────────────────────────────────


async def run_simulator(
    sim: AntarcticStationSimulator,
    db,
    sio,
    interval: int = 5,
) -> None:
    """
    Infinite coroutine that drives the simulator loop.

    Each iteration:
    1. Advance the physics model by one tick.
    2. Serialise the resulting state.
    3. Persist to the ``telemetry_logs`` collection.
    4. Broadcast the payload to all Socket.IO clients.
    5. Sleep for *interval* seconds (default = 5).

    Parameters
    ----------
    sim : AntarcticStationSimulator
        The station simulator instance to drive.
    db :
        Database interface (MotorDB or MockDB).
    sio :
        ``socketio.AsyncServer`` instance for real-time broadcasts.
    interval : int
        Real-time seconds between ticks (each tick = 1 simulated minute).
    """
    logger.info(
        "Starting IoT simulator for station '%s' (interval=%ds).",
        sim.station_name,
        interval,
    )
    while True:
        try:
            sim.tick()
            payload = sim.get_payload()

            # Persist to database
            from .db import insert_one  # local import to avoid circular dep
            await insert_one("telemetry_logs", payload)

            # Broadcast to all connected Socket.IO clients
            await sio.emit("telemetry", payload)

            logger.debug(
                "[%s] tick=%d fuel=%.1f%% water=%.1f%%",
                sim.station_name,
                sim.tick_count,
                payload["fuel"]["pct"],
                payload["water"]["pct"],
            )
        except Exception:
            logger.exception(
                "Error in IoT simulator loop for station '%s'.",
                sim.station_name,
            )

        await asyncio.sleep(interval)
