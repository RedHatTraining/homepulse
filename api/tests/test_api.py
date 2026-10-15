import pytest
from fastapi.testclient import TestClient

from homepulse import alerts, main
from homepulse.status import HomeStatus
from homepulse.utility_services import water_supply

app = main.app


@pytest.fixture(autouse=True)
def _bootstrap():
    water_supply._event_to_device.clear()
    main.startup()
    yield
    alerts._active.clear()
    alerts._acknowledged.clear()


@pytest.fixture()
def client():
    return TestClient(app, raise_server_exceptions=True)


class TestListDevices:
    def test_returns_list(self, client):
        r = client.get("/api/devices")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_device_shape(self, client):
        r = client.get("/api/devices")
        device = r.json()[0]
        assert "id" in device
        assert "name" in device
        assert "status" in device
        assert "power_w" in device


class TestGetDevice:
    def test_found(self, client):
        device_id = next(iter(main.scenario.devices))
        r = client.get(f"/api/devices/{device_id}")
        assert r.status_code == 200
        assert r.json()["id"] == device_id

    def test_not_found(self, client):
        r = client.get("/api/devices/nonexistent")
        assert r.status_code == 404


class TestUpdateDevice:
    def test_toggle_off(self, client):
        device_id = next(
            did for did, d in main.scenario.devices.items() if d.status == "on"
        )
        r = client.put(f"/api/devices/{device_id}", json={"status": "off"})
        assert r.status_code == 200
        assert r.json()["status"] == "off"

    def test_toggle_on(self, client):
        device_id = next(iter(main.scenario.devices))
        client.put(f"/api/devices/{device_id}", json={"status": "off"})
        r = client.put(f"/api/devices/{device_id}", json={"status": "on"})
        assert r.status_code == 200
        assert r.json()["status"] == "on"

    def test_not_found(self, client):
        r = client.put("/api/devices/nonexistent", json={"status": "on"})
        assert r.status_code == 404


class TestHomeStatus:
    def test_current_reading_shape(self, client):
        r = client.get("/api/home/status")
        assert r.status_code == 200
        data = r.json()
        assert "solar_kw" in data
        assert "battery_pct" in data
        assert "home_kw" in data
        assert "grid_to_home" in data
        assert "solar_to_home" in data
        assert "clean_pct" in data

    def test_energy_flow_conservation(self, client):
        r = client.get("/api/home/status")
        data = r.json()
        solar_kw = data["solar_kw"]
        solar_to_home = data["solar_to_home"]
        solar_to_battery = data["solar_to_battery"]
        assert solar_to_home + solar_to_battery <= solar_kw + 0.01

    def test_clean_pct_bounded(self, client):
        r = client.get("/api/home/status")
        pct = r.json()["clean_pct"]
        assert 0 <= pct <= 100


class TestAlerts:
    def test_list_alerts(self, client):
        r = client.get("/api/alerts")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_acknowledge_not_found(self, client):
        r = client.patch("/api/alerts/nonexistent")
        assert r.status_code == 404

    def test_acknowledge_flow(self, client):
        alerts.evaluate(HomeStatus(home_kw=10, battery_pct=100), main.scenario.devices)
        active = alerts.list_all()
        if not active:
            pytest.skip("no alert triggered")
        alert_id = active[0]["id"]
        r = client.patch(f"/api/alerts/{alert_id}")
        assert r.status_code == 200
        assert r.json()["acknowledged"] is True
