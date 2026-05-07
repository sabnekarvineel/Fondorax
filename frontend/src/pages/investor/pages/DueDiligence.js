import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DueDiligence.css';

const DueDiligence = () => {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [timeline, setTimeline] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('in-progress');

  useEffect(() => {
    fetchRecords();
  }, [status]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/investor-v2/due-diligence?status=${status}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setRecords(response.data.data || []);
      if (selectedRecord) {
        setSelectedRecord(null);
      }
    } catch (error) {
      console.error('Error fetching due diligence records:', error);
      alert('Error loading records');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordDetail = async (recordId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/investor-v2/due-diligence/${recordId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setSelectedRecord(response.data.data.dueDiligence);
      setTimeline(response.data.data.recentProofOfWork || []);
    } catch (error) {
      console.error('Error fetching record detail:', error);
      alert('Error loading record details');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (rec) => {
    const colors = {
      'strong-invest': '#4CAF50',
      'pass': '#2196F3',
      'maybe': '#FF9800',
      'weak-pass': '#F44336',
      'strong-pass': '#4CAF50'
    };
    return colors[rec] || '#999';
  };

  const getRiskColor = (level) => {
    const colors = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#F44336',
      'very-high': '#C62828'
    };
    return colors[level] || '#999';
  };

  if (selectedRecord) {
    return (
      <DetailView
        record={selectedRecord}
        timeline={timeline}
        onBack={() => setSelectedRecord(null)}
        onUpdate={() => fetchRecords()}
      />
    );
  }

  return (
    <div className="due-diligence-container">
      <div className="dd-header">
        <h1>Due Diligence Tracker</h1>
        <p className="subtitle">Manage your investment evaluation process</p>
      </div>

      <div className="status-tabs">
        <button
          className={`tab ${status === 'in-progress' ? 'active' : ''}`}
          onClick={() => setStatus('in-progress')}
        >
          In Progress
        </button>
        <button
          className={`tab ${status === 'completed' ? 'active' : ''}`}
          onClick={() => setStatus('completed')}
        >
          Completed
        </button>
        <button
          className={`tab ${status === 'all' ? 'active' : ''}`}
          onClick={() => setStatus('all')}
        >
          All
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading records...</div>
      ) : records.length === 0 ? (
        <div className="empty-state">
          <p>No due diligence records yet</p>
          <p className="hint">Create a new record to track your evaluation</p>
        </div>
      ) : (
        <div className="records-list">
          {records.map((record) => (
            <div key={record._id} className="record-item">
              <div className="record-header-summary">
                <div>
                  <h3>{record.founderId?.firstName} {record.founderId?.lastName}</h3>
                  <p className="company">{record.founderId?.company}</p>
                </div>
                <div className="record-badges">
                  <span
                    className="recommendation-badge"
                    style={{ backgroundColor: getRecommendationColor(record.recommendation) }}
                  >
                    {record.recommendation.replace('-', ' ')}
                  </span>
                  {record.riskLevel && (
                    <span
                      className="risk-badge"
                      style={{ backgroundColor: getRiskColor(record.riskLevel) }}
                    >
                      {record.riskLevel} risk
                    </span>
                  )}
                </div>
              </div>

              <div className="record-assessment-summary">
                {record.teamAssessment?.overallRating && (
                  <div className="assessment-item">
                    <span>Team: ⭐ {record.teamAssessment.overallRating}/5</span>
                  </div>
                )}
                {record.marketAssessment?.overallRating && (
                  <div className="assessment-item">
                    <span>Market: ⭐ {record.marketAssessment.overallRating}/5</span>
                  </div>
                )}
                {record.productAssessment?.overallRating && (
                  <div className="assessment-item">
                    <span>Product: ⭐ {record.productAssessment.overallRating}/5</span>
                  </div>
                )}
                {record.financialAssessment?.overallRating && (
                  <div className="assessment-item">
                    <span>Financial: ⭐ {record.financialAssessment.overallRating}/5</span>
                  </div>
                )}
              </div>

              <div className="record-footer">
                <span className="updated-at">
                  Updated {new Date(record.updatedAt).toLocaleDateString()}
                </span>
                <button
                  className="btn-view-detail"
                  onClick={() => fetchRecordDetail(record._id)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Detail View Component
const DetailView = ({ record, timeline, onBack, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    recommendation: record.recommendation,
    riskLevel: record.riskLevel,
    teamAssessment: record.teamAssessment || {},
    marketAssessment: record.marketAssessment || {},
    productAssessment: record.productAssessment || {},
    financialAssessment: record.financialAssessment || {},
    investmentCeiling: record.investmentCeiling,
    investmentFloor: record.investmentFloor
  });

  const handleSave = async () => {
    try {
      await axios.put(
        `/api/investor-v2/due-diligence/${record._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      alert('Due diligence record updated');
      setEditMode(false);
      onUpdate();
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Error saving record');
    }
  };

  const getRecommendationColor = (rec) => {
    const colors = {
      'strong-invest': '#4CAF50',
      'pass': '#2196F3',
      'maybe': '#FF9800',
      'weak-pass': '#F44336',
      'strong-pass': '#4CAF50'
    };
    return colors[rec] || '#999';
  };

  return (
    <div className="dd-detail-container">
      <button className="btn-back" onClick={onBack}>← Back</button>

      <div className="detail-header">
        <div>
          <h1>{record.founderId?.firstName} {record.founderId?.lastName}</h1>
          <p className="company">{record.founderId?.company}</p>
        </div>
        <button
          className={`btn-edit-mode ${editMode ? 'editing' : ''}`}
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="detail-content">
        {/* Team Assessment */}
        <section className="assessment-section">
          <h2>Team Assessment</h2>
          {editMode ? (
            <div className="form-group">
              <label>Team Strengths (comma-separated)</label>
              <textarea
                value={(formData.teamAssessment?.strengths || []).join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    teamAssessment: {
                      ...formData.teamAssessment,
                      strengths: e.target.value.split(',').map(s => s.trim())
                    }
                  })
                }
                placeholder="e.g., Strong founding team, Industry experience, Good execution"
              />

              <label>Team Concerns</label>
              <textarea
                value={(formData.teamAssessment?.concerns || []).join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    teamAssessment: {
                      ...formData.teamAssessment,
                      concerns: e.target.value.split(',').map(s => s.trim())
                    }
                  })
                }
                placeholder="e.g., Lack of sales experience, New team, Limited network"
              />

              <label>Rating (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.teamAssessment?.overallRating || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    teamAssessment: {
                      ...formData.teamAssessment,
                      overallRating: parseInt(e.target.value)
                    }
                  })
                }
              />

              <label>Notes</label>
              <textarea
                value={formData.teamAssessment?.notes || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    teamAssessment: {
                      ...formData.teamAssessment,
                      notes: e.target.value
                    }
                  })
                }
              />
            </div>
          ) : (
            <div className="assessment-display">
              {record.teamAssessment?.overallRating && (
                <p className="rating">Rating: ⭐ {record.teamAssessment.overallRating}/5</p>
              )}
              {record.teamAssessment?.strengths?.length > 0 && (
                <div className="assessment-list">
                  <h4>Strengths:</h4>
                  <ul>
                    {record.teamAssessment.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {record.teamAssessment?.concerns?.length > 0 && (
                <div className="assessment-list">
                  <h4>Concerns:</h4>
                  <ul>
                    {record.teamAssessment.concerns.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {record.teamAssessment?.notes && (
                <p className="notes">{record.teamAssessment.notes}</p>
              )}
            </div>
          )}
        </section>

        {/* Market Assessment */}
        <section className="assessment-section">
          <h2>Market Assessment</h2>
          {editMode ? (
            <div className="form-group">
              <label>Market Size</label>
              <input
                type="text"
                value={formData.marketAssessment?.marketSize || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    marketAssessment: {
                      ...formData.marketAssessment,
                      marketSize: e.target.value
                    }
                  })
                }
                placeholder="e.g., $10B TAM"
              />

              <label>Competitive Advantages</label>
              <textarea
                value={(formData.marketAssessment?.competitiveAdvantage || []).join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    marketAssessment: {
                      ...formData.marketAssessment,
                      competitiveAdvantage: e.target.value.split(',').map(s => s.trim())
                    }
                  })
                }
              />

              <label>Rating (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.marketAssessment?.overallRating || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    marketAssessment: {
                      ...formData.marketAssessment,
                      overallRating: parseInt(e.target.value)
                    }
                  })
                }
              />
            </div>
          ) : (
            <div className="assessment-display">
              {record.marketAssessment?.overallRating && (
                <p className="rating">Rating: ⭐ {record.marketAssessment.overallRating}/5</p>
              )}
              {record.marketAssessment?.marketSize && (
                <p><strong>Market Size:</strong> {record.marketAssessment.marketSize}</p>
              )}
            </div>
          )}
        </section>

        {/* Product Assessment */}
        <section className="assessment-section">
          <h2>Product Assessment</h2>
          {editMode ? (
            <div className="form-group">
              <label>Product Maturity</label>
              <select
                value={formData.productAssessment?.productMaturity || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    productAssessment: {
                      ...formData.productAssessment,
                      productMaturity: e.target.value
                    }
                  })
                }
              >
                <option value="">Select...</option>
                <option value="concept">Concept</option>
                <option value="prototype">Prototype</option>
                <option value="beta">Beta</option>
                <option value="production">Production</option>
                <option value="mature">Mature</option>
              </select>

              <label>Rating (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.productAssessment?.overallRating || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    productAssessment: {
                      ...formData.productAssessment,
                      overallRating: parseInt(e.target.value)
                    }
                  })
                }
              />
            </div>
          ) : (
            <div className="assessment-display">
              {record.productAssessment?.overallRating && (
                <p className="rating">Rating: ⭐ {record.productAssessment.overallRating}/5</p>
              )}
              {record.productAssessment?.productMaturity && (
                <p><strong>Maturity:</strong> {record.productAssessment.productMaturity}</p>
              )}
            </div>
          )}
        </section>

        {/* Financial Assessment */}
        <section className="assessment-section">
          <h2>Financial Assessment</h2>
          {editMode ? (
            <div className="form-group">
              <label>Monthly Burn</label>
              <input
                type="number"
                value={formData.financialAssessment?.monthlyBurn || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    financialAssessment: {
                      ...formData.financialAssessment,
                      monthlyBurn: parseInt(e.target.value)
                    }
                  })
                }
                placeholder="e.g., 50000"
              />

              <label>Monthly Revenue</label>
              <input
                type="number"
                value={formData.financialAssessment?.monthlyRevenue || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    financialAssessment: {
                      ...formData.financialAssessment,
                      monthlyRevenue: parseInt(e.target.value)
                    }
                  })
                }
                placeholder="e.g., 25000"
              />

              <label>Rating (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.financialAssessment?.overallRating || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    financialAssessment: {
                      ...formData.financialAssessment,
                      overallRating: parseInt(e.target.value)
                    }
                  })
                }
              />
            </div>
          ) : (
            <div className="assessment-display">
              {record.financialAssessment?.overallRating && (
                <p className="rating">Rating: ⭐ {record.financialAssessment.overallRating}/5</p>
              )}
              {record.financialAssessment?.monthlyBurn && (
                <p><strong>Monthly Burn:</strong> ${record.financialAssessment.monthlyBurn}</p>
              )}
              {record.financialAssessment?.monthlyRevenue && (
                <p><strong>Monthly Revenue:</strong> ${record.financialAssessment.monthlyRevenue}</p>
              )}
            </div>
          )}
        </section>

        {/* Recommendation & Risk */}
        {editMode && (
          <section className="assessment-section">
            <h2>Final Assessment</h2>
            <div className="form-group">
              <label>Recommendation</label>
              <select
                value={formData.recommendation}
                onChange={(e) =>
                  setFormData({ ...formData, recommendation: e.target.value })
                }
              >
                <option value="strong-pass">Strong Pass</option>
                <option value="pass">Pass</option>
                <option value="maybe">Maybe</option>
                <option value="weak-pass">Weak Pass</option>
                <option value="strong-invest">Strong Invest</option>
              </select>

              <label>Risk Level</label>
              <select
                value={formData.riskLevel}
                onChange={(e) =>
                  setFormData({ ...formData, riskLevel: e.target.value })
                }
              >
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
                <option value="very-high">Very High Risk</option>
              </select>

              <label>Investment Floor ($)</label>
              <input
                type="number"
                value={formData.investmentFloor || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    investmentFloor: parseInt(e.target.value)
                  })
                }
                placeholder="Minimum investment"
              />

              <label>Investment Ceiling ($)</label>
              <input
                type="number"
                value={formData.investmentCeiling || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    investmentCeiling: parseInt(e.target.value)
                  })
                }
                placeholder="Maximum investment"
              />
            </div>

            <button className="btn-save-assessment" onClick={handleSave}>
              Save Assessment
            </button>
          </section>
        )}
      </div>
    </div>
  );
};

export default DueDiligence;
