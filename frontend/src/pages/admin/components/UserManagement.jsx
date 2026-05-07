import React, { useState, useEffect } from 'react';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionModal, setActionModal] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const query = filter !== 'all' ? `?role=${filter}` : '';
      const response = await fetch(`http://localhost:5000/api/admin-v2/users${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveFounder = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin-v2/users/${userId}/approve-founder`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approvalNotes: 'Approved by admin' })
      });

      if (response.ok) {
        setActionModal(null);
        fetchUsers();
        alert('Founder approved successfully');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleSuspendUser = async (userId) => {
    const reason = prompt('Enter suspension reason:');
    if (!reason) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin-v2/users/${userId}/suspend`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        fetchUsers();
        alert('User suspended successfully');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div className="user-mgmt-loading">Loading users...</div>;
  if (error) return <div className="user-mgmt-error">Error: {error}</div>;

  return (
    <div className="user-management">
      <h2>User Management</h2>

      <div className="user-controls">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Users</option>
          <option value="founder">Founders</option>
          <option value="investor">Investors</option>
          <option value="admin">Admins</option>
        </select>

        <div className="user-stats">
          <span>Total: {users.length}</span>
        </div>
      </div>

      <div className="users-cards-container">
        {users.map((user) => (
          <div key={user._id} className={`user-card ${user.suspended ? 'suspended' : ''}`}>
            <div className="card-header">
              <div className="user-info">
                <h3 className="user-name">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="user-email">{user.email}</p>
              </div>
              <div className="card-badges">
                <span className={`role-badge role-${user.role}`}>
                  {user.role.toUpperCase()}
                </span>
                {user.suspended ? (
                  <span className="status-badge suspended">🚫 SUSPENDED</span>
                ) : user.verified ? (
                  <span className="status-badge verified">VERIFIED</span>
                ) : (
                  <span className="status-badge pending">⏳ PENDING</span>
                )}
              </div>
            </div>

            <div className="card-meta">
              <div className="meta-item">
                <span className="meta-label">KYC Status</span>
                <span className={`kyc-badge ${user.kycStatus}`}>
                  {user.kycStatus}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Approval</span>
                <span className={`approval-badge ${user.approvalStatus}`}>
                  {user.approvalStatus}
                </span>
              </div>
            </div>

            <div className="card-actions">
              <button
                className="action-btn view"
                onClick={() => setSelectedUser(user)}
                title="View details"
              >
                View
              </button>
              {user.role === 'founder' && user.approvalStatus === 'pending' && (
                <button
                  className="action-btn approve"
                  onClick={() => handleApproveFounder(user._id)}
                  title="Approve founder"
                >
                  Verify
                </button>
              )}
              {!user.suspended && (
                <button
                  className="action-btn suspend"
                  onClick={() => handleSuspendUser(user._id)}
                  title="Block user"
                >
                  🚫 Block
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedUser && (
        <div className="user-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="user-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedUser(null)}>
              ✕
            </button>
            <h3>User Details: {selectedUser.firstName} {selectedUser.lastName}</h3>
            <div className="user-details">
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
              <p><strong>Company:</strong> {selectedUser.company || 'N/A'}</p>
              <p><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</p>
              <p><strong>Location:</strong> {selectedUser.location || 'N/A'}</p>
              <p><strong>KYC Status:</strong> {selectedUser.kycStatus}</p>
              <p><strong>Verification Status:</strong> {selectedUser.verified ? 'Verified' : 'Not Verified'}</p>
              <p><strong>Account Status:</strong> {selectedUser.suspended ? 'SUSPENDED' : 'ACTIVE'}</p>
              {selectedUser.suspensionReason && (
                <p><strong>Suspension Reason:</strong> {selectedUser.suspensionReason}</p>
              )}
              <p><strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
