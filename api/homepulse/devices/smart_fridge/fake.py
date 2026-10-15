from homepulse.devices._appliance_base import FakeAppliance

device = FakeAppliance(
    name="Smart Fridge",
    location="Kitchen",
    power_w=180,
    simulation="cycle",
    cycle_on_ratio=0.3,
    cycle_idle_w=15,
    cycle_period_s=10,
)
