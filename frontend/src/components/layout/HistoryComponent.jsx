// ─────────────────────────────────────────────────────────────────────────────
// components/layout/HistoryComponent.jsx
// (previously: inline JSX inside pages/Dashboard.jsx — the 'history' view)
//
// PURPOSE: Interview history table — rendered INSIDE Dashboard's main area.
// This is a COMPONENT, not a standalone page.
//
// Loaded by Dashboard when: currentView === 'history'
// Route that triggers it:   /history
//
// Props received from Dashboard:
//   history        → array of all interview sessions from the database
//   loading        → true while data is fetching (shows skeleton table)
//   onViewChange(path) → callback to navigate to another view
// ─────────────────────────────────────────────────────────────────────────────
import { SkeletonTable } from '../ui/Skeleton';

const HistoryComponent = ({ history, loading, onViewChange }) => {
  return (
    <div className="w-full max-w-[1100px] mx-auto space-y-container-margin text-left pb-16 pt-8 pr-6 md:pr-10">
      <div>
        <h2 className="font-headline-lg text-headline-lg font-bold text-text-primary">Interview History</h2>
        <p className="font-body-md text-body-md text-text-secondary">Browse through all your historical mock performance assessments.</p>
      </div>

      {loading ? (
        <div className="glass-card rounded-xl p-card-padding">
          <SkeletonTable />
        </div>
      ) : history.length === 0 ? (
        <div className="bg-bg-card border border-border-muted rounded-xl p-12 text-center max-w-lg mx-auto shadow-sm">
          <span className="material-symbols-outlined text-primary text-5xl mb-4">history</span>
          <h3 className="font-headline-md text-xl font-bold text-text-primary mb-2">No History Yet</h3>
          <p className="text-text-secondary text-sm mb-6 leading-relaxed">
            You haven't completed any mock interview sessions yet. Complete your first session to view your analytics and AI report logs here!
          </p>
          <button
            onClick={() => onViewChange('/standard-practice')}
            className="bg-primary text-on-primary font-bold py-2 px-5 rounded-md shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Start First Interview
          </button>
        </div>
      ) : (
        <div className="bg-bg-card border border-border-muted rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-muted bg-surface-container-low text-text-secondary font-label-md text-xs uppercase tracking-wider">
                  <th className="py-3 px-6 font-semibold">Topic / Stack</th>
                  <th className="py-3 px-6 font-semibold">Difficulty</th>
                  <th className="py-3 px-6 font-semibold">Overall Rating</th>
                  <th className="py-3 px-6 font-semibold">Completed Date</th>
                  <th className="py-3 px-6 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted font-body-sm text-sm">
                {history.map((session) => {
                  const date = new Date(session.createdAt);
                  const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                  return (
                    <tr key={session.id} className="hover:bg-surface-variant/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-text-primary">{session.topic}</td>
                      <td className="py-4 px-6 text-text-secondary">
                        <span className="bg-surface-container-high px-2.5 py-0.5 rounded border border-border-muted text-xs">
                          {session.experienceLevel}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`font-semibold inline-flex items-center gap-1 ${
                          session.overallScore >= 80 ? 'text-success' : session.overallScore >= 50 ? 'text-warning' : 'text-danger'
                        }`}>
                          <span className="material-symbols-outlined text-[14px]">grade</span>
                          {(session.overallScore / 10).toFixed(1)} / 10
                        </span>
                      </td>
                      <td className="py-4 px-6 text-text-secondary font-code-md text-xs">{dateStr}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => onViewChange('/report/' + session.id)}
                          className="bg-surface-variant text-text-primary border border-border-muted font-semibold py-1.5 px-3 rounded-md hover:bg-outline-variant active:scale-95 transition-all inline-flex items-center gap-1 cursor-pointer text-xs"
                        >
                          View Report
                          <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryComponent;
