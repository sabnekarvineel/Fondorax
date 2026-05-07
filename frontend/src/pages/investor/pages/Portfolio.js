import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Portfolio({ user }) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPortfolio = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/investor/portfolio', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setPortfolio(response.data.portfolio);
      } else {
        setError('Failed to load portfolio');
      }
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError('Error loading portfolio. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  if (error) {
    return (
      <div>
        <div className="dashboard-header">
          <h2>Your Investment Portfolio</h2>
          <p>Track all your investments and portfolio performance</p>
        </div>
        <div className="card" style={{ backgroundColor: '#fee2e2', borderColor: '#fecaca', padding: '20px' }}>
          <p style={{ color: '#991b1b', margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-header">
        <h2>Your Investment Portfolio</h2>
        <p>Track all your investments and portfolio performance</p>
      </div>

      {portfolio?.investments?.length === 0 ? (
        <div className="card">
          <p className="text-muted">No investments yet. Browse the marketplace or explore founders to get started.</p>
        </div>
      ) : (
        <div>
          <h3 style={{ marginBottom: '15px' }}>Active Investments</h3>
           <div className="grid-2">
             {portfolio?.investments?.map(inv => (
               <div key={inv._id} className="card">
                 <h4>{inv.startupId?.company || 'Company Name'}</h4>
                 <div style={{ marginTop: '15px' }}>
                   <p><strong>Investment:</strong> ${inv.investmentAmount?.toLocaleString()}</p>
                   <p><strong>Equity:</strong> {inv.equity}%</p>
                   <p><strong>Status:</strong> <span className="badge badge-success">{inv.status}</span></p>
                   <p className="text-muted" style={{ fontSize: '12px', marginTop: '10px' }}>
                     Invested: {new Date(inv.investmentDate).toLocaleDateString()}
                   </p>
                 </div>

               </div>
             ))}
           </div>

          <div className="mt-30">
            <h3>Portfolio Analysis</h3>
            <div className="card">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
                <div>
                  <p className="text-muted">Total Invested</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    ${portfolio?.analytics?.totalInvestment?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted">Average Return</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--success-color)' }}>
                    {portfolio?.analytics?.roiPercentage?.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-muted">Diversification</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    {portfolio?.analytics?.diversificationScore}/100
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Portfolio;
