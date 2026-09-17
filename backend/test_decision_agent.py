from pprint import pprint

from services.decision_agent import generate_field_decision
from services.intelligence import get_agricultural_intelligence


def main() -> None:
    print("Running AgriNexa Decision Agent test...\n")

    # Existing Anantapur test case
    intelligence = get_agricultural_intelligence(
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

    decision = generate_field_decision(
        intelligence
    )

    print("===== SINGLE DECISION AGENT =====\n")

    pprint(decision)

    # Required fields
    required_keys = {
        "priority",
        "priority_score",
        "yield_gap_percent",
        "predicted_yield",
        "historical_baseline",
        "signals",
        "reason",
        "recommended_action",
    }

    missing_keys = required_keys - set(
        decision.keys()
    )

    if missing_keys:
        raise AssertionError(
            f"Missing keys: {missing_keys}"
        )

    print("\nDecision agent test passed successfully.")


if __name__ == "__main__":
    main()