import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Founders({ user }) {
  const [founders, setFounders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFounder, setSelectedFounder] = useState(null);
  const [founderDetails, setFounderDetails] = useState(null);

  useEffect(() => {
    fetchFounders();
  }, []);

  const fetchFounders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/investor/founders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFounders(response.data.founders);
    } catch (err) {
      console.error('Error fetching founders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFounderDetails = async (founderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/investor/founder/${founderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFounderDetails(response.data);
      setSelectedFounder(founderId);
    } catch (err) {
      console.error('Error fetching details:', err);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="dashboard-header">
        <h2>Browse Founders</h2>
        <p>Explore verified founders and their execution scores</p>
      </div>

      <div className="grid-2">
        {founders.map(founder => (
          <div key={founder._id} className="founder-card">
            <div className="founder-info">
              <h4>{founder.firstName} {founder.lastName}</h4>
              <p>{founder.company || 'Company pending'}</p>
              <p className="text-muted">{founder.email}</p>
            </div>
            <div className="founder-score">
              <div className="execution-badge">{founder.executionScore}</div>
              <small style={{ color: '#94a3b8', fontSize: '11px' }}>Score</small>
              {founder.verified && <span className="badge badge-success">✓ Verified</span>}
            </div>
            <button
              className="investment-button"
              onClick={() => fetchFounderDetails(founder._id)}
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {selectedFounder && founderDetails && (
        <div style={{ marginTop: '40px', padding: '30px', backgroundColor: 'var(--light-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h3>{founderDetails.founder.firstName} {founderDetails.founder.lastName}</h3>
            <button
              className="btn-outline"
              onClick={() => { setSelectedFounder(null); setFounderDetails(null); }}
            >
              Close
            </button>
          </div>

          <div className="grid-2" style={{ marginBottom: '30px' }}>
            <div>
              <p className="text-muted">Company</p>
              <p style={{ fontSize: '18px', fontWeight: '600' }}>{founderDetails.founder.company || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted">Location</p>
              <p style={{ fontSize: '18px', fontWeight: '600' }}>{founderDetails.founder.location || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted">Execution Score</p>
              <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--primary-color)' }}>{founderDetails.executionScore}</p>
            </div>
            <div>
              <p className="text-muted">Total Updates</p>
              <p style={{ fontSize: '18px', fontWeight: '600' }}>{founderDetails.totalEntries}</p>
            </div>
          </div>

          <div>
            <h4 style={{ marginBottom: '15px' }}>Recent Proof of Work</h4>
            {founderDetails.powEntries.length === 0 ? (
              <p className="text-muted">No entries yet</p>
            ) : (
              <div>
                {founderDetails.powEntries.slice(0, 5).map(pow => (
                  <div key={pow._id} style={{ padding: '12px', marginBottom: '10px', backgroundColor: 'rgba(99, 102, 241, 0.05)', borderRadius: '6px' }}>
                    <p style={{ fontWeight: '600', marginBottom: '5px' }}>{pow.title}</p>
                    <p style={{ fontSize: '13px', color: '#64748b' }}>{pow.description}</p>
                    <small style={{ color: '#94a3b8' }}>Score: {pow.executionScore}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Founders;
