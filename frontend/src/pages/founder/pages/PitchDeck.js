import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PitchDeck.css';

function PitchDeck({ user }) {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    fileUrl: ''
  });

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/pitch/my-decks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDecks(response.data.decks);
    } catch (err) {
      console.error('Error fetching decks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/pitch/upload', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFormData({ title: '', fileUrl: '' });
      setShowForm(false);
      fetchDecks();
    } catch (err) {
      console.error('Error uploading deck:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your pitch decks...</p>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return 'badge-pending';
      case 'analyzing':
        return 'badge-analyzing';
      case 'analyzed':
        return 'badge-analyzed';
      default:
        return 'badge-pending';
    }
  };

  return (
    <div className="pitchdeck-container">
      <div className="pitchdeck-header">
        <h2>Your Pitch Deck</h2>
        <p>Upload and share your pitch deck with investors</p>
      </div>

      <div className="pitchdeck-upload-section">
        <button 
          className={`upload-btn ${showForm ? 'active' : ''}`}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Upload Pitch Deck'}
        </button>
      </div>

      {showForm && (
        <div className="pitchdeck-form-container">
          <h3>Upload Pitch Deck</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Deck Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Series A Pitch 2024"
                required
              />
            </div>

            <div className="form-group">
              <label>File URL</label>
              <input
                type="text"
                name="fileUrl"
                value={formData.fileUrl}
                onChange={handleChange}
                placeholder="https://example.com/pitch.pdf"
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Upload Deck
              </button>
              <button 
                type="button" 
                className="btn-outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="pitchdeck-list-section">
        <h3>Your Pitch Decks</h3>
        {decks.length === 0 ? (
          <div className="no-decks">
            <p>No pitch decks uploaded yet</p>
            <p style={{ fontSize: '0.9rem', margin: '8px 0 0 0', opacity: 0.8 }}>
              Upload one to get AI-powered analysis
            </p>
          </div>
        ) : (
          <div className="pitchdeck-grid">
            {decks.map(deck => (
              <div key={deck._id} className="deck-card">
                <div className="deck-card-header">
                  <h4>{deck.title}</h4>
                  <span className={`deck-badge ${getStatusBadge(deck.status)}`}>
                    {deck.status}
                  </span>
                </div>

                {deck.status === 'analyzed' && deck.analysis && (
                  <>
                    <div className="deck-card-divider"></div>
                    <div className="deck-analysis">
                      <div className="analysis-item">
                        <span className="analysis-label">Investment Readiness</span>
                        <span className={`analysis-value ${getScoreColor(deck.analysis.investmentReadinessScore)}`}>
                          {deck.analysis.investmentReadinessScore}%
                        </span>
                      </div>
                      <div className="analysis-item">
                        <span className="analysis-label">Risk Score</span>
                        <span className={`analysis-value ${getScoreColor(100 - deck.analysis.riskScore)}`}>
                          {deck.analysis.riskScore}%
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <div className="deck-card-divider"></div>

                <div className="deck-footer">
                  <span className="deck-date">
                    {new Date(deck.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <div className="deck-actions">
                    <button className="action-btn">View</button>
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

export default PitchDeck;
