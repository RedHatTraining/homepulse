from __future__ import annotations

import importlib
from typing import Any, Protocol


class SensorDevice(Protocol):
    name: str

    def get_reading(self) -> dict[str, Any]: ...


class ApplianceDevice(Protocol):
    id: str
    name: str
    location: str

    def get_state(self) -> dict[str, Any]: ...

    def set_status(self, status: str) -> None: ...


APPLIANCES = [
    "smart_fridge",
    "led_lights",
    "smart_tv",
    "workstation_pc",
    "heat_pump",
    "microwave",
    "oven",
    "tumble_dryer",
    "ev_charger",
    "washing_machine",
    "dishwasher",
    "garden_irrigation",
]

WATER_APPLIANCES = ["dishwasher", "washing_machine", "garden_irrigation"]


def load_fake_devices() -> dict[str, Any]:
    devices: dict[str, Any] = {}
    for name in APPLIANCES:
        mod = importlib.import_module(f"homepulse.devices.{name}.fake")
        devices[mod.device.id] = mod.device
    return devices
