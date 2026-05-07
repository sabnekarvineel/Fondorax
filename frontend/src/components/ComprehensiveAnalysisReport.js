import React, { useState } from 'react';
import './ComprehensiveAnalysisReport.css';
import { exportAnalysisPDF } from '../services/pitchAnalysisApi';

function ComprehensiveAnalysisReport({ analysisData }) {
  const [isExporting, setIsExporting] = useState(false);
  if (!analysisData) return null;

  console.log("ComprehensiveAnalysisReport received:", analysisData);

  // Handle nested data structure
  let analysis = analysisData.analysis;
  let startup = analysisData.startup;

  // If analysis is directly passed (from old structure or test data)
  if (!analysis && analysisData.overallScore !== undefined) {
    analysis = analysisData;
  }

  console.log("Extracted analysis:", analysis);
  console.log("Extracted startup:", startup);

  // Ensure dimensions exist - create empty ones if missing
  if (!analysis?.dimensions) {
    console.warn("Missing dimensions in analysis, creating defaults:", {
      hasAnalysis: !!analysis,
      analysisKeys: analysis ? Object.keys(analysis) : [],
    });
    
    // Create default dimensions structure if missing
    if (analysis) {
      analysis.dimensions = {
        founder: { score: 0, strengths: [], weaknesses: [] },
        problem: { score: 0, strengths: [], weaknesses: [] },
        market: { score: 0, strengths: [], weaknesses: [] },
        product: { score: 0, strengths: [], weaknesses: [] },
        traction: { score: 0, strengths: [], weaknesses: [] },
        businessModel: { score: 0, strengths: [], weaknesses: [] },
        financial: { score: 0, strengths: [], weaknesses: [] },
        competitive: { score: 0, strengths: [], weaknesses: [] },
      };
    }
  }

  if (!analysis) {
    return (
      <div className="comprehensive-report">
        <div className="report-header">
          <h1>Analysis Report</h1>
          <p className="subtitle">Unable to load analysis</p>
        </div>
        <div className="summary-section">
          <p>The analysis data could not be processed. Please try uploading your pitch deck again.</p>
        </div>
      </div>
    );
  }

  const dimensions = analysis.dimensions;

  const getRiskColor = (level) => {
    switch(level) {
      case 'Low': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'High': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const dimensionLabels = {
    founder: '👥 Founder & Team',
    problem: '🎯 Problem Validation',
    market: '📈 Market Opportunity',
    product: '🛠️ Product & Solution',
    traction: '🚀 Traction & Performance',
    businessModel: '💰 Business Model',
    financial: '📊 Financial Health',
    competitive: '⚔️ Competitive Position',
  };

  const runwayMonths = analysis.metrics?.runway || 0;
  const runwayColor = runwayMonths > 18 ? '#10b981' : runwayMonths > 12 ? '#f59e0b' : '#ef4444';

  const handleExportPDF = async () => {
    if (!analysisData._id) {
      alert('Analysis ID not found');
      return;
    }
    
    setIsExporting(true);
    try {
      await exportAnalysisPDF(analysisData._id);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Simple bar chart as HTML
  const ScoreBar = ({ score }) => (
    <div className="score-bar">
      <div 
        className="score-fill" 
        style={{
          width: `${score}%`,
          backgroundColor: score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
        }}
      ></div>
    </div>
  );

  return (
    <div className="comprehensive-report">
      {/* Header */}
      <div className="report-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Comprehensive Investment Analysis</h1>
            <p className="subtitle">
              {startup?.name || analysisData.startup?.name || 'Unknown Startup'} - {startup?.stage || analysisData.startup?.stage || 'Unknown Stage'}
            </p>
          </div>
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1e40af',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              opacity: isExporting ? 0.6 : 1,
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            {isExporting ? '⏳ Exporting...' : '📥 Export as PDF'}
          </button>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="overall-section">
        <div className="score-card">
          <div className="score-circle" style={{ 
            backgroundColor: (analysis.overallScore || 0) >= 70 ? '#10b981' : (analysis.overallScore || 0) >= 50 ? '#f59e0b' : '#ef4444'
          }}>
            <div className="score-number">{analysis.overallScore || 0}</div>
            <div className="score-label">Overall Score</div>
          </div>
        </div>

        <div className="risk-assessment-card">
          <h3>Risk Assessment</h3>
          <div className="risk-badge" style={{ backgroundColor: getRiskColor(analysis.riskLevel) }}>
            {analysis.riskLevel || 'Medium'} Risk
          </div>
          <p className="recommendation-text">{analysis.recommendation || 'Assessment in progress...'}</p>
        </div>

        <div className="runway-card">
          <h3>Runway</h3>
          <div className="runway-display">
            <div className="runway-value" style={{ color: runwayColor }}>
              {runwayMonths} <span>months</span>
            </div>
            <div className="runway-indicator" style={{ backgroundColor: runwayColor }}></div>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      {analysis.summary && (
        <div className="summary-section">
          <h2>📋 Executive Summary</h2>
          <p>{analysis.summary}</p>
        </div>
      )}

      {/* Category Distribution Chart - Simple HTML Table */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>📊 Category Balance Scores</h3>
          <table className="score-table">
            <tbody>
              {[
                { name: 'Founder', key: 'founder' },
                { name: 'Problem', key: 'problem' },
                { name: 'Market', key: 'market' },
                { name: 'Product', key: 'product' },
                { name: 'Traction', key: 'traction' },
                { name: 'Business Model', key: 'businessModel' },
                { name: 'Financial', key: 'financial' },
                { name: 'Competitive', key: 'competitive' },
              ].map(({ name, key }) => (
                <tr key={key}>
                  <td style={{ width: '120px', fontWeight: '600' }}>{name}</td>
                  <td style={{ flex: 1 }}>
                    <ScoreBar score={dimensions[key]?.score || 0} />
                  </td>
                  <td style={{ width: '50px', textAlign: 'right', fontWeight: '600' }}>
                    {dimensions[key]?.score || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Evaluation Weights - Simple Display */}
        <div className="chart-container">
          <h3>⚖️ Evaluation Weights</h3>
          <div className="weights-grid">
            {[
              { name: 'Traction', value: 25 },
              { name: 'Founder', value: 15 },
              { name: 'Market', value: 15 },
              { name: 'Product', value: 15 },
              { name: 'Business', value: 10 },
              { name: 'Problem', value: 10 },
              { name: 'Finance', value: 5 },
              { name: 'Competitive', value: 5 },
            ].map((weight) => (
              <div key={weight.name} className="weight-item">
                <div className="weight-label">{weight.name}</div>
                <div className="weight-value">{weight.value}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Metrics - Simple Table */}
        <div className="chart-container full-width">
          <h3>💸 Revenue vs Burn Rate</h3>
          <div className="metrics-display">
            <div className="metric-row">
              <span className="metric-label">Revenue</span>
              <span className="metric-value" style={{ color: '#10b981' }}>
                ${(analysis.metrics?.revenue || 0).toLocaleString()}
              </span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Burn Rate</span>
              <span className="metric-value" style={{ color: '#ef4444' }}>
                ${(analysis.metrics?.burn || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dimension Scores */}
      <div className="dimensions-grid">
        <h2>📈 Category Scores</h2>
        <div className="scores-grid">
          {Object.entries(dimensions).map(([key, data]) => {
            if (!data) return null;
            const score = data.score || 0;
            return (
            <div key={key} className="dimension-card">
              <h4>{dimensionLabels[key] || key}</h4>
              <div className="dimension-score">
                <div className="score-bar">
                  <div 
                    className="score-fill" 
                    style={{
                      width: `${score}%`,
                      backgroundColor: score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
                    }}
                  ></div>
                </div>
                <span className="score-value">{score}/100</span>
              </div>
              
              {data.strengths && data.strengths.length > 0 && (
                <div className="strengths">
                  <p className="label">Strengths:</p>
                  <ul>
                    {data.strengths.slice(0, 2).map((s, i) => (
                      <li key={i}>✓ {s}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {data.weaknesses && data.weaknesses.length > 0 && (
                <div className="weaknesses">
                  <p className="label">Concerns:</p>
                  <ul>
                    {data.weaknesses.slice(0, 2).map((w, i) => (
                      <li key={i}>✗ {w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="insights-section">
        <div className="insights-grid">
          {analysis.strengths && analysis.strengths.length > 0 && (
            <div className="insights-card positive">
              <h3>✅ Key Strengths</h3>
              <ul>
                {analysis.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.weaknesses && analysis.weaknesses.length > 0 && (
            <div className="insights-card negative">
              <h3>⚠️ Areas to Address</h3>
              <ul>
                {analysis.weaknesses.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {analysis.redFlags && analysis.redFlags.length > 0 && (
          <div className="alerts-card critical">
            <h3>🚩 Critical Red Flags</h3>
            <ul>
              {analysis.redFlags.map((flag, i) => (
                <li key={i}>{flag}</li>
              ))}
            </ul>
          </div>
        )}

        {analysis.greenFlags && analysis.greenFlags.length > 0 && (
          <div className="alerts-card positive">
            <h3>🟢 Green Flags</h3>
            <ul>
              {analysis.greenFlags.map((flag, i) => (
                <li key={i}>{flag}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="metrics-section">
        <h2>📊 Key Financial Metrics</h2>
        <div className="metrics-grid">
          {analysis.metrics && Object.entries(analysis.metrics).map(([key, value]) => (
            <div key={key} className="metric-card">
              <p className="metric-label">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
              <p className="metric-value">
                {key.includes('revenue') || key.includes('burn') ? '$' : ''}
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Decision */}
      <div className="decision-section">
        <h2>🎯 Investment Decision</h2>
        <div className="decision-card">
          <p className="decision-text">{analysis.recommendation}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="report-footer">
        <p>Generated for Fondorax Investment Analysis Platform</p>
        <p className="timestamp">Report Date: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}

export default ComprehensiveAnalysisReport;
