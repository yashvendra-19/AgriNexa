import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Calendar,
  Map,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  CloudSun,
  Layers,
  History,
  FileCheck,
} from "lucide-react";

export default function Reports({
  fields,
  selectedField,
  onSelectField,
  intelligence,
  onAnalyze,
  loading,
}) {
  const [reportHistory, setReportHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("agrinexa_report_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Whenever a new intelligence object arrives, add to history if not already present
  useEffect(() => {
    if (intelligence && selectedField) {
      const newEntry = {
        id: `RPT-${selectedField.id}-${Date.now().toString().slice(-4)}`,
        fieldId: selectedField.id,
        district: selectedField.district,
        state: selectedField.state,
        season: selectedField.season,
        area: selectedField.area,
        timestamp: new Date().toLocaleString(),
        predicted_yield: intelligence.predicted_yield,
        rolling_3y_yield: intelligence.rolling_3y_yield,
        yield_gap_percent: intelligence.yield_gap_percent,
        ndvi: intelligence.NDVI,
        temperature: intelligence["current temperature"],
        humidity: intelligence["current humidity"],
        decision: intelligence.decision,
      };

      setReportHistory((prev) => {
        const filtered = prev.filter((r) => r.fieldId !== selectedField.id);
        const updated = [newEntry, ...filtered].slice(0, 10);
        try {
          localStorage.setItem("agrinexa_report_history", JSON.stringify(updated));
        } catch (e) {
          console.warn("Storage error", e);
        }
        return updated;
      });
    }
  }, [intelligence, selectedField]);

  const handleDownloadReport = () => {
    const reportData = {
      title: `AgriNexa Agricultural Intelligence Report - Field ${selectedField.id}`,
      generated_at: new Date().toISOString(),
      field_specifications: {
        id: selectedField.id,
        district: selectedField.district,
        state: selectedField.state,
        season: selectedField.season,
        year: selectedField.year,
        area_ha: selectedField.area,
        previous_year_yield_t_ha: selectedField.previous_year_yield,
        rolling_3y_yield_t_ha: selectedField.rolling_3y_yield,
        coordinates: {
          latitude: selectedField.latitude,
          longitude: selectedField.longitude,
        },
      },
      predictive_intelligence: intelligence
        ? {
            predicted_yield_t_ha: intelligence.predicted_yield,
            rolling_3y_yield_baseline_t_ha: intelligence.rolling_3y_yield,
            yield_gap_percent: intelligence.yield_gap_percent,
          }
        : "Analysis pending",
      satellite_ndvi_context: intelligence
        ? {
            mean_ndvi: intelligence.NDVI,
            scene_date: intelligence["NDVI scene date"],
            cloud_cover_percent: intelligence["satellite cloud cover"],
            note: "NDVI is used as a supporting vegetation monitoring signal.",
          }
        : "Analysis pending",
      weather_context: intelligence
        ? {
            current_temperature_c: intelligence["current temperature"],
            current_humidity_percent: intelligence["current humidity"],
            current_precipitation_mm: intelligence["current precipitation"],
            short_term_rainfall_forecast: intelligence["short-term rainfall"],
          }
        : "Analysis pending",
      decision_agent: intelligence?.decision
        ? intelligence.decision
        : "No decision generated yet",
    };

    const textContent = `===========================================================
AGRINEXA AGRICULTURAL INTELLIGENCE REPORT
Generated: ${new Date().toLocaleString()}
===========================================================

FIELD INFORMATION
-----------------
Field ID       : ${selectedField.id}
District/State : ${selectedField.district}, ${selectedField.state}
Crop Season    : ${selectedField.season} (${selectedField.year})
Total Area     : ${selectedField.area.toLocaleString()} ha
Coordinates    : ${selectedField.latitude}°N, ${selectedField.longitude}°E

PREDICTIVE YIELD ANALYSIS
-------------------------
Predicted Yield   : ${intelligence ? intelligence.predicted_yield + " t/ha" : "N/A"}
3Y Rolling Avg    : ${intelligence ? intelligence.rolling_3y_yield + " t/ha" : selectedField.rolling_3y_yield.toFixed(2) + " t/ha"}
Yield Gap (%)     : ${intelligence ? intelligence.yield_gap_percent + "%" : "N/A"}

SATELLITE & VEGETATION
----------------------
Mean NDVI         : ${intelligence ? intelligence.NDVI : "N/A"}
Scene Date        : ${intelligence ? intelligence["NDVI scene date"] : "N/A"}
Cloud Cover       : ${intelligence ? intelligence["satellite cloud cover"] + "%" : "N/A"}

WEATHER CONTEXT
---------------
Temperature       : ${intelligence ? intelligence["current temperature"] + " °C" : "N/A"}
Humidity          : ${intelligence ? intelligence["current humidity"] + "%" : "N/A"}

AI DECISION AGENT GUIDANCE
--------------------------
Priority          : ${intelligence?.decision ? intelligence.decision.priority : selectedField.status.toUpperCase()}
Reason            : ${intelligence?.decision ? intelligence.decision.reason : "N/A"}
Recommended Action: ${intelligence?.decision ? intelligence.decision.recommended_action : "N/A"}

===========================================================
CONFIDENTIAL AGRICULTURAL INTELLIGENCE - AGRINEXA MVP
===========================================================`;

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `AgriNexa_Report_Field_${selectedField.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container fade-in">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <p className="eyebrow">EXECUTIVE DOCUMENTATION</p>
          <h2>Intelligence Reports</h2>
          <p className="subtitle">
            Generate, review, and export comprehensive field intelligence summaries.
          </p>
        </div>
        <div className="top-status">
          <span></span> Export Center Ready
        </div>
      </div>

      {/* TOP SELECTION & EXPORT TOOLBAR */}
      <div className="panel field-select-bar">
        <div className="field-select-info">
          <div className="location-icon">
            <FileText size={20} />
          </div>
          <div>
            <h3>
              Report for Field {selectedField.id} ({selectedField.district})
            </h3>
            <span>
              {selectedField.state} • {selectedField.season} • Area: {selectedField.area.toLocaleString()} ha
            </span>
          </div>
        </div>

        <div className="field-select-actions">
          <div className="select-wrapper">
            <label htmlFor="report-field-select">Select Field Report:</label>
            <select
              id="report-field-select"
              value={selectedField.id}
              onChange={(e) => {
                const found = fields.find((f) => f.id === e.target.value);
                if (found) onSelectField(found);
              }}
            >
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.id} — {f.district}, {f.state}
                </option>
              ))}
            </select>
          </div>

          <button
            className="analyze-button download-btn"
            onClick={handleDownloadReport}
            type="button"
          >
            <Download size={18} />
            Export Report (.TXT)
          </button>
        </div>
      </div>

      {/* MAIN REPORT VIEW & HISTORY */}
      <div className="report-main-grid">
        {/* LEFT: REPORT DOCUMENT VIEW */}
        <div className="panel report-doc-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">OFFICIAL REPORT PREVIEW</span>
              <h3>Field Intelligence Report #{selectedField.id}</h3>
            </div>
            <FileCheck size={22} className="glow-icon" />
          </div>

          <div className="report-paper">
            {/* SECTION A: REPORT SUMMARY */}
            <div className="rpt-section-header">
              <span className="rpt-badge">SUMMARY SPECIFICATIONS</span>
              <span className="rpt-date">Date: {new Date().toLocaleDateString()}</span>
            </div>

            <div className="rpt-spec-grid">
              <div className="rpt-spec-item">
                <span>Field ID:</span>
                <strong>{selectedField.id}</strong>
              </div>
              <div className="rpt-spec-item">
                <span>District:</span>
                <strong>{selectedField.district}</strong>
              </div>
              <div className="rpt-spec-item">
                <span>State:</span>
                <strong>{selectedField.state}</strong>
              </div>
              <div className="rpt-spec-item">
                <span>Season:</span>
                <strong>{selectedField.season} ({selectedField.year})</strong>
              </div>
              <div className="rpt-spec-item">
                <span>Total Area:</span>
                <strong>{selectedField.area.toLocaleString()} ha</strong>
              </div>
              <div className="rpt-spec-item">
                <span>Coordinates:</span>
                <strong>{selectedField.latitude}°N, {selectedField.longitude}°E</strong>
              </div>
            </div>

            {/* SECTION B: DETAILED ANALYSIS */}
            <div className="rpt-divider"></div>

            <div className="rpt-block">
              <h4>1. Agricultural Yield Analytics</h4>
              {intelligence ? (
                <div className="rpt-metrics-row">
                  <div className="rpt-metric-box">
                    <span>Predicted Yield</span>
                    <strong>{intelligence.predicted_yield} t/ha</strong>
                  </div>
                  <div className="rpt-metric-box">
                    <span>3Y Baseline</span>
                    <strong>{intelligence.rolling_3y_yield} t/ha</strong>
                  </div>
                  <div className="rpt-metric-box">
                    <span>Yield Gap</span>
                    <strong className={intelligence.yield_gap_percent < 0 ? "text-red" : "text-green"}>
                      {intelligence.yield_gap_percent}%
                    </strong>
                  </div>
                </div>
              ) : (
                <p className="rpt-pending-text">
                  Analysis not yet executed for this field session. Historical 3-Year Baseline: {selectedField.rolling_3y_yield.toFixed(2)} t/ha.
                </p>
              )}
            </div>

            <div className="rpt-block">
              <h4>2. Satellite Vegetation & Environmental Signals</h4>
              {intelligence ? (
                <div className="rpt-metrics-row">
                  <div className="rpt-metric-box">
                    <span>Mean NDVI</span>
                    <strong>{intelligence.NDVI}</strong>
                  </div>
                  <div className="rpt-metric-box">
                    <span>Scene Date</span>
                    <strong>{intelligence["NDVI scene date"]?.split(" ")[0]}</strong>
                  </div>
                  <div className="rpt-metric-box">
                    <span>Temperature</span>
                    <strong>{intelligence["current temperature"]} °C</strong>
                  </div>
                  <div className="rpt-metric-box">
                    <span>Humidity</span>
                    <strong>{intelligence["current humidity"]} %</strong>
                  </div>
                </div>
              ) : (
                <p className="rpt-pending-text">
                  Satellite NDVI & Open-Meteo context data pending analysis.
                </p>
              )}
            </div>

            <div className="rpt-block">
              <h4>3. AI Decision Agent Diagnosis & Recommendation</h4>
              {intelligence?.decision ? (
                <div className="rpt-decision-box">
                  <div className="rpt-dec-priority">
                    <span>Priority Level:</span>
                    <strong>{intelligence.decision.priority}</strong>
                  </div>
                  <div className="rpt-dec-text">
                    <strong>Analytical Diagnosis:</strong>
                    <p>{intelligence.decision.reason}</p>
                  </div>
                  <div className="rpt-dec-text">
                    <strong>Recommended Action:</strong>
                    <p>{intelligence.decision.recommended_action}</p>
                  </div>
                </div>
              ) : (
                <p className="rpt-pending-text">
                  Decision evaluation pending. Default Field Status: <strong>{selectedField.status.toUpperCase()}</strong>.
                </p>
              )}
            </div>

            {!intelligence && (
              <div className="rpt-action-bar">
                <button
                  className="analyze-button compact-btn"
                  onClick={onAnalyze}
                  disabled={loading}
                >
                  <BrainCircuit size={15} /> Run Live Analysis for Report
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: SECTION C: REPORT HISTORY */}
        <div className="panel report-history-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">SESSION ARCHIVE</span>
              <h3>Recent Reports History</h3>
            </div>
            <History size={20} className="glow-icon" />
          </div>

          <div className="history-list">
            {reportHistory.length > 0 ? (
              reportHistory.map((rpt) => (
                <div
                  key={rpt.id}
                  className={`history-item ${rpt.fieldId === selectedField.id ? "active-history" : ""}`}
                  onClick={() => {
                    const found = fields.find((f) => f.id === rpt.fieldId);
                    if (found) onSelectField(found);
                  }}
                >
                  <div className="history-title">
                    <strong>Field {rpt.fieldId}</strong>
                    <span>{rpt.timestamp}</span>
                  </div>
                  <div className="history-sub">
                    {rpt.district}, {rpt.state} • Yield Gap: {rpt.yield_gap_percent}%
                  </div>
                </div>
              ))
            ) : (
              <div className="intel-empty-state" style={{ padding: "30px 10px" }}>
                <History size={32} />
                <p>Run field analyses to accumulate recent report history during your session.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
