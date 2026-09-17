from services.ndvi import calculate_ndvi


def main() -> None:

    latitude = 14.6819
    longitude = 77.6006

    print("===== NDVI TEST =====")
    print(f"Latitude: {latitude}")
    print(f"Longitude: {longitude}")

    result = calculate_ndvi(
        latitude,
        longitude,
    )

    print("\n===== SATELLITE RESULT =====")
    print(f"Scene ID: {result['scene_id']}")
    print(f"Scene date: {result['scene_date']}")
    print(
        f"Cloud cover: "
        f"{result['cloud_cover']:.2f}%"
    )

    print("\n===== NDVI =====")
    print(
        f"Mean NDVI: "
        f"{result['mean_ndvi']}"
    )

    print(
        f"Median NDVI: "
        f"{result['median_ndvi']}"
    )


if __name__ == "__main__":
    main()