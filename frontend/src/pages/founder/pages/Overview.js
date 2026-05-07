import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Overview({ user }) {
  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch latest user data from backend to get current verification status
        const userResponse = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (userResponse.data.user) {
          setCurrentUser(userResponse.data.user);
        }
        
        // Fetch profile data
        const response = await axios.get('http://localhost:5000/api/founder/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(response.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <div className="dashboard-header">
        <h2>Welcome, {user.firstName}!</h2>
        <p>Monitor your execution progress and connect with investors</p>
      </div>

      <div className="overview-grid">
        <div className="stat-card">
          <div className="stat-label">Execution Score</div>
          <div className="stat-value">{profile?.executionScore || '0'}</div>
          <div className="stat-description">Based on your proof-of-work entries</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Updates</div>
          <div className="stat-value">{profile?.totalEntries || '0'}</div>
          <div className="stat-description">Milestone and progress updates</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Profile Status</div>
          <div className="stat-value" style={{ fontSize: '18px' }}>
            {currentUser.verified ? '✓ Verified' : '⏳ Pending'}
          </div>
          <div className="stat-description">Admin verification status</div>
        </div>
      </div>

      <div className="mt-30">
        <h3>Recent Updates</h3>
        <p className="text-muted">Your latest proof-of-work entries will appear here</p>
      </div>
    </div>
  );
}

export default Overview;
