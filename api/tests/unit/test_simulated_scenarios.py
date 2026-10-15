import pytest

from homepulse.devices.heat_pump import BASE_POWER_W
from homepulse.scenarios.simulated import (
    SimulatedFullSolarScenario,
    SimulatedRealisticScenario,
    SimulatedSevereWeatherScenario,
)


class TestRealisticScenario:
    @pytest.fixture(autouse=True)
    def load_scenario(self):
        self.scenario = SimulatedRealisticScenario()
        self.scenario.load_devices()

    def test_read_returns_home_status(self):
        status = self.scenario.read()
        assert status.weather in (
            "clear",
            "sunny",
            "cloudy",
            "partly_cloudy",
            "overcast",
            "rainy",
            "snowy",
        )
        assert -10 <= status.temp_c <= 50
        assert 0 <= status.battery_pct <= 100

    def test_solar_is_non_negative(self):
        status = self.scenario.read()
        assert status.solar_kw >= 0

    def test_water_fields_present(self):
        status = self.scenario.read()
        assert status.water_main_lpm >= 0
        assert status.water_rain_lpm >= 0
        assert 0 <= status.rain_tank_pct <= 100

    def test_devices_are_loaded(self):
        assert len(self.scenario.devices) > 0
        for d in self.scenario.devices.values():
            state = d.get_state()
            assert "id" in state
            assert "name" in state

    def test_battery_tracks_charge(self):
        initial = self.scenario.read().battery_pct
        updated = self.scenario.update_battery(2.0, 0.0)
        assert updated >= initial

    def test_battery_tracks_discharge(self):
        initial = self.scenario.read().battery_pct
        updated = self.scenario.update_battery(0.0, 2.0)
        assert updated <= initial


class TestSevereWeatherScenario:
    @pytest.fixture(autouse=True)
    def load_scenario(self):
        self.scenario = SimulatedSevereWeatherScenario()
        self.scenario.load_devices()

    def test_weather_matches_temperature(self):
        for _ in range(10):
            status = self.scenario.read()
            if status.temp_c < 0:
                assert status.weather == "snowy"
            else:
                assert status.weather == "rainy"

    def test_no_solar(self):
        for _ in range(10):
            status = self.scenario.read()
            assert status.solar_kw == 0.0

    def test_cold_temperatures(self):
        for _ in range(10):
            status = self.scenario.read()
            assert status.temp_c <= 3.0

    def test_high_rain_tank(self):
        for _ in range(10):
            status = self.scenario.read()
            assert status.rain_tank_pct >= 85

    def test_high_carbon_grid(self):
        for _ in range(10):
            status = self.scenario.read()
            assert status.grid_carbon_gco2 >= 250

    def test_heat_pump_boosted_for_cold(self):
        status = self.scenario.read()
        assert status.temp_c < 20
        heat_pump = next(
            d for d in self.scenario.devices.values() if d.name == "Heat Pump"
        )
        assert heat_pump.nominal_w > BASE_POWER_W

    def test_low_initial_battery(self):
        status = self.scenario.read()
        assert status.battery_pct <= 15


class TestFullSolarScenario:
    @pytest.fixture(autouse=True)
    def load_scenario(self):
        self.scenario = SimulatedFullSolarScenario()
        self.scenario.load_devices()

    def test_always_sunny(self):
        for _ in range(10):
            status = self.scenario.read()
            assert status.weather == "sunny"

    def test_high_solar_output(self):
        for _ in range(10):
            status = self.scenario.read()
            assert status.solar_kw >= 3.5

    def test_warm_temperatures(self):
        for _ in range(10):
            status = self.scenario.read()
            assert 18.0 <= status.temp_c <= 24.0

    def test_no_rain(self):
        status = self.scenario.read()
        assert status.water_rain_lpm == 0.0

    def test_high_initial_battery(self):
        status = self.scenario.read()
        assert status.battery_pct >= 90

    def test_heat_pump_adjusted_for_temperature(self):
        status = self.scenario.read()
        heat_pump = next(
            d for d in self.scenario.devices.values() if d.name == "Heat Pump"
        )
        if status.temp_c >= 20:
            assert heat_pump.nominal_w == round(BASE_POWER_W * 0.36)
        else:
            assert heat_pump.nominal_w > BASE_POWER_W
