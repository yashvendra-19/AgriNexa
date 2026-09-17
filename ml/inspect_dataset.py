from pathlib import Path
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "crop_production.csv"


def main() -> None:
    print("Loading dataset...")

    df = pd.read_csv(DATA_PATH)

    print("\n===== BASIC INFORMATION =====")
    print(f"Rows: {len(df):,}")
    print(f"Columns: {len(df.columns)}")

    print("\n===== COLUMN NAMES =====")
    for column in df.columns:
        print("-", column)

    print("\n===== FIRST 5 ROWS =====")
    print(df.head().to_string())

    print("\n===== DATA TYPES =====")
    print(df.dtypes)

    print("\n===== MISSING VALUES =====")
    print(df.isnull().sum())

    print("\n===== DUPLICATE ROWS =====")
    print(df.duplicated().sum())

    print("\n===== UNIQUE VALUES =====")
    print(f"States: {df['State_Name'].nunique()}")
    print(f"Districts: {df['District_Name'].nunique()}")
    print(f"Crops: {df['Crop'].nunique()}")
    print(f"Seasons: {df['Season'].nunique()}")
    print(f"Years: {df['Crop_Year'].nunique()}")

    print("\n===== SAMPLE CROPS =====")
    print(df["Crop"].unique()[:30])

    print("\n===== SAMPLE SEASONS =====")
    print(df["Season"].unique())

    print("\n===== PRODUCTION STATISTICS =====")
    print(df["Production"].describe())


if __name__ == "__main__":
    main()