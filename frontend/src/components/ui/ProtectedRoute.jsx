// ─────────────────────────────────────────────────────────────────────────────
// components/ui/ProtectedRoute.jsx
// (previously: components/ProtectedRoute.jsx)
//
// This component wraps any page that requires the user to be logged in.
// In App.jsx you'll see it used like:
//   <ProtectedRoute><Dashboard /></ProtectedRoute>
//
// It checks the auth state from AuthContext and does one of three things:
//   1. Still loading (verifying token) → show a loading spinner
//   2. No token (not logged in)        → redirect to /login
//   3. Token exists (logged in)        → render the wrapped page normally
//
// This means Dashboard and all its embedded components are completely
// inaccessible without a valid JWT token.
// ─────────────────────────────────────────────────────────────────────────────
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  // Read current auth state from the global context
  const { token, loading } = useAuth();

  if (loading) {
    // While the token is being verified against the backend, show a spinner
    // so the user doesn't see a flash of the login page
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-text-secondary font-label-md text-label-md uppercase tracking-wider">Verifying Session...</p>
      </div>
    );
  }

  if (!token) {
    // No valid token → redirect to login. `replace` prevents the user
    // from hitting the browser back button to get back to the protected page.
    return <Navigate to="/login" replace />;
  }

  // User is authenticated — render the actual page
  return children;
};

export default ProtectedRoute;
