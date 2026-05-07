import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CreateListingForm from '../../../components/CreateListingForm';

function Marketplace({ user }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    industry: '',
    minPrice: '',
    maxPrice: '',
    minRevenue: '',
    location: '',
    sortBy: 'newest'
  });
  const [filterOptions, setFilterOptions] = useState({
    industries: [],
    locations: [],
    stats: {}
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalListings: 0
  });

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        search: filters.search,
        industry: filters.industry,
        minPrice: filters.minPrice || 0,
        maxPrice: filters.maxPrice || Infinity,
        minRevenue: filters.minRevenue || 0,
        location: filters.location,
        sortBy: filters.sortBy,
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

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'http://localhost:5000/api/marketplace/filters/options',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFilterOptions(response.data);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    fetchFilterOptions();
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePlaceBid = (listingId) => {
    // Redirect to listing details or open bid modal
    window.location.href = `/investor/marketplace/listing/${listingId}`;
  };

  const handleCreateListingSuccess = () => {
    setShowCreateModal(false);
    fetchListings();
    alert('Listing created successfully!');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading && listings.length === 0) {
    return <div className="loading">Loading marketplace...</div>;
  }

  const getIndustryColor = (industry) => {
    const colors = {
      'SaaS': { bg: '#e0f2fe', color: '#0369a1' },
      'FinTech': { bg: '#fef3c7', color: '#92400e' },
      'HealthTech': { bg: '#dbeafe', color: '#1e40af' },
      'E-commerce': { bg: '#f0fdf4', color: '#166534' },
      'EdTech': { bg: '#ede9fe', color: '#5b21b6' },
      'AI/ML': { bg: '#fce7f3', color: '#831843' },
      'MarTech': { bg: '#fecdd3', color: '#7c2d12' },
      'Other': { bg: '#f3f4f6', color: '#374151' }
    };
    return colors[industry] || colors['Other'];
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '40px' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '60px 40px',
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 15px 0' }}>
          Micro-Exit Marketplace
        </h1>
        <p style={{ fontSize: '18px', margin: '0 0 30px 0', opacity: 0.9 }}>
          Discover high-growth startups ready for investment or acquisition
        </p>

        {/* Hero Search Bar & Buttons */}
        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search startups by name, industry..."
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
          />
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '14px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              transition: 'all 0.3s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
          >
            + Create Listing
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '14px 24px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              transition: 'all 0.3s',
              whiteSpace: 'nowrap'
            }}
          >
            {showFilters ? 'Close' : 'Filters'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>
        {/* Create Listing Modal */}
        {showCreateModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
              <CreateListingForm
                onSuccess={handleCreateListingSuccess}
                onCancel={() => setShowCreateModal(false)}
              />
            </div>
          </div>
        )}

        {/* Filters Section (Collapsible) */}
        {showFilters && (
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            marginBottom: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {/* Industry Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
                Industry
              </label>
              <select
                value={filters.industry}
                onChange={(e) => handleFilterChange('industry', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  backgroundColor: '#f8fafc'
                }}
              >
                <option value="">All Industries</option>
                {filterOptions.industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
                Location
              </label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  backgroundColor: '#f8fafc'
                }}
              >
                <option value="">All Locations</option>
                {filterOptions.locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
                Min Price
              </label>
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  backgroundColor: '#f8fafc'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
                Max Price
              </label>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  backgroundColor: '#f8fafc'
                }}
              />
            </div>

            {/* Revenue Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
                Min Revenue
              </label>
              <input
                type="number"
                value={filters.minRevenue}
                onChange={(e) => handleFilterChange('minRevenue', e.target.value)}
                placeholder="Minimum revenue"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  backgroundColor: '#f8fafc'
                }}
              />
            </div>

            {/* Reset Button */}
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={() => {
                  setFilters({
                    search: '',
                    industry: '',
                    minPrice: '',
                    maxPrice: '',
                    minRevenue: '',
                    location: '',
                    sortBy: 'newest'
                  });
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#475569'
                }}
              >
                ↻ Reset
              </button>
            </div>
          </div>
        )}

        {/* Top Bar: Results & Sort */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div>
            <p style={{ margin: 0, fontSize: '16px', color: '#475569' }}>
              <strong>{pagination.totalListings}</strong> listings found
            </p>
          </div>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontWeight: '600',
              fontSize: '14px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="revenue-high">High Revenue</option>
            <option value="growth">Best Growth</option>
            <option value="most-viewed">Most Viewed</option>
          </select>
        </div>

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            textAlign: 'center',
            padding: '80px 40px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔍</div>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 10px 0' }}>
              No listings found
            </p>
            <p style={{ color: '#64748b', margin: 0 }}>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}>
            {listings.map(listing => {
              const industryColor = getIndustryColor(listing.industry);
              return (
                <div
                  key={listing._id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    border: '1px solid #e2e8f0'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Header with Industry Badge */}
                  <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '10px', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: '700', flex: 1 }}>
                        {listing.title}
                      </h4>
                      <span style={{
                        backgroundColor: industryColor.bg,
                        color: industryColor.color,
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}>
                        {listing.industry}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                      by {listing.founder?.name} {listing.founder?.verified && '✓'}
                    </p>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '20px' }}>
                    {/* Key Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                      <div>
                        <p style={{ margin: '0 0 6px 0', color: '#64748b', fontSize: '12px', fontWeight: '600' }}>
                          ASKING PRICE
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: '24px',
                          fontWeight: '700',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}>
                          {formatCurrency(listing.askingValuation || 0)}
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 6px 0', color: '#64748b', fontSize: '12px', fontWeight: '600' }}>
                          EQUITY
                        </p>
                        <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                          {listing.equityOffered}%
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 6px 0', color: '#64748b', fontSize: '12px', fontWeight: '600' }}>
                          REVENUE
                        </p>
                        <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                          {formatCurrency(listing.revenue || 0)}
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 6px 0', color: '#64748b', fontSize: '12px', fontWeight: '600' }}>
                          GROWTH
                        </p>
                        <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#f59e0b' }}>
                          {listing.growthRate}%
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    {listing.description && (
                      <p style={{
                        margin: '0 0 16px 0',
                        color: '#64748b',
                        fontSize: '13px',
                        lineHeight: '1.5',
                        height: '40px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {listing.description}
                      </p>
                    )}

                    {/* Stats Footer */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderTop: '1px solid #e2e8f0',
                      marginBottom: '16px',
                      fontSize: '12px',
                      color: '#64748b'
                    }}>
                      {listing.location && <span>📍 {listing.location}</span>}
                      <span>👁️ {listing.views || 0}</span>
                      {listing.bids?.length > 0 && <span>🏷️ {listing.bids.length}</span>}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handlePlaceBid(listing._id)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      View & Place Bid →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            marginTop: '50px'
          }}>
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
              disabled={pagination.currentPage === 1}
              style={{
                padding: '10px 16px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: pagination.currentPage === 1 ? '#f1f5f9' : '#fff',
                color: pagination.currentPage === 1 ? '#cbd5e1' : '#1e293b',
                cursor: pagination.currentPage === 1 ? 'not-allowed' : 'pointer',
                fontWeight: '600'
              }}
            >
              ← Previous
            </button>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                const pageNum = pagination.currentPage <= 3 
                  ? i + 1 
                  : Math.max(i + pagination.currentPage - 2, pagination.currentPage - 2);
                
                if (pageNum > pagination.totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: pageNum }))}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: pageNum === pagination.currentPage ? 'none' : '1px solid #e2e8f0',
                      backgroundColor: pageNum === pagination.currentPage 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : '#fff',
                      color: pageNum === pagination.currentPage ? '#fff' : '#1e293b',
                      cursor: 'pointer',
                      fontWeight: pageNum === pagination.currentPage ? '700' : '600',
                      fontSize: '14px'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(pagination.totalPages, prev.currentPage + 1) }))}
              disabled={pagination.currentPage === pagination.totalPages}
              style={{
                padding: '10px 16px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: pagination.currentPage === pagination.totalPages ? '#f1f5f9' : '#fff',
                color: pagination.currentPage === pagination.totalPages ? '#cbd5e1' : '#1e293b',
                cursor: pagination.currentPage === pagination.totalPages ? 'not-allowed' : 'pointer',
                fontWeight: '600'
              }}
            >
              Next →
            </button>

            <span style={{ marginLeft: '12px', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
              {pagination.currentPage} / {pagination.totalPages}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Marketplace;
