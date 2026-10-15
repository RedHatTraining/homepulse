from __future__ import annotations

import random
import time
from typing import Any

from homepulse.devices import heat_pump, load_fake_devices
from homepulse.devices._seed import current_entry
from homepulse.devices.battery.fake import CAPACITY_KWH, FakeBattery
from homepulse.scenarios.base import Scenario
from homepulse.status import HomeStatus
from homepulse.utility_services import water_supply

WATER_DEVICE_NAMES = ["Dishwasher", "Washing Machine", "Garden irrigation"]


def _random_water_event() -> str | None:
    if random.random() < 0.5:
        return None
    return random.choice(WATER_DEVICE_NAMES)


class _SimulatedBase(Scenario):
    def load_devices(self) -> None:
        self.devices = load_fake_devices()
        water_supply.register_devices()

    def _get_readings(self) -> dict[str, Any]:
        raise NotImplementedError

    def read(self) -> HomeStatus:
        status = HomeStatus()
        status._apply(self._get_readings())
        water_supply.sync_devices(status.water_event, self.devices)
        for d in self.devices.values():
            if d.name == "Heat Pump":
                heat_pump.adjust_for_temperature(d, status.temp_c)
        return status


class SimulatedRealisticScenario(_SimulatedBase):
    """Replays the 48-entry seed data cycle with small jitter."""

    def __init__(self):
        self._battery = FakeBattery()

    def _get_readings(self) -> dict[str, Any]:
        entry = current_entry()
        solar = entry.get("solar_kw", 0.0)
        jitter = random.uniform(-0.02, 0.02)
        water_lpm = entry.get("water_main_lpm", 0.0)

        self._battery.get_reading()
        return {
            "solar_kw": round(max(0, solar * (1 + jitter)), 2),
            "battery_pct": round(self._battery._pct),
            "weather": entry.get("weather", "clear"),
            "temp_c": entry.get("temp_c", 20.0),
            "water_rain_lpm": round(
                max(0, entry.get("water_rain_lpm", 0.0) * (1 + jitter)), 1
            ),
            "rain_tank_pct": entry.get("rain_tank_pct", 0),
            "grid_carbon_gco2": entry.get("grid_carbon_gco2", 0),
            "water_main_lpm": round(max(0, water_lpm * (1 + jitter)), 1),
            "water_event": entry.get("water_event"),
        }

    def update_battery(self, charge_kw: float, discharge_kw: float) -> int:
        self._battery.apply_flow(charge_kw, discharge_kw)
        return round(self._battery._pct)


class SimulatedSevereWeatherScenario(_SimulatedBase):
    """Rainy, cold, no solar — triggers storm, frost, and grid dependency alerts."""

    def __init__(self):
        self._pct = 15.0
        self._last_update = 0.0

    def _get_readings(self) -> dict[str, Any]:
        if self._last_update == 0.0:
            self._last_update = time.time()

        temp_c = round(random.uniform(-2.0, 3.0), 1)
        weather = "snowy" if temp_c < 0 else "rainy"

        return {
            "solar_kw": 0.0,
            "battery_pct": round(self._pct),
            "weather": weather,
            "temp_c": temp_c,
            "water_rain_lpm": round(random.uniform(5.0, 8.0), 1),
            "rain_tank_pct": random.randint(85, 98),
            "grid_carbon_gco2": random.randint(250, 320),
            "water_main_lpm": round(random.uniform(0.0, 2.0), 1),
            "water_event": _random_water_event(),
        }

    def update_battery(self, charge_kw: float, discharge_kw: float) -> int:
        now = time.time()
        dt_h = (now - self._last_update) / 3600
        self._last_update = now
        delta_kwh = (charge_kw - discharge_kw) * dt_h
        delta_pct = (delta_kwh / CAPACITY_KWH) * 100
        self._pct = max(0, min(100, self._pct + delta_pct))
        return round(self._pct)


class SimulatedFullSolarScenario(_SimulatedBase):
    """Sunny, warm, peak solar — triggers optimal solar alert, battery charges."""

    def __init__(self):
        self._pct = 90.0
        self._last_update = 0.0

    def _get_readings(self) -> dict[str, Any]:
        if self._last_update == 0.0:
            self._last_update = time.time()

        return {
            "solar_kw": round(random.uniform(3.5, 4.2), 2),
            "battery_pct": round(self._pct),
            "weather": "sunny",
            "temp_c": round(random.uniform(18.0, 24.0), 1),
            "water_rain_lpm": 0.0,
            "rain_tank_pct": random.randint(30, 50),
            "grid_carbon_gco2": random.randint(93, 150),
            "water_main_lpm": round(random.uniform(0.0, 3.0), 1),
            "water_event": _random_water_event(),
        }

    def update_battery(self, charge_kw: float, discharge_kw: float) -> int:
        now = time.time()
        dt_h = (now - self._last_update) / 3600
        self._last_update = now
        delta_kwh = (charge_kw - discharge_kw) * dt_h
        delta_pct = (delta_kwh / CAPACITY_KWH) * 100
        self._pct = max(0, min(100, self._pct + delta_pct))
        return round(self._pct)
