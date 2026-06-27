// ─────────────────────────────────────────────────────────────────────────────
// pages/LoginPage.jsx — LOGIN FORM PAGE
//
// This is a PUBLIC PAGE — no auth required. Anyone can visit /login.
//
// What it does:
//   1. Renders a username + password form
//   2. On submit → calls loginApi() in services/api.js (POST /api/auth/login)
//   3. Backend returns a JWT token + user object
//   4. Calls AuthContext.login(token, user) to save the session globally
//   5. Navigates to /dashboard
//
// If the user is already logged in, they can still visit this page
// (no automatic redirect away — that could be a future improvement).
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await loginApi(username.trim(), password);
      login(data.token, { username: data.username, email: data.email });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-on-surface font-body-md h-screen w-full flex items-center justify-center p-container-margin relative overflow-hidden bg-transparent">
      {/* Decorative background blur */}
      <div className="absolute -right-24 -top-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-bg-card border border-border-muted rounded w-full max-w-md shadow-lg p-card-padding text-left relative z-10 animate-fadeIn">
        <div className="mb-6 text-center">
          <h1 className="font-headline-lg text-headline-lg font-bold text-primary flex items-center justify-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
            PrepIntAI
          </h1>
          <p className="font-label-md text-label-md text-text-secondary mt-1">Sign in to your AI Coach dashboard</p>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger p-3 rounded text-xs flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-label-md text-label-md text-text-secondary mb-2 uppercase tracking-wider">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-bg-base border border-border-muted text-on-surface text-sm rounded-md py-2.5 px-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-text-secondary mb-2 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg-base border border-border-muted text-on-surface text-sm rounded-md py-2.5 px-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary font-bold py-2.5 px-5 rounded-md shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-6"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">login</span>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-border-muted pt-4">
          <p className="font-body-sm text-body-sm text-text-secondary">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-bold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
