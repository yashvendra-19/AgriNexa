from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_PATH = BASE_DIR / "data" / "crop_production.csv"
OUTPUT_PATH = BASE_DIR / "data" / "prepared_crop_data.csv"


def main() -> None:
    print("Loading dataset...")

    df = pd.read_csv(INPUT_PATH)

    print(f"Original rows: {len(df):,}")

    # ---------------------------------------------------------
    # 1. Clean text columns
    # ---------------------------------------------------------
    text_columns = [
        "State_Name",
        "District_Name",
        "Season",
        "Crop",
    ]

    for column in text_columns:
        df[column] = df[column].astype(str).str.strip()

    # ---------------------------------------------------------
    # 2. Remove rows with missing production
    # ---------------------------------------------------------
    before = len(df)
    df = df.dropna(subset=["Production"])
    print(f"Removed missing production rows: {before - len(df):,}")

    # ---------------------------------------------------------
    # 3. Remove invalid area values
    # ---------------------------------------------------------
    before = len(df)
    df = df[df["Area"] > 0]
    print(f"Removed invalid area rows: {before - len(df):,}")

    # ---------------------------------------------------------
    # 4. Remove negative production values
    # ---------------------------------------------------------
    before = len(df)
    df = df[df["Production"] >= 0]
    print(f"Removed negative production rows: {before - len(df):,}")

    # ---------------------------------------------------------
    # 5. Calculate yield
    # ---------------------------------------------------------
    df["Yield"] = df["Production"] / df["Area"]

    # ---------------------------------------------------------
    # 6. Remove impossible/infinite values
    # ---------------------------------------------------------
    df = df.replace([float("inf"), float("-inf")], pd.NA)
    df = df.dropna(subset=["Yield"])

    # ---------------------------------------------------------
    # 7. Save prepared dataset
    # ---------------------------------------------------------
    df.to_csv(OUTPUT_PATH, index=False)

    print("\n===== PREPARED DATASET =====")
    print(f"Rows: {len(df):,}")
    print(f"Columns: {len(df.columns)}")

    print("\nColumns:")
    for column in df.columns:
        print("-", column)

    print("\nYield statistics:")
    print(df["Yield"].describe())

    print("\nSaved to:")
    print(OUTPUT_PATH)


if __name__ == "__main__":
    main()
