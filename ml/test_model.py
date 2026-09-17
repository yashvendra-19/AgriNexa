from pathlib import Path

import joblib
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "ml" / "field_risk_model.pkl"


def main() -> None:
    model = joblib.load(MODEL_PATH)

    field = pd.DataFrame(
        [
            {
                "ndvi_change": -0.18,
                "rainfall_deficit": 14,
                "temperature_anomaly": 2.4,
                "historical_stress": 0.65,
            }
        ]
    )

    prediction = model.predict(field)[0]
    probability = model.predict_proba(field)[0][1]

    risk_level = "HIGH" if prediction == 1 else "LOW"

    print(f"Risk Level: {risk_level}")
    print(f"Risk Probability: {probability:.2%}")


if __name__ == "__main__":
    main()
    