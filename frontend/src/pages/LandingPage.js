import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-tag">Innovation in Investment</div>
            <h1>Fondora-X</h1>
            <p className="subtitle">Live Proof-of-Work Investment Intelligence Platform</p>
            <p className="description">
              Transform startup investing from pitch-based speculation to proof-based decision-making. 
              Track real execution metrics, verify milestones, and make informed investment decisions with 
              confidence and transparency.
            </p>
            
            <div className="hero-buttons">
              <button className="btn-primary btn-large" onClick={() => navigate('/register')}>
                Get Started Now
              </button>
              <button className="btn-outline btn-large" onClick={() => navigate('/login')}>
                Sign In
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="illustration">
              <svg className="chart-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="60" width="12" height="30" fill="currentColor" opacity="0.8"/>
                <rect x="28" y="40" width="12" height="50" fill="currentColor" opacity="0.9"/>
                <rect x="46" y="20" width="12" height="70" fill="currentColor"/>
                <rect x="64" y="50" width="12" height="40" fill="currentColor" opacity="0.9"/>
                <rect x="82" y="30" width="12" height="60" fill="currentColor" opacity="0.8"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Fondora-X?</h2>
            <p className="section-subtitle">Empowering investors and founders with data-driven insights</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box">
                <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                  <polyline points="13 2 13 9 20 9"/>
                </svg>
              </div>
              <h3>Live Proof-of-Work Ledger</h3>
              <p>Real-time execution tracking with verified milestone updates, product releases, and growth metrics displayed transparently.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="2" x2="12" y2="22"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h3>Portfolio Analytics</h3>
              <p>Comprehensive dashboard with ROI tracking, risk scoring, diversification analysis, and performance metrics at your fingertips.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3>Micro-Exit Marketplace</h3>
              <p>Enable founders to list partial or full exits with transparent bidding, escrow protection, and secure deal execution.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a3 3 0 0 0-3 3v1H6a3 3 0 0 0-3 3v11a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-3V5a3 3 0 0 0-3-3z"/>
                  <path d="M9 14h6"/>
                </svg>
              </div>
              <h3>AI Pitch Analysis</h3>
              <p>Automated pitch deck evaluation with comprehensive risk scoring and investment readiness assessment powered by AI.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1"/>
                  <path d="M12 8v.01M16 12h.01M12 16v.01M8 12h.01M14.22 9.78a2 2 0 0 0-2.83 0M9.78 14.22a2 2 0 0 0 2.83 0"/>
                </svg>
              </div>
              <h3>Momentum Alerts</h3>
              <p>Real-time notifications for portfolio changes, execution milestones, market shifts, and investment opportunities you cannot miss.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3>Secure Transactions</h3>
              <p>Escrow-style payment integration with advanced fraud detection and comprehensive secure deal documentation standards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p className="section-subtitle">Simple, transparent, and efficient workflow</p>
          </div>
          
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>For Founders</h3>
              <p>Create your execution ledger, post milestone updates, and demonstrate real-time progress to the investment community.</p>
            </div>

            <div className="step-connector"></div>

            <div className="step">
              <div className="step-number">2</div>
              <h3>For Investors</h3>
              <p>View live execution feeds, analyze startup metrics comprehensively, and track portfolio performance in real-time.</p>
            </div>

            <div className="step-connector"></div>

            <div className="step">
              <div className="step-number">3</div>
              <h3>Make Decisions</h3>
              <p>Based on verified execution data and proven metrics, not just promises and pitch deck presentations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Transform Your Investment Strategy?</h2>
          <p>Join thousands of investors and founders who are already using Fondora-X</p>
          <button className="btn-primary btn-large" onClick={() => navigate('/register')}>
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Fondora-X</h4>
              <p>Redefining startup investment through execution proof and data-driven intelligence.</p>
            </div>
            
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><button onClick={() => navigate('/login')} className="footer-link-btn">Sign In</button></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#contact">Contact Us</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2024 Fondora-X. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
