import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

function Profile({ user }) {
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    company: user?.company || '',
    bio: user?.bio || '',
    profilePicture: user?.profilePicture || '',
    twoFactorEnabled: user?.twoFactorEnabled || false
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
      await axios.put('http://localhost:5000/api/auth/profile', profile, {
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
    <div className="profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>
        <p>Manage your investor profile and personal information</p>
      </div>

      <div className="profile-content">
        <div className="profile-main">
          {/* Profile Picture Section */}
          <div className="profile-picture-section">
            <div className="profile-picture-container">
              {profile.profilePicture ? (
                <img src={profile.profilePicture} alt="Profile" className="profile-picture" />
              ) : (
                <div className="profile-picture-placeholder">
                  {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                </div>
              )}
              {isEditing && (
                <label className="profile-picture-upload" title="Upload profile picture">
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} />
                  📷
                </label>
              )}
            </div>
            <div className="profile-picture-info">
              <h3>{profile.firstName} {profile.lastName}</h3>
              <div className="profile-badges-container">
                <span className="email-badge">✉ {profile.email}</span>
                <span className="role-badge">★ Investor</span>
                <span className="verification-badge">✓ Verified</span>
              </div>
            </div>
          </div>

          <div className="profile-divider"></div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h4>Personal Information</h4>
              
              <div className="form-row">
                <div className="form-group">
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
                <div className="form-group">
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

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  disabled
                  className="disabled-field"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
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
                <div className="form-group">
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

            <div className="form-divider"></div>

            <div className="form-section">
              <h4>Professional Information</h4>
              
              <div className="form-group">
                <label>Company/Firm</label>
                <input
                  type="text"
                  name="company"
                  value={profile.company}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Your investment firm or company"
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself and your investment interests"
                  rows="4"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              {!isEditing ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>

            {message && (
              <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}
          </form>
        </div>

        {/* Profile Stats Sidebar */}
        <div className="profile-sidebar">
          <div className="stats-card">
            <div className="stat-item">
              <div className="stat-value">-</div>
              <div className="stat-label">Investments</div>
            </div>
            <div className="divider"></div>
            <div className="stat-item">
              <div className="stat-value">-</div>
              <div className="stat-label">Portfolio Value</div>
            </div>
            <div className="divider"></div>
            <div className="stat-item">
              <div className="stat-value">-</div>
              <div className="stat-label">Active Deals</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;
