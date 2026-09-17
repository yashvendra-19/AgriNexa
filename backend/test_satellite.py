from services.satellite import find_sentinel_image


def main() -> None:

    # Example location: Anantapur, Andhra Pradesh
    latitude = 14.6819
    longitude = 77.6006

    print("===== SATELLITE TEST =====")
    print(f"Latitude: {latitude}")
    print(f"Longitude: {longitude}")

    item = find_sentinel_image(
        latitude,
        longitude,
    )

    if item is None:
        print("\nNo suitable Sentinel-2 image found.")
        return

    print("\n===== SENTINEL-2 IMAGE =====")

    print("Item ID:")
    print(item.id)

    print("\nDate:")
    print(item.datetime)

    print("\nCloud Cover:")
    print(item.properties.get("eo:cloud_cover"))

    print("\nAvailable Assets:")

    for name in item.assets.keys():
        print("-", name)


if __name__ == "__main__":
    main()