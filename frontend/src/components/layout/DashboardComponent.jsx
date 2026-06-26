// ─────────────────────────────────────────────────────────────────────────────
// components/layout/DashboardComponent.jsx
// (previously: inline JSX inside pages/Dashboard.jsx — the 'analytics' view)
//
// PURPOSE: The home/analytics overview screen — rendered INSIDE Dashboard's main area.
// This is a COMPONENT, not a standalone page.
//
// Loaded by Dashboard when: currentView === 'analytics'
// Route that triggers it:   /dashboard
//
// Props received from Dashboard:
//   history          → array of all interview sessions from the database
//   loading          → true while data is fetching (shows skeleton placeholders)
//   error            → error string if fetch failed
//   hasRealHistory   → boolean: does the user have any completed interviews?
//   totalInterviews  → calculated total count
//   averageScore     → calculated average score (0-100)
//   improvementRate  → calculated improvement rate percentage
//   activeStreak     → calculated current daily streak
//   heatmapWeeks     → processed 52-week heatmap grid data
//   timelineItems    → last 5 sessions formatted for the timeline
//   onViewChange(path) → callback to navigate to another view
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { Skeleton, SkeletonCard, SkeletonTimeline } from '../ui/Skeleton';

// SVG performance trend chart (last 7 sessions)
const PerformanceChart = ({ history }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const chartData = history && history.length > 0 
    ? [...history]
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .slice(-7)
        .map(h => ({
          topic: h.topic,
          score: h.overallScore / 10,
          date: new Date(h.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        }))
    : [];

  if (chartData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-3xl text-text-secondary mb-2 block">show_chart</span>
          <p className="font-body-sm text-body-sm text-text-secondary">No performance data yet.</p>
          <p className="font-label-md text-label-md text-text-secondary mt-1">Complete your first interview to see your trend!</p>
        </div>
      </div>
    );
  }

  const padding = { top: 20, right: 30, bottom: 35, left: 40 };
  const chartW = 500;
  const chartH = 200;
  const graphW = chartW - padding.left - padding.right;
  const graphH = chartH - padding.top - padding.bottom;

  const points = chartData.map((d, idx) => {
    const x = padding.left + (chartData.length <= 1 ? graphW / 2 : (idx * (graphW / (chartData.length - 1))));
    const y = chartH - padding.bottom - ((d.score / 10) * graphH);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${chartH - padding.bottom} L ${points[0].x} ${chartH - padding.bottom} Z`
    : '';

  const yTicks = [0, 2, 4, 6, 8, 10];

  return (
    <div className="relative w-full h-full">
      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="var(--color-primary)" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Horizontal grid lines */}
        {yTicks.map(t => {
          const y = chartH - padding.bottom - ((t / 10) * graphH);
          return (
            <g key={t}>
              <line x1={padding.left} y1={y} x2={chartW - padding.right} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <text x={padding.left - 10} y={y + 3} fill="var(--color-text-secondary)" fontSize="9" textAnchor="end" fontFamily="var(--font-code)" className="opacity-75">{t}</text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {points.map((p, idx) => (
          <text key={idx} x={p.x} y={chartH - 12} fill="var(--color-text-secondary)" fontSize="9" textAnchor="middle" fontFamily="var(--font-code)" className="opacity-75">{p.date}</text>
        ))}

        {/* Area fill */}
        {areaPath && (<path d={areaPath} fill="url(#areaGradient)" />)}

        {/* Outer Grid Bounds */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={chartH - padding.bottom} stroke="rgba(255,255,255,0.12)" />
        <line x1={padding.left} y1={chartH - padding.bottom} x2={chartW - padding.right} y2={chartH - padding.bottom} stroke="rgba(255,255,255,0.12)" />

        {/* Glowing Chart Line */}
        {linePath && (<path d={linePath} fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />)}

        {/* Vertical hover guide line */}
        {hoveredIdx !== null && (
          <line x1={points[hoveredIdx].x} y1={padding.top} x2={points[hoveredIdx].x} y2={chartH - padding.bottom} stroke="rgba(172, 199, 255, 0.4)" strokeWidth="1" strokeDasharray="2 2" />
        )}

        {/* Data point nodes */}
        {points.map((p, idx) => (
          <circle key={idx} cx={p.x} cy={p.y} r={hoveredIdx === idx ? 6 : 4} fill={hoveredIdx === idx ? "var(--color-primary)" : "var(--color-bg-base)"} stroke="var(--color-primary)" strokeWidth={hoveredIdx === idx ? 3 : 2} className="transition-all duration-150" />
        ))}

        {/* Slice areas for clean hover triggers */}
        {points.map((p, idx) => {
          const sliceW = graphW / (chartData.length - 1 || 1);
          const x = p.x - sliceW / 2;
          return (
            <rect key={idx} x={x} y={padding.top} width={sliceW} height={graphH} fill="transparent" className="cursor-pointer" onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)} />
          );
        })}
      </svg>

      {/* Floating Glassmorphic Tooltip */}
      {hoveredIdx !== null && points[hoveredIdx] && (
        <div 
          className="absolute glass-card pointer-events-none p-3 rounded-lg text-left shadow-xl border border-border-muted/50 z-20 transition-all duration-100 ease-out"
          style={{ left: `${(points[hoveredIdx].x / chartW) * 100}%`, top: `${(points[hoveredIdx].y / chartH) * 100 - 8}%`, transform: 'translate(-50%, -100%)', minWidth: '150px' }}
        >
          <div className="font-code-md text-[9px] text-primary font-bold uppercase tracking-wider mb-0.5">{points[hoveredIdx].date}</div>
          <div className="font-body-sm text-xs font-bold text-text-primary truncate mb-1" style={{ maxWidth: '140px' }} title={points[hoveredIdx].topic}>{points[hoveredIdx].topic}</div>
          <div className="flex items-center gap-1 font-body-sm text-xs font-bold text-success">
            <span className="material-symbols-outlined text-[12px] leading-none">grade</span>
            Score: {points[hoveredIdx].score.toFixed(1)}/10
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main DashboardComponent ────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// All outer padding / max-width is handled by the Dashboard shell so this
// component stays layout-agnostic and renders identically whether it is at
// 600px wide or 1400px wide.
// ─────────────────────────────────────────────────────────────────────────────
const DashboardComponent = ({
  history,
  loading,
  error,
  hasRealHistory,
  totalInterviews,
  averageScore,
  improvementRate,
  activeStreak,
  heatmapWeeks,
  timelineItems,
  onViewChange
}) => {
  return (
    <div className="w-full max-w-[1100px] mx-auto space-y-container-margin text-left pb-16 pt-8 pr-6 md:pr-10">
      <div>
        <h2 className="font-headline-lg text-headline-lg font-bold text-text-primary">Dashboard</h2>
        <p className="font-body-md text-body-md text-text-secondary">Overview of your interview performance and consistency.</p>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger p-4 rounded text-xs flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-gutter">
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
          {/* Chart Skeleton */}
          <div className="glass-card rounded-xl p-card-padding h-64 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <Skeleton width="180px" height="20px" />
              <Skeleton width="80px" height="16px" />
            </div>
            <div className="flex-1 flex items-end gap-3 pt-6 pb-2">
              <div className="w-full h-32 animate-shimmer bg-surface-variant/20 rounded mt-4"></div>
            </div>
          </div>
          {/* Heatmap Skeleton */}
          <div className="glass-card rounded-xl p-card-padding h-40 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <Skeleton width="150px" height="20px" />
              <Skeleton width="120px" height="12px" />
            </div>
            <div className="w-full h-16 animate-shimmer bg-surface-variant/20 rounded mt-4"></div>
          </div>
          {/* Lower Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-container-margin">
            <div className="lg:col-span-2 glass-card rounded-xl p-card-padding">
              <Skeleton className="mb-6" width="150px" height="24px" />
              <SkeletonTimeline />
            </div>
            <div className="space-y-container-margin">
              <div className="glass-card rounded-xl p-card-padding h-40">
                <Skeleton className="mb-4" width="120px" height="20px" />
                <Skeleton className="mb-2" width="100%" height="40px" />
                <Skeleton width="60px" height="24px" />
              </div>
              <div className="glass-card rounded-xl p-card-padding h-32">
                <Skeleton className="mb-2" width="100px" height="18px" />
                <Skeleton className="mb-1" width="100%" height="14px" />
                <Skeleton width="80%" height="14px" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            <div className="glass-card glass-card-hover rounded-xl p-card-padding flex flex-col justify-between h-[116px] shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="font-label-md text-label-md text-text-secondary">Total Interviews</span>
                <span className="material-symbols-outlined text-text-secondary">forum</span>
              </div>
              <div className="flex items-end gap-3">
                <span className="font-display-lg text-display-lg font-bold text-text-primary">{totalInterviews}</span>
                <span className="font-body-sm text-body-sm text-success mb-1 flex items-center font-bold">
                  <span className="material-symbols-outlined text-sm leading-none mr-0.5">arrow_upward</span> 12%
                </span>
              </div>
            </div>

            <div className="glass-card glass-card-hover rounded-xl p-card-padding flex flex-col justify-between h-[116px] shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="font-label-md text-label-md text-text-secondary">Avg Score</span>
                <span className="material-symbols-outlined text-text-secondary">grade</span>
              </div>
              <div className="flex items-end gap-3">
                <span className="font-display-lg text-display-lg font-bold text-text-primary">{(averageScore / 10).toFixed(1)}</span>
                <span className="font-body-sm text-body-sm text-text-secondary mb-1">/ 10</span>
              </div>
              <div className="w-full bg-surface-container-highest h-1 mt-3 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${averageScore}%` }}></div>
              </div>
            </div>

            <div className="glass-card glass-card-hover rounded-xl p-card-padding flex flex-col justify-between h-[116px] shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="font-label-md text-label-md text-text-secondary">Improvement Rate</span>
                <span className="material-symbols-outlined text-text-secondary">trending_up</span>
              </div>
              <div className="flex items-end gap-3">
                <span className="font-display-lg text-display-lg font-bold text-text-primary">
                  {improvementRate >= 0 ? `+${improvementRate}%` : `${improvementRate}%`}
                </span>
                <span className="font-body-sm text-body-sm text-text-secondary mb-1">vs last month</span>
              </div>
            </div>

            <div className="glass-card glass-card-hover rounded-xl p-card-padding flex flex-col justify-between h-[116px] shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="font-label-md text-label-md text-text-secondary">Current Streak</span>
                <span className="material-symbols-outlined text-warning" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              </div>
              <div className="flex items-end gap-3">
                <span className="font-display-lg text-display-lg font-bold text-text-primary">{activeStreak}</span>
                <span className="font-body-sm text-body-sm text-text-secondary mb-1">{activeStreak === 1 ? 'day' : 'days'}</span>
              </div>
            </div>
          </div>

          {/* Performance Trend Chart */}
          <div className="glass-card rounded-xl p-card-padding shadow-sm relative">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-text-primary">Performance Trend</h3>
                <p className="font-body-sm text-xs text-text-secondary">Overall mock score trajectory over the last 7 sessions.</p>
              </div>
              {!hasRealHistory && (
                <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-code-md font-bold uppercase tracking-wider">Demo Mode</span>
              )}
            </div>
            <div className="h-64 relative w-full">
              <PerformanceChart history={history} />
            </div>
          </div>

          {/* Practice Consistency Heatmap Section */}
          <div className="glass-card rounded-xl p-card-padding shadow-sm">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h3 className="font-headline-md text-headline-md font-bold text-text-primary">Practice Consistency</h3>
              <div className="flex items-center gap-2 text-xs text-text-secondary font-body-sm">
                <span>Less</span>
                <div className="flex">
                  <div className="heatmap-cell heatmap-0 border border-border-muted"></div>
                  <div className="heatmap-cell heatmap-1"></div>
                  <div className="heatmap-cell heatmap-2"></div>
                  <div className="heatmap-cell heatmap-3"></div>
                  <div className="heatmap-cell heatmap-4"></div>
                </div>
                <span>More</span>
              </div>
            </div>

            <div className="overflow-x-auto pb-2 scrollbar-thin">
              <div className="flex gap-[2px] min-w-max">
                {heatmapWeeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-[2px]">
                    {week.map((day) => (
                      <div
                        key={day.date}
                        className={`heatmap-cell heatmap-${day.intensity} ${day.intensity === 0 ? 'border border-border-muted' : ''} transition-all hover:scale-130 hover:z-10 hover:shadow-lg duration-150`}
                        title={`${day.count} assessments on ${day.date}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between mt-2 font-code-md text-code-md text-text-secondary text-xs uppercase tracking-wider">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
              <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
          </div>

          {/* Timeline and AI Coach notes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-container-margin">
            <div className="lg:col-span-2 glass-card rounded-xl p-card-padding shadow-sm">
              <h3 className="font-headline-md text-headline-md font-bold text-text-primary mb-6">Recent Activity</h3>
              {timelineItems.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-3xl text-text-secondary mb-2 block">history</span>
                  <p className="font-body-sm text-body-sm text-text-secondary">No recent activity yet.</p>
                  <p className="font-label-md text-label-md text-text-secondary mt-1">Start a practice interview to build your timeline!</p>
                </div>
              ) : (
              <div className="relative border-l border-border-muted ml-3 space-y-6">
                {timelineItems.map((item) => (
                  <div key={item.id} className="relative pl-6">
                    <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-bg-card border-2 flex items-center justify-center ${item.isDemo ? 'border-border-muted' : 'border-primary'}`}>
                      {!item.isDemo && <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>}
                    </span>

                    <div className="flex justify-between items-start mb-1 flex-wrap gap-2">
                      <h4 className="font-body-md text-body-md font-bold text-text-primary">
                        {item.topic}
                        {item.isDemo && <span className="text-[9px] text-text-secondary bg-surface-container-highest px-1.5 py-0.5 rounded ml-1.5 uppercase font-code-md">Sample</span>}
                      </h4>
                      <span className="font-code-md text-code-md text-text-secondary text-xs">{item.time}</span>
                    </div>

                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="bg-surface-container-high text-on-surface text-xs px-2 py-0.5 rounded border border-border-muted">{item.experienceLevel}</span>
                      <span className={`flex items-center gap-1 text-sm font-bold ${Number(item.score) >= 8.0 ? 'text-success' : Number(item.score) >= 6.0 ? 'text-warning' : 'text-danger'}`}>
                        <span className="material-symbols-outlined text-xs">{Number(item.score) >= 8.0 ? 'check_circle' : 'info'}</span>
                        Score: {item.score}/10
                      </span>
                    </div>

                    <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed mb-2 max-w-xl">{item.summary}</p>

                    {!item.isDemo && (
                      <button
                        onClick={() => onViewChange('/report/' + item.id)}
                        className="text-xs text-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer mt-1"
                      >
                        View Full Report
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              )}
            </div>

            <div className="space-y-container-margin">
              <div className="glass-card glass-card-hover rounded-xl p-card-padding shadow-sm">
                <h3 className="font-headline-md text-headline-md font-bold text-text-primary mb-4">Recommended Next</h3>
                <div
                  onClick={() => onViewChange('/standard-practice')}
                  className="p-3 border border-border-muted/30 rounded bg-surface-container-low mb-3 hover:border-primary transition-colors cursor-pointer group flex flex-col justify-between min-h-[116px]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-body-sm text-body-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                      {hasRealHistory && history[0]?.topic?.toLowerCase()?.includes("java") ? "React Design Patterns" : "Graph Traversal"}
                    </h4>
                    <span className="material-symbols-outlined text-text-secondary text-sm group-hover:text-primary transition-colors">arrow_forward</span>
                  </div>
                  <p className="font-label-md text-label-md text-text-secondary mb-2 leading-snug">Based on weak performance in recent mock.</p>
                  <span className="text-xs bg-error_container text-on-error-container px-1.5 py-0.5 rounded font-bold uppercase tracking-wider self-start leading-none shrink-0">High Priority</span>
                </div>

                <button
                  onClick={() => onViewChange('/standard-practice')}
                  className="w-full text-center font-label-md text-label-md text-primary border border-primary py-1.5 rounded hover:bg-primary/10 transition-colors cursor-pointer font-bold"
                >
                  View All Topics
                </button>
              </div>

              <div className="glass-card rounded-xl p-card-padding relative overflow-hidden shadow-sm">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
                <h3 className="font-headline-md text-headline-md font-bold text-text-primary mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
                  AI Coach Note
                </h3>
                <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed italic">
                  "You're improving consistently on system design, but tend to rush through the initial requirements gathering phase. Try to spend 2-3 minutes clarifying constraints before diving into architecture."
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardComponent;
