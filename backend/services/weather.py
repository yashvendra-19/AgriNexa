import requests


OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


def get_weather(latitude: float, longitude: float) -> dict:
    response = requests.get(
        OPEN_METEO_URL,
        params={
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,precipitation,rain,weather_code",
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum",
            "timezone": "auto",
            "forecast_days": 3,
        },
        timeout=10,
    )
    response.raise_for_status()
    return response.json()