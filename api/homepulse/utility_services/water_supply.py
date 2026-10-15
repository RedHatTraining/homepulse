import importlib
import random

from homepulse.devices import WATER_APPLIANCES
from homepulse.devices._seed import current_entry

_event_to_device: dict[str, str] = {}


def register_devices() -> None:
    for mod_name in WATER_APPLIANCES:
        pkg = importlib.import_module(f"homepulse.devices.{mod_name}")
        fake = importlib.import_module(f"homepulse.devices.{mod_name}.fake")
        device_name = fake.device.name
        for event_name in pkg.WATER_EVENT_NAMES:
            _event_to_device[event_name] = device_name


def get_reading() -> dict:
    entry = current_entry()
    lpm = entry.get("water_main_lpm", 0.0)
    jitter = random.uniform(-0.02, 0.02)
    return {
        "water_main_lpm": round(max(0, lpm * (1 + jitter)), 1),
        "water_event": entry.get("water_event"),
    }


def sync_devices(water_event: str | None, devices: dict) -> None:
    active_device = _event_to_device.get(water_event) if water_event else None
    for d in devices.values():
        if d.name in _event_to_device.values():
            if d.name == active_device:
                d.set_status("on")
                d.activity = "Running"
            else:
                d.set_status("off")
