from homepulse.devices._appliance_base import FakeAppliance

device = FakeAppliance(
    name="Microwave",
    location="Kitchen",
    power_w=1200,
    standby_w=3,
    initially_off=True,
    simulation="jitter",
    jitter_frac=0.02,
)
