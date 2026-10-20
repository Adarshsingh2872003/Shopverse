import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState('login');
  const [accountType, setAccountType] = useState('user');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = mode === 'login'
        ? await login({ ...f, accountType })
        : await register(f);
      nav(user.isAdmin ? '/admin' : '/');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setF({ name: '', email: '', password: '' });
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-icon">⚡</div>
          <h1>{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Sign in to your ShopVerse account'
              : 'Join ShopVerse and start shopping'}
          </p>
        </div>

        {/* Form */}
        <form id="auth-form" className="auth-form" onSubmit={submit} noValidate>
          {mode === 'login' && (
            <div className="input-group">
              <label className="input-label" htmlFor="account-type">Sign in as</label>
              <select
                id="account-type"
                className="input-field"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          {mode === 'register' && (
            <div className="input-group">
              <label className="input-label" htmlFor="name-input">Full name</label>
              <input
                id="name-input"
                className="input-field"
                required
                placeholder="Jane Doe"
                value={f.name}
                onChange={on('name')}
                autoComplete="name"
              />
            </div>
          )}

          <div className="input-group">
            <label className="input-label" htmlFor="email-input">Email address</label>
            <input
              id="email-input"
              className="input-field"
              required
              type="email"
              placeholder="you@example.com"
              value={f.email}
              onChange={on('email')}
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password-input">Password</label>
            <input
              id="password-input"
              className="input-field"
              required
              type="password"
              minLength="6"
              placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
              value={f.password}
              onChange={on('password')}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && (
            <p className="text-error" role="alert" aria-live="polite">
              ⚠️ {error}
            </p>
          )}

          <button
            id="auth-submit-btn"
            className="btn"
            disabled={busy}
            style={{ width: '100%', justifyContent: 'center', marginTop: '.25rem' }}
          >
            {busy
              ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
              : (mode === 'login' ? 'Sign in →' : 'Create account →')}
          </button>
        </form>

        <hr className="divider" />

        <p className="auth-toggle">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            id="auth-mode-toggle"
            className="link-btn"
            type="button"
            onClick={switchMode}
          >
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
