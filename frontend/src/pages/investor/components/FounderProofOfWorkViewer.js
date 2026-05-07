import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/FounderProofOfWorkViewer.css';

function FounderProofOfWorkViewer({ founderId }) {
  const [summary, setSummary] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchFounderProofOfWork();
  }, [founderId]);

  const fetchFounderProofOfWork = async () => {
    try {
      const token = localStorage.getItem('token');
      const [summaryRes, entriesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/founder/${founderId}/pow-summary`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:5000/api/founder/${founderId}/pow-entries`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setSummary(summaryRes.data);
      setEntries(entriesRes.data.entries);
    } catch (err) {
      console.error('Error fetching proof of work:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="pow-viewer-loading">Loading execution history...</div>;
  if (!summary) return <div className="pow-viewer-empty">No proof of work data available</div>;

  return (
    <div className="pow-viewer">
      {/* Readiness Badge */}
      <div className="readiness-section">
        <div className={`readiness-badge ${summary.readiness.toLowerCase().replace(' ', '-')}`}>
          {summary.readiness}
        </div>
        <div className="readiness-info">
          <strong>Execution Readiness:</strong>
          <p>Based on verified execution data, not pitch deck claims</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="pow-stats">
        <div className="stat">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{summary.highlights.productShips}</div>
          <div className="stat-label">Product Updates</div>
        </div>
        <div className="stat">
          <div className="stat-icon">🎥</div>
          <div className="stat-value">{summary.highlights.customerVoice}</div>
          <div className="stat-label">Customer Interviews</div>
        </div>
        <div className="stat">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{summary.highlights.revenueGrowth}</div>
          <div className="stat-label">Revenue Milestones</div>
        </div>
        <div className="stat">
          <div className="stat-icon">📈</div>
          <div className="stat-value">{summary.highlights.metricsShared}</div>
          <div className="stat-label">Metrics Updates</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="pow-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Execution Story
        </button>
        <button
          className={`tab ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          Key Metrics
        </button>
        <button
          className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Full Timeline
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          {/* Product Momentum */}
          {summary.executionStory.productMomentum.length > 0 && (
            <div className="story-section">
              <h4>📦 Product Momentum</h4>
              <p className="story-subtitle">What they've shipped</p>
              {summary.executionStory.productMomentum.map((ship, idx) => (
                <div key={idx} className="story-item">
                  <div className="story-date">
                    {new Date(ship.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="story-content">
                    <strong>{ship.title}</strong>
                    {ship.features.length > 0 && (
                      <ul className="feature-list">
                        {ship.features.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Customer Validation */}
          {summary.executionStory.customerValidation.length > 0 && (
            <div className="story-section">
              <h4>🎥 Customer Validation</h4>
              <p className="story-subtitle">Real customer feedback</p>
              {summary.executionStory.customerValidation.map((customer, idx) => (
                <div key={idx} className="story-item customer-item">
                  <div className="customer-avatar">{customer.customer?.charAt(0)}</div>
                  <div className="customer-content">
                    <strong>{customer.customer}</strong>
                    <span className="customer-company">@ {customer.company}</span>
                    {customer.hasVideo && (
                      <span className="has-video">🎥 Video Interview</span>
                    )}
                    <small>{new Date(customer.date).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Growth Trajectory */}
          {summary.executionStory.growthTrajectory.length > 0 && (
            <div className="story-section">
              <h4>📈 Growth Trajectory</h4>
              <p className="story-subtitle">Verified growth metrics</p>
              {summary.executionStory.growthTrajectory.map((growth, idx) => (
                <div key={idx} className="story-item metrics-item">
                  <div className="growth-date">
                    {new Date(growth.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="growth-title">{growth.title}</div>
                  {(growth.metrics.mau || growth.metrics.mrr) && (
                    <div className="growth-metrics">
                      {growth.metrics.mau && (
                        <span className="metric-badge">
                          {growth.metrics.mau.toLocaleString()} MAU
                        </span>
                      )}
                      {growth.metrics.mrr && (
                        <span className="metric-badge mrr">
                          ${growth.metrics.mrr.toLocaleString()} MRR
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="tab-content">
          {summary.recentMetrics && (
            <div className="metrics-section">
              <h4>Current Performance</h4>
              <div className="metrics-display-full">
                {summary.recentMetrics.mau && (
                  <div className="metric-row">
                    <span className="metric-name">Monthly Active Users (MAU)</span>
                    <span className="metric-val">{summary.recentMetrics.mau.toLocaleString()}</span>
                  </div>
                )}
                {summary.recentMetrics.mrr && (
                  <div className="metric-row">
                    <span className="metric-name">Monthly Recurring Revenue (MRR)</span>
                    <span className="metric-val">${summary.recentMetrics.mrr.toLocaleString()}</span>
                  </div>
                )}
                {summary.recentMetrics.nps && (
                  <div className="metric-row">
                    <span className="metric-name">Net Promoter Score (NPS)</span>
                    <span className="metric-val">{summary.recentMetrics.nps}</span>
                  </div>
                )}
                {summary.recentMetrics.churnRate && (
                  <div className="metric-row">
                    <span className="metric-name">Churn Rate</span>
                    <span className="metric-val">{summary.recentMetrics.churnRate.toFixed(1)}%</span>
                  </div>
                )}
              </div>
              <small className="last-updated">
                Last updated: {new Date(summary.recentMetrics.lastUpdated).toLocaleDateString()}
              </small>
            </div>
          )}
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="tab-content timeline-view">
          {entries.length > 0 ? (
            <div className="timeline">
              {entries.map((entry) => (
                <div key={entry._id} className="timeline-event">
                  <div className="event-icon">{getTypeIcon(entry.type)}</div>
                  <div className="event-content">
                    <div className="event-title">{entry.title}</div>
                    <div className="event-date">
                      {new Date(entry.displayDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    {entry.verified && <span className="verified-mark">✓ Verified</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No timeline entries yet</p>
          )}
        </div>
      )}

      {/* Last Updated */}
      <div className="pow-footer">
        <small>Last update: {new Date(summary.lastUpdate).toLocaleDateString()}</small>
        <small className="data-note">All data verified and self-reported by founder</small>
      </div>
    </div>
  );
}

function getTypeIcon(type) {
  const icons = {
    'product-changelog': '📦',
    'customer-interview': '🎥',
    'growth-metric': '📈',
    'customer-feedback': '💬',
    'iteration': '🔄',
    'revenue-milestone': '💰'
  };
  return icons[type] || '📝';
}

export default FounderProofOfWorkViewer;
