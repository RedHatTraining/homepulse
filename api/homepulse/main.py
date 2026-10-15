import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from homepulse import alerts, energy_metrics
from homepulse.scenarios import Scenario, get_scenario

scenario: Scenario


def startup():
    global scenario
    scenario_name = os.environ.get("HOMEPULSE_SCENARIO", "realistic")
    scenario = get_scenario(scenario_name)
    scenario.load_devices()


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    startup()
    yield


app = FastAPI(title="HomePulse API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Devices CRUD ---


@app.get("/api/devices")
def list_devices():
    return [d.get_state() for d in scenario.devices.values()]


@app.get("/api/devices/{device_id}")
def get_device(device_id: str):
    if device_id not in scenario.devices:
        raise HTTPException(404, "Device not found")
    return scenario.devices[device_id].get_state()


class DeviceUpdateBody(BaseModel):
    name: str | None = None
    location: str | None = None
    power_w: int | None = None
    status: str | None = None


@app.put("/api/devices/{device_id}")
def update_device(device_id: str, body: DeviceUpdateBody):
    if device_id not in scenario.devices:
        raise HTTPException(404, "Device not found")
    d = scenario.devices[device_id]
    if body.status is not None:
        d.set_status(body.status)
    return d.get_state()


# --- Home Status ---


@app.get("/api/home/status")
def get_home_status():
    if scenario is None:
        raise HTTPException(
            500,
            "HomePulse scenario not loaded. Check the HOMEPULSE_SCENARIO environment variable.",
        )

    status = scenario.read()

    metrics = energy_metrics.compute(status, scenario.devices, scenario)
    status.set_energy_metrics(metrics)

    active_alerts = alerts.evaluate(status, scenario.devices)
    status.set_alerts(active_alerts)

    return status.to_dict()


# --- Alerts ---


@app.get("/api/alerts")
def list_alerts():
    return alerts.list_all()


@app.patch("/api/alerts/{alert_id}")
def acknowledge_alert(alert_id: str):
    result = alerts.acknowledge(alert_id)
    if not result:
        raise HTTPException(404, "Alert not found")
    return result
