from dataclasses import asdict, dataclass, field


@dataclass
class HomeStatus:
    # Sensor readings
    solar_kw: float = 0.0
    battery_pct: int = 0
    water_rain_lpm: float = 0.0
    rain_tank_pct: int = 0
    weather: str = "clear"
    temp_c: float = 20.0

    # External supplies
    grid_carbon_gco2: float = 0.0
    water_main_lpm: float = 0.0
    water_event: str | None = None

    # Computed energy metrics
    home_kw: float = 0.0
    solar_to_home: float = 0.0
    solar_to_battery: float = 0.0
    battery_to_home: float = 0.0
    grid_to_home: float = 0.0
    clean_pct: int = 100
    home_carbon_gco2: float = 0.0

    # Alerts
    alerts: list[dict] = field(default_factory=list)

    def _apply(self, data: dict) -> None:
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)

    def set_energy_metrics(self, metrics: dict) -> None:
        self._apply(metrics)

    def set_alerts(self, alerts: list[dict]) -> None:
        self.alerts = alerts

    def to_dict(self) -> dict:
        return asdict(self)
