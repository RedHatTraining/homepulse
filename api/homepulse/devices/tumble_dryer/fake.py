from homepulse.devices._appliance_base import FakeAppliance

device = FakeAppliance(
    name="Tumble Dryer",
    location="Laundry",
    power_w=2400,
    standby_w=1,
    initially_off=True,
    simulation="jitter",
    jitter_frac=0.05,
)
