import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

function Profile({ user }) {
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    company: user?.company || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    location: user?.location || '',
    profilePicture: user?.profilePicture || ''
  });

  const [stats, setStats] = useState({
    pitchDecks: 0,
    fundraising: 0,
    activeDeals: 0
  });

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch pitch decks
      const decksResponse = await axios.get('http://localhost:5000/api/pitch/my-decks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pitchDecks = decksResponse.data.decks?.length || 0;

      // Fetch deals
      const dealsResponse = await axios.get('http://localhost:5000/api/marketplace/deals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const activeDeals = dealsResponse.data.deals?.filter(d => d.status === 'active').length || 0;

      setStats({
        pitchDecks,
        fundraising: 0, // Placeholder - update based on your actual data structure
        activeDeals
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfile(prev => ({ ...prev, profilePicture: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/founder/profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error updating profile');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="founder-profile-container">
      <div className="founder-profile-header">
        <h2>My Profile</h2>
        <p>Manage your founder profile and startup information</p>
      </div>

      <div className="founder-profile-content">
        <div className="founder-profile-main">
          {/* Profile Picture Section */}
          <div className="founder-profile-picture-section">
            <div className="founder-profile-picture-container">
              {profile.profilePicture ? (
                <img src={profile.profilePicture} alt="Profile" className="founder-profile-picture" />
              ) : (
                <div className="founder-profile-picture-placeholder">
                  {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                </div>
              )}
              {isEditing && (
                <label className="founder-profile-picture-upload" title="Upload profile picture">
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} />
                  📷
                </label>
              )}
            </div>
            <div className="founder-profile-picture-info">
              <h3>{profile.firstName} {profile.lastName}</h3>
              <div className="founder-profile-badges-container">
                <span className="founder-email-badge">✉ {profile.email}</span>
                <span className="founder-role-badge">🚀 Founder</span>
                <span className="founder-status-badge">✓ Active</span>
              </div>
            </div>
          </div>

          <div className="founder-profile-divider"></div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="founder-profile-form">
            <div className="founder-form-section">
              <h4>Personal Information</h4>
              
              <div className="founder-form-row">
                <div className="founder-form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="founder-form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="founder-form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  disabled
                  style={{ backgroundColor: '#f3f4f6', borderColor: '#d1d5db', cursor: 'not-allowed' }}
                />
              </div>

              <div className="founder-form-row">
                <div className="founder-form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="founder-form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={profile.location}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="City, Country"
                  />
                </div>
              </div>
            </div>

            <div className="founder-form-divider"></div>

            <div className="founder-form-section">
              <h4>Startup Information</h4>
              
              <div className="founder-form-group">
                <label>Company/Startup Name</label>
                <input
                  type="text"
                  name="company"
                  value={profile.company}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Your startup or company name"
                />
              </div>

              <div className="founder-form-group">
                <label>About You & Your Startup</label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Share your vision, mission, and what makes your startup unique"
                  rows="4"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="founder-form-actions">
              {!isEditing ? (
                <button
                  type="button"
                  className="founder-btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    className="founder-btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    className="founder-btn-outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>

            {message && (
              <div className={`founder-message ${message.includes('successfully') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}
          </form>
        </div>

        {/* Profile Stats Sidebar */}
        <div className="founder-profile-sidebar">
          <div className="founder-stats-card">
            <div className="founder-stat-item">
              <div className="founder-stat-value">{stats.pitchDecks}</div>
              <div className="founder-stat-label">Pitch Decks</div>
            </div>
            <div className="founder-stat-item">
              <div className="founder-stat-value">{stats.fundraising}</div>
              <div className="founder-stat-label">Fundraising</div>
            </div>
            <div className="founder-stat-item">
              <div className="founder-stat-value">{stats.activeDeals}</div>
              <div className="founder-stat-label">Active Deals</div>
            </div>
          </div>

          <div className="founder-profile-card">
            <h4>Funding Status</h4>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <span style={{
                fontSize: '0.9rem',
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#f5f3ff',
                color: '#7c3aed'
              }}>
                🎯 Seeking Investment
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0 }}>
              Update your availability and investment needs
            </p>
          </div>


        </div>
      </div>
    </div>
  );
}

export default Profile;
