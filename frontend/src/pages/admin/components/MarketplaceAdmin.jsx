import React, { useState, useEffect } from 'react';
import './MarketplaceAdmin.css';

const MarketplaceAdmin = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const token = localStorage.getItem('token');

  const fetchListings = async () => {
    try {
      setLoading(true);
      const query = filter !== 'all' ? `?status=${filter}` : '';
      const response = await fetch(`http://localhost:5000/api/admin-v2/marketplace/listings${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch listings');

      const data = await response.json();
      setListings(data.listings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchListings();
  }, [filter, token]);

  const handleApproveListing = async (listingId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin-v2/marketplace/listings/${listingId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        fetchListings();
        alert('Listing approved successfully');
      } else {
        alert('Failed to approve listing');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleRejectListing = async (listingId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin-v2/marketplace/listings/${listingId}/reject`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        fetchListings();
        alert('Listing rejected successfully');
      } else {
        alert('Failed to reject listing');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleFreezeListing = async (listingId) => {
    const reason = prompt('Enter freeze reason:');
    if (!reason) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin-v2/marketplace/listings/${listingId}/freeze`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        fetchListings();
        alert('Listing frozen successfully');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div className="marketplace-loading">Loading listings...</div>;
  if (error) return <div className="marketplace-error">Error: {error}</div>;

  return (
    <div className="marketplace-admin">
      <h2>Marketplace Management</h2>

      <div className="marketplace-controls">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Listings</option>
          <option value="active">Active</option>
          <option value="pending">Pending Approval</option>
          <option value="completed">Completed</option>
          <option value="frozen">Frozen</option>
        </select>
      </div>

      <div className="listings-grid">
        {listings.length === 0 ? (
          <div className="no-listings">No listings found</div>
        ) : (
          listings.map((listing) => (
            <div key={listing._id} className="listing-card">
              <div className="listing-header">
                <h3>{listing.title || 'Untitled Listing'}</h3>
                <span className={`listing-status ${listing.status}`}>
                  {listing.status.toUpperCase()}
                </span>
              </div>

              <div className="listing-details">
                <p><strong>Founder:</strong> {listing.startupId?.firstName} {listing.startupId?.lastName}</p>
                <p><strong>Company:</strong> {listing.startupId?.company || 'N/A'}</p>
                <p><strong>Asking Price:</strong> ₹{(listing.buyPrice || 0).toLocaleString()}</p>
                <p><strong>Equity:</strong> {listing.equityPercentage}%</p>
                <p><strong>Description:</strong> {(listing.description || 'N/A').substring(0, 100)}...</p>
                <p><strong>Bids Received:</strong> {listing.bids?.length || 0}</p>
              </div>

              <div className="listing-actions">
                {listing.status === 'pending' && (
                  <>
                    <button
                      className="action-btn approve"
                      onClick={() => handleApproveListing(listing._id)}
                    >
                      Approve
                    </button>
                    <button
                      className="action-btn reject"
                      onClick={() => handleRejectListing(listing._id)}
                    >
                      Reject
                    </button>
                  </>
                )}
                {listing.status !== 'frozen' && listing.status !== 'completed' && listing.status !== 'rejected' && (
                  <button
                    className="action-btn freeze"
                    onClick={() => handleFreezeListing(listing._id)}
                  >
                    Freeze
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MarketplaceAdmin;
