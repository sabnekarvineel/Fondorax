import React, { useState } from 'react';
import axios from 'axios';
import '../../../styles/PitchAnalysis.css';

function PitchAnalysis({ user }) {
    const [formData, setFormData] = useState({
        companyName: '',
        founder: {
            yearsExperience: 0,
            previousStartups: 0,
            domainExpertise: false,
            hasCoFounder: false,
            hasTechCoFounder: false,
            fullTime: true
        },
        market: {
            tam: 0,
            growthRate: 0,
            competitorCount: 0,
            isTimely: false,
            isValidated: false,
            realistic: true
        },
        product: {
            stage: 'idea',
            hasUVP: false,
            isUnique: false,
            hasMoat: false,
            hasPatent: false,
            hasProprietary: false
        },
        traction: {
            monthlyRevenue: 0,
            momGrowth: 0,
            activeUsers: 0,
            retentionRate: 0,
            churnRate: 0,
            conversionRate: 0
        },
        finance: {
            monthlyBurn: 0,
            runway: 0,
            ltv: 0,
            cac: 0,
            grossMargin: 0,
            previousFunding: false
        }
    });

    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('founder');

    const handleNestedChange = (category, field, value) => {
        setFormData(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: isNaN(value) ? value : parseFloat(value)
            }
        }));
    };

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name === 'companyName' ? value : parseFloat(value))
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/analysis/pitch', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setAnalysis(response.data.analysis);
        } catch (error) {
            console.error('Error analyzing pitch:', error);
            alert('Error analyzing pitch: ' + error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const renderTab = () => {
        switch (activeTab) {
            case 'founder':
                return (
                    <div className="form-section">
                        <h3 className="form-section-title">👥 Founder & Team Information</h3>
                        <div className="form-group">
                            <label className="form-label">Years of Industry Experience</label>
                            <input
                                type="number"
                                value={formData.founder.yearsExperience}
                                onChange={(e) => handleNestedChange('founder', 'yearsExperience', e.target.value)}
                                placeholder="0"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Previous Startups Founded</label>
                            <input
                                type="number"
                                value={formData.founder.previousStartups}
                                onChange={(e) => handleNestedChange('founder', 'previousStartups', e.target.value)}
                                placeholder="0"
                                className="form-input"
                            />
                        </div>

                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.founder.domainExpertise}
                                    onChange={(e) => handleNestedChange('founder', 'domainExpertise', e.target.checked)}
                                    className="checkbox-input"
                                />
                                <span>Domain Expert in Industry</span>
                            </label>
                        </div>

                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.founder.hasCoFounder}
                                    onChange={(e) => handleNestedChange('founder', 'hasCoFounder', e.target.checked)}
                                    className="checkbox-input"
                                />
                                <span>Has Co-founder</span>
                            </label>
                        </div>

                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.founder.hasTechCoFounder}
                                    onChange={(e) => handleNestedChange('founder', 'hasTechCoFounder', e.target.checked)}
                                    className="checkbox-input"
                                />
                                <span>Has Technical Co-founder</span>
                            </label>
                        </div>

                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.founder.fullTime}
                                    onChange={(e) => handleNestedChange('founder', 'fullTime', e.target.checked)}
                                    className="checkbox-input"
                                />
                                <span>Founder Committed Full-time</span>
                            </label>
                        </div>
                    </div>
                );

            case 'market':
                return (
                    <div className="form-section">
                        <h3 className="form-section-title">📈 Market Opportunity</h3>
                        <div className="form-group">
                            <label className="form-label">Total Addressable Market (TAM) in $</label>
                            <input
                                type="number"
                                value={formData.market.tam}
                                onChange={(e) => handleNestedChange('market', 'tam', e.target.value)}
                                placeholder="1000000000"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Market Growth Rate (%)</label>
                            <input
                                type="number"
                                value={formData.market.growthRate}
                                onChange={(e) => handleNestedChange('market', 'growthRate', e.target.value)}
                                placeholder="20"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Number of Competitors</label>
                            <input
                                type="number"
                                value={formData.market.competitorCount}
                                onChange={(e) => handleNestedChange('market', 'competitorCount', e.target.value)}
                                placeholder="0"
                                className="form-input"
                            />
                        </div>

                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.market.isTimely}
                                    onChange={(e) => handleNestedChange('market', 'isTimely', e.target.checked)}
                                    className="checkbox-input"
                                />
                                <span>Perfect Market Timing</span>
                            </label>
                        </div>

                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.market.isValidated}
                                    onChange={(e) => handleNestedChange('market', 'isValidated', e.target.checked)}
                                    className="checkbox-input"
                                />
                                <span>Market Validated</span>
                            </label>
                        </div>
                    </div>
                );

            case 'product':
                return (
                    <div className="form-section">
                        <h3 className="form-section-title">🛠️ Product & Differentiation</h3>
                        <div className="form-group">
                            <label className="form-label">Product Stage</label>
                            <select
                                value={formData.product.stage}
                                onChange={(e) => handleNestedChange('product', 'stage', e.target.value)}
                                className="form-input"
                            >
                                <option value="idea">Idea</option>
                                <option value="prototype">Prototype</option>
                                <option value="mvp">MVP</option>
                                <option value="beta">Beta</option>
                                <option value="paying-customers">Paying Customers</option>
                                <option value="revenue">Revenue</option>
                            </select>
                        </div>

                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.product.hasUVP}
                                    onChange={(e) => handleNestedChange('product', 'hasUVP', e.target.checked)}
                                    className="checkbox-input"
                                />
                                <span>Clear Unique Value Proposition</span>
                            </label>
                        </div>

                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.product.isUnique}
                                    onChange={(e) => handleNestedChange('product', 'isUnique', e.target.checked)}
                                    className="checkbox-input"
                                />
                                <span>Truly Unique/Innovative</span>
                            </label>
                        </div>

                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.product.hasMoat}
                                    onChange={(e) => handleNestedChange('product', 'hasMoat', e.target.checked)}
                                    className="checkbox-input"
                                />
                                <span>Has Technological Moat</span>
                            </label>
                        </div>

                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.product.hasPatent}
                                    onChange={(e) => handleNestedChange('product', 'hasPatent', e.target.checked)}
                                    className="checkbox-input"
                                />
                                <span>Has Patents</span>
                            </label>
                        </div>
                    </div>
                );

            case 'traction':
                return (
                    <div className="form-section">
                        <h3 className="form-section-title">🚀 Traction & Growth</h3>
                        <div className="form-group">
                            <label className="form-label">Monthly Revenue ($)</label>
                            <input
                                type="number"
                                value={formData.traction.monthlyRevenue}
                                onChange={(e) => handleNestedChange('traction', 'monthlyRevenue', e.target.value)}
                                placeholder="0"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Monthly Growth Rate (%)</label>
                            <input
                                type="number"
                                value={formData.traction.momGrowth}
                                onChange={(e) => handleNestedChange('traction', 'momGrowth', e.target.value)}
                                placeholder="10"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Active Users</label>
                            <input
                                type="number"
                                value={formData.traction.activeUsers}
                                onChange={(e) => handleNestedChange('traction', 'activeUsers', e.target.value)}
                                placeholder="0"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Retention Rate (%)</label>
                            <input
                                type="number"
                                value={formData.traction.retentionRate}
                                onChange={(e) => handleNestedChange('traction', 'retentionRate', e.target.value)}
                                placeholder="80"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Churn Rate (%)</label>
                            <input
                                type="number"
                                value={formData.traction.churnRate}
                                onChange={(e) => handleNestedChange('traction', 'churnRate', e.target.value)}
                                placeholder="5"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Conversion Rate (%)</label>
                            <input
                                type="number"
                                value={formData.traction.conversionRate}
                                onChange={(e) => handleNestedChange('traction', 'conversionRate', e.target.value)}
                                placeholder="5"
                                className="form-input"
                            />
                        </div>
                    </div>
                );

            case 'finance':
                return (
                    <div className="form-section">
                        <h3 className="form-section-title">💰 Financial Health</h3>
                        <div className="form-group">
                            <label className="form-label">Monthly Burn Rate ($)</label>
                            <input
                                type="number"
                                value={formData.finance.monthlyBurn}
                                onChange={(e) => handleNestedChange('finance', 'monthlyBurn', e.target.value)}
                                placeholder="0"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Runway (Months)</label>
                            <input
                                type="number"
                                value={formData.finance.runway}
                                onChange={(e) => handleNestedChange('finance', 'runway', e.target.value)}
                                placeholder="12"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Lifetime Value (LTV) in $</label>
                            <input
                                type="number"
                                value={formData.finance.ltv}
                                onChange={(e) => handleNestedChange('finance', 'ltv', e.target.value)}
                                placeholder="0"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Customer Acquisition Cost (CAC) in $</label>
                            <input
                                type="number"
                                value={formData.finance.cac}
                                onChange={(e) => handleNestedChange('finance', 'cac', e.target.value)}
                                placeholder="0"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Gross Margin (%)</label>
                            <input
                                type="number"
                                value={formData.finance.grossMargin}
                                onChange={(e) => handleNestedChange('finance', 'grossMargin', e.target.value)}
                                placeholder="60"
                                className="form-input"
                            />
                        </div>

                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.finance.previousFunding}
                                    onChange={(e) => handleNestedChange('finance', 'previousFunding', e.target.checked)}
                                    className="checkbox-input"
                                />
                                <span>Raised Previous Funding</span>
                            </label>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="pitch-analysis-container">
            <div className="analysis-header">
                <div className="header-content">
                    <h1>Self-Assess Your Pitch</h1>
                    <p className="header-subtitle">AI-powered pitch analysis with instant scoring and recommendations</p>
                </div>
            </div>

            {!analysis ? (
                <div className="analysis-form-wrapper">
                    <div className="pitch-form-card">
                        <div className="company-name-section">
                            <label htmlFor="companyName" className="form-label">Company Name</label>
                            <input
                                id="companyName"
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                placeholder="Enter your company name"
                                className="company-name-input"
                            />
                        </div>

                        <div className="tabs-section">
                            <div className="tabs-container">
                                {['founder', 'market', 'product', 'traction', 'finance'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                                    >
                                        <span className="tab-label">{tab}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="tabs-indicator" />
                        </div>

                        <div className="form-content">
                            {renderTab()}
                        </div>

                        <button
                            className="submit-button"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner">⏳</span>
                                    Analyzing Your Pitch...
                                </>
                            ) : (
                                <>
                                    <span className="rocket-icon">🚀</span>
                                    Run AI Analysis
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <AnalysisReport analysis={analysis} onReset={() => setAnalysis(null)} />
            )}
        </div>
    );
}

function AnalysisReport({ analysis, onReset }) {
    return (
        <div>
            {/* Overall Score */}
            <div className="card" style={{ backgroundColor: analysis.overallScore >= 75 ? '#f0fdf4' : '#fff7ed', borderLeft: `4px solid ${analysis.overallScore >= 75 ? '#10b981' : '#f59e0b'}` }}>
                <h3>Overall Investment Score</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', color: analysis.overallScore >= 75 ? '#10b981' : '#f59e0b' }}>
                        {analysis.overallScore}
                    </div>
                    <div>
                        <p style={{ margin: 0 }}>Risk Level: <span className="badge" style={{ background: analysis.riskLevel === 'Low Risk' ? '#d1fae5' : '#fed7aa', color: analysis.riskLevel === 'Low Risk' ? '#059669' : '#d97706' }}>{analysis.riskLevel}</span></p>
                        <p style={{ margin: '10px 0 0 0' }}>{analysis.summary}</p>
                    </div>
                </div>
            </div>

            {/* Category Scores */}
            <div className="grid-2" style={{ marginTop: '30px', marginBottom: '30px' }}>
                <ScoreCard label="Founder & Team" score={analysis.foundScore} weight="20%" />
                <ScoreCard label="Market Opportunity" score={analysis.marketScore} weight="15%" />
                <ScoreCard label="Product" score={analysis.productScore} weight="15%" />
                <ScoreCard label="Traction" score={analysis.tractionScore} weight="25%" />
                <ScoreCard label="Financial Health" score={analysis.financeScore} weight="15%" />
                <ScoreCard label="Risk Management" score={analysis.riskScore} weight="10%" />
            </div>

            {/* Key Metrics */}
            <div className="card" style={{ marginBottom: '30px' }}>
                <h3>Key Financial Metrics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
                    {Object.entries(analysis.metrics).map(([key, value]) => (
                        <div key={key}>
                            <p className="text-muted" style={{ fontSize: '12px', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</p>
                            <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '5px 0' }}>{value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Alerts */}
            {analysis.alerts.length > 0 && (
                <div className="card" style={{ marginBottom: '30px', borderLeft: '4px solid #ef4444' }}>
                    <h3>⚠️ Alerts & Red Flags</h3>
                    {analysis.alerts.map((alert, idx) => (
                        <div key={idx} style={{ marginBottom: '12px', padding: '12px', backgroundColor: alert.level === 'critical' ? '#fee2e2' : '#fef3c7', borderRadius: '6px' }}>
                            <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>{alert.title}</p>
                            <p style={{ margin: 0, fontSize: '14px' }}>{alert.message}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Recommendations */}
            <div className="card" style={{ marginBottom: '30px' }}>
                <h3>Investment Recommendations</h3>
                {analysis.recommendations.map((rec, idx) => (
                    <p key={idx} style={{ margin: '10px 0' }}>✓ {rec}</p>
                ))}
            </div>

            {/* SWOT Analysis */}
            <div className="grid-2" style={{ marginBottom: '30px' }}>
                <SwotBox title="Strengths" items={analysis.swotAnalysis.strengths} type="strength" />
                <SwotBox title="Weaknesses" items={analysis.swotAnalysis.weaknesses} type="weakness" />
                <SwotBox title="Opportunities" items={analysis.swotAnalysis.opportunities} type="opportunity" />
                <SwotBox title="Threats" items={analysis.swotAnalysis.threats} type="threat" />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-primary" onClick={onReset}>← Analyze Another Pitch</button>
                <button className="btn-outline">📊 Export as PDF</button>
            </div>
        </div>
    );
}

function ScoreCard({ label, score, weight }) {
    return (
        <div className="card">
            <p className="text-muted" style={{ fontSize: '12px' }}>{label}</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary-color)', margin: '5px 0' }}>
                {score}
            </p>
            <p className="text-muted" style={{ fontSize: '12px' }}>{weight} weight</p>
        </div>
    );
}

function SwotBox({ title, items, type }) {
    const colors = {
        strength: { bg: '#f0fdf4', border: '#10b981', icon: '✓' },
        weakness: { bg: '#fee2e2', border: '#ef4444', icon: '✗' },
        opportunity: { bg: '#dbeafe', border: '#3b82f6', icon: '→' },
        threat: { bg: '#fef3c7', border: '#f59e0b', icon: '!' }
    };

    const color = colors[type];

    return (
        <div className="card" style={{ backgroundColor: color.bg, borderLeft: `4px solid ${color.border}` }}>
            <h4>{title}</h4>
            {items.length === 0 ? (
                <p className="text-muted">None identified</p>
            ) : (
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {items.map((item, idx) => (
                        <li key={idx} style={{ margin: '8px 0' }}>{item}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default PitchAnalysis;
