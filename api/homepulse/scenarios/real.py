from typing import Any

from homepulse.scenarios.base import Scenario


class RealScenario(Scenario):
    def get_readings(self) -> dict[str, Any]:
        raise NotImplementedError("Real sensor integration not available")

    def update_battery(self, charge_kw: float, discharge_kw: float) -> int:
        raise NotImplementedError("Real sensor integration not available")
