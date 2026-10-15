"""Simulated home battery — tracks charge state dynamically."""

import time
from typing import Any

from homepulse.devices._seed import current_entry

CAPACITY_KWH = 13.5


class FakeBattery:
    name = "Battery"

    def __init__(self):
        self._pct: float | None = None
        self._last_update: float = 0

    def get_reading(self) -> dict[str, Any]:
        entry = current_entry()
        if self._pct is None:
            self._pct = float(entry.get("battery_pct", 50))
            self._last_update = time.time()
        return {"battery_pct": round(self._pct)}

    def apply_flow(self, charge_kw: float, discharge_kw: float) -> None:
        now = time.time()
        dt_h = (now - self._last_update) / 3600
        self._last_update = now
        if self._pct is None:
            return
        delta_kwh = (charge_kw - discharge_kw) * dt_h
        delta_pct = (delta_kwh / CAPACITY_KWH) * 100
        self._pct = max(0, min(100, self._pct + delta_pct))
