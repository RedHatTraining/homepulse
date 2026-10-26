# HomePulse

Example smart-home monitoring application for Red Hat Training courses and lessons.

## Architecture

```
api/                        FastAPI backend (Python 3.12+, uv)
  homepulse/
    main.py                 App entry point, route definitions
    alerts.py               Rule-based alert engine
    energy_metrics.py       Energy flow computation (solar/battery/grid routing)
    status.py               HomeStatus dataclass
    devices/                Appliance modules (DI pattern, fake implementations)
    scenarios/              Scenario abstraction (simulated + real stub)
    utility_services/       External supplies (electricity grid, water supply)
  tests/                    API integration tests
  tests/unit/               Unit tests for scenarios
frontend/                   React 19 + PatternFly 6 + Vite
database/                   schema.sql (unused — the API is 100% in-memory)
```

The API simulates a home with solar panels, a battery, grid connection, water supply, and 12 household appliances. No database, no external services.

## Run locally

Start the API and frontend in two terminals:

```bash
# Terminal 1 — API (port 8000)
cd api
uv sync
uv run fastapi dev main.py

# Terminal 2 — Frontend (port 5174, proxies /api to :8000)
cd frontend
npm ci
npm run dev
```

Open http://localhost:5174 in your browser.

## Run backend tests

From the `api/` directory:

```bash
uv run pytest              # run all tests
uv run pytest tests/unit   # run only unit tests
uv run pytest tests/test_api.py # run only the API tests
```

## Run backend Python linter

From the same `api/` directory:

```bash
uv run ruff check
```

## Run frontend tests and linter

From the `frontend/` directory:

```bash
npm test             # run all tests once (Vitest)
npm run test:watch   # re-run tests on file changes
npm run lint         # run ESLint
npm run lint:fix     # run ESLint and apply automatic fixes
```

## Container build

For the backend API:

```bash
cd api
podman build -t homepulse-api -f Containerfile .
podman run -p 8000:8000 homepulse-api
```

For the frontend:

```bash
cd frontend
podman build -t homepulse-frontend -f Containerfile .
podman run -p 5174:5174 homepulse-frontend
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/home/status` | Home status including sensors, energy flow, and alerts |
| GET | `/api/devices` | List all appliance devices |
| GET | `/api/devices/{id}` | Get a single device |
| PUT | `/api/devices/{id}` | Toggle device status (on/off) |
| GET | `/api/alerts` | Active alerts |
| PATCH | `/api/alerts/{id}` | Acknowledge an alert |

## Scenarios

The `HOMEPULSE_SCENARIO` environment variable selects which simulation runs (defaults to `realistic`):

| Scenario | Description |
|----------|-------------|
| `realistic` | Replays a 48-entry seed data cycle with jitter |
| `severe_weather` | Cold/rainy/snowy, no solar, high grid carbon |
| `full_solar` | Sunny, warm, peak solar output, battery near full |

Each scenario owns its devices, readings, and device adjustments (e.g. heat pump power scales with temperature, water appliances sync with water events).

## Device architecture

Each appliance lives in `api/homepulse/devices/<device_name>/` with a `fake.py` module providing simulated behavior, loaded via `importlib` at startup.

All devices use simulated implementations because this is a training app with no real hardware. In a production system, each device directory would contain connector modules for specific hardware.

### Appliance devices

smart_fridge, led_lights, smart_tv, workstation_pc, heat_pump, microwave, oven, tumble_dryer, ev_charger, washing_machine, dishwasher, garden_irrigation — use the shared `FakeAppliance` base with jitter/cycle/vary simulation modes.

### Infrastructure sensors

solar_panel, battery, rain_tank, weather_station — classes like `FakeSolarPanel` with a `get_reading()` method. These are used by the simulated scenarios to produce coherent environmental readings.

## Roadmap

- [ ] **Database** — Add a small database with CRUD operations to add, delete, and edit devices instead of the current in-memory list (`database/schema.sql` is a placeholder for this).
