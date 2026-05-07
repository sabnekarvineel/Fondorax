import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Pages
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';
import FounderDashboard from './pages/founder/Dashboard';
import InvestorDashboard from './pages/investor/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

// Components
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
        {user && <Navbar user={user} onLogout={handleLogout} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />}
        
        <Routes>
          <Route path="/" element={user ? <Navigate to={`/${user.role}`} /> : <LandingPage />} />
          <Route path="/register" element={user ? <Navigate to={`/${user.role}`} /> : <Register setUser={setUser} />} />
          <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <Login setUser={setUser} />} />
          
          {/* Founder Routes */}
          <Route 
            path="/founder/*" 
            element={user && user.role === 'founder' ? <FounderDashboard user={user} /> : <Navigate to="/login" />} 
          />
          
          {/* Investor Routes */}
          <Route 
            path="/investor/*" 
            element={user && user.role === 'investor' ? <InvestorDashboard user={user} /> : <Navigate to="/login" />} 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/*" 
            element={user && user.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
