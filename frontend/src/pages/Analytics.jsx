import { useState } from "react";
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Filter,
  Layers,
  Map,
} from "lucide-react";

export default function Analytics({ fields, onInspectField }) {
  const [filterState, setFilterState] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const highPriorityFields = fields.filter((f) => f.status === "high");
  const monitorFields = fields.filter((f) => f.status === "medium");
  const normalFields = fields.filter((f) => f.status === "low");

  const totalArea = fields.reduce((sum, f) => sum + f.area, 0);
  const avg3yYield = (
    fields.reduce((sum, f) => sum + f.rolling_3y_yield, 0) / fields.length
  ).toFixed(2);

  const filteredFields = fields.filter((field) => {
    const matchesFilter =
      filterState === "all"
        ? true
        : filterState === "high"
        ? field.status === "high"
        : filterState === "medium"
        ? field.status === "medium"
        : field.status === "low";

    const matchesSearch =
      field.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.state.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="page-container fade-in">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <p className="eyebrow">PORTFOLIO TELEMETRY</p>
          <h2>Portfolio Analytics</h2>
          <p className="subtitle">
            Aggregate analytical insights across {fields.length} monitored agricultural fields in India.
          </p>
        </div>
        <div className="top-status">
          <span></span> Analytics Engine Active
        </div>
      </div>

      {/* STATS */}
      <section className="stats">
        <div className="stat-card">
          <span>TOTAL FIELDS</span>
          <strong>{fields.length}</strong>
          <small>{totalArea.toLocaleString()} ha monitored</small>
        </div>

        <div className="stat-card danger">
          <span>HIGH PRIORITY</span>
          <strong>{String(highPriorityFields.length).padStart(2, "0")}</strong>
          <small>Requires immediate attention</small>
        </div>

        <div className="stat-card warning">
          <span>MONITOR</span>
          <strong>{String(monitorFields.length).padStart(2, "0")}</strong>
          <small>Emerging performance gaps</small>
        </div>

        <div className="stat-card success">
          <span>NORMAL</span>
          <strong>{String(normalFields.length).padStart(2, "0")}</strong>
          <small>Stable baseline yield</small>
        </div>
      </section>

      {/* ANALYTICAL VISUALIZATIONS */}
      <div className="analytics-top-grid">
        {/* PRIORITY DISTRIBUTION */}
        <div className="panel intel-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">RISK DISTRIBUTION</span>
              <h3>Portfolio Risk Breakdown</h3>
            </div>
            <BarChart3 size={20} className="glow-icon" />
          </div>

          <div className="risk-distribution-container">
            <div className="dist-segmented-bar">
              <div
                className="seg-part high-part"
                style={{ width: `${(highPriorityFields.length / fields.length) * 100}%` }}
                title={`High Priority: ${highPriorityFields.length}`}
              ></div>
              <div
                className="seg-part med-part"
                style={{ width: `${(monitorFields.length / fields.length) * 100}%` }}
                title={`Monitor: ${monitorFields.length}`}
              ></div>
              <div
                className="seg-part low-part"
                style={{ width: `${(normalFields.length / fields.length) * 100}%` }}
                title={`Normal: ${normalFields.length}`}
              ></div>
            </div>

            <div className="dist-legend-grid">
              <div className="dist-card high-card">
                <span className="dist-badge red">HIGH RISK</span>
                <strong>{highPriorityFields.length} Fields</strong>
                <small>{((highPriorityFields.length / fields.length) * 100).toFixed(1)}% of portfolio</small>
              </div>

              <div className="dist-card med-card">
                <span className="dist-badge orange">MONITOR</span>
                <strong>{monitorFields.length} Fields</strong>
                <small>{((monitorFields.length / fields.length) * 100).toFixed(1)}% of portfolio</small>
              </div>

              <div className="dist-card low-card">
                <span className="dist-badge green">NORMAL</span>
                <strong>{normalFields.length} Fields</strong>
                <small>{((normalFields.length / fields.length) * 100).toFixed(1)}% of portfolio</small>
              </div>
            </div>
          </div>
        </div>

        {/* INSIGHT CARDS */}
        <div className="panel intel-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">AUTOMATED PORTFOLIO INSIGHTS</span>
              <h3>Analytical Findings</h3>
            </div>
            <Layers size={20} className="glow-icon" />
          </div>

          <div className="insights-list">
            <div className="insight-row danger-border">
              <AlertTriangle size={18} className="text-red" />
              <div>
                <strong>{highPriorityFields.length} Fields Need Urgent Intervention</strong>
                <p>
                  Fields like {highPriorityFields[0]?.id} ({highPriorityFields[0]?.district}) exhibit historical yield deficits relative to 3Y averages.
                </p>
              </div>
            </div>

            <div className="insight-row success-border">
              <CheckCircle2 size={18} className="text-green" />
              <div>
                <strong>Average Portfolio Baseline Yield: {avg3yYield} t/ha</strong>
                <p>
                  Punjab & Tamil Nadu districts lead overall baseline productivity across the monitored regions.
                </p>
              </div>
            </div>

            <div className="insight-row warning-border">
              <Layers size={18} className="text-yellow" />
              <div>
                <strong>{monitorFields.length} Fields Under Moderate Monitoring</strong>
                <p>
                  Watch for emerging rainfall gaps or vegetation shifts during the upcoming crop season.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PORTFOLIO FIELD RISK TABLE */}
      <div className="panel table-panel">
        <div className="panel-header">
          <div>
            <span className="panel-label">FIELD PORTFOLIO MATRIX</span>
            <h3>Field Performance Directory ({filteredFields.length})</h3>
          </div>

          <div className="table-controls">
            <input
              type="text"
              className="search-input"
              placeholder="Filter by Field, District, State..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              className="filter-select"
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High Priority Only</option>
              <option value="medium">Monitor Only</option>
              <option value="low">Normal Only</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>FIELD ID</th>
                <th>LOCATION</th>
                <th>SEASON</th>
                <th>AREA (HA)</th>
                <th>PREV YIELD</th>
                <th>3Y AVG YIELD</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredFields.map((field) => (
                <tr key={field.id} className={`table-row ${field.status}`}>
                  <td>
                    <strong className="field-id-tag">{field.id}</strong>
                  </td>
                  <td>
                    <div className="loc-cell">
                      <Map size={14} />
                      <span>
                        {field.district}, <em>{field.state}</em>
                      </span>
                    </div>
                  </td>
                  <td>{field.season} ({field.year})</td>
                  <td>{field.area.toLocaleString()}</td>
                  <td>{field.previous_year_yield.toFixed(2)} t/ha</td>
                  <td>{field.rolling_3y_yield.toFixed(2)} t/ha</td>
                  <td>
                    <span
                      className={`risk-badge ${
                        field.status === "high"
                          ? "high"
                          : field.status === "medium"
                          ? "medium"
                          : "low"
                      }`}
                    >
                      {field.status === "high"
                        ? "HIGH PRIORITY"
                        : field.status === "medium"
                        ? "MONITOR"
                        : "NORMAL"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="inspect-btn"
                      onClick={() => onInspectField(field)}
                      title="Inspect Field Intelligence"
                    >
                      Inspect <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
