from homepulse.scenarios.base import Scenario
from homepulse.scenarios.simulated import (
    SimulatedFullSolarScenario,
    SimulatedRealisticScenario,
    SimulatedSevereWeatherScenario,
)

SCENARIOS: dict[str, type[Scenario]] = {
    "realistic": SimulatedRealisticScenario,
    "severe_weather": SimulatedSevereWeatherScenario,
    "full_solar": SimulatedFullSolarScenario,
}


def get_scenario(name: str) -> Scenario:
    scenario_cls = SCENARIOS.get(name, SimulatedRealisticScenario)
    return scenario_cls()
