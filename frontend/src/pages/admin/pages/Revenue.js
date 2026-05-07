import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Revenue.css';

function Revenue({ user }) {
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/revenue', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRevenue(response.data);
    } catch (err) {
      console.error('Error fetching revenue:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>Loading revenue data...</p>
      </div>
    );
  }

  return (
    <div className="revenue-container">
      <div className="dashboard-header">
        <h2>Revenue Analytics</h2>
        <p>Monitor platform revenue and financial metrics</p>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="metric-content">
            <p className="metric-label">Total Revenue</p>
            <h3 className="metric-value">${(revenue?.totalRevenue || 0).toFixed(2)}</h3>
            <p className="metric-desc">From completed transactions</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon deals">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </div>
          <div className="metric-content">
            <p className="metric-label">Completed Deals</p>
            <h3 className="metric-value">{revenue?.completedDeals || 0}</h3>
            <p className="metric-desc">Successful marketplace transactions</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon average">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </div>
          <div className="metric-content">
            <p className="metric-label">Average Deal Size</p>
            <h3 className="metric-value">
              ${revenue?.completedDeals > 0 
                ? (revenue.totalRevenue / revenue.completedDeals).toFixed(0)
                : '0'
              }
            </h3>
            <p className="metric-desc">Per transaction amount</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="transactions-section">
        <h3>Recent Transactions</h3>
        
        {revenue?.listings?.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12h6M9 16h6M13 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" />
            </svg>
            <p>No completed transactions yet</p>
          </div>
        ) : (
          <div className="transactions-card">
            <div className="transactions-list">
              {revenue?.listings?.map((listing, index) => (
                <div key={listing._id} className={`transaction-row ${index !== revenue.listings.length - 1 ? 'with-border' : ''}`}>
                  <div className="transaction-startup">
                    <div className="startup-avatar">
                      {listing.startupId?.company?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="startup-info">
                      <p className="startup-name">{listing.startupId?.company || 'Unknown'}</p>
                      <p className="startup-date">{new Date(listing.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="transaction-details">
                    <div className="detail-item">
                      <span className="detail-label">Valuation</span>
                      <span className="detail-value">${(listing.askingValuation || 0).toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Fee</span>
                      <span className="detail-value fee">${(listing.transactionFee || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="transactions-footer">
              <p>Showing {revenue?.listings?.length || 0} recent transactions</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Revenue;
