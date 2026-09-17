from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "prepared_crop_data.csv"


def main() -> None:
    df = pd.read_csv(DATA_PATH)

    # Keep only Rice
    rice = df[df["Crop"].str.strip().str.lower() == "rice"].copy()

    print("===== RICE DATASET =====")
    print(f"Rows: {len(rice):,}")

    print("\n===== YEARS =====")
    print(
        rice["Crop_Year"]
        .value_counts()
        .sort_index()
        .to_string()
    )

    print("\n===== STATES =====")
    print(f"Unique states: {rice['State_Name'].nunique()}")

    print("\n===== SEASONS =====")
    print(rice["Season"].value_counts().to_string())

    print("\n===== RICE YIELD STATISTICS =====")
    print(rice["Yield"].describe())

    print("\n===== EXTREME YIELD VALUES =====")
    extreme = (
        rice[
            [
                "State_Name",
                "District_Name",
                "Crop_Year",
                "Season",
                "Area",
                "Production",
                "Yield",
            ]
        ]
        .sort_values("Yield", ascending=False)
        .head(20)
    )

    print(extreme.to_string(index=False))

    print("\n===== ZERO YIELD RECORDS =====")
    print((rice["Yield"] == 0).sum())

    print("\n===== RICE RECORDS BY STATE =====")
    print(
        rice["State_Name"]
        .value_counts()
        .head(15)
        .to_string()
    )


if __name__ == "__main__":
    main()
