import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Marketplace({ user }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    company: '',
    exitType: 'partial',
    askingValuation: '',
    equityOffered: '',
    description: ''
  });

  useEffect(() => {
    fetchListings();
  }, []);

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

  const handleCreateListing = async () => {
    if (!createForm.company || !createForm.askingValuation || !createForm.equityOffered) {
      alert('Please fill in all required fields');
      return;
    }

    if (createForm.equityOffered <= 0 || createForm.equityOffered > 100) {
      alert('Equity offered must be between 1 and 100');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/marketplace/create-listing',
        {
          company: createForm.company,
          exitType: createForm.exitType,
          askingValuation: parseFloat(createForm.askingValuation),
          equityOffered: parseFloat(createForm.equityOffered),
          description: createForm.description
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowCreateModal(false);
      setCreateForm({
        company: '',
        exitType: 'partial',
        askingValuation: '',
        equityOffered: '',
        description: ''
      });
      fetchListings();
      alert('Listing created successfully!');
    } catch (err) {
      console.error('Error creating listing:', err);
      alert(err.response?.data?.message || 'Error creating listing');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="dashboard-header">
        <h2>Micro-Exit Marketplace</h2>
        <p>Discover exit opportunities and place bids on startups</p>
        <button
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ marginTop: '15px' }}
        >
          Create Listing
        </button>
      </div>

      {showCreateModal && (
        <div className="card" style={{ marginBottom: '20px', backgroundColor: 'rgba(99, 102, 241, 0.05)' }}>
          <h3>Create Marketplace Listing</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Company Name *
            </label>
            <input
              type="text"
              value={createForm.company}
              onChange={(e) => setCreateForm({ ...createForm, company: e.target.value })}
              placeholder="Enter company name"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Exit Type *
            </label>
            <select
              value={createForm.exitType}
              onChange={(e) => setCreateForm({ ...createForm, exitType: e.target.value })}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="partial">Partial</option>
              <option value="full">Full</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Asking Valuation ($) *
            </label>
            <input
              type="number"
              value={createForm.askingValuation}
              onChange={(e) => setCreateForm({ ...createForm, askingValuation: e.target.value })}
              placeholder="Enter asking valuation"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Equity Offered (%) *
            </label>
            <input
              type="number"
              value={createForm.equityOffered}
              onChange={(e) => setCreateForm({ ...createForm, equityOffered: e.target.value })}
              placeholder="Enter equity percentage (1-100)"
              min="1"
              max="100"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Description (Optional)
            </label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              placeholder="Enter listing description"
              style={{ width: '100%', minHeight: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              className="btn-success"
              onClick={handleCreateListing}
              style={{ width: '100%' }}
            >
              Create Listing
            </button>
            <button
              className="btn-outline"
              onClick={() => setShowCreateModal(false)}
              style={{ width: '100%' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {listings.length === 0 ? (
        <div className="card">
          <p className="text-muted">No listings available at the moment.</p>
        </div>
      ) : (
        <div className="grid-2">
          {listings.map(listing => (
            <div key={listing._id} className="marketplace-item">
              <h4>{listing.startupId?.company}</h4>
              
              <div className="marketplace-details">
                <div className="detail-item">
                  <div className="detail-label">Exit Type</div>
                  <div style={{ textTransform: 'capitalize' }}>{listing.exitType}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Valuation</div>
                  <div>${listing.askingValuation?.toLocaleString()}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Equity Offered</div>
                  <div>{listing.equityOffered}%</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Bids Received</div>
                  <div>{listing.bids?.length || 0}</div>
                </div>
              </div>

              <p className="text-muted" style={{ fontSize: '13px', marginBottom: '15px' }}>
                {listing.description}
              </p>

              <button
                className="btn-primary"
                onClick={() => setSelectedListing(listing._id)}
                style={{ width: '100%' }}
              >
                Place Bid
              </button>

              {selectedListing === listing._id && (
                <div style={{ marginTop: '15px', padding: '15px', backgroundColor: 'rgba(99, 102, 241, 0.05)', borderRadius: '6px' }}>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Enter your bid amount"
                    style={{ width: '100%', marginBottom: '10px' }}
                  />
                  <button
                    className="btn-success"
                    onClick={() => handlePlaceBid(listing._id)}
                    style={{ width: '100%', marginBottom: '8px' }}
                  >
                    Confirm Bid
                  </button>
                  <button
                    className="btn-outline"
                    onClick={() => setSelectedListing(null)}
                    style={{ width: '100%' }}
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
  );
}

export default Marketplace;
