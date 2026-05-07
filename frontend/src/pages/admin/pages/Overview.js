import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Overview.css';

function Overview({ user }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    completedDeals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch revenue data
      const revenueResponse = await axios.get('http://localhost:5000/api/admin/revenue', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats({
        totalRevenue: revenueResponse.data.totalRevenue,
        completedDeals: revenueResponse.data.completedDeals,
        totalUsers: 0,
        totalTransactions: 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="overview-container">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <p>System overview and management tools</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-content">
            <div className="stat-title">Total Users</div>
            <div className="stat-value">-</div>
          </div>
        </div>

        <div className="stat-card stat-purple">
          <div className="stat-content">
            <div className="stat-title">Active Transactions</div>
            <div className="stat-value">-</div>
          </div>
        </div>

        <div className="stat-card stat-green">
          <div className="stat-content">
            <div className="stat-title">Total Revenue</div>
            <div className="stat-value">${stats.totalRevenue?.toFixed(2)}</div>
          </div>
        </div>

        <div className="stat-card stat-teal">
          <div className="stat-content">
            <div className="stat-title">Completed Deals</div>
            <div className="stat-value">{stats.completedDeals}</div>
          </div>
        </div>
      </div>

      <div className="system-status">
        <h3>System Status</h3>
        <div className="status-box">
          <span className="status-indicator">✓</span>
          <span className="status-text">All systems operational</span>
        </div>
      </div>
    </div>
  );
}

export default Overview;
