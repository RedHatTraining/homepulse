import json
import time
from pathlib import Path
from typing import Any

_DATA_FILE = Path(__file__).resolve().parent / "fake_seed_data.json"
_cache: list[dict[str, Any]] | None = None


def _load() -> list[dict[str, Any]]:
    global _cache
    if _cache is None:
        with open(_DATA_FILE) as f:
            _cache = json.load(f)
    return _cache


def current_entry() -> dict[str, Any]:
    data = _load()
    if not data:
        return {}
    idx = int(time.time() / 60) % len(data)
    return dict(data[idx])
