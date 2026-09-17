import { useState, useEffect } from "react";
import {
  BrainCircuit,
  ShieldAlert,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  ListOrdered,
  Layers,
  Sparkles,
  Map,
  RefreshCw,
} from "lucide-react";

export default function AIAdvisor({
  fields,
  selectedField,
  onSelectField,
  intelligence,
  loading,
  onAnalyze,
}) {
  useEffect(() => {
    if (!intelligence && !loading && onAnalyze) {
      onAnalyze();
    }
  }, [selectedField.id]);

  // Sort fields by priority (high -> medium -> low)
  const sortedQueue = [...fields].sort((a, b) => {
    const priorityWeight = { high: 1, medium: 2, low: 3 };
    return priorityWeight[a.status] - priorityWeight[b.status];
  });

  const highCount = fields.filter((f) => f.status === "high").length;
  const medCount = fields.filter((f) => f.status === "medium").length;
  const lowCount = fields.filter((f) => f.status === "low").length;

  const displayYieldGap = intelligence
    ? intelligence.yield_gap_percent
    : Number(
        (
          ((selectedField.previous_year_yield - selectedField.rolling_3y_yield) /
            selectedField.rolling_3y_yield) *
          100
        ).toFixed(1)
      );

  const status = intelligence?.decision?.priority
    ? intelligence.decision.priority.toUpperCase().includes("HIGH")
      ? "high"
      : intelligence.decision.priority.toUpperCase().includes("MONITOR")
      ? "medium"
      : "low"
    : selectedField.status;

  const statusLabel =
    status === "high"
      ? "HIGH PRIORITY"
      : status === "medium"
      ? "MONITOR"
      : "NORMAL";

  const initialDecision = {
    priority: statusLabel,
    priority_score: status === "high" ? 3 : status === "medium" ? 2 : 1,
    reason:
      status === "high"
        ? `Field ${selectedField.id} in ${selectedField.district} exhibits a critical yield deficit (${displayYieldGap}%) falling below the learned high-priority threshold (-12.47%).`
        : status === "medium"
        ? `Field ${selectedField.id} in ${selectedField.district} displays a yield gap (${displayYieldGap}%) within the learned monitoring boundary (+3.54%).`
        : `Field ${selectedField.id} in ${selectedField.district} operates within normal historical yield performance parameters (+${Math.abs(displayYieldGap)}%).`,
    recommended_action:
      status === "high"
        ? "Prioritize immediate field inspection, verify soil moisture levels, and schedule corrective nutrient enrichment."
        : status === "medium"
        ? "Increase monitoring frequency and re-check vegetation health index before next irrigation cycle."
        : "Maintain standard routine field monitoring. No immediate escalation required.",
    historical_sample_size: 12042,
    decision_boundaries: {
      high_priority_below_or_equal: -12.47,
      monitor_below_or_equal: 3.54,
    },
  };

  const decisionObj = intelligence?.decision || initialDecision;

  return (
    <div className="page-container fade-in">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <p className="eyebrow">DETERMINISTIC SINGLE DECISION AGENT</p>
          <h2>AI Advisor</h2>
          <p className="subtitle">
            Analytical decision support for agricultural professionals. Powered by statistical boundary rules and historical data.
          </p>
        </div>
        <div className="top-status purple">
          <span></span> Rule Engine Active
        </div>
      </div>

      {/* SECTION A: CURRENT PRIORITY SUMMARY */}
      <section className="stats">
        <div className="stat-card danger">
          <span>HIGH PRIORITY QUEUE</span>
          <strong>{String(highCount).padStart(2, "0")}</strong>
          <small>Critical yield deficits requiring immediate intervention</small>
        </div>

        <div className="stat-card warning">
          <span>MONITOR QUEUE</span>
          <strong>{String(medCount).padStart(2, "0")}</strong>
          <small>Emerging performance gaps under close watch</small>
        </div>

        <div className="stat-card success">
          <span>NORMAL QUEUE</span>
          <strong>{String(lowCount).padStart(2, "0")}</strong>
          <small>Operating within normal expected parameters</small>
        </div>

        <div className="stat-card">
          <span>HISTORICAL SAMPLES</span>
          <strong>12,042</strong>
          <small>Trained rice-yield baseline dataset</small>
        </div>
      </section>

      {/* MAIN ADVISOR GRID */}
      <div className="advisor-main-grid">
        {/* LEFT COLUMN: ACTIVE FIELD DECISION PROFILE */}
        <div className="panel advisor-intel-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">ACTIVE FIELD DECISION PROFILE</span>
              <h3>
                Field {selectedField.id} — {selectedField.district}
              </h3>
            </div>
            <button
              className="analyze-button compact-btn"
              onClick={onAnalyze}
              disabled={loading}
              type="button"
            >
              {loading ? (
                <RefreshCw size={14} className="spin" />
              ) : (
                <>
                  <BrainCircuit size={15} /> Evaluate Rules
                </>
              )}
            </button>
          </div>

          <div className="field-select-inline">
            <label htmlFor="advisor-field-select">Select Target Field:</label>
            <select
              id="advisor-field-select"
              value={selectedField.id}
              onChange={(e) => {
                const found = fields.find((f) => f.id === e.target.value);
                if (found) onSelectField(found);
              }}
            >
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  [{f.status === "high" ? "HIGH PRIORITY" : f.status === "medium" ? "MONITOR" : "NORMAL"}] {f.id} — {f.district}, {f.state}
                </option>
              ))}
            </select>
          </div>

          <div className="decision-card-detailed">
            <div className="dec-header-bar">
              <div>
                <span className="dec-tag-label">PRIORITY EVALUATION</span>
                <div
                  className={`dec-priority-tag ${decisionObj.priority
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {decisionObj.priority}
                </div>
              </div>
              <div className="dec-score-pill">
                Score: {decisionObj.priority_score}
              </div>
            </div>

            <div className="dec-section">
              <span className="dec-section-title">ANALYTICAL DIAGNOSIS</span>
              <p className="dec-section-text">{decisionObj.reason}</p>
            </div>

            <div className="dec-section action-box">
              <span className="dec-section-title">RECOMMENDED ACTION</span>
              <p className="dec-action-text">
                {decisionObj.recommended_action}
              </p>
            </div>

            <div className="dec-section">
              <span className="dec-section-title">SUPPORTING SIGNALS</span>
              <div className="signals-grid">
                <div className="sig-item">
                  <span>Predicted Yield:</span>
                  <strong>
                    {intelligence?.predicted_yield || selectedField.previous_year_yield.toFixed(2)} t/ha
                  </strong>
                </div>
                <div className="sig-item">
                  <span>3Y Average:</span>
                  <strong>
                    {intelligence?.rolling_3y_yield || selectedField.rolling_3y_yield.toFixed(2)} t/ha
                  </strong>
                </div>
                <div className="sig-item">
                  <span>Yield Gap:</span>
                  <strong>{displayYieldGap}%</strong>
                </div>
                <div className="sig-item">
                  <span>Vegetation NDVI:</span>
                  <strong>{intelligence?.NDVI || 0.2841}</strong>
                </div>
              </div>
            </div>

            {/* SECTION D: DECISION TRANSPARENCY */}
            <div className="transparency-footer">
              <Sparkles size={16} className="text-cyan" />
              <div>
                <strong>Decision Transparency Notice</strong>
                <p>
                  Decision generated from historical agricultural performance distribution and current analytical signals.
                </p>
                <small>
                  High Priority Boundary ≤ {decisionObj.decision_boundaries?.high_priority_below_or_equal || -12.47}% Yield Gap | Monitor Boundary ≤ {decisionObj.decision_boundaries?.monitor_below_or_equal || 3.54}% Yield Gap
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SECTION C: PROFESSIONAL ACTION QUEUE */}
        <div className="panel advisor-queue-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">RANKED RISK MATRIX</span>
              <h3>Action Queue ({sortedQueue.length})</h3>
            </div>
            <ListOrdered size={20} className="glow-icon" />
          </div>

          <div className="queue-list">
            {sortedQueue.map((item, index) => (
              <div
                key={item.id}
                className={`queue-item ${item.id === selectedField.id ? "active-queue" : ""} ${item.status}`}
                onClick={() => onSelectField(item)}
              >
                <div className="queue-rank">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="queue-info">
                  <div className="queue-title-row">
                    <strong>Field {item.id}</strong>
                    <span className={`risk-badge ${item.status}`}>
                      {item.status === "high"
                        ? "HIGH PRIORITY"
                        : item.status === "medium"
                        ? "MONITOR"
                        : "NORMAL"}
                    </span>
                  </div>
                  <span className="queue-sub">
                    {item.district}, {item.state} • {item.season}
                  </span>
                </div>

                <ChevronRight size={16} className="queue-arrow" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
