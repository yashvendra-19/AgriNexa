# AgriNexa

AgriNexa is an agricultural intelligence MVP for agricultural professionals. It combines historical agriculture data, a trained rice-yield model, live weather data, and Sentinel-2 NDVI context into a structured field analysis.

## Current Pipeline

```text
Professional
    -> Field / Region
    -> Predictive AI + Weather + Satellite NDVI
    -> Structured Agricultural Intelligence
```

Weather and NDVI are currently contextual signals. The rice-yield model was not trained with these variables, so the application does not claim that they caused a prediction.

## Project Structure

```text
AgriNexa/
|-- backend/
|   |-- main.py
|   |-- services/
|   |   |-- intelligence.py
|   |   |-- ndvi.py
|   |   |-- satellite.py
|   |   `-- weather.py
|   `-- test_*.py
|-- data/
|-- docs/
|-- frontend/
`-- ml/
```

## Requirements

- Python 3.13 or compatible Python version
- Node.js and npm
- Internet access for Open-Meteo and Planetary Computer requests

The trained model files are stored under `ml/` and are required by the backend.

## Backend Setup

From the project root, create and activate a virtual environment if needed:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install fastapi uvicorn joblib pandas requests numpy planetary-computer pystac-client rasterio
```

Start the FastAPI server:

```powershell
cd backend
uvicorn main:app --reload --port 8080
```

The API is available at `http://127.0.0.1:8080`. Interactive API documentation is available at `http://127.0.0.1:8080/docs`.

## API Endpoints

### `GET /`

Returns the API health status.

### `POST /predict`

Runs the existing rice-yield prediction using the historical model inputs:

```json
{
  "state": "Andhra Pradesh",
  "district": "ANANTAPUR",
  "year": 2014,
  "season": "Kharif",
  "area": 22658,
  "previous_year_yield": 2.112008,
  "rolling_3y_yield": 2.426377,
  "previous_year_area": 28114
}
```

### `POST /analyze`

Runs the combined agricultural intelligence flow. It accepts the `/predict` fields plus `latitude` and `longitude`, then returns predicted yield, yield gap, NDVI metadata, current weather, and short-term rainfall.

Example additional fields:

```json
{
  "latitude": 14.6819,
  "longitude": 77.6006
}
```

## Frontend Setup

Install dependencies and start the Vite development server:

```powershell
cd frontend
npm install
npm run dev
```

The frontend is typically available at `http://localhost:5173`.

Useful frontend commands:

```powershell
npm run lint
npm run build
```

## Service Checks

Run these from the project root using the project virtual environment:

```powershell
.\.venv\Scripts\python.exe backend\test_weather.py
.\.venv\Scripts\python.exe backend\test_ndvi.py
.\.venv\Scripts\python.exe backend\test_intelligence.py
```

The weather, NDVI, and intelligence checks make live external requests and therefore require network access.

## Scope

This MVP does not yet include satellite map integration, an LLM, a decision agent, or a multi-agent system. The existing frontend currently provides a dashboard and field analysis workflow while the backend exposes the structured intelligence API.
