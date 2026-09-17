from pathlib import Path
from typing import Any

import pandas as pd


# ============================================================
# PROJECT DATA
# ============================================================

DATA_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "rice_model_data.csv"
)


# ============================================================
# HELPERS
# ============================================================

def _safe_float(value: Any, default: float | None = None):
    try:
        if value is None:
            return default

        return float(value)

    except (TypeError, ValueError):
        return default


def _extract_rainfall_summary(
    intelligence: dict[str, Any],
) -> dict[str, Any]:

    rainfall = intelligence.get(
        "short-term rainfall",
        {},
    )

    dates = rainfall.get("dates", [])
    precipitation = rainfall.get(
        "precipitation_sum",
        [],
    )
    rain = rainfall.get(
        "rain_sum",
        [],
    )

    precipitation_values = [
        _safe_float(value, 0.0)
        for value in precipitation
    ]

    rain_values = [
        _safe_float(value, 0.0)
        for value in rain
    ]

    total_precipitation = sum(
        precipitation_values
    )

    total_rain = sum(rain_values)

    peak_date = None
    peak_precipitation = 0.0

    if precipitation_values and dates:

        peak_index = max(
            range(len(precipitation_values)),
            key=lambda index: precipitation_values[index],
        )

        peak_date = dates[peak_index]
        peak_precipitation = (
            precipitation_values[peak_index]
        )

    return {
        "dates": dates,
        "precipitation_values": precipitation_values,
        "rain_values": rain_values,
        "total_precipitation": total_precipitation,
        "total_rain": total_rain,
        "peak_date": peak_date,
        "peak_precipitation": peak_precipitation,
    }


# ============================================================
# LEARN DECISION BOUNDARIES
# ============================================================

def learn_decision_boundaries() -> dict[str, float]:

    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Decision data not found: {DATA_PATH}"
        )

    df = pd.read_csv(DATA_PATH)

    required_columns = {
        "Crop_Year",
        "Yield",
        "Rolling_3Y_Yield",
    }

    missing = (
        required_columns
        - set(df.columns)
    )

    if missing:
        raise ValueError(
            f"Missing required columns: {missing}"
        )

    # Use only the historical period used by
    # the predictive model.
    df = df[
        df["Crop_Year"] <= 2012
    ].copy()

    df = df[
        df["Rolling_3Y_Yield"].notna()
        & (df["Rolling_3Y_Yield"] > 0)
    ]

    df["Yield_Gap_Percent"] = (
        (
            df["Yield"]
            - df["Rolling_3Y_Yield"]
        )
        / df["Rolling_3Y_Yield"]
    ) * 100

    df = df[
        df["Yield_Gap_Percent"].notna()
    ]

    if len(df) < 20:
        raise ValueError(
            "Not enough historical records to "
            "learn decision boundaries."
        )

    high_priority_boundary = float(
        df["Yield_Gap_Percent"].quantile(0.20)
    )

    monitor_boundary = float(
        df["Yield_Gap_Percent"].quantile(0.50)
    )

    return {
        "high_priority_boundary":
            high_priority_boundary,

        "monitor_boundary":
            monitor_boundary,

        "sample_size":
            len(df),
    }


# ============================================================
# PERFORMANCE DIAGNOSIS
# ============================================================

def build_performance_diagnosis(
    yield_gap: float,
    high_boundary: float,
    monitor_boundary: float,
) -> str:

    if yield_gap <= high_boundary:

        return (
            f"The predicted yield is {abs(yield_gap):.2f}% "
            "below the historical comparison baseline and "
            "falls within the lower tail of the learned "
            "yield-gap distribution. This field is therefore "
            "flagged for priority professional inspection."
        )

    if yield_gap <= monitor_boundary:

        return (
            f"The predicted yield is {abs(yield_gap):.2f}% "
            "below the historical comparison baseline. "
            "The field falls into the monitoring range of "
            "the learned historical distribution and merits "
            "closer observation."
        )

    return (
        f"The predicted yield is {yield_gap:.2f}% above "
        "the historical comparison baseline. Based on the "
        "current predictive signal, the field is not showing "
        "a modeled yield-performance concern."
    )


# ============================================================
# VEGETATION DIAGNOSIS
# ============================================================

def build_vegetation_context(
    ndvi: float | None,
) -> str:

    if ndvi is None:
        return (
            "No current satellite vegetation signal was "
            "available for this analysis."
        )

    return (
        f"The latest satellite-derived NDVI is {ndvi:.4f}. "
        "This value is used as a supporting vegetation "
        "monitoring signal and should not be interpreted "
        "alone as proof of a specific crop problem."
    )


# ============================================================
# WEATHER DIAGNOSIS
# ============================================================

def build_weather_context(
    temperature: float | None,
    humidity: float | None,
    precipitation: float | None,
    rainfall_summary: dict[str, Any],
) -> str:

    pieces = []

    if temperature is not None:
        pieces.append(
            f"current temperature is {temperature:.1f}°C"
        )

    if humidity is not None:
        pieces.append(
            f"humidity is {humidity:.0f}%"
        )

    if precipitation is not None:
        pieces.append(
            f"current precipitation is "
            f"{precipitation:.1f} mm"
        )

    current_context = ""

    if pieces:
        current_context = (
            "Current weather context: "
            + ", ".join(pieces)
            + ". "
        )

    total_precipitation = rainfall_summary[
        "total_precipitation"
    ]

    peak_date = rainfall_summary[
        "peak_date"
    ]

    peak_precipitation = rainfall_summary[
        "peak_precipitation"
    ]

    forecast_context = ""

    if total_precipitation > 0:

        forecast_context = (
            f"The available short-term forecast contains "
            f"{total_precipitation:.1f} mm of total precipitation"
        )

        if peak_date is not None:
            forecast_context += (
                f", with the largest daily amount "
                f"of {peak_precipitation:.1f} mm on "
                f"{peak_date}"
            )

        forecast_context += "."

    else:

        forecast_context = (
            "No measurable short-term precipitation "
            "is currently present in the available forecast."
        )

    return (
        current_context
        + forecast_context
        + " Weather signals are treated as contextual "
        "evidence rather than direct proof of yield causation."
    )


# ============================================================
# RECOMMENDATION GENERATOR
# ============================================================

def build_recommendation(
    priority: str,
    yield_gap: float,
    high_boundary: float,
    monitor_boundary: float,
    rainfall_summary: dict[str, Any],
) -> tuple[str, str]:

    peak_date = rainfall_summary[
        "peak_date"
    ]

    peak_precipitation = rainfall_summary[
        "peak_precipitation"
    ]

    total_precipitation = rainfall_summary[
        "total_precipitation"
    ]

    if priority == "HIGH PRIORITY":

        reason = (
            f"The projected yield is below the learned "
            f"high-priority boundary of {high_boundary:.3f}%. "
            f"The current yield gap is {yield_gap:.3f}%, "
            "placing this field in the lower-performing "
            "portion of the historical distribution."
        )

        recommendation = (
            "Inspect this field first. Verify crop condition, "
            "soil moisture, irrigation or drainage status, "
            "and visible vegetation stress. Record the field "
            "observations and reassess the field after the "
            "next available update. "
        )

        if total_precipitation > 0:
            recommendation += (
                f"The forecast contains {total_precipitation:.1f} mm "
                "of precipitation, so the professional should "
                "also verify field conditions around the forecast "
            )

            if peak_date is not None:
                recommendation += (
                    f"rainfall peak on {peak_date} "
                    f"({peak_precipitation:.1f} mm)."
                )
            else:
                recommendation += "period."

        return reason, recommendation

    if priority == "MONITOR":

        reason = (
            f"The projected yield is below the historical "
            f"comparison baseline and falls within the learned "
            f"monitoring range, which extends to "
            f"{monitor_boundary:.3f}%."
        )

        recommendation = (
            "Increase monitoring frequency rather than "
            "immediately escalating the field. Recheck the "
            "vegetation signal, field moisture conditions, "
            "and upcoming weather, then reassess the predicted "
            "yield after new observations become available."
        )

        return reason, recommendation

    reason = (
        f"The projected yield is {yield_gap:.3f}% above "
        "the historical comparison baseline and remains "
        "above the learned monitoring boundary of "
        f"{monitor_boundary:.3f}%."
    )

    recommendation = (
        "Continue routine professional monitoring. No immediate "
        "priority escalation is indicated by the current "
        "predictive signal. Maintain normal field observations "
        "and reassess if the yield prediction, vegetation "
        "signal, or weather context changes materially."
    )

    if peak_date is not None and peak_precipitation > 0:

        recommendation += (
            f" Pay particular attention to field conditions "
            f"around the forecast rainfall peak on {peak_date} "
            f"({peak_precipitation:.1f} mm)."
        )

    return reason, recommendation


# ============================================================
# SINGLE DECISION AGENT
# ============================================================

def generate_field_decision(
    intelligence: dict[str, Any],
) -> dict[str, Any]:

    yield_gap = float(
        intelligence["yield_gap_percent"]
    )

    predicted_yield = float(
        intelligence["predicted_yield"]
    )

    historical_baseline = float(
        intelligence["rolling_3y_yield"]
    )

    # --------------------------------------------------------
    # LEARN CURRENT BOUNDARIES
    # --------------------------------------------------------

    boundaries = (
        learn_decision_boundaries()
    )

    high_boundary = boundaries[
        "high_priority_boundary"
    ]

    monitor_boundary = boundaries[
        "monitor_boundary"
    ]

    # --------------------------------------------------------
    # DECISION
    # --------------------------------------------------------

    if yield_gap <= high_boundary:

        priority = "HIGH PRIORITY"
        priority_score = 3

    elif yield_gap <= monitor_boundary:

        priority = "MONITOR"
        priority_score = 2

    else:

        priority = "NORMAL"
        priority_score = 1

    # --------------------------------------------------------
    # SIGNALS
    # --------------------------------------------------------

    ndvi = _safe_float(
        intelligence.get("NDVI")
    )

    temperature = _safe_float(
        intelligence.get("current temperature")
    )

    humidity = _safe_float(
        intelligence.get("current humidity")
    )

    precipitation = _safe_float(
        intelligence.get("current precipitation")
    )

    rainfall_summary = (
        _extract_rainfall_summary(
            intelligence
        )
    )

    # --------------------------------------------------------
    # DETAILED ANALYSIS
    # --------------------------------------------------------

    performance_diagnosis = (
        build_performance_diagnosis(
            yield_gap,
            high_boundary,
            monitor_boundary,
        )
    )

    vegetation_context = (
        build_vegetation_context(
            ndvi
        )
    )

    weather_context = (
        build_weather_context(
            temperature,
            humidity,
            precipitation,
            rainfall_summary,
        )
    )

    reason, recommendation = (
        build_recommendation(
            priority,
            yield_gap,
            high_boundary,
            monitor_boundary,
            rainfall_summary,
        )
    )

    # --------------------------------------------------------
    # COMPLETE ANALYTICAL DIAGNOSIS
    # --------------------------------------------------------

    analytical_diagnosis = {
        "overall_assessment":
            performance_diagnosis,

        "performance_analysis":
            (
                f"Predicted yield is "
                f"{predicted_yield:.3f} tonnes/hectare "
                f"against a historical baseline of "
                f"{historical_baseline:.3f} tonnes/hectare."
            ),

        "vegetation_analysis":
            vegetation_context,

        "weather_analysis":
            weather_context,

        "decision_basis":
            (
                f"The current yield gap of "
                f"{yield_gap:.3f}% was evaluated against "
                f"learned historical boundaries of "
                f"{high_boundary:.3f}% for high priority "
                f"and {monitor_boundary:.3f}% for monitoring."
            ),

        "limitations":
            (
                "This is an analytical decision-support result. "
                "NDVI and weather signals provide context but "
                "do not independently establish the cause of "
                "a yield outcome or diagnose a crop disease."
            ),
    }

    # --------------------------------------------------------
    # FINAL OUTPUT
    # --------------------------------------------------------

    return {
        "priority":
            priority,

        "priority_score":
            priority_score,

        "yield_gap_percent":
            round(yield_gap, 3),

        "predicted_yield":
            round(predicted_yield, 3),

        "historical_baseline":
            round(historical_baseline, 3),

        "decision_boundaries": {
            "high_priority_below_or_equal":
                round(high_boundary, 3),

            "monitor_below_or_equal":
                round(monitor_boundary, 3),
        },

        "historical_sample_size":
            boundaries["sample_size"],

        "analytical_diagnosis":
            analytical_diagnosis,

        "reason":
            reason,

        "recommended_action":
            recommendation,

        "signals": {
            "ndvi":
                intelligence.get("NDVI"),

            "temperature":
                intelligence.get(
                    "current temperature"
                ),

            "humidity":
                intelligence.get(
                    "current humidity"
                ),

            "current_precipitation":
                intelligence.get(
                    "current precipitation"
                ),

            "short_term_rainfall":
                intelligence.get(
                    "short-term rainfall"
                ),
        },
    }