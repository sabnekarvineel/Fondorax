import React from 'react';
import './AdminStats.css';

const AdminStats = ({ stats }) => {
  if (!stats) {
    return <div className="stats-loading">Loading statistics...</div>;
  }

  const StatCard = ({ icon, title, value, subtitle, color }) => (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <h3 className="stat-value">{value.toLocaleString()}</h3>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="admin-stats">
      <h2>Platform Overview</h2>

      <div className="stats-grid">
        <StatCard
          icon="U"
          title="Total Users"
          value={stats.users.total}
          subtitle={`${stats.users.verified} verified`}
          color="blue"
        />
        <StatCard
          icon="F"
          title="Founders"
          value={stats.users.founders}
          color="green"
        />
        <StatCard
          icon="I"
          title="Investors"
          value={stats.users.investors}
          color="purple"
        />
        <StatCard
          icon="V"
          title="Verified Users"
          value={stats.users.verified}
          color="teal"
        />

        <StatCard
          icon="L"
          title="Active Listings"
          value={stats.marketplace.activeListings}
          subtitle={`of ${stats.marketplace.totalListings} total`}
          color="blue"
        />
        <StatCard
          icon="D"
          title="Completed Deals"
          value={stats.marketplace.completedDeals}
          color="green"
        />

        <StatCard
          icon="M"
          title="Total Investments"
          value={`₹${(stats.investments.total / 100000).toFixed(1)}L`}
          subtitle={`Avg: ₹${(stats.investments.averageDeal / 100000).toFixed(1)}L`}
          color="purple"
        />
        <StatCard
          icon="R"
          title="Revenue Generated"
          value={`₹${(stats.revenue.total / 1000).toFixed(0)}K`}
          color="teal"
        />

        <StatCard
          icon="P"
          title="Pending Approvals"
          value={stats.pending.approvals}
          color="orange"
        />
        <StatCard
          icon="F"
          title="Flagged Accounts"
          value={stats.pending.flagged}
          color="red"
        />
      </div>

      <div className="stats-charts">
        <div className="chart-placeholder">
          <h3>User Distribution</h3>
          <div className="user-dist">
            <div className="dist-bar">
              <div className="dist-item" style={{ width: `${(stats.users.founders / stats.users.total * 100)}%` }}>
                Founders: {stats.users.founders}
              </div>
              <div className="dist-item" style={{ width: `${(stats.users.investors / stats.users.total * 100)}%`, background: '#8b5cf6' }}>
                Investors: {stats.users.investors}
              </div>
            </div>
          </div>
        </div>

        <div className="chart-placeholder">
          <h3>Marketplace Status</h3>
          <div className="marketplace-dist">
            <div className="status-bar">
              <div className="status-item active">Active: {stats.marketplace.activeListings}</div>
              <div className="status-item completed">Completed: {stats.marketplace.completedDeals}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
