from homepulse.devices._appliance_base import FakeAppliance

device = FakeAppliance(
    name="Heat Pump",
    location="Basement",
    power_w=2200,
    standby_w=10,
    simulation="cycle",
    cycle_on_ratio=0.7,
    cycle_idle_w=50,
    cycle_period_s=25,
)
