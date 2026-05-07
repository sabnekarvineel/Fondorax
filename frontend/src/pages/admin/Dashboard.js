import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import '../Dashboard.css';
import './AdminDashboard.css';

import Overview from './pages/Overview';
import Users from './pages/Users';
import Transactions from './pages/Transactions';
import Revenue from './pages/Revenue';
import ResourcesAdmin from './components/ResourcesAdmin';

function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { label: 'Overview', path: '' },
    { label: 'Users', path: 'users' },
    { label: 'Transactions', path: 'transactions' },
    { label: 'Revenue', path: 'revenue' },
    { label: 'Resources', path: 'resources' }
  ];

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h3>Admin Menu</h3>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <ul className="sidebar-menu">
          {menuItems.map((item, idx) => (
            <li key={idx}>
              <button
                onClick={() => navigate(`/admin/${item.path}`)}
                className="menu-item"
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button 
        className="toggle-sidebar-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      <div className="dashboard-content">
        <Routes>
          <Route path="" element={<Overview user={user} />} />
          <Route path="users" element={<Users user={user} />} />
          <Route path="transactions" element={<Transactions user={user} />} />
          <Route path="revenue" element={<Revenue user={user} />} />
          <Route path="resources" element={<ResourcesAdmin />} />
        </Routes>
      </div>
    </div>
  );
}

export default AdminDashboard;
