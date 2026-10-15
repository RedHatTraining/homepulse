CREATE TABLE IF NOT EXISTS appliances (
    id VARCHAR(8) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    power_w INTEGER NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'off'
);

CREATE TABLE IF NOT EXISTS readings (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    solar_kw REAL NOT NULL,
    home_kw REAL NOT NULL,
    battery_kw REAL NOT NULL,
    battery_pct INTEGER NOT NULL,
    grid_kw REAL NOT NULL,
    water_main_lpm REAL NOT NULL,
    water_rain_lpm REAL NOT NULL,
    rain_tank_pct INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(8) PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    detail TEXT,
    recommendation TEXT,
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE
);
