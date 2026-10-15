from homepulse.devices._appliance_base import FakeAppliance

device = FakeAppliance(
    name="Workstation PC",
    location="Office",
    power_w=450,
    standby_w=5,
    simulation="vary",
    vary_min_frac=0.3,
    vary_max_frac=1.0,
    vary_period_s=8,
)
