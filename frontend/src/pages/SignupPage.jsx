// ─────────────────────────────────────────────────────────────────────────────
// pages/SignupPage.jsx — REGISTRATION FORM PAGE
//
// This is a PUBLIC PAGE — no auth required. Anyone can visit /signup.
//
// What it does:
//   1. Renders a username + email + password form
//   2. On submit → calls registerApi() in services/api.js (POST /api/auth/register)
//   3. Backend creates the user account and returns a JWT token
//   4. Calls AuthContext.login(token, user) to log the user in immediately
//   5. Navigates to /dashboard (user lands directly in the app after signup)
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerApi, checkUsername } from '../services/api';

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ username: '', email: '', password: '', confirmPassword: '' });

  const handleUsernameChange = (e) => {
    const val = e.target.value;
    setUsername(val);
    if (val.trim().length > 0 && val.trim().length < 8) {
      setFieldErrors(prev => ({ ...prev, username: 'Username must be at least 8 characters.' }));
    } else {
      setFieldErrors(prev => ({ ...prev, username: '' }));
    }
  };

  // Real-time username availability check
  useEffect(() => {
    if (username.trim().length >= 8) {
      const check = async () => {
        try {
          const exists = await checkUsername(username.trim());
          if (exists) {
            setFieldErrors(prev => ({ ...prev, username: 'Username is already taken.' }));
          } else {
            // Only clear the error if it was specifically the "taken" error
            setFieldErrors(prev => (prev.username === 'Username is already taken.' ? { ...prev, username: '' } : prev));
          }
        } catch (e) {
          console.error("Failed to check username availability", e);
        }
      };
      
      const timer = setTimeout(check, 500); // 500ms debounce
      return () => clearTimeout(timer);
    }
  }, [username]);

  const validateEmail = (emailStr) => {
    if (!emailStr) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailStr)) {
      return 'Please enter a valid email address.';
    }
    return '';
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (val.trim().length > 0) {
      setFieldErrors(prev => ({ ...prev, email: validateEmail(val.trim()) }));
    } else {
      setFieldErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const validatePassword = (pass) => {
    if (!pass) return '';
    if (pass.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(pass)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(pass)) return 'Password must contain at least one lowercase letter.';
    if (!/[0-9]/.test(pass)) return 'Password must contain at least one number.';
    if (!/[^A-Za-z0-9]/.test(pass)) return 'Password must contain at least one special character.';
    return '';
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setFieldErrors(prev => ({ ...prev, password: validatePassword(val) }));
    if (confirmPassword && val !== confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
    } else if (confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const val = e.target.value;
    setConfirmPassword(val);
    if (val && val !== password) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
    } else {
      setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }

    if (username.trim().length < 8) {
      setError('Username must be at least 8 characters.');
      return;
    }

    const emailErr = validateEmail(email.trim());
    if (emailErr) {
      setError(emailErr);
      return;
    }

    const passError = validatePassword(password);
    if (passError) {
      setError(passError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (fieldErrors.username || fieldErrors.email || fieldErrors.password || fieldErrors.confirmPassword) {
      setError('Please resolve all validation errors before signing up.');
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
    <div className="text-on-surface font-body-md h-screen w-full flex items-center justify-center p-container-margin relative overflow-hidden bg-transparent">
      {/* Back to Home Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-text-secondary hover:text-primary font-semibold text-sm transition-colors z-20"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Home
      </button>

      {/* Decorative background blur */}
      <div className="absolute -right-24 -top-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-bg-card border border-border-muted rounded w-full max-w-md shadow-lg p-card-padding text-left relative z-10 animate-fadeIn">
        <div className="mb-6 text-center">
          <h1 className="font-headline-lg text-headline-lg font-bold text-primary flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
            PREPINTAI
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
              onChange={handleUsernameChange}
              className={`w-full bg-bg-base border ${fieldErrors.username ? 'border-danger focus:border-danger focus:ring-danger' : 'border-border-muted focus:border-primary focus:ring-primary'} text-on-surface text-sm rounded-md py-2.5 px-3 focus:outline-none focus:ring-1 transition-all`}
              placeholder="Min 8 characters"
              required
            />
            {fieldErrors.username && <p className="text-danger text-xs mt-1.5">{fieldErrors.username}</p>}
          </div>

          <div>
            <label className="block font-label-md text-label-md text-text-secondary mb-2 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              className={`w-full bg-bg-base border ${fieldErrors.email ? 'border-danger focus:border-danger focus:ring-danger' : 'border-border-muted focus:border-primary focus:ring-primary'} text-on-surface text-sm rounded-md py-2.5 px-3 focus:outline-none focus:ring-1 transition-all`}
              placeholder="you@example.com"
              required
            />
            {fieldErrors.email && <p className="text-danger text-xs mt-1.5">{fieldErrors.email}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-label-md text-text-secondary mb-2 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                className={`w-full bg-bg-base border ${fieldErrors.password ? 'border-danger focus:border-danger focus:ring-danger' : 'border-border-muted focus:border-primary focus:ring-primary'} text-on-surface text-sm rounded-md py-2.5 px-3 focus:outline-none focus:ring-1 transition-all`}
                placeholder="Min 8 chars, 1 Uppercase, 1 Symbol"
                required
              />
              {fieldErrors.password && <p className="text-danger text-xs mt-1.5 leading-tight">{fieldErrors.password}</p>}
            </div>

            <div>
              <label className="block font-label-md text-label-md text-text-secondary mb-2 uppercase tracking-wider">Confirm</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={`w-full bg-bg-base border ${fieldErrors.confirmPassword ? 'border-danger focus:border-danger focus:ring-danger' : 'border-border-muted focus:border-primary focus:ring-primary'} text-on-surface text-sm rounded-md py-2.5 px-3 focus:outline-none focus:ring-1 transition-all`}
                placeholder="Retype password"
                required
              />
              {fieldErrors.confirmPassword && <p className="text-danger text-xs mt-1.5 leading-tight">{fieldErrors.confirmPassword}</p>}
            </div>
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
