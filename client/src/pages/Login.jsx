import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try { await (mode === 'login' ? login(f) : register(f)); nav('/'); }
    catch (err) { setError(err.message); }
  };

  return (
    <form className="stack narrow" onSubmit={submit}>
      <h1>{mode === 'login' ? 'Sign in' : 'Create your account'}</h1>
      {mode === 'register' && <input required placeholder="Full name" value={f.name} onChange={on('name')} />}
      <input required type="email" placeholder="Email" value={f.email} onChange={on('email')} />
      <input required type="password" minLength="6" placeholder="Password (6+ characters)" value={f.password} onChange={on('password')} />
      {error && <p className="error">{error}</p>}
      <button className="btn">{mode === 'login' ? 'Sign in' : 'Create account'}</button>
      <button type="button" className="link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
        {mode === 'login' ? 'New here? Create an account' : 'Have an account? Sign in'}
      </button>
    </form>
  );
}
