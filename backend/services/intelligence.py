from pathlib import Path

import joblib
import pandas as pd

from services.ndvi import calculate_ndvi
from services.weather import get_weather


BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / "ml" / "rice_yield_model.pkl"


def get_agricultural_intelligence(
	latitude: float,
	longitude: float,
	state: str,
	district: str,
	year: int,
	season: str,
	area: float,
	previous_year_yield: float,
	rolling_3y_yield: float,
	previous_year_area: float,
) -> dict:
	if rolling_3y_yield == 0:
		raise ValueError("rolling_3y_yield must not be zero")

	model = joblib.load(MODEL_PATH)
	input_data = pd.DataFrame(
		[
			{
				"State_Name": state,
				"District_Name": district,
				"Crop_Year": year,
				"Season": season,
				"Area": area,
				"Previous_Year_Yield": previous_year_yield,
				"Rolling_3Y_Yield": rolling_3y_yield,
				"Previous_Year_Area": previous_year_area,
			}
		]
	)

	predicted_yield = float(model.predict(input_data)[0])
	weather = get_weather(latitude, longitude)
	ndvi = calculate_ndvi(latitude, longitude)

	current_weather = weather["current"]
	daily_weather = weather["daily"]

	return {
		"location": {
			"latitude": latitude,
			"longitude": longitude,
			"state": state,
			"district": district,
		},
		"predicted_yield": round(predicted_yield, 3),
		"rolling_3y_yield": rolling_3y_yield,
		"yield_gap_percent": round(
			((predicted_yield - rolling_3y_yield) / rolling_3y_yield) * 100,
			3,
		),
		"NDVI": ndvi["mean_ndvi"],
		"NDVI scene date": ndvi["scene_date"],
		"satellite cloud cover": ndvi["cloud_cover"],
		"current temperature": current_weather["temperature_2m"],
		"current precipitation": current_weather["precipitation"],
		"current humidity": current_weather["relative_humidity_2m"],
		"short-term rainfall": {
			"dates": daily_weather["time"],
			"precipitation_sum": daily_weather["precipitation_sum"],
			"rain_sum": daily_weather["rain_sum"],
		},
	}
