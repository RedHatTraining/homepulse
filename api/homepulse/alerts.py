from uuid import uuid4

from homepulse.status import HomeStatus

RULES = [
    {
        "key": "high_consumption",
        "type": "energy",
        "title": "High consumption detected",
        "detail": "Home draw exceeded {value:.1f} kW.",
        "recommendation": "Consider turning off non-essential devices.",
        "check": lambda r, _: r.home_kw > 5,
        "value": lambda r, _: r.home_kw,
    },
    {
        "key": "rain_cistern_high",
        "type": "rain",
        "title": "Rain cistern at {value}% capacity",
        "detail": "Cistern nearly full after rainstorm.",
        "recommendation": "Switch washer water source to rainwater cistern.",
        "check": lambda r, _: r.rain_tank_pct > 85,
        "value": lambda r, _: r.rain_tank_pct,
    },
    {
        "key": "low_battery",
        "type": "energy",
        "title": "Battery level low ({value}%)",
        "detail": "Home battery has dropped below 10%.",
        "recommendation": "Reduce consumption or wait for solar to recharge.",
        "check": lambda r, _: r.battery_pct < 10,
        "value": lambda r, _: r.battery_pct,
    },
    {
        "key": "grid_dependency",
        "type": "energy",
        "title": "Running on grid power",
        "detail": "Grid is supplying {value:.2f} kW with no solar or battery contribution.",
        "recommendation": "Non-essential loads could be deferred until solar returns.",
        "check": lambda r, _: (
            r.grid_to_home > 0 and r.solar_to_home == 0 and r.battery_to_home == 0
        ),
        "value": lambda r, _: r.grid_to_home,
    },
    {
        "key": "water_flow_active",
        "type": "water",
        "title": "Continuous water flow: {value}",
        "detail": "Water is flowing through {value}.",
        "recommendation": "Verify the usage is intentional.",
        "check": lambda r, _: bool(r.water_event),
        "value": lambda r, _: r.water_event or "",
    },
    {
        "key": "heat_wave",
        "type": "weather",
        "title": "Heat wave warning ({value}°C)",
        "detail": "Temperature has exceeded 35°C.",
        "recommendation": "Close blinds and pre-cool the house while solar energy is available.",
        "check": lambda r, _: r.temp_c > 35,
        "value": lambda r, _: r.temp_c,
    },
    {
        "key": "frost_risk",
        "type": "weather",
        "title": "Frost risk ({value}°C)",
        "detail": "Temperature has dropped below 2°C.",
        "recommendation": "Keep heat pump running. Protect garden irrigation pipes from freezing.",
        "check": lambda r, _: r.temp_c < 2,
        "value": lambda r, _: r.temp_c,
    },
    {
        "key": "storm_warning",
        "type": "weather",
        "title": "Storm warning",
        "detail": "Severe weather detected ({value}). Expect no solar production.",
        "recommendation": "Close windows, secure outdoor equipment, and check rain tank overflow.",
        "check": lambda r, _: r.weather in ("rainy", "snowy"),
        "value": lambda r, _: r.weather,
    },
    {
        "key": "optimal_solar",
        "type": "energy",
        "title": "Optimal solar conditions",
        "detail": "Sunny skies at {value}°C — panels operating at peak efficiency.",
        "recommendation": "Good time to run high-draw devices (EV charger, washing machine, dishwasher).",
        "check": lambda r, _: r.weather == "sunny" and 15 <= r.temp_c <= 25,
        "value": lambda r, _: r.temp_c,
    },
]

_active: dict[str, dict] = {}
_acknowledged: dict[str, dict] = {}


def evaluate(reading: HomeStatus, devices: dict) -> list[dict]:
    triggered_keys = set()
    for rule in RULES:
        key = rule["key"]
        fires = rule["check"](reading, devices)
        if fires:
            triggered_keys.add(key)
            if key not in _active and key not in _acknowledged:
                value = rule["value"](reading, devices)
                aid = str(uuid4())[:8]
                _active[key] = {
                    "id": aid,
                    "type": rule["type"],
                    "title": rule["title"].format(value=value),
                    "detail": rule["detail"].format(value=value),
                    "recommendation": rule["recommendation"],
                    "acknowledged": False,
                }

    for key in list(_active):
        if key not in triggered_keys:
            del _active[key]
    for key in list(_acknowledged):
        if key not in triggered_keys:
            del _acknowledged[key]

    return list_all()


def list_all() -> list[dict]:
    return list(_active.values()) + list(_acknowledged.values())


def acknowledge(alert_id: str) -> dict | None:
    for key, alert in list(_active.items()):
        if alert["id"] == alert_id:
            alert["acknowledged"] = True
            _acknowledged[key] = _active.pop(key)
            return alert
    return None
