from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel

from .services.intelligence import get_agricultural_intelligence
from .services.decision_agent import generate_field_decision


# ============================================================
# PROJECT PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "ml" / "rice_yield_model.pkl"


# ============================================================
# LOAD TRAINED MODEL
# ============================================================

print("Loading AgriNexa ML model...")

model = joblib.load(MODEL_PATH)

print("ML model loaded successfully.")


# ============================================================
# CREATE FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="AgriNexa API",
    description="Predictive agricultural intelligence backend",
    version="0.1.0",
)


# ============================================================
# INPUT DATA STRUCTURES
# ============================================================

class PredictionRequest(BaseModel):
    state: str
    district: str
    year: int
    season: str
    area: float
    previous_year_yield: float
    rolling_3y_yield: float
    previous_year_area: float


class AnalyzeRequest(PredictionRequest):
    latitude: float
    longitude: float


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():
    return {
        "name": "AgriNexa",
        "message": "AgriNexa API is running",
        "status": "ok",
    }


# ============================================================
# PREDICTION ENDPOINT
# ============================================================

@app.post("/predict")
def predict(request: PredictionRequest):

    input_data = pd.DataFrame(
        [
            {
                "State_Name": request.state,
                "District_Name": request.district,
                "Crop_Year": request.year,
                "Season": request.season,
                "Area": request.area,
                "Previous_Year_Yield": request.previous_year_yield,
                "Rolling_3Y_Yield": request.rolling_3y_yield,
                "Previous_Year_Area": request.previous_year_area,
            }
        ]
    )

    predicted_yield = model.predict(input_data)[0]

    return {
        "predicted_yield": round(float(predicted_yield), 3),
        "unit": "tonnes/hectare",
    }


# ============================================================
# FULL AGRICULTURAL ANALYSIS + SINGLE DECISION AGENT
# ============================================================

@app.post("/analyze")
def analyze(request: AnalyzeRequest):

    # --------------------------------------------------------
    # Step 1: Generate agricultural intelligence
    # --------------------------------------------------------

    intelligence = get_agricultural_intelligence(
        latitude=request.latitude,
        longitude=request.longitude,
        state=request.state,
        district=request.district,
        year=request.year,
        season=request.season,
        area=request.area,
        previous_year_yield=request.previous_year_yield,
        rolling_3y_yield=request.rolling_3y_yield,
        previous_year_area=request.previous_year_area,
    )

    # --------------------------------------------------------
    # Step 2: Run the Single Decision Agent
    # --------------------------------------------------------

    decision = generate_field_decision(
        intelligence
    )

    # --------------------------------------------------------
    # Step 3: Return intelligence + decision
    # --------------------------------------------------------

    return {
        **intelligence,
        "decision": decision,
    }