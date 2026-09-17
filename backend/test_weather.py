from pprint import pprint

from services.weather import get_weather


latitude = 14.6819
longitude = 77.6006

weather = get_weather(latitude, longitude)

print("===== WEATHER TEST =====")
print(f"Latitude: {latitude}")
print(f"Longitude: {longitude}")

print("\n===== CURRENT WEATHER =====")
pprint(weather["current"])

print("\n===== DAILY WEATHER =====")
pprint(weather["daily"])