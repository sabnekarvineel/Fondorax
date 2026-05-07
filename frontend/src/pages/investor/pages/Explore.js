import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function Explore({ user }) {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [listings, setListings] = useState([]);
  const [pitchDesks, setPitchDesks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [bidAmount, setBidAmount] = useState('');

  // Pitch Desk Filters
  const [selectedStage, setSelectedStage] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');

  const stages = ['pre-seed', 'seed', 'series-a', 'series-b', 'series-c', 'series-d+'];
  const industries = ['SaaS', 'AI/ML', 'Biotech', 'FinTech', 'ClimateTech', 'Creator Economy', 'Other'];

  const fetchPitchDesksCallback = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (selectedStage !== 'all') params.append('stage', selectedStage);
      if (selectedIndustry !== 'all') params.append('industry', selectedIndustry);
      
      const response = await axios.get(`http://localhost:5000/api/pitch/desks?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPitchDesks(response.data.pitchDesks || []);
    } catch (err) {
      console.error('Error fetching pitch desks:', err);
      alert('Error loading pitch desks. Please try again.');
      setPitchDesks([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStage, selectedIndustry]);

  useEffect(() => {
    if (activeTab === 'marketplace') {
      fetchListings();
    } else if (activeTab === 'pitchdesks') {
      fetchPitchDesksCallback();
    }
  }, [activeTab, fetchPitchDesksCallback]);

  const fetchListings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/marketplace/listings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListings(response.data.listings);
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPitchDesks = pitchDesks.filter(pitch => {
    const stageMatch = selectedStage === 'all' || pitch.stage === selectedStage;
    const industryMatch = selectedIndustry === 'all' || pitch.industry === selectedIndustry;
    return stageMatch && industryMatch;
  });

  const handlePlaceBid = async (listingId) => {
    if (!bidAmount || bidAmount <= 0) {
      alert('Please enter a valid bid amount');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/marketplace/place-bid/${listingId}`,
        { bidAmount: parseFloat(bidAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setBidAmount('');
      setSelectedListing(null);
      fetchListings();
      alert('Bid placed successfully!');
    } catch (err) {
      console.error('Error placing bid:', err);
      alert('Error placing bid');
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <h2>Explore</h2>
        <p>Discover investment opportunities and pitch desks</p>
      </div>

      {/* Tab Navigation */}
      <div className="tabs-container" style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
        <button 
          className={`tab-button ${activeTab === 'marketplace' ? 'active' : ''}`}
          onClick={() => { setActiveTab('marketplace'); setLoading(true); }}
          style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontWeight: activeTab === 'marketplace' ? 'bold' : 'normal' }}
        >
          Marketplace
        </button>
        <button 
          className={`tab-button ${activeTab === 'pitchdesks' ? 'active' : ''}`}
          onClick={() => { setActiveTab('pitchdesks'); setLoading(true); }}
          style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontWeight: activeTab === 'pitchdesks' ? 'bold' : 'normal' }}
        >
          Pitch Desks
        </button>
      </div>

      {/* Marketplace Tab */}
      {activeTab === 'marketplace' && (
        <div>
          {loading ? (
            <div className="card">
              <p className="text-muted">Loading marketplace listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="card">
              <p className="text-muted">No listings available at the moment.</p>
            </div>
          ) : (
            <div className="grid-2">
              {listings.map(listing => (
                <div key={listing._id} className="card" style={{ marginBottom: '20px' }}>
                  <h4 style={{ marginTop: 0 }}>{listing.startupId?.company || listing.company || 'Unknown'}</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px', fontSize: '14px' }}>
                    <div>
                      <p className="text-muted" style={{ margin: '0 0 5px 0', fontSize: '12px' }}>Exit Type</p>
                      <p style={{ margin: 0, fontWeight: '600', textTransform: 'capitalize' }}>{listing.exitType}</p>
                    </div>
                    <div>
                      <p className="text-muted" style={{ margin: '0 0 5px 0', fontSize: '12px' }}>Valuation</p>
                      <p style={{ margin: 0, fontWeight: '600' }}>${listing.askingValuation?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted" style={{ margin: '0 0 5px 0', fontSize: '12px' }}>Equity</p>
                      <p style={{ margin: 0, fontWeight: '600' }}>{listing.equityOffered}%</p>
                    </div>
                    <div>
                      <p className="text-muted" style={{ margin: '0 0 5px 0', fontSize: '12px' }}>Bids</p>
                      <p style={{ margin: 0, fontWeight: '600' }}>{listing.bids?.length || 0}</p>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: '#666', margin: '15px 0' }}>
                    {listing.description}
                  </p>

                  <button
                    className="btn-primary"
                    onClick={() => setSelectedListing(listing._id)}
                    style={{ width: '100%', padding: '8px' }}
                  >
                    Place Bid
                  </button>

                  {selectedListing === listing._id && (
                    <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f0f4f8', borderRadius: '6px' }}>
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder="Enter bid amount"
                        style={{ width: '100%', marginBottom: '10px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                      <button
                        className="btn-success"
                        onClick={() => handlePlaceBid(listing._id)}
                        style={{ width: '100%', marginBottom: '8px', padding: '8px' }}
                      >
                        Confirm Bid
                      </button>
                      <button
                        className="btn-outline"
                        onClick={() => { setSelectedListing(null); setBidAmount(''); }}
                        style={{ width: '100%', padding: '8px' }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pitch Desks Tab */}
      {activeTab === 'pitchdesks' && (
        <div>
          {/* Filters */}
          <div className="card" style={{ marginBottom: '30px', padding: '20px' }}>
            <h4 style={{ marginTop: 0 }}>Filters</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Stage</label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="all">All Stages</option>
                  {stages.map(stage => (
                    <option key={stage} value={stage}>
                      {stage.charAt(0).toUpperCase() + stage.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Industry</label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="all">All Industries</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pitch Desks Grid */}
          {loading ? (
            <div className="card">
              <p className="text-muted">Loading pitch desks...</p>
            </div>
          ) : filteredPitchDesks.length === 0 ? (
            <div className="card">
              <p className="text-muted">No pitch desks found matching your filters.</p>
            </div>
          ) : (
            <div className="grid-2">
              {filteredPitchDesks.map(pitch => (
                <div key={pitch._id} className="card" style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0' }}>{pitch.founderName || 'Unknown'}</h4>
                      <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{pitch.company || 'Unnamed Company'}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', backgroundColor: '#dbeafe', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                        {pitch.stage?.replace('-', ' ').toUpperCase() || 'N/A'}
                      </span>
                      <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>{pitch.industry || 'N/A'}</p>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: '#666', margin: '15px 0', minHeight: '40px' }}>
                    {pitch.description || 'No description available'}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px', fontSize: '13px' }}>
                    <div>
                      <p className="text-muted" style={{ margin: '0 0 5px 0', fontSize: '11px' }}>Seeking</p>
                      <p style={{ margin: 0, fontWeight: '600' }}>${pitch.fundingAmount?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted" style={{ margin: '0 0 5px 0', fontSize: '11px' }}>Equity</p>
                      <p style={{ margin: 0, fontWeight: '600' }}>{pitch.equityOffered || 'N/A'}%</p>
                    </div>
                  </div>

                  <button
                    className="btn-primary"
                    style={{ width: '100%', padding: '8px' }}
                  >
                    View Pitch Deck
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


    </div>
  );
}

export default Explore;
