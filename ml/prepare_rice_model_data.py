from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent
INPUT_PATH = BASE_DIR / "data" / "prepared_crop_data.csv"
OUTPUT_PATH = BASE_DIR / "data" / "rice_model_data.csv"


def main() -> None:
    print("Loading prepared dataset...")

    df = pd.read_csv(INPUT_PATH)

    # ---------------------------------------------------------
    # 1. Keep Rice only
    # ---------------------------------------------------------
    df = df[df["Crop"].str.strip().str.lower() == "rice"].copy()

    # Clean text fields
    df["State_Name"] = df["State_Name"].str.strip()
    df["District_Name"] = df["District_Name"].str.strip()
    df["Season"] = df["Season"].str.strip()

    # ---------------------------------------------------------
    # 2. Sort chronologically
    # ---------------------------------------------------------
    df = df.sort_values(
        ["State_Name", "District_Name", "Season", "Crop_Year"]
    )

    # ---------------------------------------------------------
    # 3. Previous-year yield
    # ---------------------------------------------------------
    df["Previous_Year_Yield"] = (
        df.groupby(
            ["State_Name", "District_Name", "Season"]
        )["Yield"]
        .shift(1)
    )

    # ---------------------------------------------------------
    # 4. Previous 3-year average yield
    # ---------------------------------------------------------
    df["Rolling_3Y_Yield"] = (
        df.groupby(
            ["State_Name", "District_Name", "Season"]
        )["Yield"]
        .transform(
            lambda x: x.shift(1).rolling(3, min_periods=1).mean()
        )
    )

    # ---------------------------------------------------------
    # 5. Previous-year area
    # ---------------------------------------------------------
    df["Previous_Year_Area"] = (
        df.groupby(
            ["State_Name", "District_Name", "Season"]
        )["Area"]
        .shift(1)
    )

    # ---------------------------------------------------------
    # 6. Remove rows without enough historical information
    # ---------------------------------------------------------
    df = df.dropna(
        subset=[
            "Previous_Year_Yield",
            "Rolling_3Y_Yield",
            "Previous_Year_Area",
        ]
    )

    # ---------------------------------------------------------
    # 7. Deal with extreme target outliers
    # ---------------------------------------------------------
    # Keep the bulk of the distribution while removing
    # extremely unusual observations.
    upper_limit = df["Yield"].quantile(0.99)

    print(f"99th percentile yield: {upper_limit:.4f}")

    before = len(df)

    df = df[df["Yield"] <= upper_limit].copy()

    print(
        f"Removed extreme yield records: "
        f"{before - len(df):,}"
    )

    # ---------------------------------------------------------
    # 8. Save
    # ---------------------------------------------------------
    df.to_csv(OUTPUT_PATH, index=False)

    print("\n===== RICE MODEL DATA =====")
    print(f"Rows: {len(df):,}")
    print(f"Years: {df['Crop_Year'].min()} - {df['Crop_Year'].max()}")

    print("\nColumns:")
    for column in df.columns:
        print("-", column)

    print(f"\nSaved to: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()