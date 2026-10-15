from homepulse.devices._appliance_base import FakeAppliance

device = FakeAppliance(
    name="Smart TV",
    location="Living Room",
    power_w=120,
    standby_w=2,
    simulation="vary",
    vary_min_frac=0.6,
    vary_max_frac=1.0,
    vary_period_s=20,
)
