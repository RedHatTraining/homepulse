from homepulse.devices._appliance_base import FakeAppliance

device = FakeAppliance(
    name="Dishwasher",
    location="Kitchen",
    power_w=1800,
    standby_w=2,
    water_lpm=6.5,
    initially_off=True,
    simulation="vary",
    vary_min_frac=0.5,
    vary_max_frac=1.0,
    vary_period_s=12,
)
