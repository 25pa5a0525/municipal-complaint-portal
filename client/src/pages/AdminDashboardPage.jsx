import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, LogOut, Search, Filter, RefreshCw, 
  FileText, Clock, CheckCircle2, XCircle, AlertCircle, 
  ExternalLink, User, Phone, Mail, MapPin, X, Send, 
  History, Calendar, Check 
} from 'lucide-react';
import { 
  checkAdminAuth, logoutAdmin, getAdminDashboard, 
  getAdminComplaints, getAdminComplaintDetails, updateComplaintStatus 
} from '../services/api';
import StatusBadge from '../components/StatusBadge';

const CATEGORIES = [
  'All',
  'Road Damage',
  'Garbage Collection',
  'Water Supply',
  'Streetlight Issues',
  'Drainage',
  'Sanitation'
];

const STATUSES = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  // Auth & Admin state
  const [adminUser, setAdminUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Dashboard Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0
  });

  // Complaints Table State
  const [complaints, setComplaints] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modal / Detail & Update State
  const [activeModalComplaint, setActiveModalComplaint] = useState(null);
  const [modalHistory, setModalHistory] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [updateSubmitting, setUpdateSubmitting] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState('');

  // Check Auth on Mount
  useEffect(() => {
    checkAdminAuth()
      .then((res) => {
        if (res && res.authenticated) {
          setAdminUser(res.user);
          loadDashboardData();
          loadComplaints();
        } else {
          navigate('/admin/login');
        }
      })
      .catch(() => {
        navigate('/admin/login');
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  const loadDashboardData = async () => {
    try {
      const res = await getAdminDashboard();
      if (res && res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard stats:', err);
    }
  };

  const loadComplaints = async () => {
    setTableLoading(true);
    try {
      const filters = {};
      if (searchTerm.trim()) filters.search = searchTerm.trim();
      if (selectedCategory !== 'All') filters.category = selectedCategory;
      if (selectedStatus !== 'All') filters.status = selectedStatus;

      const res = await getAdminComplaints(filters);
      if (res && res.success) {
        setComplaints(res.complaints || []);
      }
    } catch (err) {
      console.error('Failed to load complaints table:', err);
    } finally {
      setTableLoading(false);
    }
  };

  // Re-fetch when filters change
  useEffect(() => {
    if (adminUser) {
      loadComplaints();
    }
  }, [selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadComplaints();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    // Call directly with clean filters
    getAdminComplaints({})
      .then((res) => {
        if (res && res.success) {
          setComplaints(res.complaints || []);
        }
      });
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/admin/login');
    }
  };

  // Open Manage Modal
  const openComplaintModal = async (complaintId) => {
    setModalLoading(true);
    setUpdateError('');
    setUpdateSuccessMsg('');
    try {
      const res = await getAdminComplaintDetails(complaintId);
      if (res && res.success) {
        setActiveModalComplaint(res.complaint);
        setModalHistory(res.history || []);
        setNewStatus(res.complaint.status);
        setAdminNote('');
      }
    } catch (err) {
      console.error('Failed to load complaint details:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setActiveModalComplaint(null);
    setModalHistory([]);
    setAdminNote('');
    setUpdateError('');
    setUpdateSuccessMsg('');
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!adminNote.trim()) {
      setUpdateError('Please provide an official administrative note or action description.');
      return;
    }

    setUpdateSubmitting(true);
    setUpdateError('');
    setUpdateSuccessMsg('');

    try {
      const res = await updateComplaintStatus(activeModalComplaint.id, {
        status: newStatus,
        admin_note: adminNote.trim()
      });

      if (res && res.success) {
        setUpdateSuccessMsg(`Status updated to "${newStatus}" successfully!`);
        setActiveModalComplaint(res.complaint);
        setModalHistory(res.history || []);
        setAdminNote('');

        // Refresh table and stats automatically
        loadDashboardData();
        loadComplaints();
      } else {
        setUpdateError(res?.message || 'Could not update complaint status.');
      }
    } catch (err) {
      console.error('Status update failed:', err);
      setUpdateError(err.response?.data?.message || 'Failed to update status. Please try again.');
    } finally {
      setUpdateSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={36} className="spin-slow" style={{ color: 'var(--primary-navy)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Verifying administrative session...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', minHeight: '90vh', paddingBottom: '3rem' }}>
      {/* Administrator Top Header */}
      <div className="admin-header">
        <div className="container admin-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: '0.45rem', borderRadius: '8px' }}>
              <ShieldCheck size={24} style={{ color: '#38BDF8' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'white' }}>
                  Municipal Administrator Console
                </h1>
                <span className="admin-title-badge">Authenticated</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Logged in as: <strong>{adminUser?.username || 'admin'}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/" className="btn btn-outline-white btn-sm" target="_blank" rel="noopener noreferrer">
              <ExternalLink size={14} />
              Open Citizen Portal
            </Link>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout} style={{ color: '#DC2626' }}>
              <LogOut size={14} />
              Log Out
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '2rem' }}>
        {/* Dashboard Statistics Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div className="stat-card" style={{ padding: '1.25rem 1rem' }}>
            <div className="stat-icon-wrap stat-icon-total" style={{ width: '44px', height: '44px' }}>
              <FileText size={22} />
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: '1.6rem' }}>{stats.total}</div>
              <div className="stat-label" style={{ fontSize: '0.8rem' }}>Total Grievances</div>
            </div>
          </div>

          <div className="stat-card" style={{ padding: '1.25rem 1rem' }}>
            <div className="stat-icon-wrap stat-icon-pending" style={{ width: '44px', height: '44px' }}>
              <Clock size={22} />
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: '1.6rem' }}>{stats.pending}</div>
              <div className="stat-label" style={{ fontSize: '0.8rem' }}>Pending Review</div>
            </div>
          </div>

          <div className="stat-card" style={{ padding: '1.25rem 1rem' }}>
            <div className="stat-icon-wrap stat-icon-progress" style={{ width: '44px', height: '44px' }}>
              <RefreshCw size={22} />
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: '1.6rem' }}>{stats.in_progress}</div>
              <div className="stat-label" style={{ fontSize: '0.8rem' }}>In Progress</div>
            </div>
          </div>

          <div className="stat-card" style={{ padding: '1.25rem 1rem' }}>
            <div className="stat-icon-wrap stat-icon-resolved" style={{ width: '44px', height: '44px' }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: '1.6rem' }}>{stats.resolved}</div>
              <div className="stat-label" style={{ fontSize: '0.8rem' }}>Resolved</div>
            </div>
          </div>

          <div className="stat-card" style={{ padding: '1.25rem 1rem' }}>
            <div className="stat-icon-wrap" style={{ width: '44px', height: '44px', backgroundColor: 'var(--status-rejected-bg)', color: 'var(--status-rejected-text)' }}>
              <XCircle size={22} />
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: '1.6rem' }}>{stats.rejected}</div>
              <div className="stat-label" style={{ fontSize: '0.8rem' }}>Rejected</div>
            </div>
          </div>
        </div>

        {/* Complaint Management & Filtering Toolbar */}
        <div className="filter-toolbar">
          <form onSubmit={handleSearchSubmit} className="filter-search-box" style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by Tracking ID, Title, Citizen or Locality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.6rem 0.85rem', fontSize: '0.9rem' }}
            />
            <button type="submit" className="btn btn-navy btn-sm">
              <Search size={15} />
              Search
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ padding: '0.6rem 0.85rem', fontSize: '0.9rem' }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>Category: {c}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{ padding: '0.6rem 0.85rem', fontSize: '0.9rem' }}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>Status: {s}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Complaint Management Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Citizen Details</th>
                <th>Complaint Title & Category</th>
                <th>Ward & Locality</th>
                <th>Submission Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                    <RefreshCw size={24} className="spin-slow" style={{ color: 'var(--secondary-teal)' }} />
                    <div style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Loading complaints from SQLite...</div>
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No complaints found matching the selected filters.
                  </td>
                </tr>
              ) : (
                complaints.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-navy)' }}>
                        {item.tracking_id}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.citizen_name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        📞 {item.mobile_number}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--secondary-teal)', fontWeight: 600 }}>
                        {item.category}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>Ward {item.ward_number}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.locality}</div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {item.created_at}
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-navy btn-sm"
                        onClick={() => openComplaintModal(item.id)}
                      >
                        Manage & Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaint Detail & Status Update Modal */}
      {activeModalComplaint && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h3 className="modal-title">
                  Manage Complaint: {activeModalComplaint.tracking_id}
                </h3>
                <StatusBadge status={activeModalComplaint.status} />
              </div>
              <button type="button" className="modal-close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {updateSuccessMsg && (
                <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <Check size={18} />
                  <span>{updateSuccessMsg}</span>
                </div>
              )}

              {updateError && (
                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <AlertCircle size={18} />
                  <span>{updateError}</span>
                </div>
              )}

              {/* Citizen Details Box */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', fontSize: '0.88rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Citizen Name</span>
                  <strong>{activeModalComplaint.citizen_name}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Mobile Number</span>
                  <strong>{activeModalComplaint.mobile_number}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Email Address</span>
                  <span>{activeModalComplaint.email || 'Not provided'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Location / Ward</span>
                  <span>Ward {activeModalComplaint.ward_number}, {activeModalComplaint.locality}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Landmark</span>
                  <span>{activeModalComplaint.landmark || 'None specified'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Submission Time</span>
                  <span>{activeModalComplaint.created_at}</span>
                </div>
              </div>

              {/* Complaint Description */}
              <div style={{ marginBottom: '1.75rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.4rem' }}>
                  {activeModalComplaint.title}
                </h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--secondary-teal)', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Category: {activeModalComplaint.category}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', padding: '0.85rem', borderRadius: '6px' }}>
                  {activeModalComplaint.description}
                </p>
              </div>

              {/* Status Update Form */}
              <div style={{ border: '2px solid #E2E8F0', borderRadius: '10px', padding: '1.25rem', backgroundColor: '#F8FAFC', marginBottom: '1.75rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--secondary-teal)' }} />
                  Update Complaint Status & Administrative Remarks
                </h4>

                <form onSubmit={handleStatusUpdate}>
                  <div className="form-row" style={{ marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="modal-status">
                        Change Status To <span className="required">*</span>
                      </label>
                      <select
                        id="modal-status"
                        className="form-select"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Note: Changing status immediately updates the citizen progress timeline and logs an official audit record.
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="modal-notes">
                      Administrative Action / Notes / Reason <span className="required">*</span>
                    </label>
                    <textarea
                      id="modal-notes"
                      rows={3}
                      className="form-textarea"
                      placeholder="e.g. Field inspection conducted by junior engineer. Work order issued to road repair contractor... (Or reason if rejected)"
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={updateSubmitting}
                    >
                      {updateSubmitting ? (
                        <>
                          <RefreshCw size={16} className="spin-slow" />
                          Saving Status in SQLite...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Save Status Update
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Status History Audit Table */}
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <History size={16} />
                  Status Audit History Log ({modalHistory.length} events)
                </h4>

                <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F1F5F9', color: '#475569', textAlign: 'left' }}>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Timestamp</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Transition</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Administrator Note / Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalHistory.map((h, idx) => (
                        <tr key={h.id || idx} style={{ borderTop: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                            {h.changed_at}
                          </td>
                          <td style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{h.old_status || 'New'}</span> → <StatusBadge status={h.new_status} />
                          </td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>
                            {h.admin_note || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
