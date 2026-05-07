import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HighSignalDiscovery.css';

const HighSignalDiscovery = () => {
  const [view, setView] = useState('high-signal'); // high-signal, tiers, custom
  const [founders, setFounders] = useState([]);
  const [tiers, setTiers] = useState({});
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    minTrustScore: 40,
    minExecutionVelocity: 3,
    minConsistency: 0,
    minTransparency: 0,
    hasCustomerFeedback: false,
    hasRevenueData: false
  });

  useEffect(() => {
    if (view === 'high-signal') {
      fetchHighSignalFounders();
    } else if (view === 'tiers') {
      fetchTierView();
    }
  }, [view]);

  const fetchHighSignalFounders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        minExecutionVelocity: filters.minExecutionVelocity,
        minTrustScore: filters.minTrustScore
      });

      const response = await axios.get(
        `/api/investor-v2/discover/high-signal?${params}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setFounders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching high-signal founders:', error);
      alert('Error loading founders');
    } finally {
      setLoading(false);
    }
  };

  const fetchTierView = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/investor-v2/discover/by-trust-tier', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setTiers(response.data.data || {});
    } catch (error) {
      console.error('Error fetching tiers:', error);
      alert('Error loading trust tiers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomFilter = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        '/api/investor-v2/discover/filter',
        filters,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setFounders(response.data.data || []);
    } catch (error) {
      console.error('Error filtering founders:', error);
      alert('Error filtering founders');
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (founderId) => {
    try {
      const response = await axios.post(
        '/api/investor-v2/watchlist/add',
        { founderId, notes: '' },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.data.success) {
        alert('Added to watchlist!');
      }
    } catch (error) {
      if (error.response?.status === 400) {
        alert('Already on your watchlist');
      } else {
        console.error('Error adding to watchlist:', error);
        alert('Error adding to watchlist');
      }
    }
  };

  const getTrustScoreColor = (score) => {
    if (score >= 75) return '#4CAF50';
    if (score >= 50) return '#2196F3';
    if (score >= 25) return '#FF9800';
    return '#999';
  };

  const getTierColor = (tierName) => {
    const colors = {
      verified: '#4CAF50',
      active: '#2196F3',
      emerging: '#FF9800',
      new: '#999'
    };
    return colors[tierName] || '#999';
  };

  return (
    <div className="discovery-container">
      <div className="discovery-header">
        <h1>Discover Founders</h1>
        <p className="subtitle">Find high-signal startups showing strong execution</p>
      </div>

      <div className="view-switcher">
        <button
          className={`switcher-btn ${view === 'high-signal' ? 'active' : ''}`}
          onClick={() => setView('high-signal')}
        >
          🚀 High Signal
        </button>
        <button
          className={`switcher-btn ${view === 'tiers' ? 'active' : ''}`}
          onClick={() => setView('tiers')}
        >
          📊 Trust Tiers
        </button>
        <button
          className={`switcher-btn ${view === 'custom' ? 'active' : ''}`}
          onClick={() => setView('custom')}
        >
          🔧 Custom Filter
        </button>
      </div>

      {view === 'high-signal' && (
        <div className="view-content">
          <div className="quick-filters">
            <div className="filter-group">
              <label>Min Trust Score</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minTrustScore}
                  onChange={(e) =>
                    setFilters({ ...filters, minTrustScore: parseInt(e.target.value) })
                  }
                  className="slider"
                />
                <span className="slider-value">{filters.minTrustScore}</span>
              </div>
            </div>

            <div className="filter-group">
              <label>Min Features Shipped (30d)</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={filters.minExecutionVelocity}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      minExecutionVelocity: parseInt(e.target.value)
                    })
                  }
                  className="slider"
                />
                <span className="slider-value">{filters.minExecutionVelocity}</span>
              </div>
            </div>

            <button
              className="btn-apply-filter"
              onClick={fetchHighSignalFounders}
            >
              Apply Filter
            </button>
          </div>

          <div className="results-info">
            <p>Showing founders with 3+ features shipped in last 30 days and strong consistency</p>
          </div>

          {loading ? (
            <div className="loading">Loading founders...</div>
          ) : founders.length === 0 ? (
            <div className="empty-state">
              <p>No founders found matching your criteria</p>
              <p className="hint">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="founders-grid">
              {founders.map((item) => (
                <div key={item.founder._id} className="founder-card">
                  <div className="card-header-discovery">
                    <h3>{item.founder.firstName} {item.founder.lastName}</h3>
                    <div className="trust-score-badge" style={{
                      backgroundColor: getTrustScoreColor(item.trustScore.overallTrustScore)
                    }}>
                      {item.trustScore.overallTrustScore}
                    </div>
                  </div>

                  <p className="company-info">{item.founder.company || 'Not specified'}</p>

                  <div className="execution-metrics">
                    <div className="metric-box">
                      <span className="metric-label">Features (30d)</span>
                      <span className="metric-value">
                        {item.trustScore.metrics.featuresShippedLast30Days || 0}
                      </span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-label">Updates (30d)</span>
                      <span className="metric-value">
                        {item.trustScore.metrics.updatesLast30Days || 0}
                      </span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-label">Consistency</span>
                      <span className="metric-value">
                        {Math.round(item.trustScore.consistencyScore)}%
                      </span>
                    </div>
                  </div>

                  <div className="score-breakdown">
                    <div className="score-item">
                      <span>Velocity</span>
                      <div className="score-bar">
                        <div
                          className="score-fill"
                          style={{
                            width: `${item.trustScore.velocityScore}%`,
                            backgroundColor: '#2196F3'
                          }}
                        />
                      </div>
                    </div>
                    <div className="score-item">
                      <span>Transparency</span>
                      <div className="score-bar">
                        <div
                          className="score-fill"
                          style={{
                            width: `${item.trustScore.transparencyScore}%`,
                            backgroundColor: '#4CAF50'
                          }}
                        />
                      </div>
                    </div>
                    <div className="score-item">
                      <span>Execution</span>
                      <div className="score-bar">
                        <div
                          className="score-fill"
                          style={{
                            width: `${item.trustScore.executionScore}%`,
                            backgroundColor: '#FF9800'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn-add-watchlist"
                    onClick={() => addToWatchlist(item.founder._id)}
                  >
                    + Add to Watchlist
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'tiers' && (
        <div className="tiers-view">
          {Object.entries(tiers).map(([tierName, tierData]) => (
            <div key={tierName} className="tier-section">
              <div className="tier-header">
                <h2
                  className="tier-name"
                  style={{ color: getTierColor(tierName) }}
                >
                  {tierName.charAt(0).toUpperCase() + tierName.slice(1)}
                </h2>
                <span className="tier-score-range">Score: {tierData.scoreRange}</span>
                <span className="tier-count">{tierData.count} founders</span>
              </div>

              {tierData.founders.length === 0 ? (
                <p className="no-founders">No founders in this tier</p>
              ) : (
                <div className="tier-founders-grid">
                  {tierData.founders.map((item) => (
                    <div key={item.founder._id} className="tier-founder-card">
                      <h4>{item.founder.firstName} {item.founder.lastName}</h4>
                      <p className="company">{item.founder.company}</p>
                      <div className="tier-stats">
                        <div>Updates: {item.trustScore.metrics.updatesLast30Days}</div>
                        <div>Consistency: {Math.round(item.trustScore.consistencyScore)}%</div>
                      </div>
                      <button
                        className="btn-add-watchlist-sm"
                        onClick={() => addToWatchlist(item.founder._id)}
                      >
                        Add to Watchlist
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {view === 'custom' && (
        <div className="custom-filter-view">
          <div className="filter-panel">
            <h3>Advanced Filters</h3>

            <div className="filter-group">
              <label>Minimum Trust Score</label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.minTrustScore}
                onChange={(e) =>
                  setFilters({ ...filters, minTrustScore: parseInt(e.target.value) })
                }
              />
            </div>

            <div className="filter-group">
              <label>Minimum Consistency Score</label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.minConsistency}
                onChange={(e) =>
                  setFilters({ ...filters, minConsistency: parseInt(e.target.value) })
                }
              />
            </div>

            <div className="filter-group">
              <label>Minimum Transparency Score</label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.minTransparency}
                onChange={(e) =>
                  setFilters({ ...filters, minTransparency: parseInt(e.target.value) })
                }
              />
            </div>

            <div className="filter-group">
              <label>Features Shipped (last 30 days)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={filters.minExecutionVelocity}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    minExecutionVelocity: parseInt(e.target.value)
                  })
                }
              />
            </div>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={filters.hasCustomerFeedback}
                  onChange={(e) =>
                    setFilters({ ...filters, hasCustomerFeedback: e.target.checked })
                  }
                />
                <span>Has Customer Interviews</span>
              </label>
            </div>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={filters.hasRevenueData}
                  onChange={(e) =>
                    setFilters({ ...filters, hasRevenueData: e.target.checked })
                  }
                />
                <span>Has Revenue Data</span>
              </label>
            </div>

            <button className="btn-apply-custom" onClick={fetchCustomFilter}>
              Apply Filters
            </button>
          </div>

          {loading ? (
            <div className="loading">Filtering founders...</div>
          ) : founders.length === 0 ? (
            <div className="empty-state">
              <p>No founders found with these criteria</p>
            </div>
          ) : (
            <div className="results-list">
              {founders.map((item) => (
                <div key={item.founder._id} className="result-item">
                  <div className="result-header">
                    <h4>{item.founder.firstName} {item.founder.lastName}</h4>
                    <span className="trust-badge" style={{
                      backgroundColor: getTrustScoreColor(item.trustScore.overallTrustScore)
                    }}>
                      {item.trustScore.overallTrustScore}
                    </span>
                  </div>
                  <p className="result-company">{item.founder.company}</p>
                  <div className="result-metrics">
                    <span>PoW: {item.proofOfWorkCount}</span>
                    <span>Updates: {item.trustScore.metrics.updatesLast30Days}</span>
                    <span>Consistency: {Math.round(item.trustScore.consistencyScore)}%</span>
                  </div>
                  <button
                    className="btn-add-watchlist-inline"
                    onClick={() => addToWatchlist(item.founder._id)}
                  >
                    Add to Watchlist
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HighSignalDiscovery;
