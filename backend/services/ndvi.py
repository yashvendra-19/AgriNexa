import numpy as np
import planetary_computer
import pystac_client
import rasterio
from rasterio.windows import Window
from rasterio.warp import transform


STAC_URL = "https://planetarycomputer.microsoft.com/api/stac/v1"
COLLECTION = "sentinel-2-l2a"


def get_latest_sentinel_item(latitude: float, longitude: float):
    catalog = pystac_client.Client.open(
        STAC_URL,
        modifier=planetary_computer.sign_inplace,
    )

    bbox = [
        longitude - 0.05,
        latitude - 0.05,
        longitude + 0.05,
        latitude + 0.05,
    ]

    search = catalog.search(
        collections=[COLLECTION],
        bbox=bbox,
        query={
            "eo:cloud_cover": {
                "lt": 20
            }
        },
        sortby=[
            {
                "field": "datetime",
                "direction": "desc",
            }
        ],
        max_items=5,
    )

    items = list(search.items())

    if not items:
        return None

    return items[0]


def calculate_ndvi(
    latitude: float,
    longitude: float,
    window_size: int = 100,
) -> dict:

    item = get_latest_sentinel_item(
        latitude,
        longitude,
    )

    if item is None:
        raise RuntimeError(
            "No suitable Sentinel-2 image found."
        )

    # Get signed asset URLs
    red_url = item.assets["B04"].href
    nir_url = item.assets["B08"].href

    # Open Red band
    with rasterio.open(red_url) as red_src:

        # Convert GPS coordinates into the satellite CRS
        x, y = transform(
            "EPSG:4326",
            red_src.crs,
            [longitude],
            [latitude],
        )

        pixel_x, pixel_y = red_src.index(
            x[0],
            y[0],
        )

        half = window_size // 2

        window = Window(
            pixel_x - half,
            pixel_y - half,
            window_size,
            window_size,
        )

        red = red_src.read(
            1,
            window=window,
        ).astype("float32")

    # Open Near Infrared band
    with rasterio.open(nir_url) as nir_src:

        nir = nir_src.read(
            1,
            window=window,
        ).astype("float32")

    # Sentinel-2 surface reflectance is scaled.
    # Since both bands have the same scale,
    # the scale cancels in the NDVI ratio.

    denominator = nir + red

    ndvi = np.where(
        denominator == 0,
        np.nan,
        (nir - red) / denominator,
    )

    mean_ndvi = float(
        np.nanmean(ndvi)
    )

    median_ndvi = float(
        np.nanmedian(ndvi)
    )

    return {
        "scene_id": item.id,
        "scene_date": str(item.datetime),
        "cloud_cover": float(
            item.properties.get(
                "eo:cloud_cover",
                0
            )
        ),
        "mean_ndvi": round(
            mean_ndvi,
            4
        ),
        "median_ndvi": round(
            median_ndvi,
            4
        ),
    }