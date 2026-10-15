from typing import Any

from homepulse.scenarios import Scenario
from homepulse.status import HomeStatus


def compute(
    status: HomeStatus, devices: dict[str, Any], scenario: Scenario
) -> dict[str, Any]:
    home_w = 0
    for d in devices.values():
        state = d.get_state()
        if state["status"] == "on":
            home_w += state["power_w"]
        else:
            home_w += state.get("standby_w", 0)
    home = round(home_w / 1000, 2)

    solar = status.solar_kw
    battery_pct = status.battery_pct

    solar_to_home = round(min(solar, home), 2)
    solar_excess = round(max(0, solar - home), 2)
    solar_to_battery = solar_excess if battery_pct < 100 else 0

    home_deficit = round(max(0, home - solar), 2)
    battery_available = round(battery_pct / 100 * 5, 2)
    battery_to_home = (
        round(min(home_deficit, battery_available), 2) if battery_pct > 5 else 0
    )
    grid_to_home = round(max(0, home_deficit - battery_to_home), 2)

    battery_pct = scenario.update_battery(solar_to_battery, battery_to_home)

    if home > 0:
        clean_kw = solar_to_home + battery_to_home
        clean_pct = round(clean_kw / home * 100)
        home_carbon_gco2 = round(grid_to_home * status.grid_carbon_gco2 / home)
    else:
        clean_pct = 100
        home_carbon_gco2 = 0

    return {
        "home_kw": home,
        "solar_to_home": solar_to_home,
        "solar_to_battery": round(solar_to_battery, 2),
        "battery_to_home": battery_to_home,
        "grid_to_home": grid_to_home,
        "battery_pct": battery_pct,
        "clean_pct": clean_pct,
        "home_carbon_gco2": home_carbon_gco2,
    }
