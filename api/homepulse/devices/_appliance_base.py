"""Shared base for fake appliance devices."""

from __future__ import annotations

import random
import time
from typing import Any
from uuid import uuid4


class FakeAppliance:
    """Appliance that simulates power draw using one of three modes.

    Simulation modes
    ----------------
    jitter  – Steady draw with small random noise each reading.
              Power = nominal ± jitter_frac (e.g. 0.05 → ±5 %).
              Good for always-on loads like routers or chargers.

    cycle   – Alternates between full power and an idle level in
              fixed time slots of ``cycle_period_s`` seconds.  Each
              slot is "on" with probability ``cycle_on_ratio``.
              Good for compressor-driven appliances (fridge, heat pump).

    vary    – Picks a random fraction between ``vary_min_frac`` and
              ``vary_max_frac`` of nominal power, changing every
              ``vary_period_s`` seconds.  Good for variable loads
              like a washing machine or dimmable lights.
    """

    def __init__(
        self,
        *,
        name: str,
        location: str,
        power_w: int,
        initially_off: bool = False,
        standby_w: int = 0,
        water_lpm: float = 0,
        simulation: str = "jitter",
        jitter_frac: float = 0.05,
        cycle_on_ratio: float = 0.7,
        cycle_idle_w: int = 0,
        cycle_period_s: int = 15,
        vary_min_frac: float = 0.3,
        vary_max_frac: float = 1.0,
        vary_period_s: int = 15,
    ):
        self.id = str(uuid4())[:8]
        self.name = name
        self.location = location
        self.nominal_w = power_w
        self.power_w = power_w
        self.standby_w = standby_w
        self.water_lpm = water_lpm
        self.status = "off" if initially_off else "on"
        self.activity = ""

        self._simulation = simulation
        self._jitter_frac = jitter_frac
        self._cycle_on_ratio = cycle_on_ratio
        self._cycle_idle_w = cycle_idle_w
        self._cycle_period_s = cycle_period_s
        self._vary_min_frac = vary_min_frac
        self._vary_max_frac = vary_max_frac
        self._vary_period_s = vary_period_s

    def _live_power(self) -> int:
        t = time.time()
        nominal = self.nominal_w

        if self._simulation == "jitter":
            return round(
                nominal * (1 + random.uniform(-self._jitter_frac, self._jitter_frac))
            )

        if self._simulation == "cycle":
            slot = int(t / self._cycle_period_s)
            on = (hash((self.name, slot)) % 100) / 100 < self._cycle_on_ratio
            return nominal if on else self._cycle_idle_w

        if self._simulation == "vary":
            slot = int(t / self._vary_period_s)
            rng = random.Random(hash((self.name, slot)))
            factor = rng.uniform(self._vary_min_frac, self._vary_max_frac)
            return round(nominal * factor)

        return nominal

    def get_state(self) -> dict[str, Any]:
        state: dict[str, Any] = {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "nominal_w": self.nominal_w,
            "status": self.status,
            "activity": self.activity,
        }
        if self.status == "on":
            self.power_w = self._live_power()
            state["power_w"] = self.power_w
        else:
            state["power_w"] = 0
        if self.standby_w:
            state["standby_w"] = self.standby_w
        if self.water_lpm:
            state["water_lpm"] = self.water_lpm
        return state

    def set_status(self, status: str) -> None:
        self.status = status
        if status == "off":
            self.activity = ""
