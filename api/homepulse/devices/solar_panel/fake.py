"""Simulated solar panel — reads production from seed data."""

import random
from typing import Any

from homepulse.devices._seed import current_entry


class FakeSolarPanel:
    name = "Solar Panel"

    def get_reading(self) -> dict[str, Any]:
        entry = current_entry()
        kw = entry.get("solar_kw", 0.0)
        jitter = random.uniform(-0.02, 0.02)
        return {"solar_kw": round(max(0, kw * (1 + jitter)), 2)}
