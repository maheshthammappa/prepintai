// ─────────────────────────────────────────────────────────────────────────────
// AuthContext.jsx — GLOBAL AUTHENTICATION STATE
//
// This file solves a common problem: many components need to know "is the user
// logged in?" and "who are they?". Instead of passing these as props down
// through every level, we use React Context — a global store any component
// can tap into via the useAuth() hook.
//
// What it provides to the rest of the app:
//   user    → the logged-in user object (username, email, etc.)
//   token   → the JWT token string
//   loading → true while we're verifying the token on page load
//   login(token, userData) → call this after a successful login API call
//   logout()               → call this to clear the session
// ─────────────────────────────────────────────────────────────────────────────
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe } from '../services/api';

// Create the context object. null is the default value (before Provider wraps the app).
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Read token from localStorage on first load (persists across browser refreshes)
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // useCallback prevents these functions from being re-created on every render,
  // which keeps the useEffect dependency array stable.
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback((newToken, userData) => {
    setToken(newToken);
    setUser(userData);
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (token) {
      // Save the token to localStorage so it survives a page refresh
      localStorage.setItem('token', token);
      let cancelled = false;
      // Verify the token is still valid by fetching the current user profile
      getMe()
        .then((userData) => {
          if (!cancelled) {
            setUser(userData);    // Token is valid — store the user object
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch user context from token:", err);
          if (!cancelled) {
            logout();             // Token expired/invalid — force logout
            setLoading(false);
          }
        });
      // Cleanup: if the component unmounts before the API call finishes,
      // ignore the result to prevent setting state on an unmounted component.
      return () => { cancelled = true; };
    } else {
      // No token → clear everything and stop the loading spinner
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token, logout]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    // Provide the auth values to all child components
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — instead of importing useContext + AuthContext everywhere,
// components just call useAuth() and get everything they need.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
