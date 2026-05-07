import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ExecutionLedger.css';

function ExecutionLedger({ user }) {
  const [entries, setEntries] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLedgerData();
  }, []);

  const fetchLedgerData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [powRes, metricsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/founder/my-pow', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/founder/metrics', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setEntries(powRes.data.powEntries || []);
      setMetrics(metricsRes.data);
    } catch (err) {
      console.error('Error fetching ledger data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return '#10b981';
    if (score >= 50) return '#f59e0b';
    if (score >= 25) return '#ef4444';
    return '#6b7280';
  };

  const getScoreStatus = (score) => {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Good';
    if (score >= 25) return 'Developing';
    return 'Getting Started';
  };

  const totalExecutionScore = metrics?.executionScore || 0;
  const totalTransparencyScore = metrics?.transparencyScore || 0;
  const totalVelocityScore = metrics?.velocityScore || 0;

  return (
    <div className="execution-ledger-container">
      {/* Header */}
      <div className="ledger-header">
        <div className="header-content">
          <h1>Execution Ledger</h1>
          <p>Document your real execution, customer feedback, and growth metrics</p>
        </div>
        <div className="header-company">
          <div className="company-badge">{user?.company || 'Startup'}</div>
          <div className="user-name">{user?.firstName}</div>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="ledger-content-wrapper">
        {/* Left Column - Score Cards */}
        <div className="ledger-left-column">
          <div className="score-cards-grid">
            {/* Execution Score */}
            <div className="score-card execution-card">
              <div className="score-card-top">
                <span className="score-label">Execution</span>
                <span className={`score-status ${getScoreStatus(totalExecutionScore).toLowerCase().replace(' ', '-')}`}>
                  {getScoreStatus(totalExecutionScore)}
                </span>
              </div>
              <div className="score-display">
                <span
                  className="score-number"
                  style={{ color: getScoreColor(totalExecutionScore) }}
                >
                  {totalExecutionScore}
                </span>
              </div>
              <div className="score-details">
                <p className="detail-item">
                  <span className="detail-label">Features Shipped</span>
                  <span className="detail-value">{metrics?.featuresShipped || 0}</span>
                </p>
                <p className="detail-item">
                  <span className="detail-label">Bugs Fixed</span>
                  <span className="detail-value">{metrics?.bugsFixes || 0}</span>
                </p>
              </div>
              <div className="score-bar">
                <div
                  className="score-bar-fill"
                  style={{
                    width: `${totalExecutionScore}%`,
                    backgroundColor: getScoreColor(totalExecutionScore)
                  }}
                />
              </div>
            </div>

            {/* Transparency Score */}
            <div className="score-card transparency-card">
              <div className="score-card-top">
                <span className="score-label">Transparency</span>
                <span className={`score-status ${getScoreStatus(totalTransparencyScore).toLowerCase().replace(' ', '-')}`}>
                  {getScoreStatus(totalTransparencyScore)}
                </span>
              </div>
              <div className="score-display">
                <span
                  className="score-number"
                  style={{ color: getScoreColor(totalTransparencyScore) }}
                >
                  {totalTransparencyScore}
                </span>
              </div>
              <div className="score-details">
                <p className="detail-item">
                  <span className="detail-label">Customer Interviews</span>
                  <span className="detail-value">{metrics?.customerInterviews || 0}</span>
                </p>
                <p className="detail-item">
                  <span className="detail-label">Verified Entries</span>
                  <span className="detail-value">{metrics?.verifiedEntries || 0}</span>
                </p>
              </div>
              <div className="score-bar">
                <div
                  className="score-bar-fill"
                  style={{
                    width: `${totalTransparencyScore}%`,
                    backgroundColor: getScoreColor(totalTransparencyScore)
                  }}
                />
              </div>
            </div>

            {/* Velocity Score */}
            <div className="score-card velocity-card">
              <div className="score-card-top">
                <span className="score-label">Velocity</span>
                <span className={`score-status ${getScoreStatus(totalVelocityScore).toLowerCase().replace(' ', '-')}`}>
                  {getScoreStatus(totalVelocityScore)}
                </span>
              </div>
              <div className="score-display">
                <span
                  className="score-number"
                  style={{ color: getScoreColor(totalVelocityScore) }}
                >
                  {totalVelocityScore}
                </span>
              </div>
              <div className="score-details">
                <p className="detail-item">
                  <span className="detail-label">Updates</span>
                  <span className="detail-value">{entries?.length || 0}</span>
                </p>
                <p className="detail-item">
                  <span className="detail-label">Frequency</span>
                  <span className="detail-value">0.5 per week</span>
                </p>
              </div>
              <div className="score-bar">
                <div
                  className="score-bar-fill"
                  style={{
                    width: `${totalVelocityScore}%`,
                    backgroundColor: getScoreColor(totalVelocityScore)
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Timeline Section */}
        <div className="ledger-right-column">
        <div className="timeline-header">
          <h2>Your Execution Timeline</h2>
          <span className="entry-count">{entries?.length || 0} entries</span>
        </div>

        {loading ? (
          <div className="ledger-loading">Loading your execution timeline...</div>
        ) : entries.length === 0 ? (
          <div className="timeline-empty">
            <div className="empty-icon">📋</div>
            <p>No entries yet. Start documenting your execution!</p>
          </div>
        ) : (
          <div className="timeline-entries">
            {entries.map((entry, index) => (
              <div key={entry._id || index} className="timeline-entry">
                <div className="timeline-entry-header">
                  <div className="entry-type-badge" data-type={entry.type}>
                    {getTypeIcon(entry.type)} {getTypeLabel(entry.type)}
                  </div>
                  <span className="entry-date">
                    {new Date(entry.createdAt || entry.displayDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="entry-content">
                  <h3 className="entry-title">{entry.title}</h3>
                  <p className="entry-description">{entry.description}</p>

                  {/* Type-specific content */}
                  {entry.type === 'product-changelog' && entry.changelog && (
                    <div className="entry-details">
                      {entry.changelog.features && entry.changelog.features.length > 0 && (
                        <div className="detail-section">
                          <strong>Features:</strong>
                          <ul>
                            {entry.changelog.features.map((f, i) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {entry.changelog.bugFixes && entry.changelog.bugFixes.length > 0 && (
                        <div className="detail-section">
                          <strong>Bugs Fixed:</strong>
                          <ul>
                            {entry.changelog.bugFixes.map((f, i) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {entry.type === 'customer-interview' && entry.customerInterview && (
                    <div className="entry-details">
                      <div className="detail-item">
                        <strong>Customer:</strong> {entry.customerInterview.customerName}
                      </div>
                      {entry.customerInterview.videoUrl && (
                        <a href={entry.customerInterview.videoUrl} target="_blank" rel="noopener noreferrer" className="video-link">
                          ▶ Watch Interview
                        </a>
                      )}
                    </div>
                  )}

                  {entry.metrics && Object.keys(entry.metrics).some(k => entry.metrics[k] > 0) && (
                    <div className="entry-metrics">
                      {entry.metrics.mau > 0 && (
                        <span className="metric-badge">MAU: {entry.metrics.mau}</span>
                      )}
                      {entry.metrics.mrr > 0 && (
                        <span className="metric-badge">MRR: ${entry.metrics.mrr}</span>
                      )}
                      {entry.metrics.nps > 0 && (
                        <span className="metric-badge">NPS: {entry.metrics.nps}</span>
                      )}
                    </div>
                  )}
                </div>

                {entry.executionScore > 0 && (
                  <div className="entry-score">
                    <span className="score-label">Execution Score</span>
                    <span
                      className="score-value"
                      style={{ color: getScoreColor(entry.executionScore) }}
                    >
                      {entry.executionScore}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

function getTypeLabel(type) {
  const labels = {
    'product-changelog': 'Features Shipped',
    'customer-interview': 'Customer Interview',
    'growth-metric': 'Growth Metrics',
    'customer-feedback': 'Customer Feedback',
    'iteration': 'Learning & Iteration',
    'revenue-milestone': 'Revenue Milestone'
  };
  return labels[type] || 'Update';
}

function getTypeIcon(type) {
  const icons = {
    'product-changelog': '📦',
    'customer-interview': '🎥',
    'growth-metric': '📊',
    'customer-feedback': '💬',
    'iteration': '🔄',
    'revenue-milestone': '💰'
  };
  return icons[type] || '📝';
}

export default ExecutionLedger;
