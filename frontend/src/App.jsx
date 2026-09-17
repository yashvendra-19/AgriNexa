import { useEffect, useState } from "react";
import axios from "axios";

import {
  Activity,
  BarChart3,
  BrainCircuit,
  Map,
  FileText,
  Leaf,
  CloudSun,
  ChevronRight,
} from "lucide-react";

import "./App.css";


// ============================================================
// SAMPLE AGRICULTURAL FIELDS
// ============================================================
// These are temporary demo fields.
// Later we will replace them with real geographic field data.

const fields = [
  {
    id: "F027",
    state: "Andhra Pradesh",
    district: "ANANTAPUR",
    year: 2014,
    season: "Kharif",
    area: 22658,
    previous_year_yield: 2.112008,
    rolling_3y_yield: 2.426377,
    previous_year_area: 28114,
    status: "high",
    latitude: 14.6819,
    longitude: 77.6006,
  },

  {
    id: "F041",
    state: "Uttar Pradesh",
    district: "LUCKNOW",
    year: 2014,
    season: "Kharif",
    area: 18500,
    previous_year_yield: 2.15,
    rolling_3y_yield: 2.31,
    previous_year_area: 17900,
    status: "medium",
    latitude: 26.8467,
    longitude: 80.9462,
  },

  {
    id: "F063",
    state: "West Bengal",
    district: "24 PARAGANAS NORTH",
    year: 2014,
    season: "Winter",
    area: 139767,
    previous_year_yield: 2.9640147639511003,
    rolling_3y_yield: 2.719676566715108,
    previous_year_area: 131943,
    status: "low",
    latitude: 22.72,
    longitude: 88.48,
  },

  {
    id: "F064",
    state: "Maharashtra",
    district: "PUNE",
    year: 2014,
    season: "Kharif",
    area: 82100,
    previous_year_yield: 1.8660170523751525,
    rolling_3y_yield: 1.5384063048988008,
    previous_year_area: 82100,
    status: "medium",
    latitude: 18.5204,
    longitude: 73.8567,
  },

  {
    id: "F065",
    state: "Maharashtra",
    district: "NASHIK",
    year: 2014,
    season: "Kharif",
    area: 71200,
    previous_year_yield: 1.2851239669421488,
    rolling_3y_yield: 1.2373310607226478,
    previous_year_area: 72600,
    status: "low",
    latitude: 20.0059,
    longitude: 73.791,
  },

  {
    id: "F066",
    state: "Maharashtra",
    district: "KOLHAPUR",
    year: 2014,
    season: "Kharif",
    area: 110900,
    previous_year_yield: 3.1213235294117645,
    rolling_3y_yield: 2.8043838493298483,
    previous_year_area: 108800,
    status: "low",
    latitude: 16.705,
    longitude: 74.2433,
  },

  {
    id: "F067",
    state: "Bihar",
    district: "PATNA",
    year: 2014,
    season: "Winter",
    area: 63475,
    previous_year_yield: 2.4282978723404254,
    rolling_3y_yield: 2.8083094041668315,
    previous_year_area: 56400,
    status: "high",
    latitude: 25.5941,
    longitude: 85.1376,
  },

  {
    id: "F068",
    state: "Bihar",
    district: "GAYA",
    year: 2014,
    season: "Winter",
    area: 104005,
    previous_year_yield: 1.9849310571240968,
    rolling_3y_yield: 2.8272092728130382,
    previous_year_area: 60920,
    status: "medium",
    latitude: 24.7955,
    longitude: 84.9994,
  },

  {
    id: "F069",
    state: "Madhya Pradesh",
    district: "BHOPAL",
    year: 2013,
    season: "Kharif",
    area: 522,
    previous_year_yield: 1.136163982430454,
    rolling_3y_yield: 1.245425719315606,
    previous_year_area: 683,
    status: "medium",
    latitude: 23.2599,
    longitude: 77.4126,
  },

  {
    id: "F070",
    state: "Madhya Pradesh",
    district: "INDORE",
    year: 2013,
    season: "Kharif",
    area: 5,
    previous_year_yield: 1,
    rolling_3y_yield: 1,
    previous_year_area: 4,
    status: "low",
    latitude: 22.7196,
    longitude: 75.8577,
  },

  {
    id: "F071",
    state: "Rajasthan",
    district: "JAIPUR",
    year: 2001,
    season: "Kharif",
    area: 9,
    previous_year_yield: 0.9166666666666666,
    rolling_3y_yield: 1.2083333333333333,
    previous_year_area: 12,
    status: "high",
    latitude: 26.9124,
    longitude: 75.7873,
  },

  {
    id: "F072",
    state: "Rajasthan",
    district: "AJMER",
    year: 2010,
    season: "Kharif",
    area: 9,
    previous_year_yield: 1.5714285714285714,
    rolling_3y_yield: 1.7738095238095235,
    previous_year_area: 7,
    status: "medium",
    latitude: 26.4499,
    longitude: 74.6399,
  },

  {
    id: "F073",
    state: "Punjab",
    district: "AMRITSAR",
    year: 2014,
    season: "Kharif",
    area: 182000,
    previous_year_yield: 2.8461538461538463,
    rolling_3y_yield: 2.802086534695231,
    previous_year_area: 182000,
    status: "low",
    latitude: 31.634,
    longitude: 74.8723,
  },

  {
    id: "F074",
    state: "Punjab",
    district: "LUDHIANA",
    year: 2014,
    season: "Kharif",
    area: 257000,
    previous_year_yield: 4.424124513618677,
    rolling_3y_yield: 4.409857328145266,
    previous_year_area: 257000,
    status: "low",
    latitude: 30.901,
    longitude: 75.8573,
  },

  {
    id: "F075",
    state: "Haryana",
    district: "KARNAL",
    year: 2012,
    season: "Kharif",
    area: 170172,
    previous_year_yield: 3.035738090332901,
    rolling_3y_yield: 2.9142458744057933,
    previous_year_area: 165034,
    status: "low",
    latitude: 29.6857,
    longitude: 76.9905,
  },

  {
    id: "F076",
    state: "Haryana",
    district: "HISAR",
    year: 2012,
    season: "Kharif",
    area: 42070,
    previous_year_yield: 2.586146641504159,
    rolling_3y_yield: 2.428552115473761,
    previous_year_area: 42921,
    status: "medium",
    latitude: 29.1492,
    longitude: 75.7217,
  },

  {
    id: "F077",
    state: "Karnataka",
    district: "MYSORE",
    year: 2014,
    season: "Kharif",
    area: 94359,
    previous_year_yield: 3.39055124976836,
    rolling_3y_yield: 3.260086175517415,
    previous_year_area: 91737,
    status: "low",
    latitude: 12.2958,
    longitude: 76.6394,
  },

  {
    id: "F078",
    state: "Karnataka",
    district: "BELLARY",
    year: 2014,
    season: "Kharif",
    area: 77598,
    previous_year_yield: 3.825654519142218,
    rolling_3y_yield: 3.758202457869276,
    previous_year_area: 76010,
    status: "low",
    latitude: 15.1394,
    longitude: 76.9214,
  },

  {
    id: "F079",
    state: "Tamil Nadu",
    district: "COIMBATORE",
    year: 2012,
    season: "Kharif",
    area: 2156,
    previous_year_yield: 3.9885888170407,
    rolling_3y_yield: 3.801796012715077,
    previous_year_area: 2629,
    status: "low",
    latitude: 11.0168,
    longitude: 76.9558,
  },

  {
    id: "F080",
    state: "Tamil Nadu",
    district: "THANJAVUR",
    year: 2012,
    season: "Kharif",
    area: 146959,
    previous_year_yield: 3.9952449145466913,
    rolling_3y_yield: 3.1617934631786286,
    previous_year_area: 180859,
    status: "low",
    latitude: 10.7867,
    longitude: 79.1378,
  },
];


// ============================================================
// MAIN APPLICATION
// ============================================================

function App() {

  // ----------------------------------------------------------
  // Selected field
  // ----------------------------------------------------------

  const [selectedField, setSelectedField] = useState(fields[0]);


  // ----------------------------------------------------------
  // Intelligence returned from backend
  // ----------------------------------------------------------

  const [intelligence, setIntelligence] = useState(null);


  // ----------------------------------------------------------
  // Loading state
  // ----------------------------------------------------------

  const [loading, setLoading] = useState(false);

  const [analysisStage, setAnalysisStage] = useState(0);


  // ----------------------------------------------------------
  // Error message
  // ----------------------------------------------------------

  const [error, setError] = useState("");


  useEffect(() => {
    if (!loading) {
      return undefined;
    }

    const stageTimer = window.setInterval(() => {
      setAnalysisStage((stage) => Math.min(stage + 1, 3));
    }, 350);

    return () => window.clearInterval(stageTimer);
  }, [loading]);


  // ==========================================================
  // SEND FIELD DATA TO FASTAPI
  // ==========================================================

  const analyzeField = async () => {

    setIntelligence(null);
    setAnalysisStage(0);
    setError("");

    if (!Number.isFinite(selectedField.latitude) || !Number.isFinite(selectedField.longitude)) {
      setError(
        "Live satellite analysis is not configured for this field yet. Coordinates are required."
      );
      return;
    }

    setLoading(true);

    try {

      const response = await axios.post(
        "/analyze",
        {
          latitude: selectedField.latitude,
          longitude: selectedField.longitude,
          state: selectedField.state,
          district: selectedField.district,
          year: selectedField.year,
          season: selectedField.season,
          area: selectedField.area,
          previous_year_yield: selectedField.previous_year_yield,
          rolling_3y_yield: selectedField.rolling_3y_yield,
          previous_year_area: selectedField.previous_year_area,
        }
      );

      setIntelligence(response.data);

    } catch (err) {

      console.error("Analysis error:", err);

      setError(
        "Unable to connect to AgriNexa intelligence service. Make sure the FastAPI backend is running on port 8080."
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================================
  // CHANGE SELECTED FIELD
  // ==========================================================

  const handleFieldChange = (event) => {

    const fieldId = event.target.value;

    const field = fields.find(
      (item) => item.id === fieldId
    );

    setSelectedField(field);
    setIntelligence(null);
    setError("");
  };


  const status = intelligence
    ? intelligence.yield_gap_percent <= -15
      ? "high"
      : intelligence.yield_gap_percent <= 0
      ? "medium"
      : "low"
    : selectedField.status;

  const statusLabel = status === "high"
    ? "HIGH PRIORITY"
    : status === "medium"
    ? "MONITOR"
    : "NORMAL";

  const rainfallTotal = intelligence
    ? intelligence["short-term rainfall"].precipitation_sum.reduce(
        (total, amount) => total + amount,
        0
      )
    : 0;


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div className="app">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside className="sidebar">

        {/* BRAND */}

        <div className="brand">

          <div className="brand-icon">
            <Leaf size={22} />
          </div>

          <div>

            <h1>AgriNexa</h1>

            <span>
              AGRICULTURAL INTELLIGENCE
            </span>

          </div>

        </div>


        {/* NAVIGATION */}

        <nav>

          <div className="nav-item active">
            <BarChart3 size={18} />
            Dashboard
          </div>

          <div className="nav-item">
            <Map size={18} />
            Field Intelligence
          </div>

          <div className="nav-item">
            <Activity size={18} />
            Analytics
          </div>

          <div className="nav-item">
            <BrainCircuit size={18} />
            AI Advisor
          </div>

          <div className="nav-item">
            <FileText size={18} />
            Reports
          </div>

        </nav>


        {/* SYSTEM STATUS */}

        <div className="system-card">

          <div className="status-dot"></div>

          <div>

            <strong>
              System Online
            </strong>

            <small>
              Predictive Engine Active
            </small>

          </div>

        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="main">


        {/* ===================================================
            TOP HEADER
        ==================================================== */}

        <header className="topbar">

          <div>

            <p className="eyebrow">
              PROFESSIONAL DASHBOARD
            </p>

            <h2>
              Agricultural Intelligence
            </h2>

            <p className="subtitle">
              Predictive insights for agricultural professionals.
            </p>

          </div>


          <div className="top-status">

            <span></span>

            Live

          </div>

        </header>


        {/* ===================================================
            STAT CARDS
        ==================================================== */}

        <section className="stats">


          <div className="stat-card">

            <span>
              FIELDS MONITORED
            </span>

            <strong>
              100
            </strong>

            <small>
              Across active portfolio
            </small>

          </div>


          <div className="stat-card danger">

            <span>
              HIGH PRIORITY
            </span>

            <strong>
              08
            </strong>

            <small>
              Requires professional attention
            </small>

          </div>


          <div className="stat-card warning">

            <span>
              MONITOR
            </span>

            <strong>
              17
            </strong>

            <small>
              Watch emerging changes
            </small>

          </div>


          <div className="stat-card success">

            <span>
              NORMAL
            </span>

            <strong>
              75
            </strong>

            <small>
              No immediate action
            </small>

          </div>

        </section>


        {/* ===================================================
            MAIN DASHBOARD GRID
        ==================================================== */}

        <section className="dashboard-grid">


          {/* =================================================
              MAP PANEL
          ================================================== */}

          <div className="panel map-panel">

            <div className="panel-header">

              <div>

                <span className="panel-label">
                  FIELD OVERVIEW
                </span>

                <h3>
                  Portfolio Risk Map
                </h3>

              </div>


              <div className="map-legend">

                <span>
                  <i className="green"></i>
                  Normal
                </span>

                <span>
                  <i className="orange"></i>
                  Monitor
                </span>

                <span>
                  <i className="red"></i>
                  Priority
                </span>

              </div>

            </div>


            {/* Temporary visual map.
                We will replace this with Leaflet later. */}

            <div className="fake-map">

              <div className="map-grid"></div>


              <div className="field-shape shape-one"></div>

              <div className="field-shape shape-two"></div>

              <div className="field-shape shape-three"></div>


              <button
                className="map-point p1 green-point"
                type="button"
                aria-label="Normal field"
              ></button>

              <button
                className="map-point p2 green-point"
                type="button"
                aria-label="Normal field"
              ></button>

              <button
                className="map-point p3 red-point"
                type="button"
                aria-label="High risk field"
              ></button>

              <button
                className="map-point p4 orange-point"
                type="button"
                aria-label="Medium risk field"
              ></button>

              <button
                className="map-point p5 green-point"
                type="button"
                aria-label="Normal field"
              ></button>

              <button
                className="map-point p6 red-point"
                type="button"
                aria-label="High risk field"
              ></button>

              <button
                className="map-point p7 green-point"
                type="button"
                aria-label="Normal field"
              ></button>


              <div className="map-center-label">

                <Map size={16} />

                Agricultural Monitoring Area

              </div>

            </div>

          </div>


          {/* =================================================
              FIELD ANALYSIS PANEL
          ================================================== */}

          <div className="panel field-panel">


            <div className="panel-header">

              <div>

                <span className="panel-label">
                  FIELD ANALYSIS
                </span>

                <h3>
                  Selected Field
                </h3>

              </div>


              <span
                className={`risk-badge ${status}`}
              >

                {statusLabel}

              </span>

            </div>


            {/* FIELD SELECTOR */}

            <div className="field-selector">

              <label htmlFor="field-select">
                Select field
              </label>

              <select
                id="field-select"
                value={selectedField.id}
                onChange={handleFieldChange}
              >

                {fields.map((field) => (

                  <option
                    key={field.id}
                    value={field.id}
                  >

                    {field.id} — {field.district}

                  </option>

                ))}

              </select>

            </div>


            {/* LOCATION */}

            <div className="field-location">

              <div className="location-icon">

                <Map size={18} />

              </div>


              <div>

                <strong>
                  {selectedField.district}
                </strong>

                <span>
                  {selectedField.state}
                </span>

              </div>

            </div>


            {/* FIELD METRICS */}

            <div className="metrics">


              <div>

                <span>
                  Previous Yield
                </span>

                <strong>
                  {selectedField.previous_year_yield.toFixed(2)}
                </strong>

              </div>


              <div>

                <span>
                  3Y Avg Yield
                </span>

                <strong>
                  {selectedField.rolling_3y_yield.toFixed(2)}
                </strong>

              </div>


              <div>

                <span>
                  Area
                </span>

                <strong>
                  {selectedField.area.toLocaleString()}
                </strong>

              </div>


            </div>


            {/* ANALYZE BUTTON */}

            <button
              className="analyze-button"
              onClick={analyzeField}
              disabled={loading}
              type="button"
            >

              {loading ? (

                <span className="analyze-loading">
                  <span>Analyzing Field {selectedField.id}</span>
                  <span className="loading-stages" aria-hidden="true">
                    <span className={analysisStage >= 0 ? "complete" : ""}>Historical Data</span>
                    <span className={analysisStage >= 1 ? "complete" : ""}>Predictive Model</span>
                    <span className={analysisStage >= 2 ? "complete" : ""}>Satellite Signal</span>
                    <span className={analysisStage >= 3 ? "complete" : ""}>Weather Context</span>
                  </span>
                </span>

              ) : (

                <>

                  <BrainCircuit size={18} />

                  Analyze Field

                  <ChevronRight size={18} />

                </>

              )}

            </button>


            {/* ERROR */}

            {error && (

              <div className="error-message">

                <AlertTriangleIcon />

                {error}

              </div>

            )}


            {/* INTELLIGENCE */}

            {intelligence && (

              <div className="prediction-card result-reveal">

                <div className="prediction-icon">

                  <Activity size={22} />

                </div>


                <div>

                  <span>
                    MODEL PREDICTION
                  </span>

                  <strong>
                    {intelligence.predicted_yield} t/ha
                  </strong>

                  <small>
                    Predicted rice yield
                  </small>

                </div>

                <div>
                  <span>HISTORICAL BASELINE</span>
                  <strong>{intelligence.rolling_3y_yield} t/ha</strong>
                </div>

                <div>
                  <span>YIELD GAP</span>
                  <strong>{intelligence.yield_gap_percent}%</strong>
                </div>

                <div>
                  <span>NDVI</span>
                  <strong>{intelligence.NDVI}</strong>
                </div>

                <div>
                  <span>TEMPERATURE</span>
                  <strong>{intelligence["current temperature"]} °C</strong>
                </div>

                <div>
                  <span>HUMIDITY</span>
                  <strong>{intelligence["current humidity"]} %</strong>
                </div>

                <div>
                  <span>CURRENT PRECIPITATION</span>
                  <strong>{intelligence["current precipitation"]} mm</strong>
                </div>

                <div>
                  <span>SATELLITE</span>
                  <strong>{intelligence["NDVI scene date"]}</strong>
                </div>

                <div>
                  <span>CLOUD COVER</span>
                  <strong>{intelligence["satellite cloud cover"]} %</strong>
                </div>

              </div>

            )}

          </div>

        </section>


        {/* ===================================================
            LOWER DASHBOARD
        ==================================================== */}

        <section className="lower-grid">


          {/* PRIORITY FIELDS */}

          <div className="panel priority-panel">

            <div className="panel-header">

              <div>

                <span className="panel-label">
                  PROFESSIONAL ACTION QUEUE
                </span>

                <h3>
                  Priority Fields
                </h3>

              </div>

              <span className="view-all">
                View all
              </span>

            </div>


            <div className="priority-list">


              <div className="priority-row">

                <div className="priority-number">
                  01
                </div>

                <div className="priority-info">

                  <strong>
                    Field F027
                  </strong>

                  <span>
                    ANANTAPUR • Andhra Pradesh
                  </span>

                </div>

                <div className="priority-risk high">
                  HIGH
                </div>

                <ChevronRight size={17} />

              </div>


              <div className="priority-row">

                <div className="priority-number">
                  02
                </div>

                <div className="priority-info">

                  <strong>
                    Field F041
                  </strong>

                  <span>
                    LUCKNOW • Uttar Pradesh
                  </span>

                </div>

                <div className="priority-risk medium">
                  MONITOR
                </div>

                <ChevronRight size={17} />

              </div>


              <div className="priority-row">

                <div className="priority-number">
                  03
                </div>

                <div className="priority-info">

                  <strong>
                    Field F063
                  </strong>

                  <span>
                    24 PARAGANAS NORTH • West Bengal
                  </span>

                </div>

                <div className="priority-risk low">
                  NORMAL
                </div>

                <ChevronRight size={17} />

              </div>


            </div>

          </div>


          {/* AI ADVISOR */}

          <div className="panel advisor-panel">

            <div className="panel-header">

              <div>

                <span className="panel-label">
                  AI ADVISOR
                </span>

                <h3>
                  AgriNexa Intelligence
                </h3>

              </div>

              <BrainCircuit size={22} />

            </div>


            <div className="advisor-message">

              <div className="advisor-icon">

                <BrainCircuit size={18} />

              </div>


              <p>
                {intelligence
                  ? `Projected yield is ${intelligence.predicted_yield} t/ha against a historical baseline of ${intelligence.rolling_3y_yield} t/ha, representing a ${intelligence.yield_gap_percent}% yield gap. Current vegetation and weather signals are provided as monitoring context.`
                  : "Select a field and run analysis to generate a professional recommendation."}
              </p>

            </div>


            <div className="advisor-placeholder">

              <CloudSun size={25} />

              {intelligence ? (
                <div>
                  <span>MONITORING CONTEXT</span>
                  <p>NDVI: {intelligence.NDVI}</p>
                  <p>Temperature: {intelligence["current temperature"]} °C</p>
                  <p>Humidity: {intelligence["current humidity"]} %</p>
                  <p>3-day rainfall total: {rainfallTotal} mm</p>
                </div>
              ) : (
                <span>Predictive context will appear here</span>
              )}

            </div>

          </div>


        </section>


        {/* ===================================================
            FOOTER
        ==================================================== */}

        <footer>

          <span>
            AgriNexa v0.1
          </span>

          <span>
            Predictive Agricultural Intelligence
          </span>

        </footer>

      </main>

    </div>
  );
}


// ============================================================
// SMALL ERROR ICON
// ============================================================

function AlertTriangleIcon() {

  return (

    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >

      <path d="M10.3 3.3 2.2 17a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0Z" />

      <path d="M12 9v4" />

      <path d="M12 17h.01" />

    </svg>

  );
}


export default App;