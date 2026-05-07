import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import '../Dashboard.css';
import './InvestorDashboard.css';

import Overview from './pages/Overview';
import Portfolio from './pages/Portfolio';
import PortfolioAnalysis from './pages/PortfolioAnalysis';
import Marketplace from './pages/Marketplace';
import Founders from './pages/Founders';
import PitchAnalysis from './pages/PitchAnalysis';
import Explore from './pages/Explore';
import ListingDetails from './pages/ListingDetails';
import Profile from './pages/Profile';

function InvestorDashboard({ user }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { label: 'Explore', path: 'explore', icon: 'E' },
    { label: 'Marketplace', path: 'marketplace', icon: 'M' },
    { label: 'Pitch Desk Analysis', path: 'pitch-analysis', icon: 'P' },
    { label: 'Portfolio', path: 'portfolio', icon: 'Po' },
    { label: 'Portfolio Analysis', path: 'portfolio-analysis', icon: 'A' },
    { label: 'Profile', path: 'profile', icon: 'Pr' },
    { label: 'Overview', path: '', icon: 'O' }
  ];

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h3>Investor Menu</h3>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <ul className="sidebar-menu">
          {menuItems.map((item, idx) => (
            <li key={idx}>
              <button
                onClick={() => navigate(`/investor/${item.path}`)}
                className="menu-item"
              >
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
        {sidebarOpen ? '✕' : '☰'}
      </button>

      <div className="dashboard-content">
         <Routes>
            <Route path="" element={<Overview user={user} />} />
            <Route path="explore" element={<Explore user={user} />} />
            <Route path="marketplace" element={<Marketplace user={user} />} />
            <Route path="marketplace/listing/:id" element={<ListingDetails />} />
            <Route path="pitch-analysis" element={<PitchAnalysis user={user} />} />
            <Route path="portfolio" element={<Portfolio user={user} />} />
            <Route path="portfolio-analysis" element={<PortfolioAnalysis user={user} />} />
            <Route path="founders" element={<Founders user={user} />} />
            <Route path="profile" element={<Profile user={user} />} />
         </Routes>
      </div>
    </div>
  );
}

export default InvestorDashboard;
