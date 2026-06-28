// ─────────────────────────────────────────────────────────────────────────────
// components/layout/ViewReportComponent.jsx
// (previously: pages/ReportPage.jsx)
//
// PURPOSE: Post-interview results and AI feedback — rendered INSIDE Dashboard's main area.
// This is a COMPONENT, not a standalone page.
//
// Loaded by Dashboard when: currentView === 'report'
//
// Two ways it gets data:
//   1. Fresh report (just finished): reportData passed as prop from Dashboard
//   2. History view (/report/:id): reportId passed as prop → fetches from API
//
// Props received from Dashboard:
//   reportId   → interview session ID to fetch from DB (for history view)
//   reportData → report object passed directly (for fresh reports)
//   onBack()   → callback to go back (usually to /history)
//   isEmbedded → true when inside Dashboard
//
// What it shows:
//   Overall score + circular progress, summary, radar chart,
//   skill dimension circles, strengths/weaknesses, per-question accordion
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getHistoryDetail } from '../../services/api';
import { Skeleton } from '../ui/Skeleton';

// SVG Radar chart rendered with 4 axes (Technical, Communication, Confidence, Problem Solving)
const RadarChart = ({ metrics }) => {
  const cx = 130;
  const cy = 110;
  const R = 65;

  const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
  const rings = [0.25, 0.5, 0.75, 1.0];

  const points = metrics.map((m, idx) => {
    const angle = angles[idx];
    const score = m.score;
    const x = cx + (score / 100) * R * Math.cos(angle);
    const y = cy + (score / 100) * R * Math.sin(angle);
    return { x, y, label: m.name, score };
  });

  const polygonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <svg viewBox="0 0 260 220" className="w-full h-full overflow-visible">
        {/* Concentric grid circles */}
        {rings.map((r, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={R * r}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines and labels */}
        {angles.map((angle, idx) => {
          const xMax = cx + R * Math.cos(angle);
          const yMax = cy + R * Math.sin(angle);
          
          let textAnchor = 'middle';
          let dy = '0.35em';
          let lx = cx + (R + 14) * Math.cos(angle);
          let ly = cy + (R + 14) * Math.sin(angle);

          if (idx === 0) {
            textAnchor = 'middle';
            ly = cy - R - 10;
            dy = '0';
          } else if (idx === 1) {
            textAnchor = 'start';
            lx = cx + R + 8;
          } else if (idx === 2) {
            textAnchor = 'middle';
            ly = cy + R + 10;
            dy = '0.8em';
          } else if (idx === 3) {
            textAnchor = 'end';
            lx = cx - R - 8;
          }

          return (
            <g key={idx}>
              <line
                x1={cx}
                y1={cy}
                x2={xMax}
                y2={yMax}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
              />
              <text
                x={lx}
                y={ly}
                textAnchor={textAnchor}
                dy={dy}
                fill="var(--color-text-secondary)"
                fontSize="9"
                fontWeight="600"
                fontFamily="var(--font-body)"
                className="opacity-90 uppercase tracking-wider"
              >
                {metrics[idx].name.split(' ')[0]}
              </text>
            </g>
          );
        })}

        {/* Data polygon */}
        {polygonPath && (
          <path
            d={polygonPath}
            fill="var(--color-primary)"
            fillOpacity="0.15"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="var(--color-primary)"
              stroke="var(--color-bg-base)"
              strokeWidth="1.5"
            />
            <text
              x={p.x}
              y={p.y - 8}
              textAnchor="middle"
              fill="var(--color-success)"
              fontSize="8"
              fontWeight="bold"
              fontFamily="var(--font-code)"
            >
              {p.score}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const ViewReportComponent = ({ reportId = null, reportData = null, onBack, isEmbedded = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const { report: stateReport = null, topic: stateTopic = '', experienceLevel: stateLevel = '' } = location.state || {};

  const [report, setReport] = useState(reportData || stateReport);
  const [topic, setTopic] = useState(stateTopic);
  const [experienceLevel, setExperienceLevel] = useState(stateLevel);

  const effectiveId = reportId || id;

  const [loading, setLoading] = useState(!reportData && !stateReport && !!effectiveId);
  const [error, setError] = useState('');
  const [openAccordions, setOpenAccordions] = useState({});

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!report) {
      if (effectiveId) {
        setLoading(true);
        getHistoryDetail(effectiveId)
          .then((data) => {
            setReport(data);
            setTopic(data.topic);
            setExperienceLevel(data.experienceLevel);
            setLoading(false);
          })
          .catch((err) => {
            console.error(err);
            setError('Failed to load historical report. Please check your backend connection.');
            setLoading(false);
          });
      } else {
        if (!isEmbedded) {
          navigate('/standard-practice');
        }
      }
    }
  }, [effectiveId, report, navigate, isEmbedded]);
  /* eslint-enable react-hooks/set-state-in-effect */
  if (loading) {
    return (
      <div className={isEmbedded ? "w-full flex flex-col font-body p-6 space-y-8" : "bg-bg-base text-text-primary min-h-screen flex flex-col font-body p-6 space-y-8"}>
        {/* Header Skeleton */}
        <div className="glass-card rounded-xl p-6 md:p-8 space-y-4">
          <Skeleton width="180px" height="24px" />
          <Skeleton width="40%" height="16px" />
          <Skeleton width="100%" height="60px" className="mt-4" />
        </div>
        
        {/* Core Dimensions Skeleton */}
        <div className="space-y-4">
          <Skeleton width="140px" height="20px" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card rounded-xl p-5 flex flex-col items-center justify-center h-36">
                <Skeleton width="60%" height="14px" className="mb-4" />
                <Skeleton width="60px" height="60px" variant="circle" />
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Weaknesses Split Card Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-xl p-6 space-y-4 h-48">
            <Skeleton width="100px" height="18px" />
            <Skeleton width="90%" height="12px" />
            <Skeleton width="80%" height="12px" />
            <Skeleton width="70%" height="12px" />
          </div>
          <div className="glass-card rounded-xl p-6 space-y-4 h-48">
            <Skeleton width="100px" height="18px" />
            <Skeleton width="90%" height="12px" />
            <Skeleton width="80%" height="12px" />
            <Skeleton width="70%" height="12px" />
          </div>
        </div>
      </div>
    );
  }
  if (error || !report) {
    return (
      <div className={isEmbedded ? "w-full flex flex-col justify-center items-center font-body p-6 min-h-[400px]" : "bg-bg-base text-text-primary min-h-screen flex flex-col justify-center items-center font-body p-6"}>
        <div className="bg-bg-card border border-border-muted p-8 rounded-xl max-w-md text-center shadow-lg">
          <span className="material-symbols-outlined text-danger text-5xl mb-4">error</span>
          <h2 className="text-xl font-bold mb-2">Report Load Error</h2>
          <p className="text-text-secondary text-sm mb-6">{error || 'No report found.'}</p>
          <button
            onClick={() => {
              if (onBack) onBack();
              else navigate('/');
            }}
            className="bg-primary text-on-primary font-bold py-2 px-5 rounded-md shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const toggleAccordion = (id) => {
    setOpenAccordions({
      ...openAccordions,
      [id]: !openAccordions[id]
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success border-success/20 bg-success/5';
    if (score >= 50) return 'text-warning border-warning/20 bg-warning/5';
    return 'text-danger border-danger/20 bg-danger/5';
  };

  const getScoreStrokeClass = (score) => {
    if (score >= 80) return 'stroke-success';
    if (score >= 50) return 'stroke-warning';
    return 'stroke-danger';
  };

  // Helper mock scores for sub-metrics (Accuracy, Communication, Confidence, Logic)
  // since Gemini provides a general score, we distribute or calculate minor variances for visual interest in the circles.
  const metrics = [
    { name: 'Technical Accuracy', score: report.overallScore },
    { name: 'Communication', score: Math.max(10, report.overallScore - 4) },
    { name: 'Confidence', score: Math.min(100, report.overallScore + 2) },
    { name: 'Problem Solving', score: Math.max(10, report.overallScore - 8) }
  ];

  return (
    <div className={isEmbedded ? "w-full flex flex-col font-body pb-12 relative" : "bg-bg-base text-text-primary min-h-screen flex flex-col font-body pb-12 relative"}>
      {/* Top Header (standalone mode only) */}
      {!isEmbedded && (
        <header className="h-16 border-b border-border-muted bg-surface-container-low shrink-0 relative z-20 flex items-center w-full">
          <div className="max-w-[1300px] w-full mx-auto px-4 md:px-6 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>neurology</span>
              </div>
              <span className="font-headline-md text-xl font-extrabold text-primary tracking-tight">PrepIntAI</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="bg-surface-variant text-text-primary border border-border-muted font-semibold py-2 px-4 rounded-md hover:bg-outline-variant active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">home</span>
                Home
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Background Grid Pattern (standalone mode only) */}
      {!isEmbedded && (
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #30363D 1px, transparent 1px), linear-gradient(to bottom, #30363D 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.1 }}></div>
      )}

      {/* Combined Evaluation Report & Summary Card */}
      <div className="w-full max-w-[1100px] mx-auto px-0 pt-6 pb-6 space-y-8 relative z-10">
        {isEmbedded && (
          <button
            onClick={() => {
              if (onBack) onBack();
            }}
            className="bg-surface-variant text-text-primary border border-border-muted font-semibold py-2 px-4 rounded-md hover:bg-outline-variant active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer self-start"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to History
          </button>
        )}
        <section className="glass-card rounded-xl p-6 md:p-8 shadow-md relative overflow-hidden animate-fadeIn">
          {/* Background glow decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-success opacity-5 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-border-muted relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2.5 flex-wrap">
                <span className="bg-success/10 text-success border border-success/20 px-3 py-1 rounded-full font-label-md text-[10px] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  Evaluation Complete
                </span>
                <span className="text-text-secondary text-xs font-semibold">Topic: {topic}</span>
              </div>
              <h1 className="font-display text-4xl font-bold text-on-surface tracking-tight mb-1">Interview Performance Report</h1>
              <p className="font-body text-text-secondary text-sm font-semibold">{experienceLevel} Mock Assessment</p>
            </div>
            
            {/* Stunning Glassmorphic Score Card */}
            <div className="flex items-center gap-4 bg-surface-variant/40 border border-border-muted px-5 py-3 rounded-xl backdrop-blur-md shadow-sm min-w-[200px]">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-border-muted"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`${getScoreStrokeClass(report.overallScore)} transition-all duration-1000 ease-out`}
                    strokeDasharray={`${report.overallScore}, 100`}
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs font-extrabold text-on-surface">{report.overallScore}%</span>
              </div>
              <div>
                <p className="font-label-md text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-0.5">Overall Score</p>
                <p className="text-[11px] text-text-secondary font-semibold">Assessment Rating</p>
              </div>
            </div>
          </div>

          <div className="pt-6 relative z-10">
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">Overall Summary</h2>
            <p className="text-text-secondary text-sm leading-relaxed">{report.overallSummary}</p>
          </div>
        </section>

        {/* Bento Grid: Sub-Metrics circular indicators & Radar Chart */}
        <section>
          <h2 className="font-headline-md text-lg font-bold text-on-surface mb-4">Core Dimensions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: Circles */}
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.map((m) => (
                <div key={m.name} className="glass-card glass-card-hover rounded-xl p-5 flex flex-col items-center justify-center relative overflow-hidden group shadow-sm">
                  <h3 className="font-label-md text-xs font-semibold text-text-secondary mb-4 text-center">{m.name}</h3>
                  
                  {/* SVG Circular Progress Bar */}
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-border-muted"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={`${getScoreStrokeClass(m.score)} transition-all duration-1000 ease-out`}
                        strokeDasharray={`${m.score}, 100`}
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-sm font-bold text-text-primary">{m.score}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Radar Chart */}
            <div className="lg:col-span-4 glass-card rounded-xl p-5 flex flex-col items-center justify-center shadow-sm">
              <h3 className="font-label-md text-xs font-semibold text-text-secondary mb-2 text-center uppercase tracking-wider">Skill Mapping</h3>
              <div className="w-full h-44 flex items-center justify-center">
                <RadarChart metrics={metrics} />
              </div>
            </div>
          </div>
        </section>

        {/* Strengths & Weaknesses Split Card */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="glass-card rounded-xl p-6 shadow-sm">
            <h3 className="font-label-md text-sm font-bold text-success uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>thumb_up</span>
              Key Strengths
            </h3>
            <ul className="space-y-2.5">
              {report.strengths?.map((str, idx) => (
                <li key={idx} className="text-xs text-text-secondary flex items-start gap-2 leading-relaxed">
                  <span className="text-success select-none mt-0.5">•</span>
                  {str}
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses & Improvements */}
          <div className="glass-card rounded-xl p-6 shadow-sm">
            <h3 className="font-label-md text-sm font-bold text-warning uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
              Suggested Improvements
            </h3>
            <ul className="space-y-2.5">
              {report.improvementSuggestions?.map((sug, idx) => (
                <li key={idx} className="text-xs text-text-secondary flex items-start gap-2 leading-relaxed">
                  <span className="text-warning select-none mt-0.5">•</span>
                  {sug}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Detailed Question breakdown Accordions */}
        <section className="space-y-3">
          <h2 className="font-headline-md text-lg font-bold text-on-surface mb-4">Question-by-Question Analysis</h2>
          
          {report.evaluations?.map((item) => {
            const isOpen = openAccordions[item.questionId];
            return (
              <div key={item.questionId} className="glass-card rounded-xl overflow-hidden border border-border-muted shadow-sm">
                <button
                  onClick={() => toggleAccordion(item.questionId)}
                  className="w-full px-6 py-4 flex items-start justify-between text-left focus:outline-none"
                >
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                      <span className="bg-surface-variant text-text-secondary px-2 py-0.5 rounded text-[10px] font-code font-bold uppercase">Q{item.questionId}</span>
                      <span className={`border px-2 py-0.5 rounded-full font-label-md text-[10px] font-bold ${getScoreColor(item.score)}`}>
                        Score: {item.score}%
                      </span>
                    </div>
                    <h4 className="font-headline-md text-sm font-bold leading-snug text-on-surface">{item.questionText}</h4>
                  </div>
                  <span className={`material-symbols-outlined text-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {/* Collapsible content */}
                {isOpen && (
                  <div className="border-t border-border-muted bg-surface-dim p-6 space-y-6">
                    {/* User answer */}
                    <div>
                      <h5 className="font-label-md text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
                        Your Response
                      </h5>
                      <div className="font-body text-xs text-on-surface-variant bg-bg-base p-4 rounded border border-border-muted leading-relaxed whitespace-pre-line">
                        {item.userAnswer}
                      </div>
                    </div>

                    {/* AI Feedback */}
                    <div>
                      <h5 className="font-label-md text-xs font-semibold text-warning uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">analytics</span>
                        AI Critique & Feedback
                      </h5>
                      <div className="font-body text-xs text-text-secondary leading-relaxed bg-surface-container p-4 rounded border border-border-muted whitespace-pre-line">
                        {item.feedback}
                      </div>
                    </div>

                    {/* Suggested Answer */}
                    <div>
                      <h5 className="font-label-md text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                        Suggested Model Answer
                      </h5>
                      <div className="font-code text-xs text-primary-fixed bg-bg-base p-4 rounded border border-border-muted overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {item.suggestedAnswer}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>

      </div>
    </div>
  );
};

export default ViewReportComponent;
