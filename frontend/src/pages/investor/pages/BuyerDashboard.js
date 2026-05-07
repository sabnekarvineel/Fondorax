import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';

function BuyerDashboard({ user }) {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDeals: 0
  });

  useEffect(() => {
    fetchInterests();
  }, [activeTab, pagination.currentPage]);

  const fetchInterests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const status = activeTab === 'all' ? '' : activeTab;

      const response = await axios.get(
        `http://localhost:5000/api/deals/my-interests?status=${status}&page=${pagination.currentPage}&limit=12`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInterests(response.data.deals);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error fetching interests:', err);
    } finally {
      setLoading(false);
    }
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

  const getNextStep = (status) => {
    const steps = {
      'interested': 'Waiting for seller to send NDA',
      'nda_pending': 'Sign the NDA document',
      'nda_signed': 'Review due diligence documents',
      'due_diligence': 'Make an offer',
      'negotiating': 'Agree on final price',
      'closed': 'Deal closed - Transfer complete'
    };
    return steps[status] || 'Unknown';
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
        <h1>💼 My Acquisition Interests</h1>
        <p>Track your startup acquisition deals from interest to closure</p>
      </div>

      {/* Stats Section */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Interests</h3>
          <p className="stat-number">{pagination.totalDeals}</p>
        </div>
        <div className="stat-card">
          <h3>In Negotiation</h3>
          <p className="stat-number">
            {interests.filter(d => d.status === 'negotiating').length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Closed Deals</h3>
          <p className="stat-number">
            {interests.filter(d => d.status === 'closed').length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['all', 'interested', 'nda_signed', 'due_diligence', 'negotiating', 'closed'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab);
              setPagination(prev => ({ ...prev, currentPage: 1 }));
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Deals List */}
      <div className="deals-section">
        {loading ? (
          <div className="loading">Loading your interests...</div>
        ) : interests.length === 0 ? (
          <div className="no-data">
            <p>No interests in this category</p>
          </div>
        ) : (
          <div className="deals-list">
            {interests.map(deal => {
              const badge = getStatusBadge(deal.status);
              return (
                <div
                  key={deal._id}
                  className="deal-card"
                  onClick={() => {
                    setSelectedDeal(deal);
                    setShowModal(true);
                  }}
                >
                  <div className="deal-header">
                    <div>
                      <h3>{deal.listingId.title}</h3>
                      <p className="seller-info">by {deal.sellerId.firstName} {deal.sellerId.lastName}</p>
                    </div>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: badge.bg, color: badge.color }}
                    >
                      {badge.text}
                    </span>
                  </div>

                  <div className="deal-metrics">
                    <div className="metric">
                      <label>Monthly Revenue</label>
                      <p>{formatCurrency(deal.listingId.monthlyRevenue)}</p>
                    </div>
                    <div className="metric">
                      <label>Asking Price</label>
                      <p>{formatCurrency(deal.listingId.askingPrice)}</p>
                    </div>
                    <div className="metric">
                      <label>Est. Valuation</label>
                      <p>{formatCurrency(deal.listingId.valuationScore?.totalValue || 0)}</p>
                    </div>
                  </div>

                  <div className="next-step">
                    <span className="step-label">Next Step:</span>
                    <span className="step-text">{getNextStep(deal.status)}</span>
                  </div>

                  <div className="deal-timeline">
                    <div className={`timeline-item ${['interested', 'nda_pending', 'nda_signed', 'due_diligence', 'negotiating', 'closed'].indexOf(deal.status) >= 0 ? 'active' : ''}`}>
                      <span>Interested</span>
                    </div>
                    <div className={`timeline-item ${['nda_pending', 'nda_signed', 'due_diligence', 'negotiating', 'closed'].indexOf(deal.status) >= 0 ? 'active' : ''}`}>
                      <span>NDA</span>
                    </div>
                    <div className={`timeline-item ${['due_diligence', 'negotiating', 'closed'].indexOf(deal.status) >= 0 ? 'active' : ''}`}>
                      <span>DD</span>
                    </div>
                    <div className={`timeline-item ${['negotiating', 'closed'].indexOf(deal.status) >= 0 ? 'active' : ''}`}>
                      <span>Negotiate</span>
                    </div>
                    <div className={`timeline-item ${deal.status === 'closed' ? 'active' : ''}`}>
                      <span>Closed</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() =>
              setPagination(prev => ({
                ...prev,
                currentPage: Math.max(1, prev.currentPage - 1)
              }))
            }
            disabled={pagination.currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {pagination.currentPage} / {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setPagination(prev => ({
                ...prev,
                currentPage: Math.min(pagination.totalPages, prev.currentPage + 1)
              }))
            }
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Deal Details Modal */}
      {showModal && selectedDeal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedDeal.listingId.title}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="deal-details">
              <div className="detail-section">
                <h4>Startup Details</h4>
                <p><strong>Seller:</strong> {selectedDeal.sellerId.firstName} {selectedDeal.sellerId.lastName}</p>
                <p><strong>Email:</strong> {selectedDeal.sellerId.email}</p>
                <p><strong>Monthly Revenue:</strong> {formatCurrency(selectedDeal.listingId.monthlyRevenue)}</p>
                <p><strong>Growth Rate:</strong> {selectedDeal.listingId.growthRate}%</p>
              </div>

              <div className="detail-section">
                <h4>Deal Info</h4>
                <p><strong>Asking Price:</strong> {formatCurrency(selectedDeal.listingId.askingPrice)}</p>
                <p><strong>Est. Valuation:</strong> {formatCurrency(selectedDeal.listingId.valuationScore?.totalValue || 0)}</p>
                <p><strong>Status:</strong> {getStatusBadge(selectedDeal.status).text}</p>
                <p><strong>Interested Since:</strong> {new Date(selectedDeal.interestedAt).toLocaleDateString()}</p>
              </div>

              {selectedDeal.negotiationHistory?.length > 0 && (
                <div className="detail-section">
                  <h4>Recent Offers</h4>
                  {selectedDeal.negotiationHistory.slice(-3).map((nego, idx) => (
                    <p key={idx}>
                      {nego.proposedPrice ? (
                        <>
                          <strong>₹{nego.proposedPrice.toLocaleString()}</strong> - {nego.message}
                        </>
                      ) : (
                        nego.message
                      )}
                    </p>
                  ))}
                </div>
              )}

              <div className="modal-actions">
                <button className="btn btn-primary">
                  Continue Deal
                </button>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyerDashboard;
