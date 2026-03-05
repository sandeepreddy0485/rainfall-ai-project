"""import requests
import datetime as dt
import pandas as pd
import logging
from cachetools import TTLCache, cached
from app.config import Settings

# load config
settings = Settings()
# basic module logger
logger = logging.getLogger("app.weather")

# simple in‑memory caches
_current_cache = TTLCache(maxsize=1000, ttl=1800)      # 30 minutes
_historical_cache = TTLCache(maxsize=1000, ttl=7200)   # 2 hours


@cached(cache=_current_cache)
def fetch_current_weather(lat: float, lon: float):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current_weather": True,
        "hourly": ["temperature_2m", "precipitation", "relativehumidity_2m"],
        # request sunrise and sunset so UI can display accurate times
        "daily": [
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "sunrise",
            "sunset",
        ],
        "forecast_days": 7,
        "timezone": "auto"
    }

    response = requests.get(url, params=params, timeout=settings.open_meteo_timeout)

    if response.status_code == 200:
        data = response.json()
        # in case API doesn't provide sunrise/sunset for some reason we keep fallback
        if "daily" in data and "sunrise" not in data["daily"]:
            data["daily"]["sunrise"] = ["06:00"]
        if "daily" in data and "sunset" not in data["daily"]:
            data["daily"]["sunset"] = ["18:00"]
        return data

    logger.warning(f"current weather call failed status={response.status_code}")
    return {"error": "Failed to fetch current weather"}


@cached(cache=_historical_cache)
def fetch_historical_weather(lat: float, lon: float, days: int = 180):
    end = dt.datetime.now()
    start = end - dt.timedelta(days=days)

    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start.strftime("%Y-%m-%d"),
        "end_date": end.strftime("%Y-%m-%d"),
        "daily": ["temperature_2m_max", "temperature_2m_min", "precipitation_sum"],
        "timezone": "auto"
    }

    response = requests.get(url, params=params, timeout=10)

    if response.status_code == 200:
        data = response.json()

        if "daily" in data:
            df = pd.DataFrame({
                "date": pd.to_datetime(data["daily"]["time"]),
                "temp_max": data["daily"]["temperature_2m_max"],
                "temp_min": data["daily"]["temperature_2m_min"],
                "precipitation": data["daily"]["precipitation_sum"]
            })

            df["temp_avg"] = (df["temp_max"] + df["temp_min"]) / 2
            return df

    return None
    """
import requests
import datetime as dt
import pandas as pd
import logging
from cachetools import TTLCache, cached
from app.config import Settings

# load config
settings = Settings()
logger = logging.getLogger("app.weather")

_current_cache = TTLCache(maxsize=1000, ttl=1800)
_historical_cache = TTLCache(maxsize=1000, ttl=7200)


@cached(cache=_current_cache)
def fetch_current_weather(lat: float, lon: float):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current_weather": True,
        "hourly": ["temperature_2m", "precipitation", "relativehumidity_2m"],
        "daily": ["temperature_2m_max", "temperature_2m_min", "precipitation_sum", "sunrise", "sunset"],
        "forecast_days": 7,
        "timezone": "auto"
    }

    try:
        response = requests.get(url, params=params, timeout=settings.open_meteo_timeout)
        logger.info(f"Open‑Meteo response status: {response.status_code}")
        if response.status_code != 200:
            logger.error(f"Open‑Meteo error body: {response.text[:500]}")
            return {"error": f"Failed to fetch current weather (HTTP {response.status_code})"}

        data = response.json()
        # ensure sunrise/sunset fields exist
        if "daily" in data:
            if "sunrise" not in data["daily"]:
                data["daily"]["sunrise"] = ["06:00"]
            if "sunset" not in data["daily"]:
                data["daily"]["sunset"] = ["18:00"]
        return data

    except requests.exceptions.Timeout:
        logger.error("Open‑Meteo request timed out")
        return {"error": "Weather service timeout"}
    except requests.exceptions.ConnectionError:
        logger.error("Open‑Meteo connection error")
        return {"error": "Cannot connect to weather service"}
    except Exception as e:
        logger.exception(f"Unexpected error in fetch_current_weather: {e}")
        return {"error": "Internal server error"}


# fetch_historical_weather remains the same...