import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  FileText, CheckCircle2, Copy, Check, ArrowRight, 
  AlertCircle, Building2, User, Phone, Mail, MapPin, 
  HelpCircle, RefreshCw, Sparkles 
} from 'lucide-react';
import { registerComplaint } from '../services/api';

const CATEGORIES = [
  'Road Damage',
  'Garbage Collection',
  'Water Supply',
  'Streetlight Issues',
  'Drainage',
  'Sanitation'
];

export default function RegisterComplaintPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    citizen_name: '',
    mobile_number: '',
    email: '',
    category: '',
    title: '',
    description: '',
    ward_number: '',
    locality: '',
    landmark: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Success State
  const [submittedData, setSubmittedData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Pre-fill category if provided in query string e.g. /register?category=Road%20Damage
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat && CATEGORIES.includes(cat)) {
      setFormData((prev) => ({ ...prev, category: cat }));
    }
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field error when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setSubmitError('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.citizen_name.trim()) {
      newErrors.citizen_name = 'Citizen name is required.';
    } else if (formData.citizen_name.trim().length < 2) {
      newErrors.citizen_name = 'Name must be at least 2 characters.';
    }

    const cleanMobile = formData.mobile_number.trim();
    if (!cleanMobile) {
      newErrors.mobile_number = 'Mobile number is required.';
    } else if (!/^\d{10}$/.test(cleanMobile)) {
      newErrors.mobile_number = 'Mobile number must contain exactly 10 numeric digits.';
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please provide a valid email format (e.g. name@example.com).';
      }
    }

    if (!formData.category) {
      newErrors.category = 'Please select a complaint category.';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Complaint title is required.';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long.';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Detailed description is required.';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Please describe the problem in at least 10 characters.';
    }

    if (!formData.ward_number.toString().trim()) {
      newErrors.ward_number = 'Ward number is required.';
    }

    if (!formData.locality.trim()) {
      newErrors.locality = 'Area or locality is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      // Scroll to top of form
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const response = await registerComplaint(formData);
      if (response && response.success) {
        setSubmittedData({
          tracking_id: response.tracking_id,
          title: formData.title,
          category: formData.category,
          ward_number: formData.ward_number,
          locality: formData.locality,
          citizen_name: formData.citizen_name
        });
        window.scrollTo({ top: 50, behavior: 'smooth' });
      } else {
        setSubmitError(response?.message || 'Failed to submit complaint. Please try again.');
      }
    } catch (err) {
      console.error('Submission failed:', err);
      const serverMessage = err.response?.data?.message;
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        setErrors(serverErrors);
      }
      setSubmitError(serverMessage || 'Could not connect to the municipal server. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (submittedData?.tracking_id) {
      navigator.clipboard.writeText(submittedData.tracking_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleResetForNew = () => {
    setSubmittedData(null);
    setFormData({
      citizen_name: '',
      mobile_number: '',
      email: '',
      category: '',
      title: '',
      description: '',
      ward_number: '',
      locality: '',
      landmark: ''
    });
    setErrors({});
    setSubmitError('');
    setCopied(false);
  };

  // If successfully submitted, render the Success View
  if (submittedData) {
    return (
      <div className="section" style={{ minHeight: '80vh' }}>
        <div className="container">
          <div className="success-box">
            <div className="success-icon-wrap">
              <CheckCircle2 size={44} />
            </div>

            <h2 style={{ fontSize: '1.9rem', color: 'var(--primary-navy)', fontWeight: 800, marginBottom: '0.6rem' }}>
              Complaint Registered Successfully!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
              Your civic grievance has been logged permanently in the municipal database and routed to the designated ward authority.
            </p>

            {/* Tracking ID Display Card */}
            <div className="tracking-code-card">
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>
                  Your Unique Tracking ID
                </span>
                <span className="tracking-code-val">{submittedData.tracking_id}</span>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={copyToClipboard}
                title="Copy Tracking ID to Clipboard"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
              >
                {copied ? (
                  <>
                    <Check size={16} style={{ color: 'var(--secondary-teal)' }} />
                    <span style={{ color: 'var(--secondary-teal)' }}>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>

            {/* Submission Summary Card */}
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '1.25rem', textAlign: 'left', marginBottom: '2rem', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Registered By</span>
                  <strong>{submittedData.citizen_name}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Category</span>
                  <strong>{submittedData.category}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Location</span>
                  <span>Ward {submittedData.ward_number}, {submittedData.locality}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Initial Status</span>
                  <span className="status-badge pending" style={{ padding: '0.15rem 0.5rem', fontSize: '0.75rem' }}>Pending</span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
              Please save this tracking ID for future reference. You can check review updates and inspection notes on the tracking page anytime.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => navigate(`/track?id=${submittedData.tracking_id}`)}
              >
                Track This Complaint Now
                <ArrowRight size={18} />
              </button>
              <button
                type="button"
                className="btn btn-outline-navy"
                onClick={handleResetForNew}
              >
                Register Another Complaint
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '860px' }}>
        {/* Header Breadcrumb & Title */}
        <div style={{ marginBottom: '2rem' }}>
          <span className="section-badge">Citizen Services</span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
            Register a Civic Complaint
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Report civic problems in your neighborhood. Please provide accurate locality details to ensure prompt field inspection.
          </p>
        </div>

        {submitError && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={20} />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-card" noValidate>
          {/* Section 1: Citizen Contact Details */}
          <h2 className="form-section-title">
            <User size={20} style={{ color: 'var(--secondary-teal)' }} />
            1. Citizen Contact Information
          </h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Your contact details are used solely by municipal staff for verification and will remain strictly confidential from public tracking view.
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="citizen_name">
                Citizen Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="citizen_name"
                name="citizen_name"
                className={`form-input ${errors.citizen_name ? 'error' : ''}`}
                placeholder="e.g. Ramesh Kumar"
                value={formData.citizen_name}
                onChange={handleChange}
              />
              {errors.citizen_name && <div className="form-error-msg">{errors.citizen_name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="mobile_number">
                Mobile Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="mobile_number"
                name="mobile_number"
                maxLength={10}
                className={`form-input ${errors.mobile_number ? 'error' : ''}`}
                placeholder="10-digit mobile number (e.g. 9876543210)"
                value={formData.mobile_number}
                onChange={handleChange}
              />
              {errors.mobile_number && <div className="form-error-msg">{errors.mobile_number}</div>}
              <div className="form-help-text">Must be exactly 10 digits for status notifications.</div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address <span className="optional">(Optional)</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="e.g. ramesh.kumar@example.com"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <div className="form-error-msg">{errors.email}</div>}
          </div>

          {/* Section 2: Complaint Specifics */}
          <h2 className="form-section-title" style={{ marginTop: '2.5rem' }}>
            <FileText size={20} style={{ color: 'var(--secondary-teal)' }} />
            2. Complaint Details
          </h2>

          <div className="form-group">
            <label className="form-label" htmlFor="category">
              Complaint Category <span className="required">*</span>
            </label>
            <select
              id="category"
              name="category"
              className={`form-select ${errors.category ? 'error' : ''}`}
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">-- Select Civic Department Category --</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <div className="form-error-msg">{errors.category}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Complaint Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="e.g. Broken water pipeline leaking near block 4"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && <div className="form-error-msg">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Detailed Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Please provide specific details such as the severity of the issue, how long it has persisted, and any immediate public safety concerns..."
              value={formData.description}
              onChange={handleChange}
            />
            {errors.description && <div className="form-error-msg">{errors.description}</div>}
          </div>

          {/* Section 3: Location Details */}
          <h2 className="form-section-title" style={{ marginTop: '2.5rem' }}>
            <MapPin size={20} style={{ color: 'var(--secondary-teal)' }} />
            3. Locality & Ward Location
          </h2>

          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label" htmlFor="ward_number">
                Ward Number <span className="required">*</span>
              </label>
              <input
                type="text"
                id="ward_number"
                name="ward_number"
                className={`form-input ${errors.ward_number ? 'error' : ''}`}
                placeholder="e.g. Ward 12 or 05"
                value={formData.ward_number}
                onChange={handleChange}
              />
              {errors.ward_number && <div className="form-error-msg">{errors.ward_number}</div>}
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label" htmlFor="locality">
                Area / Locality / Street <span className="required">*</span>
              </label>
              <input
                type="text"
                id="locality"
                name="locality"
                className={`form-input ${errors.locality ? 'error' : ''}`}
                placeholder="e.g. 5th Main Road, Indiranagar"
                value={formData.locality}
                onChange={handleChange}
              />
              {errors.locality && <div className="form-error-msg">{errors.locality}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="landmark">
              Nearest Landmark <span className="optional">(Optional)</span>
            </label>
            <input
              type="text"
              id="landmark"
              name="landmark"
              className="form-input"
              placeholder="e.g. Opposite Post Office, Near City Park Gate"
              value={formData.landmark}
              onChange={handleChange}
            />
            <div className="form-help-text">Assists inspection officers in quickly locating the site.</div>
          </div>

          {/* Submission Notice & Action */}
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: '8px', margin: '2rem 0 1.5rem', border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <strong>Citizen Confirmation:</strong> By submitting this complaint, you confirm that the information provided is factual to the best of your knowledge. This portal is a demonstration system storing records in local SQLite database.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <RefreshCw size={18} className="spin-slow" />
                  Submitting to Database...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Submit Grievance
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
