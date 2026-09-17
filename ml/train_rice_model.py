from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


# ------------------------------------------------------------
# Paths
# ------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

DATA_PATH = BASE_DIR / "data" / "rice_model_data.csv"
MODEL_PATH = BASE_DIR / "ml" / "rice_yield_model.pkl"


def evaluate_model(name, y_true, y_pred):
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)

    print(f"\n===== {name} =====")
    print(f"MAE  : {mae:.4f} tonnes/hectare")
    print(f"RMSE : {rmse:.4f} tonnes/hectare")
    print(f"R²   : {r2:.4f}")


def main() -> None:
    print("Loading Rice model dataset...")

    df = pd.read_csv(DATA_PATH)

    print(f"Total rows: {len(df):,}")

    # --------------------------------------------------------
    # Features
    # --------------------------------------------------------
    feature_columns = [
        "State_Name",
        "District_Name",
        "Crop_Year",
        "Season",
        "Area",
        "Previous_Year_Yield",
        "Rolling_3Y_Yield",
        "Previous_Year_Area",
    ]

    target_column = "Yield"

    # --------------------------------------------------------
    # Time-based split
    # --------------------------------------------------------
    train_df = df[df["Crop_Year"] <= 2012].copy()
    validation_df = df[df["Crop_Year"] == 2013].copy()
    test_df = df[df["Crop_Year"] == 2014].copy()
    holdout_df = df[df["Crop_Year"] == 2015].copy()

    print("\n===== DATA SPLIT =====")
    print(f"Training   : {len(train_df):,}")
    print(f"Validation : {len(validation_df):,}")
    print(f"Test       : {len(test_df):,}")
    print(f"Holdout    : {len(holdout_df):,}")

    # --------------------------------------------------------
    # Prepare X/y
    # --------------------------------------------------------
    X_train = train_df[feature_columns]
    y_train = train_df[target_column]

    X_validation = validation_df[feature_columns]
    y_validation = validation_df[target_column]

    X_test = test_df[feature_columns]
    y_test = test_df[target_column]

    # --------------------------------------------------------
    # Feature types
    # --------------------------------------------------------
    categorical_features = [
        "State_Name",
        "District_Name",
        "Season",
    ]

    numerical_features = [
        "Crop_Year",
        "Area",
        "Previous_Year_Yield",
        "Rolling_3Y_Yield",
        "Previous_Year_Area",
    ]

    # --------------------------------------------------------
    # Categorical preprocessing
    # --------------------------------------------------------
    categorical_pipeline = Pipeline(
        steps=[
            (
                "imputer",
                SimpleImputer(strategy="most_frequent"),
            ),
            (
                "onehot",
                OneHotEncoder(
                    handle_unknown="ignore",
                    sparse_output=False,
                ),
            ),
        ]
    )

    # --------------------------------------------------------
    # Numerical preprocessing
    # --------------------------------------------------------
    numerical_pipeline = Pipeline(
        steps=[
            (
                "imputer",
                SimpleImputer(strategy="median"),
            )
        ]
    )

    # --------------------------------------------------------
    # Combine preprocessing
    # --------------------------------------------------------
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "categorical",
                categorical_pipeline,
                categorical_features,
            ),
            (
                "numerical",
                numerical_pipeline,
                numerical_features,
            ),
        ]
    )

    # --------------------------------------------------------
    # Random Forest model
    # --------------------------------------------------------
    model = RandomForestRegressor(
        n_estimators=250,
        max_depth=20,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )

    # --------------------------------------------------------
    # Full pipeline
    # --------------------------------------------------------
    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model),
        ]
    )

    # --------------------------------------------------------
    # Train
    # --------------------------------------------------------
    print("\nTraining model...")

    pipeline.fit(X_train, y_train)

    print("Training completed.")

    # --------------------------------------------------------
    # Validation
    # --------------------------------------------------------
    validation_predictions = pipeline.predict(X_validation)

    evaluate_model(
        "2013 VALIDATION",
        y_validation,
        validation_predictions,
    )

    # --------------------------------------------------------
    # Test
    # --------------------------------------------------------
    test_predictions = pipeline.predict(X_test)

    evaluate_model(
        "2014 TEST",
        y_test,
        test_predictions,
    )

    # --------------------------------------------------------
    # Simple baseline
    # --------------------------------------------------------
    baseline_prediction = y_train.median()

    baseline_predictions = np.full(
        len(y_test),
        baseline_prediction,
    )

    evaluate_model(
        "2014 MEDIAN BASELINE",
        y_test,
        baseline_predictions,
    )

    # --------------------------------------------------------
    # Save model
    # --------------------------------------------------------
    joblib.dump(pipeline, MODEL_PATH)

    print("\n===== MODEL SAVED =====")
    print(MODEL_PATH)

    # --------------------------------------------------------
    # Example prediction
    # --------------------------------------------------------
    sample = X_test.iloc[[0]]
    actual = y_test.iloc[0]
    predicted = pipeline.predict(sample)[0]

    print("\n===== SAMPLE PREDICTION =====")
    print(sample.to_string(index=False))
    print(f"\nActual yield    : {actual:.3f} tonnes/hectare")
    print(f"Predicted yield : {predicted:.3f} tonnes/hectare")


if __name__ == "__main__":
    main()
