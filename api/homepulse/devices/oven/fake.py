from homepulse.devices._appliance_base import FakeAppliance

device = FakeAppliance(
    name="Oven",
    location="Kitchen",
    power_w=2500,
    standby_w=5,
    initially_off=True,
    simulation="cycle",
    cycle_on_ratio=0.6,
    cycle_idle_w=100,
    cycle_period_s=18,
)
