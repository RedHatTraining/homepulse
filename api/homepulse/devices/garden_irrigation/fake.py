from homepulse.devices._appliance_base import FakeAppliance

device = FakeAppliance(
    name="Garden Irrigation",
    location="Garden",
    power_w=50,
    initially_off=True,
    simulation="jitter",
    jitter_frac=0.1,
)
