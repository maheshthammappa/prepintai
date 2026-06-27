// ─────────────────────────────────────────────────────────────────────────────
// components/layout/ProfileComponent.jsx
// (previously: components/ProfileComponent.jsx)
//
// PURPOSE: User profile settings form — rendered INSIDE Dashboard's main area.
// This is a COMPONENT, not a standalone page.
//
// Loaded by Dashboard when: currentView === 'profile'
// Route that triggers it:   /profile
//
// Props received from Dashboard:
//   user → the authenticated user object from AuthContext (username, email)
//
// Note: The form uses `defaultValue` (uncontrolled inputs), meaning changes
// are not yet wired to the backend. "Save Changes" shows a confirmation alert.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { updateProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ProfileComponent = ({ user }) => {
  const { updateSession } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });
  
  const [displayUser, setDisplayUser] = useState({
    username: user?.username || 'Developer',
    email: user?.email || 'user@example.com',
    bio: user?.bio || ''
  });

  // Sync state if user prop changes (e.g., initial load)
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || ''
      });
      setDisplayUser({
        username: user.username || 'Developer',
        email: user.email || 'user@example.com',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const response = await updateProfile({
        username: formData.username,
        email: formData.email,
        bio: formData.bio
      });
      
      // Update local display immediately
      setDisplayUser({
        username: response.username,
        email: response.email,
        bio: response.bio
      });

      // Update global context with new token and user data
      updateSession(response.token, {
        username: response.username,
        email: response.email,
        bio: response.bio,
        createdAt: response.createdAt
      });

      setSuccessMsg(response.message || 'Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto space-y-container-margin text-left pb-16 pt-8 px-4 md:px-10 animate-fadeIn">
      <div>
        <h2 className="font-headline-lg text-headline-lg font-bold text-text-primary">Your Profile</h2>
        <p className="font-body-md text-body-md text-text-secondary">Manage your account settings and preferences.</p>
      </div>
      
      <div className="bg-bg-card border border-border-muted rounded-xl p-6 md:p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] mt-6">
        {/* ── Avatar + Name Header ── */}
        <div className="flex items-center gap-5 mb-6 border-b border-border-muted pb-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-3xl shrink-0 shadow-sm">
            {(displayUser.username)[0].toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-text-primary mb-1">{displayUser.username}</h3>
            <p className="text-sm text-text-secondary">{displayUser.email}</p>
          </div>
        </div>

        {/* ── Edit Form ── */}
        <form className="space-y-5" onSubmit={handleSave}>
          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger p-3 rounded text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}
          {successMsg && (
            <div className="bg-success/10 border border-success/30 text-success p-3 rounded text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              {successMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">Username</label>
              <input 
                type="text" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full bg-bg-base border border-border-muted text-on-surface text-sm rounded-md py-2.5 px-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-bg-base border border-border-muted text-on-surface text-sm rounded-md py-2.5 px-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">Bio / Experience</label>
            <textarea 
              rows="3"
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              placeholder="Briefly describe your background..."
              className="w-full bg-bg-base border border-border-muted text-on-surface text-sm rounded-md py-2.5 px-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
            ></textarea>
          </div>

          <div className="pt-3 flex justify-end">
            <button 
              type="submit"
              disabled={loading}
              className="bg-primary text-on-primary font-bold py-2.5 px-5 rounded-md shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileComponent;
