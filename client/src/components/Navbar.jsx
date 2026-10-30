import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Landmark, FileText, Search, BarChart3, ShieldCheck, Menu, X, CheckCircle } from 'lucide-react';
import { checkAdminAuth } from '../services/api';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if admin is currently authenticated
    checkAdminAuth()
      .then((res) => {
        setIsAdminLoggedIn(!!res?.authenticated);
      })
      .catch(() => {
        setIsAdminLoggedIn(false);
      });
  }, [location.pathname]);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header>
      {/* Top Demo Bar */}
      <div className="demo-top-bar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="demo-indicator">
            <span className="dot"></span>
            <span>DEMO VERSION • FOR EDUCATIONAL PURPOSES ONLY</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
            College Project Demonstration • Persistent SQLite Database
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand-link" onClick={closeMenu}>
            <div className="brand-logo-icon">
              <Landmark size={26} />
            </div>
            <div className="brand-text-block">
              <span className="brand-title">Municipal Complaint Portal</span>
              <span className="brand-tagline">Your Voice, Our Responsibility</span>
            </div>
          </Link>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <ul className={`nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <li>
              <Link
                to="/"
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <FileText size={16} />
                Register Complaint
              </Link>
            </li>
            <li>
              <Link
                to="/track"
                className={`nav-link ${location.pathname === '/track' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <Search size={16} />
                Track Complaint
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <BarChart3 size={16} />
                Dashboard
              </Link>
            </li>
            <li>
              {isAdminLoggedIn ? (
                <Link
                  to="/admin"
                  className={`nav-link nav-btn-admin ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <ShieldCheck size={16} />
                  Admin Panel
                </Link>
              ) : (
                <Link
                  to="/admin/login"
                  className={`nav-link nav-btn-admin ${location.pathname === '/admin/login' ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <ShieldCheck size={16} />
                  Admin Login
                </Link>
              )}
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
