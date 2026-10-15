from typing import Any

from homepulse.status import HomeStatus


class Scenario:
    devices: dict[str, Any]

    def load_devices(self) -> None:
        raise NotImplementedError

    def read(self) -> HomeStatus:
        raise NotImplementedError

    def update_battery(self, charge_kw: float, discharge_kw: float) -> int:
        raise NotImplementedError
