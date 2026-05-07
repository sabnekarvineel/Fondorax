import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FiDownload, FiAlertCircle, FiCheck } from "react-icons/fi";
import "../styles/AnalysisDashboard.css";

export default function AnalysisDashboard({ analysis }) {
  const [radarData, setRadarData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Prepare radar chart data
    if (analysis?.analysis?.scores) {
      const scores = analysis.analysis.scores;
      setRadarData([
        { category: "Founder", value: scores.founder },
        { category: "Market", value: scores.market },
        { category: "Traction", value: scores.traction },
        { category: "Finance", value: scores.finance },
        { category: "Risk", value: scores.risk },
      ]);
    }
    setIsLoading(false);
  }, [analysis]);

  const colors = {
    excellent: "#10b981",
    good: "#3b82f6",
    average: "#f59e0b",
    poor: "#ef4444",
  };

  const getScoreColor = (score) => {
    if (score >= 80) return colors.excellent;
    if (score >= 70) return colors.good;
    if (score >= 60) return colors.average;
    return colors.poor;
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case "low":
        return colors.excellent;
      case "medium":
        return colors.average;
      case "high":
        return colors.poor;
      case "critical":
        return "#7f1d1d";
      default:
        return colors.average;
    }
  };

  const scoreDistribution = [
    { name: "Founder", value: analysis?.analysis?.scores?.founder || 0 },
    { name: "Market", value: analysis?.analysis?.scores?.market || 0 },
    { name: "Traction", value: analysis?.analysis?.scores?.traction || 0 },
    { name: "Finance", value: analysis?.analysis?.scores?.finance || 0 },
  ];

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];

  if (isLoading) {
    return <div className="loading">Loading analysis...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>{analysis?.startup?.name}</h1>
          <p className="subtitle">
            {analysis?.startup?.industry} • {analysis?.startup?.stage}
          </p>
        </div>
        <button className="download-button">
          <FiDownload /> Download Report
        </button>
      </div>

      {/* Executive Summary */}
      <section className="card summary-card">
        <h2>Executive Summary</h2>
        <p className="summary-text">{analysis?.analysis?.summary}</p>
      </section>

      {/* Overall Score Card */}
      <section className="scores-grid">
        <div className="score-card primary-score">
          <h3>Overall Score</h3>
          <div className="score-value" style={{ color: getScoreColor(analysis?.analysis?.scores?.total) }}>
            {analysis?.analysis?.scores?.total}/100
          </div>
          <p className="recommendation">{analysis?.analysis?.recommendation}</p>
        </div>

        <div className="score-card">
          <h3>Risk Level</h3>
          <div
            className="risk-badge"
            style={{ backgroundColor: getRiskColor(analysis?.analysis?.riskLevel) }}
          >
            {analysis?.analysis?.riskLevel}
          </div>
          <p className="risk-details">{analysis?.analysis?.riskDetails}</p>
        </div>
      </section>

      {/* Category Scores */}
      <section className="scores-breakdown">
        <h2>Score Breakdown</h2>
        <div className="score-items">
          <div className="score-item">
            <div className="score-label">Founder/Team</div>
            <div className="score-bar">
              <div
                className="score-fill"
                style={{
                  width: `${analysis?.analysis?.scores?.founder || 0}%`,
                  backgroundColor: getScoreColor(analysis?.analysis?.scores?.founder),
                }}
              ></div>
            </div>
            <div className="score-number">{analysis?.analysis?.scores?.founder}/100</div>
          </div>

          <div className="score-item">
            <div className="score-label">Market Opportunity</div>
            <div className="score-bar">
              <div
                className="score-fill"
                style={{
                  width: `${analysis?.analysis?.scores?.market || 0}%`,
                  backgroundColor: getScoreColor(analysis?.analysis?.scores?.market),
                }}
              ></div>
            </div>
            <div className="score-number">{analysis?.analysis?.scores?.market}/100</div>
          </div>

          <div className="score-item">
            <div className="score-label">Traction</div>
            <div className="score-bar">
              <div
                className="score-fill"
                style={{
                  width: `${analysis?.analysis?.scores?.traction || 0}%`,
                  backgroundColor: getScoreColor(analysis?.analysis?.scores?.traction),
                }}
              ></div>
            </div>
            <div className="score-number">{analysis?.analysis?.scores?.traction}/100</div>
          </div>

          <div className="score-item">
            <div className="score-label">Financial Health</div>
            <div className="score-bar">
              <div
                className="score-fill"
                style={{
                  width: `${analysis?.analysis?.scores?.finance || 0}%`,
                  backgroundColor: getScoreColor(analysis?.analysis?.scores?.finance),
                }}
              ></div>
            </div>
            <div className="score-number">{analysis?.analysis?.scores?.finance}/100</div>
          </div>

          <div className="score-item">
            <div className="score-label">Risk Assessment</div>
            <div className="score-bar">
              <div
                className="score-fill"
                style={{
                  width: `${analysis?.analysis?.scores?.risk || 0}%`,
                  backgroundColor: getScoreColor(analysis?.analysis?.scores?.risk),
                }}
              ></div>
            </div>
            <div className="score-number">{analysis?.analysis?.scores?.risk}/100</div>
          </div>
        </div>
      </section>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Radar Chart */}
        <section className="card chart-card">
          <h3>Score Balance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </section>

        {/* Score Distribution Pie Chart */}
        <section className="card chart-card">
          <h3>Score Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={scoreDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {scoreDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </section>
      </div>

      {/* Strengths & Risks */}
      <section className="strengths-risks">
        <div className="card strength-card">
          <h3>
            <FiCheck className="icon" /> Key Strengths
          </h3>
          <ul>
            {analysis?.analysis?.strengths?.length > 0 ? (
              analysis.analysis.strengths.map((strength, idx) => (
                <li key={idx}>{strength}</li>
              ))
            ) : (
              <li>No specific strengths identified</li>
            )}
          </ul>
        </div>

        <div className="card risk-card">
          <h3>
            <FiAlertCircle className="icon" /> Risk Factors
          </h3>
          <ul>
            {analysis?.analysis?.risks?.length > 0 ? (
              analysis.analysis.risks.map((risk, idx) => (
                <li key={idx}>{risk}</li>
              ))
            ) : (
              <li>No specific risks identified</li>
            )}
          </ul>
        </div>
      </section>

      {/* Business Details */}
      <section className="card details-card">
        <h3>Business Details</h3>
        <div className="details-grid">
          <div className="detail-item">
            <label>Problem Statement</label>
            <p>{analysis?.analysis?.problemStatement || "Not available"}</p>
          </div>
          <div className="detail-item">
            <label>Market Size</label>
            <p>{analysis?.analysis?.marketSize || "Not specified"}</p>
          </div>
          <div className="detail-item">
            <label>Revenue Model</label>
            <p>{analysis?.analysis?.revenueModel || "Not specified"}</p>
          </div>
        </div>
      </section>

      {/* Financial Metrics */}
      {analysis?.metrics && (
        <section className="card metrics-card">
          <h3>Financial Metrics</h3>
          <div className="metrics-grid">
            <div className="metric">
              <label>Annual Revenue</label>
              <p>${analysis?.metrics?.revenue?.toLocaleString() || "0"}</p>
            </div>
            <div className="metric">
              <label>Growth Rate</label>
              <p>{analysis?.metrics?.growthRate || "0"}%</p>
            </div>
            <div className="metric">
              <label>Active Users</label>
              <p>{analysis?.metrics?.activeUsers?.toLocaleString() || "0"}</p>
            </div>
            <div className="metric">
              <label>Runway</label>
              <p>{analysis?.metrics?.runway || "0"} months</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
