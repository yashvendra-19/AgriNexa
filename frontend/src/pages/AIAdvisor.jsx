import { useState } from "react";
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
  // Sort fields by priority (high -> medium -> low)
  const sortedQueue = [...fields].sort((a, b) => {
    const priorityWeight = { high: 1, medium: 2, low: 3 };
    return priorityWeight[a.status] - priorityWeight[b.status];
  });

  const highCount = fields.filter((f) => f.status === "high").length;
  const medCount = fields.filter((f) => f.status === "medium").length;
  const lowCount = fields.filter((f) => f.status === "low").length;

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
          <span>HISTORICAL BASES</span>
          <strong>5,124</strong>
          <small>Trained rice-yield baseline samples</small>
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
                  [{f.status.toUpperCase()}] {f.id} — {f.district}, {f.state}
                </option>
              ))}
            </select>
          </div>

          {intelligence?.decision ? (
            <div className="decision-card-detailed">
              <div className="dec-header-bar">
                <div>
                  <span className="dec-tag-label">PRIORITY EVALUATION</span>
                  <div
                    className={`dec-priority-tag ${intelligence.decision.priority
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {intelligence.decision.priority}
                  </div>
                </div>
                <div className="dec-score-pill">
                  Score: {intelligence.decision.priority_score}
                </div>
              </div>

              <div className="dec-section">
                <span className="dec-section-title">ANALYTICAL DIAGNOSIS</span>
                <p className="dec-section-text">{intelligence.decision.reason}</p>
              </div>

              <div className="dec-section action-box">
                <span className="dec-section-title">RECOMMENDED ACTION</span>
                <p className="dec-action-text">
                  {intelligence.decision.recommended_action}
                </p>
              </div>

              <div className="dec-section">
                <span className="dec-section-title">SUPPORTING SIGNALS</span>
                <div className="signals-grid">
                  <div className="sig-item">
                    <span>Predicted Yield:</span>
                    <strong>{intelligence.predicted_yield} t/ha</strong>
                  </div>
                  <div className="sig-item">
                    <span>3Y Average:</span>
                    <strong>{intelligence.rolling_3y_yield} t/ha</strong>
                  </div>
                  <div className="sig-item">
                    <span>Yield Gap:</span>
                    <strong>{intelligence.yield_gap_percent}%</strong>
                  </div>
                  <div className="sig-item">
                    <span>Vegetation NDVI:</span>
                    <strong>{intelligence.NDVI}</strong>
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
                    High Priority Boundary ≤ -15% Yield Gap | Monitor Boundary ≤ 0% Yield Gap
                  </small>
                </div>
              </div>
            </div>
          ) : (
            <div className="advisor-fallback-card">
              <BrainCircuit size={40} className="glow-icon-purple" />
              <h4>No Decision Computed for Field {selectedField.id}</h4>
              <p>
                Click "Evaluate Rules" above to trigger the Single Decision Agent analysis endpoint for this field.
              </p>
            </div>
          )}
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
                        ? "HIGH"
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
