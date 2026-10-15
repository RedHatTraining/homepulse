BASE_POWER_W = 2200


def adjust_for_temperature(device, temp_c: float) -> None:
    if temp_c < 20:
        factor = 1 + (20 - temp_c) / 10
        device.nominal_w = round(BASE_POWER_W * min(factor, 2.5))
    else:
        device.nominal_w = round(BASE_POWER_W * 0.36)
