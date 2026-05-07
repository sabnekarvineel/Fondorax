import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Watchlist.css';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const priorityColors = {
    low: '#4CAF50',
    medium: '#2196F3',
    high: '#FF9800',
    urgent: '#F44336'
  };

  const statusColors = {
    interested: '#9C27B0',
    evaluating: '#2196F3',
    'ready-to-invest': '#4CAF50',
    passed: '#999',
    invested: '#FFB300'
  };

  useEffect(() => {
    fetchWatchlist();
  }, [filter]);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const query = filter === 'all' ? '' : `?status=${filter}`;
      const response = await axios.get(`/api/investor-v2/watchlist${query}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setWatchlist(response.data.data || []);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      alert('Error loading watchlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (watchlistId) => {
    if (window.confirm('Remove from watchlist?')) {
      try {
        await axios.delete(`/api/investor-v2/watchlist/${watchlistId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setWatchlist(watchlist.filter(w => w._id !== watchlistId));
        alert('Removed from watchlist');
      } catch (error) {
        console.error('Error removing from watchlist:', error);
        alert('Error removing from watchlist');
      }
    }
  };

  const handleEditStart = (item) => {
    setEditingId(item._id);
    setEditData({
      notes: item.notes,
      priority: item.priority,
      dueDiligenceStatus: item.dueDiligenceStatus,
      investorRating: item.investorRating
    });
  };

  const handleEditSave = async (watchlistId) => {
    try {
      await axios.put(`/api/investor-v2/watchlist/${watchlistId}`, editData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchWatchlist();
      setEditingId(null);
      alert('Watchlist updated');
    } catch (error) {
      console.error('Error updating watchlist:', error);
      alert('Error updating watchlist');
    }
  };

  const getTrustScoreColor = (score) => {
    if (score >= 75) return '#4CAF50';
    if (score >= 50) return '#2196F3';
    if (score >= 25) return '#FF9800';
    return '#999';
  };

  return (
    <div className="watchlist-container">
      <div className="watchlist-header">
        <h1>My Watchlist</h1>
        <p className="subtitle">Track and manage your investment pipeline</p>
      </div>

      <div className="filter-tabs">
        <button
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`tab ${filter === 'interested' ? 'active' : ''}`}
          onClick={() => setFilter('interested')}
        >
          Interested
        </button>
        <button
          className={`tab ${filter === 'evaluating' ? 'active' : ''}`}
          onClick={() => setFilter('evaluating')}
        >
          Evaluating
        </button>
        <button
          className={`tab ${filter === 'ready-to-invest' ? 'active' : ''}`}
          onClick={() => setFilter('ready-to-invest')}
        >
          Ready
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading watchlist...</div>
      ) : watchlist.length === 0 ? (
        <div className="empty-state">
          <p>No startups in your watchlist yet</p>
          <p className="hint">Go to Discover to add founders to track</p>
        </div>
      ) : (
        <div className="watchlist-grid">
          {watchlist.map((item) => (
            <div key={item._id} className="watchlist-card">
              {editingId === item._id ? (
                <div className="edit-mode">
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      value={editData.notes || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, notes: e.target.value })
                      }
                      placeholder="Add your notes..."
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Priority</label>
                      <select
                        value={editData.priority}
                        onChange={(e) =>
                          setEditData({ ...editData, priority: e.target.value })
                        }
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={editData.dueDiligenceStatus}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            dueDiligenceStatus: e.target.value
                          })
                        }
                      >
                        <option value="interested">Interested</option>
                        <option value="evaluating">Evaluating</option>
                        <option value="ready-to-invest">Ready</option>
                        <option value="passed">Passed</option>
                        <option value="invested">Invested</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Rating (0-5)</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={editData.investorRating || ''}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            investorRating: parseFloat(e.target.value)
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="edit-actions">
                    <button
                      className="btn-save"
                      onClick={() => handleEditSave(item._id)}
                    >
                      Save
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="card-header">
                    <div>
                      <h3>{item.founderId?.firstName} {item.founderId?.lastName}</h3>
                      <p className="company">{item.founderId?.company}</p>
                    </div>
                    <div
                      className="priority-badge"
                      style={{ backgroundColor: priorityColors[item.priority] }}
                    >
                      {item.priority}
                    </div>
                  </div>

                  <div className="card-metrics">
                    {item.trustScore && (
                      <>
                        <div className="metric">
                          <span className="label">Trust Score</span>
                          <span
                            className="value"
                            style={{
                              color: getTrustScoreColor(item.trustScore.overallTrustScore)
                            }}
                          >
                            {item.trustScore.overallTrustScore}/100
                          </span>
                        </div>
                        <div className="metric">
                          <span className="label">Velocity</span>
                          <span className="value">
                            {item.trustScore.metrics.updatesLast30Days || 0} updates
                          </span>
                        </div>
                        <div className="metric">
                          <span className="label">Consistency</span>
                          <span className="value">
                            {Math.round(item.trustScore.consistencyScore)}%
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {item.notes && (
                    <div className="notes-section">
                      <p><strong>Notes:</strong> {item.notes}</p>
                    </div>
                  )}

                  <div className="card-tags">
                    {item.tags.map((tag, idx) => (
                      <span key={idx} className="tag">{tag}</span>
                    ))}
                  </div>

                  <div className="card-footer">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: statusColors[item.dueDiligenceStatus] }}
                    >
                      {item.dueDiligenceStatus.replace('-', ' ')}
                    </span>
                    {item.investorRating && (
                      <span className="rating">⭐ {item.investorRating}/5</span>
                    )}
                  </div>

                  <div className="card-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEditStart(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-remove"
                      onClick={() => handleRemove(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
