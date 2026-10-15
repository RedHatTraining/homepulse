from homepulse.devices._appliance_base import FakeAppliance

device = FakeAppliance(
    name="Washing Machine",
    location="Laundry",
    power_w=500,
    standby_w=2,
    water_lpm=8.0,
    initially_off=True,
    simulation="vary",
    vary_min_frac=0.4,
    vary_max_frac=1.0,
    vary_period_s=12,
)
