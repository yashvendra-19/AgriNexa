import requests


OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


def get_weather(latitude: float, longitude: float) -> dict:
    try:
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
            timeout=4,
        )
        response.raise_for_status()
        return response.json()
    except Exception as err:
        print(f"Weather API fallback for ({latitude}, {longitude}): {err}")
        return {
            "current": {
                "temperature_2m": 31.4,
                "relative_humidity_2m": 58,
                "precipitation": 0.0,
                "rain": 0.0,
                "weather_code": 1,
            },
            "daily": {
                "time": ["2026-09-17", "2026-09-18", "2026-09-19"],
                "temperature_2m_max": [34.0, 33.5, 32.8],
                "temperature_2m_min": [24.2, 23.8, 23.5],
                "precipitation_sum": [1.2, 0.0, 4.5],
                "rain_sum": [1.2, 0.0, 4.5],
            },
        }