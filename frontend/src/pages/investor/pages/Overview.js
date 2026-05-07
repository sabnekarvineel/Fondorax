import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Overview({ user }) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/investor/portfolio', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPortfolio(response.data.portfolio);
      } catch (err) {
        console.error('Error fetching portfolio:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="dashboard-header">
        <h2>Welcome, {user.firstName}!</h2>
        <p>Monitor your investment portfolio and discover new opportunities</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Invested</div>
          <div className="metric-value">
            ${portfolio?.analytics?.totalInvestment?.toLocaleString() || '0'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Portfolio Value</div>
          <div className="metric-value">
            ${portfolio?.analytics?.portfolioValue?.toLocaleString() || '0'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Overall ROI</div>
          <div className="metric-value">
            {portfolio?.analytics?.roiPercentage?.toFixed(2)}%
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Active Investments</div>
          <div className="metric-value">
            {portfolio?.investments?.filter(i => i.status === 'active').length || 0}
          </div>
        </div>
      </div>

      <div className="mt-30">
        <h3>Quick Stats</h3>
        <div className="grid-2" style={{ marginTop: '15px', gap: '20px' }}>
          <div className="card">
            <p className="text-muted" style={{ fontSize: '12px', margin: '0 0 10px 0' }}>Diversification Score</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#6366f1', margin: 0 }}>
              {portfolio?.analytics?.diversificationScore || 0}<span style={{ fontSize: '16px', color: '#999' }}>/100</span>
            </p>
          </div>

          <div className="card">
            <p className="text-muted" style={{ fontSize: '12px', margin: '0 0 10px 0' }}>High Risk Investments</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444', margin: 0 }}>
              {portfolio?.riskMetrics?.highRiskCount || 0}
            </p>
          </div>

          <div className="card">
            <p className="text-muted" style={{ fontSize: '12px', margin: '0 0 10px 0' }}>Medium Risk Investments</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>
              {portfolio?.riskMetrics?.mediumRiskCount || 0}
            </p>
          </div>

          <div className="card">
            <p className="text-muted" style={{ fontSize: '12px', margin: '0 0 10px 0' }}>Low Risk Investments</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', margin: 0 }}>
              {portfolio?.riskMetrics?.lowRiskCount || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Overview;
