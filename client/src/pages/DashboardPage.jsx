import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, CheckCircle2, Clock, RefreshCw, XCircle, 
  FileText, ArrowRight, ShieldCheck, PieChart, Layers 
} from 'lucide-react';
import { getComplaintStats } from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0,
    categories: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComplaintStats()
      .then((data) => {
        if (data && data.stats) {
          setStats(data.stats);
        }
      })
      .catch((err) => {
        console.error('Failed to load statistics:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const resolutionRate = stats.total > 0
    ? Math.round((stats.resolved / stats.total) * 100)
    : 0;

  return (
    <div className="section" style={{ minHeight: '80vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="section-badge">Civic Transparency</span>
          <h1 style={{ fontSize: '2.3rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
            City Civic Grievance Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '720px' }}>
            Real-time public statistics from the municipal SQLite database. Monitor citywide grievance intake, active field operations, and resolution performance across all wards.
          </p>
        </div>

        {/* Top 4 Metric Cards */}
        <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon-wrap stat-icon-total">
              <FileText size={26} />
            </div>
            <div>
              <div className="stat-value">{loading ? '...' : stats.total}</div>
              <div className="stat-label">Total Grievances Registered</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap stat-icon-pending">
              <Clock size={26} />
            </div>
            <div>
              <div className="stat-value">{loading ? '...' : stats.pending}</div>
              <div className="stat-label">Pending Inspection</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap stat-icon-progress">
              <RefreshCw size={26} />
            </div>
            <div>
              <div className="stat-value">{loading ? '...' : stats.in_progress}</div>
              <div className="stat-label">Currently In Progress</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap stat-icon-resolved">
              <CheckCircle2 size={26} />
            </div>
            <div>
              <div className="stat-value">{loading ? '...' : stats.resolved}</div>
              <div className="stat-label">Successfully Resolved</div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          {/* Card 1: Resolution Efficiency */}
          <div className="form-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <ShieldCheck size={22} style={{ color: 'var(--secondary-teal)' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                Resolution Efficiency
              </h3>
            </div>

            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--secondary-teal)', lineHeight: 1 }}>
                {resolutionRate}%
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Overall Complaint Resolution Rate
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Resolved Cases</span>
                <strong>{stats.resolved}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>In Progress Cases</span>
                <strong>{stats.in_progress}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Pending Assessment</span>
                <strong>{stats.pending}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Rejected / Non-jurisdictional</span>
                <strong>{stats.rejected}</strong>
              </div>
            </div>
          </div>

          {/* Card 2: Complaints by Civic Category */}
          <div className="form-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <Layers size={22} style={{ color: 'var(--secondary-teal)' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                Department Distribution
              </h3>
            </div>

            {stats.categories && stats.categories.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {stats.categories.map((c) => {
                  const pct = stats.total > 0 ? Math.round((c.count / stats.total) * 100) : 0;
                  return (
                    <div key={c.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                        <span style={{ fontWeight: 600 }}>{c.category}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{c.count} ({pct}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            backgroundColor: 'var(--secondary-teal)',
                            borderRadius: '4px'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No category data available.</p>
            )}
          </div>
        </div>

        {/* Quick Action Box */}
        <div style={{ backgroundColor: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.35rem' }}>
              Notice a Civic Defect in Your Neighborhood?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Take 2 minutes to report it. You will receive an immediate tracking ID to monitor ward repair progress.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary">
              Register a Complaint
              <ArrowRight size={16} />
            </Link>
            <Link to="/track" className="btn btn-secondary">
              Track Existing Issue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
