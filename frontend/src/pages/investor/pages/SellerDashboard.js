import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';

function SellerDashboard({ user }) {
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalListings: 0
  });

  useEffect(() => {
    fetchMyListings();
  }, [pagination.currentPage]);

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `http://localhost:5000/api/marketplace/listings?page=${pagination.currentPage}&limit=12`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Filter only user's listings
      const myListings = response.data.listings.filter(
        l => l.founderId._id === user._id || l.founderId === user._id
      );

      setListings(myListings);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterests = async (listingId) => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `http://localhost:5000/api/deals/interests-received/${listingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInterests(response.data.deals);
    } catch (err) {
      console.error('Error fetching interests:', err);
    }
  };

  const handleListingClick = (listing) => {
    setSelectedListing(listing);
    fetchInterests(listing._id);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      'interested': { bg: '#dbeafe', color: '#1e40af', text: 'Interested' },
      'nda_pending': { bg: '#fef3c7', color: '#b45309', text: 'NDA Pending' },
      'nda_signed': { bg: '#fecdd3', color: '#9f1239', text: 'NDA Signed' },
      'due_diligence': { bg: '#f0fdf4', color: '#166534', text: 'Due Diligence' },
      'negotiating': { bg: '#fce7f3', color: '#831843', text: 'Negotiating' },
      'closed': { bg: '#d1fae5', color: '#065f46', text: 'Closed' }
    };
    return badges[status] || badges['interested'];
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>My Listings</h1>
        <p>Manage your startup listings and track buyer interests</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Active Listings</h3>
          <p className="stat-number">{listings.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Interests</h3>
          <p className="stat-number">
            {listings.reduce((sum, l) => sum + (l.interestCount || 0), 0)}
          </p>
        </div>
        <div className="stat-card">
          <h3>Total Views</h3>
          <p className="stat-number">
            {listings.reduce((sum, l) => sum + (l.views || 0), 0)}
          </p>
        </div>
      </div>

      {/* Listings */}
      <div className="listings-section">
        <h2>Your Listings</h2>

        {loading ? (
          <div className="loading">Loading your listings...</div>
        ) : listings.length === 0 ? (
          <div className="no-data">
            <p>You haven't created any listings yet</p>
            <a href="/investor/marketplace" className="btn btn-primary">
              Create Your First Listing
            </a>
          </div>
        ) : (
          <div className="listing-cards">
            {listings.map(listing => (
              <div
                key={listing._id}
                className="listing-card seller-view"
                onClick={() => handleListingClick(listing)}
              >
                <div className="listing-header">
                  <h3>{listing.title}</h3>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: listing.status === 'sold' ? '#d1fae5' : '#dbeafe',
                      color: listing.status === 'sold' ? '#065f46' : '#1e40af'
                    }}
                  >
                    {listing.status === 'sold' ? 'SOLD' : 'ACTIVE'}
                  </span>
                </div>

                <div className="listing-metrics">
                  <div className="metric">
                    <label>Monthly Revenue</label>
                    <p>{formatCurrency(listing.monthlyRevenue)}</p>
                  </div>
                  <div className="metric">
                    <label>Asking Price</label>
                    <p>{formatCurrency(listing.askingPrice)}</p>
                  </div>
                  <div className="metric">
                    <label>Est. Valuation</label>
                    <p>{formatCurrency(listing.valuationScore?.totalValue || 0)}</p>
                  </div>
                </div>

                <div className="listing-engagement">
                  <div className="engagement-item">
                    <span className="icon">V</span>
                    <span className="value">{listing.views || 0} views</span>
                  </div>
                  <div className="engagement-item">
                    <span className="icon">L</span>
                    <span className="value">{listing.savedCount || 0} saved</span>
                  </div>
                  <div className="engagement-item highlight">
                    <span className="icon">🤝</span>
                    <span className="value">{listing.interestCount || 0} interests</span>
                  </div>
                </div>

                <div className="listing-actions">
                  <button className="btn btn-secondary">Edit</button>
                  <button className="btn btn-secondary">View Details</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interests Modal */}
      {showModal && selectedListing && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Interests for: {selectedListing.title}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="interests-list">
              {interests.length === 0 ? (
                <p className="no-data">No interests yet</p>
              ) : (
                interests.map(deal => (
                  <div key={deal._id} className="interest-card">
                    <div className="interest-header">
                      <h4>{deal.buyerId.firstName} {deal.buyerId.lastName}</h4>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusBadge(deal.status).bg,
                          color: getStatusBadge(deal.status).color
                        }}
                      >
                        {getStatusBadge(deal.status).text}
                      </span>
                    </div>

                    <div className="interest-info">
                      <p><strong>Email:</strong> {deal.buyerId.email}</p>
                      <p><strong>Interested:</strong> {new Date(deal.interestedAt).toLocaleDateString()}</p>
                      {deal.agreedPrice && (
                        <p><strong>Agreed Price:</strong> {formatCurrency(deal.agreedPrice)}</p>
                      )}
                    </div>

                    <div className="interest-actions">
                      <button className="btn btn-primary btn-small">
                        View Deal
                      </button>
                      <button className="btn btn-secondary btn-small">
                        Send NDA
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerDashboard;
