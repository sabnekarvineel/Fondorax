import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Users.css';

function Users({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/verify-user/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
      alert('User verified successfully');
    } catch (err) {
      console.error('Error verifying user:', err);
      alert('Error verifying user');
    }
  };

  const handleBlock = async (userId) => {
    if (window.confirm('Are you sure you want to block this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:5000/api/admin/block-user/${userId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchUsers();
        alert('User blocked successfully');
      } catch (err) {
        console.error('Error blocking user:', err);
        alert('Error blocking user');
      }
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin':
        return { bg: '#fee2e2', color: '#dc2626', label: 'Admin' };
      case 'founder':
        return { bg: '#ede9fe', color: '#7c3aed', label: 'Founder' };
      case 'investor':
        return { bg: '#dbeafe', color: '#0284c7', label: 'Investor' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280', label: role };
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="dashboard-header">
        <h2>User Management</h2>
        <p>View and manage all platform users</p>
      </div>

      {/* Filters Section */}
      <div className="users-filters">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="8" cy="8" r="6" />
            <path d="m12 12 4 4" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          value={filterRole} 
          onChange={(e) => setFilterRole(e.target.value)}
          className="role-filter"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="founder">Founder</option>
          <option value="investor">Investor</option>
        </select>
      </div>

      {/* Single Users Card */}
      <div className="users-card">
        {filteredUsers.length === 0 ? (
          <div className="no-users">
            <p>No users found</p>
          </div>
        ) : (
          <div className="users-list">
            {filteredUsers.map((u, index) => {
              const roleInfo = getRoleColor(u.role);
              const isLast = index === filteredUsers.length - 1;
              return (
                <div key={u._id} className={`user-row ${!isLast ? 'with-border' : ''}`}>
                  <div className="user-avatar" style={{ backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)` }}>
                    {getInitials(u.firstName, u.lastName)}
                  </div>

                  <div className="user-details">
                    <h4>{u.firstName} {u.lastName}</h4>
                    <p>{u.email}</p>
                  </div>

                  <div className="user-role">
                    <span className="role-badge" style={{ backgroundColor: roleInfo.bg, color: roleInfo.color }}>
                      {roleInfo.label}
                    </span>
                  </div>

                  <div className="user-status-col">
                    {u.verified ? (
                      <span className="status-badge verified">
                        <span className="status-dot"></span>
                        Verified
                      </span>
                    ) : (
                      <span className="status-badge pending">
                        <span className="status-dot"></span>
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="user-actions">
                    {!u.verified && (
                      <button 
                        className="action-btn verify"
                        onClick={() => handleVerify(u._id)}
                        title="Verify user"
                      >
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Verify
                      </button>
                    )}
                    <button 
                      className="action-btn block"
                      onClick={() => handleBlock(u._id)}
                      title="Block user"
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 2.525a6 6 0 008.367 12.365zm1.414-1.414A8 8 0 1 1 2.05 2.05a8 8 0 0111.841 11.841z" clipRule="evenodd" />
                      </svg>
                      Block
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="users-footer">
          <p>Showing {filteredUsers.length} of {users.length} users</p>
        </div>
      </div>
    </div>
  );
}

export default Users;
