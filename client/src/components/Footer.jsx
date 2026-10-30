import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, Phone, Mail, MapPin, AlertCircle, ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        {/* Demonstration Disclaimer Alert */}
        <div className="footer-demo-alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <ShieldAlert size={16} />
            ACADEMIC DEMONSTRATION NOTICE:
          </div>
          <div>
            This website is an educational college project demonstration. It does NOT connect to any real government department, municipal corporation, or public civic administration. All complaint records, contact numbers, and data are fictional.
          </div>
        </div>

        <div className="footer-grid">
          {/* Column 1: About */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: 'var(--secondary-teal)', padding: '0.4rem', borderRadius: '6px', color: 'white' }}>
                <Landmark size={20} />
              </div>
              <h3 className="footer-heading" style={{ marginBottom: 0 }}>Municipal Complaint Registration Portal</h3>
            </div>
            <p className="footer-text">
              A digital citizen-service initiative designed to bridge the communication gap between urban residents and municipal administrators. Empowering residents to report civic problems and track verifiable resolutions.
            </p>
            <p className="footer-text" style={{ fontStyle: 'italic', color: '#94A3B8' }}>
              "Your Voice, Our Responsibility"
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="footer-heading">Citizen Services</h4>
            <ul className="footer-links">
              <li><Link to="/">Portal Home</Link></li>
              <li><Link to="/register">Register Civic Complaint</Link></li>
              <li><Link to="/track">Track Complaint Status</Link></li>
              <li><Link to="/dashboard">City Transparency Dashboard</Link></li>
              <li><Link to="/admin/login">Municipal Staff Login</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact Demonstration Info */}
          <div>
            <h4 className="footer-heading">Demonstration Helpdesk</h4>
            <div className="footer-contact-item">
              <MapPin size={18} style={{ color: 'var(--secondary-teal)', flexShrink: 0, marginTop: '2px' }} />
              <span>Civic Centre Building, Demo Ward Office, Metro City 560001</span>
            </div>
            <div className="footer-contact-item">
              <Phone size={18} style={{ color: 'var(--secondary-teal)', flexShrink: 0 }} />
              <span>Demo Toll-Free: 1800-DEMO-CITY (9 AM - 6 PM)</span>
            </div>
            <div className="footer-contact-item">
              <Mail size={18} style={{ color: 'var(--secondary-teal)', flexShrink: 0 }} />
              <span>demo-support@municipal.local</span>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#94A3B8' }}>
              Ward Working Hours: Mon – Sat, 9:00 AM – 5:30 PM
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} Municipal Complaint Registration Portal. Built for Academic Demonstration.
          </div>
          <div>
            Standalone Full-Stack Application • React.js + Node.js Express + SQLite
          </div>
        </div>
      </div>
    </footer>
  );
}
