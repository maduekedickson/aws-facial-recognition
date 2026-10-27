import React, { useState } from 'react';
import Verify from './pages/Verify';
import About from './pages/About';

/**
 * App Component
 * 
 * Root container providing header navigation between "Verify" and "About",
 * and presenting the active page view.
 */
export default function App() {
  const [currentPage, setCurrentPage] = useState('verify'); // 'verify' | 'about'

  return (
    <div className="app-layout">
      {/* Top Corporate Navigation Bar */}
      <header className="navbar">
        <div className="nav-container">
          {/* Brand Logo & Name */}
          <div className="brand" onClick={() => setCurrentPage('verify')}>
            <div className="brand-logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                <circle cx="12" cy="16" r="1.5"></circle>
              </svg>
            </div>
            <div className="brand-text">
              <span className="brand-title">RiteClick <span className="brand-highlight">FaceGate</span></span>
              <span className="brand-tag">AWS Cloud Access</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="nav-links">
            <button
              type="button"
              className={`nav-btn ${currentPage === 'verify' ? 'nav-btn-active' : ''}`}
              onClick={() => setCurrentPage('verify')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              Verify
            </button>

            <button
              type="button"
              className={`nav-btn ${currentPage === 'about' ? 'nav-btn-active' : ''}`}
              onClick={() => setCurrentPage('about')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              About
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {currentPage === 'verify' ? <Verify /> : <About />}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <p className="footer-text">
            <strong>RiteClick FaceGate</strong> &bull; AWS Facial Recognition Access System
          </p>
          <p className="footer-subtext">
            Amazon Rekognition &bull; AWS Lambda &bull; Amazon API Gateway &bull; Amazon DynamoDB
          </p>
        </div>
      </footer>
    </div>
  );
}
