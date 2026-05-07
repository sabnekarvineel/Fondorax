import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [placingBid, setPlacingBid] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/marketplace/listings/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setListing(response.data);
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError(err.response?.data?.error || 'Failed to load listing details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      alert('Please enter a valid bid amount');
      return;
    }

    try {
      setPlacingBid(true);
      const token = localStorage.getItem('token');
      
      // For now, we'll just show an interest
      await axios.post(
        `http://localhost:5000/api/marketplace/listings/${id}/save`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Interest expressed successfully!');
      setBidAmount('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place bid');
    } finally {
      setPlacingBid(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <p>Loading listing details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#1e293b' }}>Error</h2>
        <p style={{ color: '#64748b' }}>{error || 'Listing not found'}</p>
        <button
          onClick={() => navigate('/investor/marketplace')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '40px 20px',
      paddingBottom: '60px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <button
          onClick={() => navigate('/investor/marketplace')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f1f5f9',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '20px',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          ← Back to Marketplace
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: '30px'
        }}>
          {/* Main Content */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            minHeight: '500px'
          }}>
            {/* Title & Header */}
            <div style={{ marginBottom: '30px' }}>
              <h1 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '36px', fontWeight: '700' }}>
                {listing.title}
              </h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: '16px' }}>
                By {listing.founder?.name}
                {listing.founder?.verified && ' ✓'}
              </p>
            </div>

            {/* Key Metrics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
              marginBottom: '40px',
              padding: '20px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px'
            }}>
              <div>
                <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                  Asking Price
                </p>
                <p style={{
                  margin: 0,
                  fontSize: '28px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {formatCurrency(listing.askingPrice || 0)}
                </p>
              </div>

              <div>
                <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                  Monthly Revenue
                </p>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#10b981' }}>
                  {formatCurrency(listing.monthlyRevenue || 0)}
                </p>
              </div>

              <div>
                <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                  Growth Rate
                </p>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>
                  {listing.growthRate || 0}%
                </p>
              </div>

              <div>
                <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                  Industry
                </p>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>
                  {listing.industry}
                </p>
              </div>
            </div>

            {/* Asset Type Info */}
            <div style={{
              padding: '20px',
              backgroundColor: '#f0fdf4',
              borderRadius: '8px',
              marginBottom: '30px',
              borderLeft: '4px solid #10b981'
            }}>
              <p style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                Asset Type
              </p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#166534' }}>
                {listing.assetType || 'Equity'} {listing.exitType === 'full' ? '(Full Sale)' : '(Partial Exit)'}
              </p>
              {listing.equityOffered && (
                <p style={{ margin: '10px 0 0 0', color: '#166534', fontSize: '14px' }}>
                  Equity Offered: {listing.equityOffered}%
                </p>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '18px', fontWeight: '600' }}>
                  About this listing
                </h3>
                <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                  {listing.description}
                </p>
              </div>
            )}

            {/* Location */}
            {listing.location && (
              <div style={{ marginBottom: '30px' }}>
                <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                  Location
                </p>
                <p style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>
                  📍 {listing.location}
                </p>
              </div>
            )}

            {/* Valuation Score */}
            {listing.valuationScore && (
              <div style={{
                padding: '20px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                marginBottom: '30px'
              }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>
                  Valuation Analysis
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px'
                }}>
                  <div>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Base Value</p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                      {formatCurrency(listing.valuationScore.baseValue)}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Total Value</p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '700', color: '#10b981' }}>
                      {formatCurrency(listing.valuationScore.totalValue)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div style={{
              padding: '20px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              display: 'flex',
              gap: '30px',
              fontSize: '14px',
              color: '#64748b'
            }}>
              <div>👁️ Views: {listing.views || 0}</div>
              <div>💾 Saves: {listing.savedCount || 0}</div>
              {listing.interests && (
                <div>👥 Interest Count: {listing.interests.length || 0}</div>
              )}
            </div>
          </div>

          {/* Sidebar - Bid Form */}
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '30px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              position: 'sticky',
              top: '20px'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#1e293b', fontSize: '18px', fontWeight: '600' }}>
                Express Interest
              </h3>

              <form onSubmit={handlePlaceBid}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#1e293b',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    Your Offer ($)
                  </label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`e.g., ${Math.floor(listing.askingPrice * 0.8)}`}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{
                  padding: '12px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '6px',
                  marginBottom: '15px',
                  fontSize: '13px',
                  color: '#166534'
                }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                    Asking Price: {formatCurrency(listing.askingPrice)}
                  </p>
                  {bidAmount && (
                    <p style={{ margin: 0 }}>
                      Your Offer: {formatCurrency(parseFloat(bidAmount) || 0)}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={placingBid}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: placingBid ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    marginBottom: '10px'
                  }}
                >
                  {placingBid ? 'Placing Interest...' : 'Place Interest'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const token = localStorage.getItem('token');
                    axios.post(
                      `http://localhost:5000/api/marketplace/listings/${id}/save`,
                      {},
                      { headers: { Authorization: `Bearer ${token}` } }
                    ).then(() => alert('Added to favorites!')).catch(err => alert('Error: ' + err.message));
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#f1f5f9',
                    color: '#1e293b',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ❤️ Save Listing
                </button>
              </form>

              <div style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#fef3c7',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#92400e'
              }}>
                <p style={{ margin: 0, fontWeight: '600' }}>
                  Next Steps After Interest:
                </p>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '15px' }}>
                  <li>Seller reviews your interest</li>
                  <li>NDA & due diligence process</li>
                  <li>Negotiation & deal terms</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingDetails;
