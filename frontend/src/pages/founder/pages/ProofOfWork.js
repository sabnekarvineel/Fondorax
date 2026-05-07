import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ProofOfWorkPremium.css';

function ProofOfWork({ user }) {
  const [powEntries, setPowEntries] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState('type-select');
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    metrics: {},
    changelog: { features: [], bugFixes: [], improvements: [], releaseNotes: '' },
    customerInterview: {
      customerName: '',
      companyName: '',
      interviewDate: '',
      videoUrl: '',
      transcriptUrl: '',
      keyInsights: [],
      feedback: '',
      recordingDuration: 0
    },
    attachments: []
  });

  useEffect(() => {
    fetchPowEntries();
    fetchMetrics();
  }, []);

  const fetchPowEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/founder/my-pow', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPowEntries(response.data.powEntries);
    } catch (err) {
      console.error('Error fetching entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/founder/metrics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMetrics(response.data);
    } catch (err) {
      console.error('Error fetching metrics:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        type: selectedType,
        displayDate: new Date()
      };

      await axios.post('http://localhost:5000/api/founder/create-pow', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      resetForm();
      fetchPowEntries();
      fetchMetrics();
    } catch (err) {
      console.error('Error creating entry:', err);
      alert('Error creating entry: ' + err.response?.data?.message);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'product-changelog',
      title: '',
      description: '',
      metrics: {},
      changelog: { features: [], bugFixes: [], improvements: [], releaseNotes: '' },
      customerInterview: {
        customerName: '',
        companyName: '',
        interviewDate: '',
        videoUrl: '',
        transcriptUrl: '',
        keyInsights: [],
        feedback: '',
        recordingDuration: 0
      },
      attachments: []
    });
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMetricChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      metrics: { ...prev.metrics, [name]: parseFloat(value) || 0 }
    }));
  };

  const handleChangelogChange = (e) => {
    const { name, value } = e.target;
    if (name === 'features' || name === 'bugFixes' || name === 'improvements') {
      setFormData(prev => ({
        ...prev,
        changelog: {
          ...prev.changelog,
          [name]: value.split('\n').filter(item => item.trim())
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        changelog: { ...prev.changelog, [name]: value }
      }));
    }
  };

  const handleInterviewChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      customerInterview: { ...prev.customerInterview, [name]: value }
    }));
  };

  const getTypeIcon = (type) => {
    const icons = {
      'product-changelog': '📦',
      'customer-interview': '🎥',
      'growth-metric': '📈',
      'customer-feedback': '💬',
      'iteration': '🔄',
      'revenue-milestone': '💰'
    };
    return icons[type] || '📝';
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return <span className="score-badge excellent">{Math.round(score)}</span>;
    if (score >= 60) return <span className="score-badge good">{Math.round(score)}</span>;
    if (score >= 40) return <span className="score-badge fair">{Math.round(score)}</span>;
    return <span className="score-badge low">{Math.round(score)}</span>;
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="pow-container">
      <div className="dashboard-header">
        <div>
          <h2>Live Proof of Work Ledger</h2>
          <p>Replace pitch decks with verifiable execution. Real customer data, shipped features, growth metrics.</p>
        </div>
      </div>

      {/* Metrics Dashboard */}
      {metrics && (
        <div className="metrics-grid mb-30">
          <div className="metric-card">
            <div className="metric-label">Execution Score</div>
            <div className="metric-value">{metrics.scores.execution}</div>
            <div className="metric-bar">
              <div className="metric-fill" style={{ width: `${metrics.scores.execution}%` }}></div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Transparency Score</div>
            <div className="metric-value">{metrics.scores.transparency}</div>
            <div className="metric-bar">
              <div className="metric-fill transparency" style={{ width: `${metrics.scores.transparency}%` }}></div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Posting Frequency</div>
            <div className="metric-value">{metrics.postingFrequency} per week</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Customer Interviews</div>
            <div className="metric-value">{metrics.customerInterviews}</div>
            {metrics.averageNPS > 0 && <div className="metric-sub">NPS: {metrics.averageNPS}</div>}
          </div>
        </div>
      )}

      <button className="btn-primary mb-20" onClick={() => setShowForm(!showForm)}>
        + New Update
      </button>

      {showForm && (
        <div className="form-section mb-30" style={{ borderLeft: '4px solid #3b82f6' }}>
          <h3>What to Share?</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Update Type</label>
              <div className="type-selector">
                {[
                  { value: 'product-changelog', label: '📦 Product Changelog', desc: 'Features, bugfixes, releases' },
                  { value: 'customer-interview', label: '🎥 Customer Interview', desc: 'Recorded feedback & insights' },
                  { value: 'growth-metric', label: '📈 Growth Metric', desc: 'DAU, MRR, conversion rates' },
                  { value: 'customer-feedback', label: '💬 Feedback', desc: 'Direct customer quotes' },
                  { value: 'iteration', label: '🔄 Iteration', desc: 'Learning from mistake' },
                  { value: 'revenue-milestone', label: '💰 Revenue', desc: 'Revenue achievements' }
                ].map(type => (
                  <button
                    key={type.value}
                    type="button"
                    className={`type-option ${selectedType === type.value ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedType(type.value);
                      setFormData(prev => ({ ...prev, type: type.value }));
                    }}
                  >
                    <div className="type-main">{type.label}</div>
                    <div className="type-desc">{type.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Shipped Dark Mode, Hit 10k MAU"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell the story. Why does this matter? What did you learn?"
                required
              />
            </div>

            {/* Product Changelog Fields */}
            {selectedType === 'product-changelog' && (
              <div className="form-section-nested">
                <h4>What shipped?</h4>
                <div className="form-group">
                  <label>New Features (one per line)</label>
                  <textarea
                    name="features"
                    value={formData.changelog.features?.join('\n') || ''}
                    onChange={handleChangelogChange}
                    placeholder="Dark mode&#10;API rate limiting&#10;Analytics dashboard"
                  />
                </div>
                <div className="form-group">
                  <label>Bug Fixes (one per line)</label>
                  <textarea
                    name="bugFixes"
                    value={formData.changelog.bugFixes?.join('\n') || ''}
                    onChange={handleChangelogChange}
                    placeholder="Fixed memory leak&#10;Resolved auth timeout"
                  />
                </div>
                <div className="form-group">
                  <label>Release Notes</label>
                  <textarea
                    name="releaseNotes"
                    value={formData.changelog.releaseNotes || ''}
                    onChange={handleChangelogChange}
                    placeholder="Additional context..."
                  />
                </div>
              </div>
            )}

            {/* Customer Interview Fields */}
            {selectedType === 'customer-interview' && (
              <div className="form-section-nested">
                <h4>Customer Proof</h4>
                <div className="form-group">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerInterview.customerName}
                    onChange={handleInterviewChange}
                    placeholder="e.g., Sarah Johnson"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.customerInterview.companyName}
                    onChange={handleInterviewChange}
                    placeholder="e.g., TechCorp Inc"
                  />
                </div>
                <div className="form-group">
                  <label>Interview Date</label>
                  <input
                    type="date"
                    name="interviewDate"
                    value={formData.customerInterview.interviewDate}
                    onChange={handleInterviewChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Video URL</label>
                  <input
                    type="url"
                    name="videoUrl"
                    value={formData.customerInterview.videoUrl}
                    onChange={handleInterviewChange}
                    placeholder="Link to recorded interview"
                  />
                </div>
                <div className="form-group">
                  <label>Key Insights</label>
                  <textarea
                    placeholder="Main takeaways from the interview (one per line)"
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      customerInterview: {
                        ...prev.customerInterview,
                        keyInsights: e.target.value.split('\n').filter(i => i.trim())
                      }
                    }))}
                  />
                </div>
              </div>
            )}

            {/* Growth Metrics Fields */}
            {selectedType === 'growth-metric' && (
              <div className="form-section-nested">
                <h4>Share Your Numbers</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Monthly Active Users (MAU)</label>
                    <input
                      type="number"
                      name="mau"
                      value={formData.metrics.mau || ''}
                      onChange={handleMetricChange}
                      placeholder="e.g., 5000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Net Promoter Score (NPS)</label>
                    <input
                      type="number"
                      name="nps"
                      value={formData.metrics.nps || ''}
                      onChange={handleMetricChange}
                      placeholder="e.g., 62"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Monthly Recurring Revenue (MRR)</label>
                    <input
                      type="number"
                      name="mrr"
                      value={formData.metrics.mrr || ''}
                      onChange={handleMetricChange}
                      placeholder="e.g., 25000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Churn Rate (%)</label>
                    <input
                      type="number"
                      name="churnRate"
                      value={formData.metrics.churnRate || ''}
                      onChange={handleMetricChange}
                      placeholder="e.g., 3.5"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-primary">Publish Update</button>
              <button type="button" className="btn-outline" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Live Ledger Feed */}
      <div className="ledger-feed">
        <h3>Your Execution Timeline</h3>
        {powEntries.length === 0 ? (
          <div className="empty-state">
            <p className="text-muted">Start building your proof of work ledger. Every update shows investors real execution, not just promises.</p>
          </div>
        ) : (
          <div className="timeline">
            {powEntries.map((entry, idx) => (
              <div key={entry._id} className="timeline-item">
                <div className="timeline-date">
                  {new Date(entry.displayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="entry-header">
                    <span className="entry-type-badge">{getTypeIcon(entry.type)} {entry.type.replace('-', ' ')}</span>
                    {entry.verified && <span className="verified-badge">✓ Verified</span>}
                    {getScoreBadge(entry.executionScore)}
                  </div>
                  <h4>{entry.title}</h4>
                  <p>{entry.description}</p>

                  {/* Display changelog items */}
                  {entry.changelog && (entry.changelog.features?.length > 0 || entry.changelog.bugFixes?.length > 0) && (
                    <div className="changelog-preview">
                      {entry.changelog.features?.length > 0 && (
                        <div className="changelog-section">
                          <strong>✨ New:</strong> {entry.changelog.features.slice(0, 2).join(', ')}
                        </div>
                      )}
                      {entry.changelog.bugFixes?.length > 0 && (
                        <div className="changelog-section">
                          <strong>🐛 Fixed:</strong> {entry.changelog.bugFixes.slice(0, 1).join(', ')}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Display customer interview */}
                  {entry.customerInterview?.customerName && (
                    <div className="interview-preview">
                      <div className="interview-info">
                        <strong>{entry.customerInterview.customerName}</strong> from {entry.customerInterview.companyName}
                      </div>
                      {entry.customerInterview.videoUrl && (
                        <a href={entry.customerInterview.videoUrl} target="_blank" rel="noopener noreferrer" className="video-link">
                          🎥 Watch interview
                        </a>
                      )}
                    </div>
                  )}

                  {/* Display metrics */}
                  {(entry.metrics.mau || entry.metrics.mrr || entry.metrics.nps) && (
                    <div className="metrics-display">
                      {entry.metrics.mau > 0 && <span>{entry.metrics.mau.toLocaleString()} MAU</span>}
                      {entry.metrics.mrr > 0 && <span>${entry.metrics.mrr.toLocaleString()} MRR</span>}
                      {entry.metrics.nps > 0 && <span>NPS: {entry.metrics.nps}</span>}
                    </div>
                  )}

                  <div className="entry-engagement">
                    <small>👁️ {entry.engagement?.views || 0} views • ❤️ {entry.engagement?.reactions || 0} • 📤 {entry.engagement?.shares || 0}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProofOfWork;
