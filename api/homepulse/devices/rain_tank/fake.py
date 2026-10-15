"""Simulated rain tank — reads level and flow from seed data."""

import random
from typing import Any

from homepulse.devices._seed import current_entry


class FakeRainTank:
    name = "Rain Tank"

    def get_reading(self) -> dict[str, Any]:
        entry = current_entry()
        lpm = entry.get("water_rain_lpm", 0.0)
        jitter = random.uniform(-0.02, 0.02)
        return {
            "water_rain_lpm": round(max(0, lpm * (1 + jitter)), 1),
            "rain_tank_pct": entry.get("rain_tank_pct", 0),
        }
