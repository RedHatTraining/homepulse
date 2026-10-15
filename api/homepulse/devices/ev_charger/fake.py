from homepulse.devices._appliance_base import FakeAppliance

device = FakeAppliance(
    name="EV Charger",
    location="Garage",
    power_w=7400,
    standby_w=2,
    initially_off=True,
    simulation="jitter",
    jitter_frac=0.05,
)
