from pprint import pprint

from services.intelligence import get_agricultural_intelligence


result = get_agricultural_intelligence(
    latitude=14.6819,
    longitude=77.6006,
    state="Andhra Pradesh",
    district="ANANTAPUR",
    year=2014,
    season="Kharif",
    area=22658,
    previous_year_yield=2.112008,
    rolling_3y_yield=2.426377,
    previous_year_area=28114,
)

print("===== AGRICULTURAL INTELLIGENCE =====")
pprint(result)