import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Search, AlertCircle, Calendar, MapPin, Building, 
  Clock, ShieldAlert, History, ArrowRight, UserCheck, 
  HelpCircle, RefreshCw 
} from 'lucide-react';
import { trackComplaintById } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Timeline from '../components/Timeline';

export default function TrackComplaintPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [trackingIdInput, setTrackingIdInput] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchedId, setSearchedId] = useState('');

  // Sample demo IDs for presentation quick-testing
  const sampleDemoIds = [
    { id: 'MCR-2026-881204', label: 'Pending (Road)' },
    { id: 'MCR-2026-749102', label: 'In Progress (Garbage)' },
    { id: 'MCR-2026-612398', label: 'Resolved (Water)' },
    { id: 'MCR-2026-291045', label: 'Rejected (NHAI Highway)' }
  ];

  // Auto-search if ?id= query param exists in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idParam = params.get('id');
    if (idParam) {
      setTrackingIdInput(idParam);
      performSearch(idParam);
    }
  }, [location.search]);

  const performSearch = async (idToSearch) => {
    const cleanId = (idToSearch || '').trim().toUpperCase();
    if (!cleanId) {
      setErrorMsg('Please enter a valid complaint tracking ID.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setComplaint(null);
    setHistory([]);
    setSearchedId(cleanId);

    try {
      const response = await trackComplaintById(cleanId);
      if (response && response.success) {
        setComplaint(response.complaint);
        setHistory(response.history || []);
      } else {
        setErrorMsg(response?.message || `No complaint found with Tracking ID "${cleanId}".`);
      }
    } catch (err) {
      console.error('Error tracking complaint:', err);
      const serverMsg = err.response?.data?.message;
      setErrorMsg(serverMsg || `No record found for tracking ID "${cleanId}". Please verify and try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    performSearch(trackingIdInput);
  };

  const handleSampleClick = (id) => {
    setTrackingIdInput(id);
    navigate(`/track?id=${id}`);
  };

  return (
    <div className="section" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="section-badge">Status Verification</span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.6rem' }}>
            Track Your Complaint Progress
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
            Enter your unique Tracking ID to see live departmental inspection notes, current stage, and resolution history.
          </p>
        </div>

        {/* Tracking Search Bar */}
        <form onSubmit={handleFormSubmit} className="track-search-bar">
          <input
            type="text"
            className="form-input"
            placeholder="Enter Tracking ID (e.g. MCR-2026-881204)"
            value={trackingIdInput}
            onChange={(e) => setTrackingIdInput(e.target.value)}
            style={{ fontWeight: 600, letterSpacing: '0.04em' }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '150px' }}>
            {loading ? (
              <>
                <RefreshCw size={18} className="spin-slow" />
                Searching...
              </>
            ) : (
              <>
                <Search size={18} />
                Track Status
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Chips for easy presentation click */}
        <div className="quick-demo-ids">
          <span>Click sample demo IDs to test:</span>
          {sampleDemoIds.map((sample) => (
            <button
              key={sample.id}
              type="button"
              className="demo-chip"
              onClick={() => handleSampleClick(sample.id)}
            >
              {sample.id} ({sample.label})
            </button>
          ))}
        </div>

        {/* Error Callout */}
        {errorMsg && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <AlertCircle size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                Complaint Not Found
              </div>
              <div style={{ fontSize: '0.92rem', lineHeight: 1.5 }}>
                {errorMsg}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#7F1D1D', marginTop: '0.6rem' }}>
                Tip: Tracking IDs are formatted like <strong>MCR-2026-XXXXXX</strong>. Please ensure you copied the complete ID or click one of the sample test badges above.
              </div>
            </div>
          </div>
        )}

        {/* Complaint Result View */}
        {complaint && (
          <div className="form-card" style={{ padding: '2rem' }}>
            {/* Top Bar: Tracking ID & Status Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.75rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                  Official Tracking ID
                </span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary-navy)' }}>
                  {complaint.tracking_id}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Current Status:</span>
                <StatusBadge status={complaint.status} />
              </div>
            </div>

            {/* Visual Progress Timeline */}
            <Timeline status={complaint.status} history={history} />

            {/* Complaint Overview Information */}
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
                {complaint.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.7, marginBottom: '1.5rem', whiteSpace: 'pre-line' }}>
                {complaint.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem', backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>
                    Civic Category
                  </span>
                  <strong style={{ color: 'var(--secondary-teal)' }}>{complaint.category}</strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>
                    Ward & Locality
                  </span>
                  <span>Ward {complaint.ward_number}, {complaint.locality}</span>
                </div>

                {complaint.landmark && (
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>
                      Nearest Landmark
                    </span>
                    <span>{complaint.landmark}</span>
                  </div>
                )}

                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>
                    Citizen Privacy Protected
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Filed by: <strong>{complaint.citizen_name}</strong>
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>
                    Registration Date
                  </span>
                  <span>{complaint.created_at}</span>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>
                    Last Official Update
                  </span>
                  <span>{complaint.updated_at}</span>
                </div>
              </div>
            </div>

            {/* Status History Log */}
            <div style={{ marginTop: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <History size={20} style={{ color: 'var(--primary-navy)' }} />
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                  Official Department Status History & Action Log
                </h4>
              </div>

              {history.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No administrative remarks recorded yet.
                </p>
              ) : (
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F1F5F9', textAlign: 'left', color: '#475569' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>Date & Time</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Stage Update</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Administrative Action / Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h, idx) => (
                        <tr key={h.id || idx} style={{ borderTop: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                            {h.changed_at}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                            <StatusBadge status={h.new_status} />
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)' }}>
                            {h.admin_note || 'Status recorded by system.'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick Actions Footer */}
            <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => window.print()}
              >
                Print / Save Status Receipt
              </button>

              <Link to="/register" className="btn btn-outline-navy btn-sm">
                Register Another Grievance
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
