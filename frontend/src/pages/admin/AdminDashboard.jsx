import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import AdminStats from './components/AdminStats';
import UserManagement from './components/UserManagement';
import MarketplaceAdmin from './components/MarketplaceAdmin';
import AuditLogs from './components/AuditLogs';
import ResourcesAdmin from './components/ResourcesAdmin';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin-v2/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading admin dashboard...</div>;
  if (error) return <div className="admin-error">Error: {error}</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Control Center</h1>
        <p>Manage platform, users, marketplace, and analytics</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button
          className={`admin-tab ${activeTab === 'marketplace' ? 'active' : ''}`}
          onClick={() => setActiveTab('marketplace')}
        >
          Marketplace
        </button>
        <button
          className={`admin-tab ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          Resources
        </button>
        <button
          className={`admin-tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          Audit Logs
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && <AdminStats stats={stats} />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'marketplace' && <MarketplaceAdmin />}
        {activeTab === 'resources' && <ResourcesAdmin />}
        {activeTab === 'logs' && <AuditLogs />}
      </div>
    </div>
  );
};

export default AdminDashboard;
