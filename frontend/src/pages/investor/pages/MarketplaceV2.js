import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../styles/MarketplaceV2.css';

function MarketplaceV2({ user }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('listings');

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    industry: '',
    revenueMin: '',
    revenueMax: '',
    growthRateMin: '',
    sortBy: 'newest',
    verified: false
  });

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalListings: 0
  });

  // Create listing form
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    industry: 'Other',
    monthlyRevenue: '',
    growthRate: '',
    askingPrice: '',
    location: '',
    techStack: '',
    customerCount: '',
    churnRate: ''
  });

  // Fetch listings with filters
  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const params = new URLSearchParams({
        search: filters.search,
        industry: filters.industry,
        revenueMin: filters.revenueMin || 0,
        revenueMax: filters.revenueMax || 999999999,
        growthRateMin: filters.growthRateMin || 0,
        sortBy: filters.sortBy,
        verified: filters.verified,
        page: pagination.currentPage,
        limit: 12
      });

      const response = await axios.get(
        `http://localhost:5000/api/marketplace/listings?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setListings(response.data.listings);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleCreateListing = async () => {
    try {
      if (!createForm.title || !createForm.monthlyRevenue || !createForm.askingPrice) {
        alert('Please fill in all required fields (Title, Monthly Revenue, Asking Price)');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/marketplace/listings',
        {
          ...createForm,
          monthlyRevenue: parseInt(createForm.monthlyRevenue) || 0,
          growthRate: parseInt(createForm.growthRate) || 0,
          askingPrice: parseInt(createForm.askingPrice) || 0,
          customerCount: parseInt(createForm.customerCount) || 0,
          churnRate: parseInt(createForm.churnRate) || 0,
          techStack: createForm.techStack.split(',').map(s => s.trim()).filter(s => s),
          category: 'startup_exit'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        setShowCreateModal(false);
        setCreateForm({
          title: '',
          description: '',
          industry: 'Other',
          monthlyRevenue: '',
          growthRate: '',
          askingPrice: '',
          location: '',
          techStack: '',
          customerCount: '',
          churnRate: ''
        });
        fetchListings();
        alert('Listing created successfully!');
      }
    } catch (err) {
      console.error('Error creating listing:', err);
      alert('Failed to create listing: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleExpressInterest = async (listingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/deals/express-interest/${listingId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Interest expressed! Seller will be notified.');
      fetchListings();
    } catch (err) {
      console.error('Error expressing interest:', err);
      alert('Failed to express interest: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSaveListing = async (listingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/marketplace/listings/${listingId}/save`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchListings();
    } catch (err) {
      console.error('Error saving listing:', err);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const calculateValuation = (monthlyRevenue, growthRate, industry) => {
    const multipliers = {
      'SaaS': 4.5,
      'AI/ML': 5.5,
      'E-commerce': 2.5,
      'FinTech': 4,
      'Mobile App': 3.5,
      'Other': 3
    };

    const multiple = multipliers[industry] || 3;
    const baseValue = monthlyRevenue * 12 * multiple;
    const growthBonus = baseValue * (growthRate / 100) * 0.5;
    return Math.round(baseValue + growthBonus);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'none': { bg: '#f3f4f6', color: '#6b7280', text: 'Active' },
      'interest_received': { bg: '#dbeafe', color: '#1e40af', text: 'Interest Received' },
      'nda_signed': { bg: '#fef3c7', color: '#b45309', text: 'NDA Signed' },
      'due_diligence': { bg: '#f0fdf4', color: '#166534', text: 'Due Diligence' },
      'negotiating': { bg: '#fecdd3', color: '#9f1239', text: 'Negotiating' },
      'closed': { bg: '#d1fae5', color: '#065f46', text: 'Closed' }
    };
    return statusConfig[status] || statusConfig['none'];
  };

  return (
    <div className="marketplace-container">
      {/* Hero Section */}
      <div className="marketplace-hero">
        <div className="hero-content">
          <h1>Micro-Exit Marketplace</h1>
          <p>Buy, sell, and acquire high-growth startups and SaaS products</p>

          {/* Search & CTA */}
          <div className="hero-search-bar">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, search: e.target.value }));
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
              placeholder="Search startups by name, industry..."
              className="search-input"
            />
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              + Create Listing
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary"
            >
              {showFilters ? 'Close Filters' : 'Filters'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="marketplace-main">
        {/* Create Listing Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create Listing</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="close-btn"
                >
                  ✕
                </button>
              </div>

              <div className="form-grid">
                {/* Title */}
                <div className="form-group">
                  <label>Startup Title *</label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    placeholder="e.g., AI Resume Builder"
                  />
                </div>

                {/* Description */}
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="What does your product do?"
                  />
                </div>

                {/* Industry */}
                <div className="form-group">
                  <label>Industry</label>
                  <select
                    value={createForm.industry}
                    onChange={(e) => setCreateForm({ ...createForm, industry: e.target.value })}
                  >
                    <option value="SaaS">SaaS</option>
                    <option value="AI/ML">AI/ML</option>
                    <option value="FinTech">FinTech</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Monthly Revenue */}
                <div className="form-group">
                  <label>Monthly Revenue (MRR) * ₹</label>
                  <input
                    type="number"
                    value={createForm.monthlyRevenue}
                    onChange={(e) => setCreateForm({ ...createForm, monthlyRevenue: e.target.value })}
                    placeholder="e.g., 80000"
                  />
                </div>

                {/* Growth Rate */}
                <div className="form-group">
                  <label>Growth Rate (%) per month</label>
                  <input
                    type="number"
                    value={createForm.growthRate}
                    onChange={(e) => setCreateForm({ ...createForm, growthRate: e.target.value })}
                    placeholder="e.g., 15"
                  />
                </div>

                {/* Asking Price */}
                <div className="form-group">
                  <label>Asking Price * ₹</label>
                  <input
                    type="number"
                    value={createForm.askingPrice}
                    onChange={(e) => setCreateForm({ ...createForm, askingPrice: e.target.value })}
                    placeholder="e.g., 3500000"
                  />
                </div>

                {/* Customer Count */}
                <div className="form-group">
                  <label>Customer Count</label>
                  <input
                    type="number"
                    value={createForm.customerCount}
                    onChange={(e) => setCreateForm({ ...createForm, customerCount: e.target.value })}
                    placeholder="e.g., 250"
                  />
                </div>

                {/* Churn Rate */}
                <div className="form-group">
                  <label>Monthly Churn Rate (%)</label>
                  <input
                    type="number"
                    value={createForm.churnRate}
                    onChange={(e) => setCreateForm({ ...createForm, churnRate: e.target.value })}
                    placeholder="e.g., 5"
                  />
                </div>

                {/* Tech Stack */}
                <div className="form-group">
                  <label>Tech Stack (comma separated)</label>
                  <input
                    type="text"
                    value={createForm.techStack}
                    onChange={(e) => setCreateForm({ ...createForm, techStack: e.target.value })}
                    placeholder="e.g., React, Node.js, MongoDB"
                  />
                </div>

                {/* Location */}
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={createForm.location}
                    onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="modal-footer">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateListing}
                  className="btn btn-primary"
                >
                  Create Listing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters Sidebar */}
        {showFilters && (
          <div className="filters-section">
            <h3>Filters</h3>

            {/* Industry */}
            <div className="filter-group">
              <label>Industry</label>
              <select
                value={filters.industry}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, industry: e.target.value }));
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
              >
                <option value="">All Industries</option>
                <option value="SaaS">SaaS</option>
                <option value="AI/ML">AI/ML</option>
                <option value="FinTech">FinTech</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Mobile App">Mobile App</option>
              </select>
            </div>

            {/* Revenue Range */}
            <div className="filter-group">
              <label>Monthly Revenue (₹)</label>
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.revenueMin}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, revenueMin: e.target.value }));
                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                  }}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.revenueMax}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, revenueMax: e.target.value }));
                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                  }}
                />
              </div>
            </div>

            {/* Growth Rate */}
            <div className="filter-group">
              <label>Min Growth Rate (%)</label>
              <input
                type="number"
                placeholder="e.g., 10"
                value={filters.growthRateMin}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, growthRateMin: e.target.value }));
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
              />
            </div>

            {/* Verified Only */}
            <div className="filter-group">
              <label>
                <input
                  type="checkbox"
                  checked={filters.verified}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, verified: e.target.checked }));
                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                  }}
                />
                Verified Revenue Only
              </label>
            </div>

            {/* Sort */}
            <div className="filter-group">
              <label>Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, sortBy: e.target.value }));
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
              >
                <option value="newest">Newest First</option>
                <option value="highest_revenue">Highest Revenue</option>
                <option value="highest_growth">Highest Growth</option>
                <option value="lowest_price">Best Price</option>
                <option value="most_viewed">Most Popular</option>
              </select>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        <div className="listings-grid">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : listings.length === 0 ? (
            <div className="no-results">
              <p>No listings found</p>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            listings.map(listing => {
              const valuation = calculateValuation(listing.monthlyRevenue, listing.growthRate, listing.industry);
              const statusBadge = getStatusBadge(listing.dealStatus);

              return (
                <div key={listing._id} className="listing-card">
                  {/* Card Header */}
                  <div className="card-header">
                    <div>
                      <h4>{listing.title}</h4>
                      <p className="founder-info">
                        by {listing.founder?.name}
                        {listing.founder?.verified && ' ✓'}
                      </p>
                    </div>
                    <div className="card-badges">
                      <span className="industry-badge">{listing.industry}</span>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: statusBadge.bg,
                          color: statusBadge.color
                        }}
                      >
                        {statusBadge.text}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {listing.description && (
                    <p className="card-description">{listing.description}</p>
                  )}

                  {/* Metrics Grid */}
                  <div className="metrics-grid">
                    <div className="metric">
                      <label>Monthly Revenue</label>
                      <p className="metric-value">{formatCurrency(listing.monthlyRevenue)}</p>
                    </div>
                    <div className="metric">
                      <label>Growth Rate</label>
                      <p className="metric-value" style={{ color: '#f59e0b' }}>
                        {listing.growthRate}%
                      </p>
                    </div>
                    <div className="metric">
                      <label>Asking Price</label>
                      <p className="metric-value">{formatCurrency(listing.askingPrice)}</p>
                    </div>
                    <div className="metric">
                      <label>Est. Valuation</label>
                      <p className="metric-value" style={{ color: '#10b981' }}>
                        {formatCurrency(valuation)}
                      </p>
                    </div>
                  </div>

                  {/* Product Info */}
                  {(listing.techStack?.length > 0 || listing.customerCount) && (
                    <div className="product-info">
                      {listing.customerCount && (
                        <span>{listing.customerCount} customers</span>
                      )}
                      {listing.churnRate && (
                        <span>{listing.churnRate}% churn</span>
                      )}
                      {listing.views && (
                        <span>{listing.views} views</span>
                      )}
                    </div>
                  )}

                  {/* Tech Stack */}
                  {listing.techStack?.length > 0 && (
                    <div className="tech-stack">
                      {listing.techStack.slice(0, 3).map((tech, idx) => (
                        <span key={idx} className="tech-badge">{tech}</span>
                      ))}
                      {listing.techStack.length > 3 && (
                        <span className="tech-badge">+{listing.techStack.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Engagement Stats */}
                  {(listing.savedCount > 0 || listing.interestCount > 0) && (
                    <div className="engagement-stats">
                      {listing.savedCount > 0 && <span>{listing.savedCount} saves</span>}
                      {listing.interestCount > 0 && <span>🤝 {listing.interestCount} interests</span>}
                    </div>
                  )}

                  {/* CTA Buttons */}
                  <div className="card-footer">
                    <button
                      onClick={() => handleSaveListing(listing._id)}
                      className="btn btn-outline"
                      title="Save to wishlist"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleExpressInterest(listing._id)}
                      className="btn btn-primary"
                    >
                      Express Interest →
                    </button>
                  </div>
                </div>
              );
            })
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
              className="btn btn-secondary"
            >
              ← Previous
            </button>

            <div className="page-numbers">
              {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                const pageNum = Math.max(
                  1,
                  pagination.currentPage - 2 + i
                );
                if (pageNum > pagination.totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: pageNum }))}
                    className={`page-btn ${
                      pageNum === pagination.currentPage ? 'active' : ''
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setPagination(prev => ({
                  ...prev,
                  currentPage: Math.min(pagination.totalPages, prev.currentPage + 1)
                }))
              }
              disabled={pagination.currentPage === pagination.totalPages}
              className="btn btn-secondary"
            >
              Next →
            </button>

            <span className="page-info">
              {pagination.currentPage} / {pagination.totalPages}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default MarketplaceV2;
