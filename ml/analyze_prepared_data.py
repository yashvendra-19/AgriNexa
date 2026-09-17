from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "prepared_crop_data.csv"


def main() -> None:
    print("Loading prepared dataset...")

    df = pd.read_csv(DATA_PATH)

    print(f"\nRows: {len(df):,}")

    print("\n===== TOP 15 CROPS BY RECORD COUNT =====")
    print(
        df["Crop"]
        .value_counts()
        .head(15)
        .to_string()
    )

    print("\n===== RECORDS BY YEAR =====")
    print(
        df["Crop_Year"]
        .value_counts()
        .sort_index()
        .to_string()
    )

    print("\n===== TOP 15 STATES BY RECORD COUNT =====")
    print(
        df["State_Name"]
        .value_counts()
        .head(15)
        .to_string()
    )

    print("\n===== AVERAGE YIELD BY TOP 15 CROPS =====")

    top_crops = df["Crop"].value_counts().head(15).index

    crop_yield = (
        df[df["Crop"].isin(top_crops)]
        .groupby("Crop")["Yield"]
        .agg(["count", "mean", "median"])
        .sort_values("count", ascending=False)
    )

    print(crop_yield.to_string())

    print("\n===== HIGHEST YIELD VALUES =====")
    print(
        df[["Crop", "State_Name", "District_Name", "Yield"]]
        .sort_values("Yield", ascending=False)
        .head(10)
        .to_string(index=False)
    )


if __name__ == "__main__":
    main()
