import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ProofOfWorkPremium.css';

function ProofOfWorkPremium({ user }) {
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
        changelog: { features: '', bugFixes: '', releaseNotes: '' },
        customerInterview: {
            customerName: '',
            companyName: '',
            interviewDate: '',
            videoUrl: '',
            keyInsights: '',
            recordingDuration: 0
        },
        attachments: []
    });

    const entryTypes = [
        {
            id: 'product-changelog',
            name: 'Product Update',
            subtitle: 'Features, fixes & releases',
            icon: 'package'
        },
        {
            id: 'customer-interview',
            name: 'Customer Interview',
            subtitle: 'Recorded customer feedback',
            icon: 'video'
        },
        {
            id: 'growth-metric',
            name: 'Growth Metrics',
            subtitle: 'Users, revenue, engagement',
            icon: 'trending'
        },
        {
            id: 'customer-feedback',
            name: 'Customer Feedback',
            subtitle: 'Testimonials & reviews',
            icon: 'message'
        },
        {
            id: 'iteration',
            name: 'Learning & Iteration',
            subtitle: 'What you learned & changed',
            icon: 'refresh'
        },
        {
            id: 'revenue-milestone',
            name: 'Revenue Milestone',
            subtitle: 'Revenue achievements',
            icon: 'dollar'
        }
    ];

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

    const handleSelectType = (typeId) => {
        setSelectedType(typeId);
        setFormData(prev => ({ ...prev, type: typeId }));
        setFormStep('fill-form');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
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
            alert('Error: ' + err.response?.data?.message);
        }
    };

    const resetForm = () => {
        setFormData({
            type: '',
            title: '',
            description: '',
            metrics: {},
            changelog: { features: '', bugFixes: '', releaseNotes: '' },
            customerInterview: {
                customerName: '',
                companyName: '',
                interviewDate: '',
                videoUrl: '',
                keyInsights: '',
                recordingDuration: 0
            },
            attachments: []
        });
        setSelectedType(null);
        setFormStep('type-select');
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
        setFormData(prev => ({
            ...prev,
            changelog: { ...prev.changelog, [name]: value }
        }));
    };

    const handleInterviewChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            customerInterview: { ...prev.customerInterview, [name]: value }
        }));
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#3b82f6';
        if (score >= 40) return '#f59e0b';
        return '#ef4444';
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Developing';
    };

    const renderTypeIcon = (iconType) => {
        const icons = {
            package: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
            ),
            video: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
            ),
            trending: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 17"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
            ),
            message: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            ),
            refresh: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36"></path>
                </svg>
            ),
            dollar: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
            )
        };
        return icons[iconType] || null;
    };

    const selectedTypeData = entryTypes.find(t => t.id === selectedType);

    if (loading) return <div className="pow-loading">Loading...</div>;

    return (
        <div className="pow-premium-container">




            {/* Header Section */}
            <div className="pow-header-section">
                <div className="pow-header-content">
                    <h1>Execution Ledger</h1>
                    <p>Document your real execution, customer feedback, and growth metrics</p>
                </div>
                <button
                    className="pow-create-btn"
                    onClick={() => setShowForm(!showForm)}
                >
                    <span className="btn-plus">+</span>
                    <span>New Entry</span>
                </button>
            </div>

            {/* Metrics Dashboard */}
            {metrics && (
                <div className="pow-metrics-dashboard">
                    <div className="metrics-grid">
                        <div className="metric-card">
                            <div className="metric-card-header">Execution</div>
                            <div className="metric-card-value" style={{ color: getScoreColor(metrics.scores.execution) }}>
                                {Math.round(metrics.scores.execution)}
                            </div>
                            <div className="metric-card-bar">
                                <div
                                    className="metric-card-fill"
                                    style={{ width: `${metrics.scores.execution}%`, backgroundColor: getScoreColor(metrics.scores.execution) }}
                                ></div>
                            </div>
                            <div className="metric-card-label">{getScoreLabel(metrics.scores.execution)}</div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-card-header">Transparency</div>
                            <div className="metric-card-value" style={{ color: getScoreColor(metrics.scores.transparency) }}>
                                {Math.round(metrics.scores.transparency)}
                            </div>
                            <div className="metric-card-bar">
                                <div
                                    className="metric-card-fill"
                                    style={{ width: `${metrics.scores.transparency}%`, backgroundColor: getScoreColor(metrics.scores.transparency) }}
                                ></div>
                            </div>
                            <div className="metric-card-label">{getScoreLabel(metrics.scores.transparency)}</div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-card-header">Velocity</div>
                            <div className="metric-card-value" style={{ color: getScoreColor(metrics.scores.velocity) }}>
                                {Math.round(metrics.scores.velocity)}
                            </div>
                            <div className="metric-card-bar">
                                <div
                                    className="metric-card-fill"
                                    style={{ width: `${metrics.scores.velocity}%`, backgroundColor: getScoreColor(metrics.scores.velocity) }}
                                ></div>
                            </div>
                            <div className="metric-card-label">{getScoreLabel(metrics.scores.velocity)}</div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-card-header">Updates</div>
                            <div className="metric-card-value">{metrics.totalEntries}</div>
                            <div className="metric-card-detail">{metrics.postingFrequency} per week</div>
                            <div className="metric-card-label">Posting frequency</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Section */}
            {showForm && (
                <div className="pow-form-container">
                    {formStep === 'type-select' && (
                        <div className="pow-type-selection">
                            <div className="pow-form-header">
                                <h2>What would you like to document?</h2>
                                <p>Select the type of update you want to share</p>
                            </div>

                            <div className="pow-type-grid">
                                {entryTypes.map(type => (
                                    <div
                                        key={type.id}
                                        className="pow-type-card"
                                        onClick={() => handleSelectType(type.id)}
                                    >
                                        <div className="pow-type-icon">
                                            {renderTypeIcon(type.icon)}
                                        </div>
                                        <div className="pow-type-info">
                                            <h3>{type.name}</h3>
                                            <p>{type.subtitle}</p>
                                        </div>
                                        <div className="pow-type-arrow">→</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {formStep === 'fill-form' && selectedTypeData && (
                        <div className="pow-form-fill">
                            <div className="pow-form-header-fill">
                                <button className="pow-back-btn" onClick={() => setFormStep('type-select')}>← Back</button>
                                <h2>{selectedTypeData.name}</h2>
                                <p>{selectedTypeData.subtitle}</p>
                            </div>

                            <form onSubmit={handleSubmit} className="pow-entry-form">
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Give this update a clear title"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Tell the story. Why does this matter? What's the context?"
                                        rows="6"
                                        required
                                    ></textarea>
                                </div>

                                {/* Product Changelog Fields */}
                                {selectedType === 'product-changelog' && (
                                    <div className="form-section-box">
                                        <h3>What shipped?</h3>
                                        <div className="form-group">
                                            <label>New Features (one per line)</label>
                                            <textarea
                                                name="features"
                                                value={formData.changelog.features}
                                                onChange={handleChangelogChange}
                                                placeholder="Dark mode&#10;Analytics dashboard&#10;API rate limiting"
                                                rows="4"
                                            ></textarea>
                                        </div>
                                        <div className="form-group">
                                            <label>Bug Fixes (one per line)</label>
                                            <textarea
                                                name="bugFixes"
                                                value={formData.changelog.bugFixes}
                                                onChange={handleChangelogChange}
                                                placeholder="Fixed memory leak&#10;Resolved auth timeout"
                                                rows="4"
                                            ></textarea>
                                        </div>
                                    </div>
                                )}

                                {/* Customer Interview Fields */}
                                {selectedType === 'customer-interview' && (
                                    <div className="form-section-box">
                                        <h3>Customer Details</h3>
                                        <div className="form-row">
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
                                        </div>
                                        <div className="form-row">
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
                                        </div>
                                        <div className="form-group">
                                            <label>Key Insights (one per line)</label>
                                            <textarea
                                                name="keyInsights"
                                                value={formData.customerInterview.keyInsights}
                                                onChange={handleInterviewChange}
                                                placeholder="Main takeaways from interview"
                                                rows="4"
                                            ></textarea>
                                        </div>
                                    </div>
                                )}

                                {/* Growth Metrics Fields */}
                                {selectedType === 'growth-metric' && (
                                    <div className="form-section-box">
                                        <h3>Key Metrics</h3>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Monthly Active Users (MAU)</label>
                                                <input
                                                    type="number"
                                                    name="mau"
                                                    value={formData.metrics.mau || ''}
                                                    onChange={handleMetricChange}
                                                    placeholder="e.g., 15000"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Monthly Recurring Revenue (MRR)</label>
                                                <input
                                                    type="number"
                                                    name="mrr"
                                                    value={formData.metrics.mrr || ''}
                                                    onChange={handleMetricChange}
                                                    placeholder="e.g., 45000"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
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

                                {/* Customer Feedback */}
                                {selectedType === 'customer-feedback' && (
                                    <div className="form-section-box">
                                        <h3>Customer Information</h3>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Customer Name</label>
                                                <input
                                                    type="text"
                                                    name="customerName"
                                                    value={formData.customerInterview.customerName}
                                                    onChange={handleInterviewChange}
                                                    placeholder="Who gave this feedback?"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Company</label>
                                                <input
                                                    type="text"
                                                    name="companyName"
                                                    value={formData.customerInterview.companyName}
                                                    onChange={handleInterviewChange}
                                                    placeholder="Their company"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Revenue Milestone */}
                                {selectedType === 'revenue-milestone' && (
                                    <div className="form-section-box">
                                        <h3>Revenue Details</h3>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Monthly Recurring Revenue (MRR)</label>
                                                <input
                                                    type="number"
                                                    name="mrr"
                                                    value={formData.metrics.mrr || ''}
                                                    onChange={handleMetricChange}
                                                    placeholder="Current MRR"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Customer Count</label>
                                                <input
                                                    type="number"
                                                    name="mau"
                                                    value={formData.metrics.mau || ''}
                                                    onChange={handleMetricChange}
                                                    placeholder="Number of paying customers"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="form-btn-cancel"
                                        onClick={resetForm}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="form-btn-submit">
                                        Publish Entry
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* Entries Timeline */}
            <div className="pow-timeline-section">
                <h2>Your Execution Timeline</h2>
                {powEntries.length === 0 ? (
                    <div className="pow-empty-state">
                        <div className="empty-state-content">
                            <h3>No entries yet</h3>
                            <p>Start building your execution ledger. Document your progress and let investors see real work, not promises.</p>
                        </div>
                    </div>
                ) : (
                    <div className="pow-entries-list">
                        {powEntries.map((entry) => (
                            <div key={entry._id} className="pow-entry-card">
                                <div className="entry-card-header">
                                    <div className="entry-type-badge">
                                        {entryTypes.find(t => t.id === entry.type)?.name || 'Update'}
                                    </div>
                                    <div className="entry-date">
                                        {new Date(entry.displayDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>

                                <h3 className="entry-title">{entry.title}</h3>
                                <p className="entry-description">{entry.description}</p>

                                {/* Changelog Preview */}
                                {entry.changelog && (entry.changelog.features || entry.changelog.bugFixes) && (
                                    <div className="entry-section">
                                        {entry.changelog.features && (
                                            <div className="entry-item">
                                                <span className="item-label">Features Shipped</span>
                                                <span className="item-value">
                                                    {(Array.isArray(entry.changelog.features)
                                                        ? entry.changelog.features
                                                        : entry.changelog.features.split('\n')).filter(f => f.trim()).length} item(s)
                                                </span>
                                            </div>
                                        )}
                                        {entry.changelog.bugFixes && (
                                            <div className="entry-item">
                                                <span className="item-label">Bugs Fixed</span>
                                                <span className="item-value">
                                                    {(Array.isArray(entry.changelog.bugFixes)
                                                        ? entry.changelog.bugFixes
                                                        : entry.changelog.bugFixes.split('\n')).filter(f => f.trim()).length} item(s)
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Customer Interview Preview */}
                                {entry.customerInterview?.customerName && (
                                    <div className="entry-section">
                                        <div className="entry-customer">
                                            <div className="customer-name">{entry.customerInterview.customerName}</div>
                                            <div className="customer-company">{entry.customerInterview.companyName}</div>
                                            {entry.customerInterview.videoUrl && (
                                                <a href={entry.customerInterview.videoUrl} target="_blank" rel="noopener noreferrer" className="video-link">
                                                    Watch Interview
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Metrics Display */}
                                {(entry.metrics.mau || entry.metrics.mrr || entry.metrics.nps) && (
                                    <div className="entry-metrics">
                                        {entry.metrics.mau > 0 && (
                                            <div className="metric-pill">
                                                <span className="metric-label">MAU</span>
                                                <span className="metric-value">{entry.metrics.mau.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {entry.metrics.mrr > 0 && (
                                            <div className="metric-pill">
                                                <span className="metric-label">MRR</span>
                                                <span className="metric-value">${entry.metrics.mrr.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {entry.metrics.nps > 0 && (
                                            <div className="metric-pill">
                                                <span className="metric-label">NPS</span>
                                                <span className="metric-value">{entry.metrics.nps}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Score Indicator */}
                                <div className="entry-footer">
                                    <div className="entry-score">
                                        <span className="score-label">Execution Score</span>
                                        <span
                                            className="score-value"
                                            style={{ color: getScoreColor(entry.executionScore) }}
                                        >
                                            {Math.round(entry.executionScore)}
                                        </span>
                                    </div>
                                    <div className="entry-engagement">
                                        <span>{entry.engagement?.views || 0} views</span>
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

export default ProofOfWorkPremium;
