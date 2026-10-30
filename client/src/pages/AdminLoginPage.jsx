import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, User, AlertCircle, Eye, EyeOff, RefreshCw, KeyRound } from 'lucide-react';
import { loginAdmin } from '../services/api';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await loginAdmin({
        username: username.trim(),
        password: password
      });

      if (response && response.success) {
        navigate('/admin');
      } else {
        setErrorMsg(response?.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      const serverMsg = err.response?.data?.message;
      setErrorMsg(serverMsg || 'Invalid administrative credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMsg('');
  };

  return (
    <div className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="form-card" style={{ padding: '2.5rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--primary-navy)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 4px 10px rgba(15, 44, 89, 0.25)' }}>
              <ShieldCheck size={32} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.35rem' }}>
              Administrator Login
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Municipal Staff & Administrative Officer Portal
            </p>
          </div>

          {/* Demonstration Helper Banner */}
          <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#1E40AF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Demo Credentials:</strong><br />
              User: <code style={{ backgroundColor: 'rgba(255,255,255,0.7)', padding: '1px 4px', borderRadius: '3px' }}>admin</code> / 
              Pass: <code style={{ backgroundColor: 'rgba(255,255,255,0.7)', padding: '1px 4px', borderRadius: '3px' }}>admin123</code>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={fillDemoCredentials}
              style={{ fontSize: '0.78rem', padding: '0.25rem 0.6rem', whiteSpace: 'nowrap' }}
            >
              Auto-Fill
            </button>
          </div>

          {errorMsg && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Admin Username
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  id="username"
                  className="form-input"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMsg('');
                  }}
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-navy"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="spin-slow" />
                  Verifying Credentials...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Sign In to Dashboard
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
            <Link to="/" style={{ color: 'var(--secondary-teal)', fontWeight: 600 }}>
              ← Return to Citizen Public Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
