import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerApi } from '../services/api';

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }

    if (username.trim().length < 4) {
      setError('Username must be at least 4 characters.');
      return;
    }

    if (password.trim().length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await registerApi(username.trim(), email.trim(), password);
      login(data.token, { username: data.username, email: data.email });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to register account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md h-screen w-full flex items-center justify-center p-container-margin relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute -right-24 -top-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-bg-card border border-border-muted rounded w-full max-w-md shadow-lg p-card-padding text-left relative z-10 animate-fadeIn">
        <div className="mb-6 text-center">
          <h1 className="font-headline-lg text-headline-lg font-bold text-primary flex items-center justify-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
            PrepIntAI
          </h1>
          <p className="font-label-md text-label-md text-text-secondary mt-1">Create an account to get started</p>
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
              className="w-full bg-background border border-border-muted text-on-surface font-body-sm text-body-sm rounded-md py-2 px-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
              placeholder="Min 4 characters"
              required
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-text-secondary mb-2 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border-muted text-on-surface font-body-sm text-body-sm rounded-md py-2 px-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-label-md text-text-secondary mb-2 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border-muted text-on-surface font-body-sm text-body-sm rounded-md py-2 px-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                placeholder="Min 6 chars"
                required
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md text-text-secondary mb-2 uppercase tracking-wider">Confirm</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-background border border-border-muted text-on-surface font-body-sm text-body-sm rounded-md py-2 px-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                placeholder="Retype password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-container text-on-primary-container font-label-md text-label-md py-2.5 rounded flex justify-center items-center gap-2 hover:bg-surface-variant transition-colors border border-border-muted font-bold cursor-pointer mt-6"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">person_add</span>
                Sign Up
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-border-muted pt-4">
          <p className="font-body-sm text-body-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-bold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
