"""Simulated weather station — reads conditions from seed data."""

from typing import Any

from homepulse.devices._seed import current_entry


class FakeWeatherStation:
    name = "Weather Station"

    def get_reading(self) -> dict[str, Any]:
        entry = current_entry()
        return {
            "weather": entry.get("weather", "clear"),
            "temp_c": entry.get("temp_c", 20.0),
        }
