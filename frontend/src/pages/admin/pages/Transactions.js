import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MarketplaceAdmin from '../components/MarketplaceAdmin';
import './Transactions.css';

function Transactions({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data.transactions);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="dashboard-header" style={{ marginBottom: '30px' }}>
        <h2>Marketplace Listings</h2>
        <p>Approve or reject startup listings</p>
      </div>
      <MarketplaceAdmin />
      <hr style={{ margin: '40px 0', borderColor: '#334155' }} />

      <div className="dashboard-header">
        <h2>Transaction Logs</h2>
        <p>Monitor all marketplace transactions and bids</p>
      </div>

      <div style={{ overflowX: 'auto' }} className="transactions-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Startup</th>
              <th>Exit Type</th>
              <th>Valuation</th>
              <th>Bids</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx._id}>
                <td>{typeof tx.founderId === 'object' ? tx.founderId?.company || 'Unknown' : 'Unknown'}</td>
                <td style={{ textTransform: 'capitalize' }}>{tx.exitType || 'N/A'}</td>
                <td>${tx.askingPrice?.toLocaleString() || '0'}</td>
                <td>{tx.interests?.length || 0}</td>
                <td>
                  <span className={`badge ${tx.status}`}>
                    {tx.status}
                  </span>
                </td>
                <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transactions.length === 0 && (
        <div className="card mt-20">
          <p className="text-muted">No transactions recorded yet.</p>
        </div>
      )}
    </div>
  );
}

export default Transactions;
