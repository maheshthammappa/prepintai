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
import React from 'react';

const ProfileComponent = ({ user }) => {
  return (
    <div className="w-full max-w-[1100px] mx-auto space-y-container-margin text-left pb-16 pt-8 pr-6 md:pr-10 animate-fadeIn">
      <div>
        <h2 className="font-headline-lg text-headline-lg font-bold text-text-primary">Your Profile</h2>
        <p className="font-body-md text-body-md text-text-secondary">Manage your account settings and preferences.</p>
      </div>
      
      <div className="bg-bg-card border border-border-muted rounded-xl p-8 shadow-sm mt-6">
        {/* ── Avatar + Name Header ── */}
        <div className="flex items-center gap-6 mb-8 border-b border-border-muted pb-8">
          {/* Avatar: shows first letter of username as a colored circle */}
          <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-4xl shrink-0">
            {(user?.username || 'D')[0].toUpperCase()}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-text-primary mb-1">{user?.username || 'Developer'}</h3>
            <p className="text-text-secondary">{user?.email || 'user@example.com'}</p>
          </div>
        </div>

        {/* ── Edit Form ── */}
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Profile updated successfully!'); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">Username</label>
              <input 
                type="text" 
                defaultValue={user?.username || ''}
                className="w-full bg-surface-variant border border-border-muted rounded-lg px-4 py-2.5 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">Email</label>
              <input 
                type="email" 
                defaultValue={user?.email || ''}
                className="w-full bg-surface-variant border border-border-muted rounded-lg px-4 py-2.5 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Bio / Experience</label>
            <textarea 
              rows="4"
              placeholder="Briefly describe your background..."
              className="w-full bg-surface-variant border border-border-muted rounded-lg px-4 py-2.5 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit"
              className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-all cursor-pointer shadow-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileComponent;
