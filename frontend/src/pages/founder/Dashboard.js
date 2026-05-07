import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import '../Dashboard.css';
import './FounderDashboard.css';

import Overview from './pages/Overview';
import ProofOfWorkPremium from './pages/ProofOfWorkPremium';
import PitchDeck from './pages/PitchDeck';
import PitchAnalysis from './pages/PitchAnalysis';
// eslint-disable-next-line no-unused-vars
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import ResourcesPage from '../../pages/ResourcesPage';

function FounderDashboard({ user }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { label: 'Overview', path: '', icon: '' },
    { label: 'Proof of Work', path: 'proof-of-work', icon: '' },
    { label: 'Pitch Deck', path: 'pitch-deck', icon: '' },
    { label: 'AI Pitch Analysis', path: 'pitch-analysis', icon: '' },
    { label: 'Marketplace', path: 'marketplace', icon: '' },
    { label: 'Resources', path: 'resources', icon: '' },
    { label: 'Profile', path: 'profile', icon: '' }
  ];

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h3>Founder Menu</h3>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <ul className="sidebar-menu">
          {menuItems.map((item, idx) => (
            <li key={idx}>
              <button
                onClick={() => navigate(`/founder/${item.path}`)}
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
          <Route path="proof-of-work" element={<ProofOfWorkPremium user={user} />} />
          <Route path="pitch-deck" element={<PitchDeck user={user} />} />
          <Route path="pitch-analysis" element={<PitchAnalysis user={user} />} />
          <Route path="marketplace" element={<Marketplace user={user} />} />
          <Route path="resources" element={<ResourcesPage user={user} />} />
          <Route path="profile" element={<Profile user={user} />} />
        </Routes>
      </div>
    </div>
  );
}

export default FounderDashboard;
