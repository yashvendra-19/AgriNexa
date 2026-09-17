import planetary_computer
import pystac_client


STAC_URL = "https://planetarycomputer.microsoft.com/api/stac/v1"

COLLECTION = "sentinel-2-l2a"


def find_sentinel_image(
    latitude: float,
    longitude: float,
):
    """
    Find the most recent low-cloud Sentinel-2 image
    covering the given location.
    """

    catalog = pystac_client.Client.open(
        STAC_URL,
        modifier=planetary_computer.sign_inplace,
    )

    # Create a very small bounding box around the point.
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