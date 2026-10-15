from homepulse.devices._appliance_base import FakeAppliance

device = FakeAppliance(
    name="LED Lights",
    location="Living Room",
    power_w=60,
    simulation="vary",
    vary_min_frac=0.3,
    vary_max_frac=1.0,
    vary_period_s=15,
)
