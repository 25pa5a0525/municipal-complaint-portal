import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, Search, ArrowRight, ShieldCheck, CheckCircle2, 
  Clock, RefreshCw, AlertCircle, Wrench, Trash2, Droplets, 
  Lightbulb, Waves, Sparkles, Building2, MapPin
} from 'lucide-react';
import { getComplaintStats } from '../services/api';

export default function HomePage() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0,
    categories: []
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [quickTrackId, setQuickTrackId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getComplaintStats()
      .then((data) => {
        if (data && data.stats) {
          setStats(data.stats);
        }
      })
      .catch((err) => {
        console.error('Failed to load stats:', err);
      })
      .finally(() => {
        setLoadingStats(false);
      });
  }, []);

  const handleQuickTrack = (e) => {
    e.preventDefault();
    if (quickTrackId.trim()) {
      navigate(`/track?id=${encodeURIComponent(quickTrackId.trim().toUpperCase())}`);
    }
  };

  const categoriesList = [
    {
      id: 'road',
      name: 'Road Damage',
      description: 'Report dangerous potholes, broken asphalt surfaces, damaged pavements, and street speed breaker issues.',
      icon: <Wrench size={24} />,
      color: '#0284C7'
    },
    {
      id: 'garbage',
      name: 'Garbage Collection',
      description: 'Report missed door-to-door waste pickups, overflowing community garbage dumpsters, and illegal dumping.',
      icon: <Trash2 size={24} />,
      color: '#059669'
    },
    {
      id: 'water',
      name: 'Water Supply',
      description: 'Report low municipal water pressure, underground pipeline fractures, contamination, or water supply delays.',
      icon: <Droplets size={24} />,
      color: '#0284C7'
    },
    {
      id: 'streetlight',
      name: 'Streetlight Issues',
      description: 'Report non-functioning streetlights, flickering sodium/LED fixtures, broken lighting poles, and hazardous wires.',
      icon: <Lightbulb size={24} />,
      color: '#D97706'
    },
    {
      id: 'drainage',
      name: 'Drainage Problems',
      description: 'Report choked stormwater drains, sewage pipe overflows, damaged manhole covers, and stagnant monsoon water.',
      icon: <Waves size={24} />,
      color: '#0D9488'
    },
    {
      id: 'sanitation',
      name: 'Public Sanitation',
      description: 'Report unhygienic public restrooms, accumulated street litter, open drains, and areas requiring immediate sanitation.',
      icon: <Sparkles size={24} />,
      color: '#7C3AED'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-badge">
                <ShieldCheck size={16} />
                <span>Official Municipal Citizen Service Platform</span>
              </div>
              <h1 className="hero-title">
                Making Our City Better, Together
              </h1>
              <p className="hero-description">
                A digital platform that helps citizens report municipal problems and monitor their resolution with complete transparency.
              </p>
              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary btn-lg">
                  <FileText size={18} />
                  Register a Complaint
                </Link>
                <Link to="/track" className="btn btn-outline-white btn-lg">
                  <Search size={18} />
                  Track Your Complaint
                </Link>
              </div>
            </div>

            {/* Quick Track Widget */}
            <div>
              <div className="hero-card-widget">
                <div className="hero-widget-header">
                  <Search size={20} style={{ color: 'var(--secondary-teal)' }} />
                  <h3 className="hero-widget-title">Quick Complaint Tracking</h3>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
                  Have an existing tracking ID? Check real-time review and resolution status instantly.
                </p>
                <form onSubmit={handleQuickTrack}>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. MCR-2026-881204"
                      value={quickTrackId}
                      onChange={(e) => setQuickTrackId(e.target.value)}
                      style={{ textTransform: 'uppercase', fontWeight: 600 }}
                    />
                  </div>
                  <button type="submit" className="btn btn-navy" style={{ width: '100%' }}>
                    Track Complaint Status
                    <ArrowRight size={16} />
                  </button>
                </form>

                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Sample ID: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-navy)' }}>MCR-2026-881204</span> (Click to test)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Database Statistics Bar */}
      <div className="container">
        <div className="stats-bar-wrapper">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrap stat-icon-total">
                <FileText size={26} />
              </div>
              <div>
                <div className="stat-value">{loadingStats ? '...' : stats.total}</div>
                <div className="stat-label">Total Complaints</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap stat-icon-pending">
                <Clock size={26} />
              </div>
              <div>
                <div className="stat-value">{loadingStats ? '...' : stats.pending}</div>
                <div className="stat-label">Pending Review</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap stat-icon-progress">
                <RefreshCw size={26} />
              </div>
              <div>
                <div className="stat-value">{loadingStats ? '...' : stats.in_progress}</div>
                <div className="stat-label">In Progress</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap stat-icon-resolved">
                <CheckCircle2 size={26} />
              </div>
              <div>
                <div className="stat-value">{loadingStats ? '...' : stats.resolved}</div>
                <div className="stat-label">Resolved Issues</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complaint Categories Section */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Civic Categories</span>
            <h2 className="section-title">Report Civic Issues by Category</h2>
            <p className="section-subtitle">
              Select the appropriate civic service department to ensure your grievance reaches the designated municipal field engineers quickly.
            </p>
          </div>

          <div className="categories-grid">
            {categoriesList.map((cat) => (
              <div key={cat.id} className="category-card">
                <div className="category-header">
                  <div className="category-icon" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                    {cat.icon}
                  </div>
                  <h3 className="category-title">{cat.name}</h3>
                </div>
                <p className="category-description">{cat.description}</p>
                <Link
                  to={`/register?category=${encodeURIComponent(cat.name)}`}
                  className="category-action"
                >
                  Report in {cat.name}
                  <ArrowRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Transparent Process</span>
            <h2 className="section-title">How The Portal Works</h2>
            <p className="section-subtitle">
              Our 4-step workflow guarantees that every citizen issue is logged, inspected, and acted upon systematically.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number-badge">1</div>
              <h3 className="step-title">Submit your complaint</h3>
              <p className="step-text">
                Fill the simple online registration form with the category, locality, ward number, and description of the civic problem.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number-badge">2</div>
              <h3 className="step-title">Receive a tracking ID</h3>
              <p className="step-text">
                An instant, unique tracking reference code (e.g., MCR-2026-XXXXXX) is generated and saved permanently in the system.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number-badge">3</div>
              <h3 className="step-title">Municipal staff review</h3>
              <p className="step-text">
                Authorized municipal engineers review the complaint, inspect the reported site, and deploy the appropriate field crew.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number-badge">4</div>
              <h3 className="step-title">Track until resolution</h3>
              <p className="step-text">
                Track progress milestones live on the portal. Status notes and inspection remarks are visible at every stage until closure.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/register" className="btn btn-navy btn-lg">
              <FileText size={18} />
              Get Started • Register A Grievance Now
            </Link>
          </div>
        </div>
      </section>

      {/* City Commitment Banner */}
      <section style={{ backgroundColor: 'var(--primary-navy)', color: 'white', padding: '3.5rem 0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
            Committed to Responsive Urban Governance
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            Our municipal corporation aims to resolve safety-critical civic complaints like open potholes and sewage blockages within 48 to 72 hours. Your active participation helps keep our wards clean, safe, and livable.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/dashboard" className="btn btn-primary">
              View Public Dashboard & Resolution Stats
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
