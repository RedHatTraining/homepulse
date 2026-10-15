from homepulse.devices._seed import current_entry


def get_reading() -> dict:
    entry = current_entry()
    return {"grid_carbon_gco2": entry.get("grid_carbon_gco2", 0)}
