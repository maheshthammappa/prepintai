import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { getHistory, generateQuestionsFromResume } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Import subcomponents within the same pages directory
import SetupPage from './SetupPage';
import InterviewPage from './InterviewPage';
import ReportPage from './ReportPage';
import { Skeleton, SkeletonCard, SkeletonTimeline, SkeletonTable } from '../components/Skeleton';

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
              <line 
                x1={padding.left} 
                y1={y} 
                x2={chartW - padding.right} 
                y2={y} 
                stroke="rgba(255,255,255,0.06)" 
                strokeDasharray="4 4" 
              />
              <text 
                x={padding.left - 10} 
                y={y + 3} 
                fill="var(--color-text-secondary)" 
                fontSize="9" 
                textAnchor="end" 
                fontFamily="var(--font-code)"
                className="opacity-75"
              >
                {t}
              </text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {points.map((p, idx) => (
          <text 
            key={idx} 
            x={p.x} 
            y={chartH - 12} 
            fill="var(--color-text-secondary)" 
            fontSize="9" 
            textAnchor="middle" 
            fontFamily="var(--font-code)"
            className="opacity-75"
          >
            {p.date}
          </text>
        ))}

        {/* Area fill */}
        {areaPath && (
          <path d={areaPath} fill="url(#areaGradient)" />
        )}

        {/* Outer Grid Bounds */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={chartH - padding.bottom} stroke="rgba(255,255,255,0.12)" />
        <line x1={padding.left} y1={chartH - padding.bottom} x2={chartW - padding.right} y2={chartH - padding.bottom} stroke="rgba(255,255,255,0.12)" />

        {/* Glowing Chart Line */}
        {linePath && (
          <path 
            d={linePath} 
            fill="none" 
            stroke="var(--color-primary)" 
            strokeWidth="3" 
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />
        )}

        {/* Vertical hover guide line */}
        {hoveredIdx !== null && (
          <line 
            x1={points[hoveredIdx].x} 
            y1={padding.top} 
            x2={points[hoveredIdx].x} 
            y2={chartH - padding.bottom} 
            stroke="rgba(172, 199, 255, 0.4)" 
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        )}

        {/* Data point nodes */}
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r={hoveredIdx === idx ? 6 : 4}
            fill={hoveredIdx === idx ? "var(--color-primary)" : "var(--color-bg-base)"}
            stroke="var(--color-primary)"
            strokeWidth={hoveredIdx === idx ? 3 : 2}
            className="transition-all duration-150"
          />
        ))}

        {/* Slice areas for clean hover triggers */}
        {points.map((p, idx) => {
          const sliceW = graphW / (chartData.length - 1 || 1);
          const x = p.x - sliceW / 2;
          return (
            <rect
              key={idx}
              x={x}
              y={padding.top}
              width={sliceW}
              height={graphH}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          );
        })}
      </svg>

      {/* Floating Glassmorphic Tooltip */}
      {hoveredIdx !== null && points[hoveredIdx] && (
        <div 
          className="absolute glass-card pointer-events-none p-3 rounded-lg text-left shadow-xl border border-border-muted/50 z-20 transition-all duration-100 ease-out"
          style={{
            left: `${(points[hoveredIdx].x / chartW) * 100}%`,
            top: `${(points[hoveredIdx].y / chartH) * 100 - 8}%`,
            transform: 'translate(-50%, -100%)',
            minWidth: '150px'
          }}
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

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const { user, logout } = useAuth();

  // Active subpage data
  const [activeInterviewData, setActiveInterviewData] = useState(null);
  const [activeReportId, setActiveReportId] = useState(id || null);
  const [activeReportData, setActiveReportData] = useState(null);

  // Navigation shell views: 'analytics', 'standard-setup', 'standard-interview', 'resume-setup', 'resume-interview', 'history', 'report'
  const getInitialView = () => {
    const path = location.pathname;
    if (path.includes('/standard-practice')) return 'standard-setup';
    if (path.includes('/resume-practice')) return 'resume-setup';
    if (path.includes('/history')) return 'history';
    if (path.includes('/interview')) {
      const saved = sessionStorage.getItem('prepintai_active_session');
      if (saved) return 'standard-interview';
      return 'standard-setup';
    }
    if (path.includes('/report') && id) return 'report';
    return 'analytics';
  };

  const [currentView, setCurrentView] = useState(getInitialView);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Database Sessions States
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Start Session Selection Dialog
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);

  // Resume Upload State Variables (moved inside shell)
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [resumeExperienceLevel, setResumeExperienceLevel] = useState('Intermediate');
  const [resumeQuestionCount, setResumeQuestionCount] = useState(5);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState('');

  const refreshHistory = () => {
    setLoading(true);
    getHistory()
      .then((data) => {
        setHistory(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch history:', err);
        setError('Could not connect to the backend server. Please verify it is running.');
        setLoading(false);
      });
  };

  // Fetch Session History on Mount
  useEffect(() => {
    const fetchData = async () => {
      await refreshHistory();
    };
    fetchData();
  }, []);

  // Sync currentView with URL changes
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/standard-practice')) {
      setCurrentView('standard-setup');
    } else if (path.includes('/resume-practice')) {
      setCurrentView('resume-setup');
    } else if (path.includes('/history')) {
      setCurrentView('history');
    } else if (path.includes('/interview')) {
      const saved = sessionStorage.getItem('prepintai_active_session');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setActiveInterviewData(parsed);
          setCurrentView(parsed.topic?.toLowerCase()?.includes('resume') ? 'resume-interview' : 'standard-interview');
        } catch { /* ignore parse error */ }
      } else {
        setCurrentView('standard-setup');
      }
    } else if (path.includes('/report') && id) {
      setActiveReportId(id);
      setCurrentView('report');
    } else if (path.includes('/dashboard')) {
      setCurrentView('analytics');
    }
  }, [location.pathname, id]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Safe navigation interceptor to warn users in active interviews
  const handleViewChange = (newPath) => {
    if (currentView === 'standard-interview' || currentView === 'resume-interview') {
      if (!window.confirm("You are in an active interview session. Leaving now will discard your progress. Are you sure?")) {
        return;
      }
      sessionStorage.removeItem('prepintai_active_session');
    }
    // Clean states when transitioning
    if (!newPath.includes('/report')) {
      setActiveReportId(null);
      setActiveReportData(null);
    }
    if (!newPath.includes('/interview')) {
      setActiveInterviewData(null);
    }
    navigate(newPath);
  };

  // ----------------------------------------------------
  // Dynamic Metric Calculations (with fallback to mockup values)
  // ----------------------------------------------------
  const hasRealHistory = history.length > 0;
  const totalInterviews = hasRealHistory ? history.length : 0;
  const averageScore = hasRealHistory
    ? Math.round(history.reduce((sum, s) => sum + s.overallScore, 0) / history.length)
    : 0;

  const calculateImprovement = (sessions) => {
    if (!sessions || sessions.length < 2) return 0;
    const sorted = [...sessions].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const mid = Math.floor(sorted.length / 2);
    const firstHalfAvg = sorted.slice(0, mid).reduce((sum, s) => sum + s.overallScore, 0) / mid;
    const secondHalfAvg = sorted.slice(mid).reduce((sum, s) => sum + s.overallScore, 0) / (sorted.length - mid);
    return Math.round(secondHalfAvg - firstHalfAvg);
  };
  const improvementRate = hasRealHistory ? calculateImprovement(history) : 0;

  const calculateStreak = (sessions) => {
    if (!sessions || sessions.length === 0) return 0;
    const dates = [...new Set(sessions.map(s => s.createdAt.split('T')[0]))]
      .map(d => new Date(d))
      .sort((a, b) => b - a);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newestDate = dates[0];
    if (!newestDate) return 0;

    const diffDays = Math.ceil(Math.abs(today - newestDate) / (1000 * 60 * 60 * 24));
    if (diffDays > 1) return 0;

    let currentExpected = newestDate;
    let streak = 1;

    for (let i = 1; i < dates.length; i++) {
      const prevDate = dates[i];
      const diff = (currentExpected - prevDate) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
        currentExpected = prevDate;
      } else if (diff > 1) {
        break;
      }
    }
    return streak;
  };
  const activeStreak = hasRealHistory ? calculateStreak(history) : 0;

  // Deterministic pseudo-random for demo heatmap (seeded by day index)
  const seededRandom = (seed) => {
    const x = Math.sin(seed * 9301 + 49297) * 49297;
    return x - Math.floor(x);
  };

  const heatmapWeeks = useMemo(() => {
    const counts = {};
    history.forEach(s => {
      const dateStr = s.createdAt.split('T')[0];
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    });

    const cells = [];
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);

    for (let i = 0; i <= 364; i++) {
      const current = new Date(startDate);
      current.setDate(startDate.getDate() + i);
      const dateStr = current.toISOString().split('T')[0];
      let count = counts[dateStr] || 0;

      // New users get empty heatmap — no fake data

      cells.push({
        date: dateStr,
        count,
        intensity: count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count === 3 ? 3 : 4
      });
    }

    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  }, [history, hasRealHistory]);

  const getTimelineItems = () => {
    if (hasRealHistory) {
      return history.slice(0, 5).map(session => {
        const date = new Date(session.createdAt);
        const hoursAgo = Math.floor((new Date() - date) / (1000 * 60 * 60));
        const timeString = hoursAgo === 0 ? 'Just now'
          : hoursAgo < 24 ? `${hoursAgo} ${hoursAgo === 1 ? 'hour' : 'hours'} ago`
          : hoursAgo < 48 ? 'Yesterday'
          : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

        return {
          id: session.id,
          topic: session.topic,
          experienceLevel: session.experienceLevel,
          score: (session.overallScore / 10).toFixed(1),
          summary: session.overallSummary,
          time: timeString,
          isDemo: false
        };
      });
    } else {
      return [];
    }
  };
  const timelineItems = getTimelineItems();

  // Resume handlers
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
      setResumeError('');
    }
  };

  const handleStartResumeInterview = async (e) => {
    e.preventDefault();
    if (!resumeFile && !resumeText.trim()) {
      setResumeError('Please upload a resume file or paste your resume text.');
      return;
    }

    setResumeLoading(true);
    setResumeError('');

    const formData = new FormData();
    if (resumeFile) {
      formData.append('file', resumeFile);
    }
    if (resumeText.trim()) {
      formData.append('resumeText', resumeText);
    }
    formData.append('experienceLevel', resumeExperienceLevel);
    formData.append('questionCount', resumeQuestionCount);

    try {
      const response = await generateQuestionsFromResume(formData);
      setResumeLoading(false);
      
      setResumeFile(null);
      setResumeText('');

      let topicName = response.topic || 'Resume-Based Custom Assessment';
      if (!topicName.toLowerCase().includes('resume')) {
        topicName = `${topicName} (Resume-Based)`;
      }

      const sessionData = {
        questions: response.questions,
        topic: topicName,
        experienceLevel: resumeExperienceLevel,
        duration: resumeQuestionCount * 2,
        answers: {},
        currentIndex: 0,
        timeLeft: resumeQuestionCount * 2 * 60
      };

      sessionStorage.setItem('prepintai_active_session', JSON.stringify(sessionData));
      setActiveInterviewData(sessionData);
      navigate('/interview');
    } catch (err) {
      console.error(err);
      setResumeError(err.response?.data?.message || 'Failed to generate interview questions. Verify backend server is active.');
      setResumeLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md h-screen w-full flex flex-col overflow-hidden relative">
      
      <style>{`
        .heatmap-cell {
            width: 10px;
            height: 10px;
            border-radius: 2px;
            margin: 2px;
        }
        .heatmap-0 { background-color: #161b22; }
        .heatmap-1 { background-color: #0e4429; }
        .heatmap-2 { background-color: #006d32; }
        .heatmap-3 { background-color: #26a641; }
        .heatmap-4 { background-color: #39d353; }
      `}</style>

      {/* FIXED TopNavBar Header */}
      <header className="bg-background border-b border-border-muted h-16 flex justify-between items-center px-gutter fixed top-0 left-0 right-0 z-30 w-full shrink-0">
        <div className="flex items-center gap-3">
          <span 
            className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-1.5 cursor-pointer" 
            onClick={() => handleViewChange('/dashboard')}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
            PrepIntAI
          </span>
        </div>

        {/* Global Search (decorative mockup) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">search</span>
          <input
            className="w-full bg-bg-card border border-border-muted text-on-surface font-body-sm text-body-sm rounded-md py-1.5 pl-9 pr-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
            placeholder="Search questions, topics..."
            type="text"
            disabled
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="text-text-secondary hover:text-on-surface transition-colors p-1 relative">
            <span className="material-symbols-outlined">notifications</span>
            {hasRealHistory && <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>}
          </button>
          <div className="h-8 w-8 rounded-full border border-border-muted overflow-hidden flex-shrink-0 cursor-pointer bg-primary/10 flex items-center justify-center font-bold text-xs text-primary" title={user?.email || ''}>
            {user?.username ? user.username.charAt(0).toUpperCase() : 'M'}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden pt-16 relative w-full">
        
        {/* FIXED Left Collapsible Sidebar */}
        <nav 
          className={`bg-surface-container-low border-r border-border-muted flex flex-col py-4 z-40 transition-all duration-300 fixed left-0 top-16 bottom-0 ${
            isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full overflow-hidden'
          }`}
        >
          <div className="px-gutter mb-6">
            <h2 className="font-headline-md text-sm font-bold text-primary flex items-center gap-2">
              Welcome, {user?.username || 'Developer'}
            </h2>
            <p className="font-label-md text-xs text-text-secondary mt-1">Ready to mock practice?</p>
          </div>

          <div className="px-4 mb-4">
            <button
              onClick={() => setIsStartModalOpen(true)}
              className="w-full bg-primary-container text-on-primary-container font-label-md text-label-md py-2.5 rounded flex justify-center items-center gap-2 hover:bg-surface-variant transition-colors border border-border-muted cursor-pointer font-bold shadow"
            >
              <span className="material-symbols-outlined text-sm">play_arrow</span>
              Start Interview
            </button>
          </div>

          <div className="flex flex-col flex-grow px-2 gap-1 overflow-y-auto">
            <button
              onClick={() => handleViewChange('/dashboard')}
              className={
                currentView === 'analytics'
                  ? "bg-secondary-container text-on-secondary-container border-l-4 border-primary px-3 py-2 flex items-center gap-3 rounded-r-sm font-label-md text-label-md text-left w-full cursor-pointer font-bold"
                  : "text-on-surface-variant hover:bg-surface-variant px-3 py-2 flex items-center gap-3 rounded-sm transition-all duration-200 border-l-4 border-transparent hover:border-border-muted font-label-md text-label-md text-left w-full cursor-pointer"
              }
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
              Dashboard
            </button>

            <button
              onClick={() => handleViewChange('/standard-practice')}
              className={
                currentView === 'standard-setup' || currentView === 'standard-interview'
                  ? "bg-secondary-container text-on-secondary-container border-l-4 border-primary px-3 py-2 flex items-center gap-3 rounded-r-sm font-label-md text-label-md text-left w-full cursor-pointer font-bold"
                  : "text-on-surface-variant hover:bg-surface-variant px-3 py-2 flex items-center gap-3 rounded-sm transition-all duration-200 border-l-4 border-transparent hover:border-border-muted font-label-md text-label-md text-left w-full cursor-pointer"
              }
            >
              <span className="material-symbols-outlined text-[18px]">terminal</span>
              Standard Interview
            </button>

            <button
              onClick={() => handleViewChange('/resume-practice')}
              className={
                currentView === 'resume-setup' || currentView === 'resume-interview'
                  ? "bg-secondary-container text-on-secondary-container border-l-4 border-primary px-3 py-2 flex items-center gap-3 rounded-r-sm font-label-md text-label-md text-left w-full cursor-pointer font-bold"
                  : "text-on-surface-variant hover:bg-surface-variant px-3 py-2 flex items-center gap-3 rounded-sm transition-all duration-200 border-l-4 border-transparent hover:border-border-muted font-label-md text-label-md text-left w-full cursor-pointer"
              }
            >
              <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
              Resume Interview
            </button>

            <button
              onClick={() => handleViewChange('/history')}
              className={
                currentView === 'history' || currentView === 'report'
                  ? "bg-secondary-container text-on-secondary-container border-l-4 border-primary px-3 py-2 flex items-center gap-3 rounded-r-sm font-label-md text-label-md text-left w-full cursor-pointer font-bold"
                  : "text-on-surface-variant hover:bg-surface-variant px-3 py-2 flex items-center gap-3 rounded-sm transition-all duration-200 border-l-4 border-transparent hover:border-border-muted font-label-md text-label-md text-left w-full cursor-pointer"
              }
            >
              <span className="material-symbols-outlined text-[18px]">history</span>
              History
            </button>
          </div>

          <div className="mt-auto px-2 flex flex-col gap-1 border-t border-border-muted pt-4">
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="text-danger hover:bg-danger/10 px-3 py-2.5 flex items-center gap-3 rounded-sm transition-all duration-200 font-label-md text-label-md text-left w-full cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Sign Out
            </button>
          </div>
        </nav>

        {/* Floating Sidebar Toggle Handle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`fixed top-20 z-40 p-1 rounded-r-md border border-l-0 border-border-muted bg-surface-container-low text-text-secondary hover:text-on-surface hover:bg-surface-variant transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center`}
          style={{ 
            left: isSidebarOpen ? '288px' : '0px',
            height: '64px',
            width: '24px'
          }}
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          <span className="material-symbols-outlined text-[20px] select-none">
            {isSidebarOpen ? 'chevron_left' : 'chevron_right'}
          </span>
        </button>

        {/* Dynamic Main Content Container */}
        <main 
          className={`flex-1 flex flex-col min-h-0 relative z-10 transition-all duration-300 ${
            ['analytics', 'history', 'report'].includes(currentView) ? 'overflow-y-auto' : 'overflow-hidden'
          } ${
            isSidebarOpen ? 'md:pl-72' : 'md:pl-0'
          }`}
        >
          <div className="flex-1 flex flex-col w-full">
            
            {/* View 1: Analytics / Overview */}
            {currentView === 'analytics' && (
              <div className="p-container-margin max-w-[1200px] w-full mx-auto space-y-container-margin text-left pb-16">
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
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
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
                                  className={`heatmap-cell heatmap-${day.intensity} ${
                                    day.intensity === 0 ? 'border border-border-muted' : ''
                                  } transition-all hover:scale-130 hover:z-10 hover:shadow-lg duration-150`}
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
                              <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-bg-card border-2 flex items-center justify-center ${
                                item.isDemo ? 'border-border-muted' : 'border-primary'
                              }`}>
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
                                <span className="bg-surface-container-high text-on-surface text-xs px-2 py-0.5 rounded border border-border-muted">
                                  {item.experienceLevel}
                                </span>
                                <span className={`flex items-center gap-1 text-sm font-bold ${
                                  Number(item.score) >= 8.0 ? 'text-success' : Number(item.score) >= 6.0 ? 'text-warning' : 'text-danger'
                                }`}>
                                  <span className="material-symbols-outlined text-xs">
                                    {Number(item.score) >= 8.0 ? 'check_circle' : 'info'}
                                  </span>
                                  Score: {item.score}/10
                                </span>
                              </div>

                              <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed mb-2 max-w-xl">
                                {item.summary}
                              </p>

                              {!item.isDemo && (
                                <button
                                  onClick={() => handleViewChange('/report/' + item.id)}
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
                            onClick={() => handleViewChange('/standard-practice')}
                            className="p-3 border border-border-muted/30 rounded bg-surface-container-low mb-3 hover:border-primary transition-colors cursor-pointer group flex flex-col justify-between min-h-[116px]"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-body-sm text-body-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                                {hasRealHistory && history[0]?.topic?.toLowerCase()?.includes("java") ? "React Design Patterns" : "Graph Traversal"}
                              </h4>
                              <span className="material-symbols-outlined text-text-secondary text-sm group-hover:text-primary transition-colors">arrow_forward</span>
                            </div>
                            <p className="font-label-md text-label-md text-text-secondary mb-2 leading-snug">Based on weak performance in recent mock.</p>
                            <span className="text-xs bg-error_container text-on-error-container px-1.5 py-0.5 rounded font-bold uppercase tracking-wider self-start leading-none shrink-0">
                              High Priority
                            </span>
                          </div>

                          <button
                            onClick={() => handleViewChange('/standard-practice')}
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
            )}

            {/* View 2: Standard Setup */}
            {currentView === 'standard-setup' && (
              <div className="flex-grow flex items-center justify-center p-4 md:p-6 overflow-hidden w-full h-full">
                <div className="max-w-4xl w-full max-h-full overflow-hidden">
                <SetupPage
                  isEmbedded={true}
                  onStartInterview={(interviewData) => {
                    const sessionData = {
                      questions: interviewData.questions,
                      topic: interviewData.topic,
                      experienceLevel: interviewData.experienceLevel,
                      duration: interviewData.duration,
                      answers: {},
                      currentIndex: 0,
                      timeLeft: interviewData.duration * 60
                    };
                    sessionStorage.setItem('prepintai_active_session', JSON.stringify(sessionData));
                    setActiveInterviewData(sessionData);
                    navigate('/interview');
                  }}
                  onCancel={() => handleViewChange('/dashboard')}
                />
                </div>
              </div>
            )}

            {/* View 3: Standard Interview in Progress */}
            {currentView === 'standard-interview' && activeInterviewData && (
              <div className="flex-1 flex flex-col min-h-0 w-full">
                <InterviewPage
                  isEmbedded={true}
                  questions={activeInterviewData.questions}
                  topic={activeInterviewData.topic}
                  experienceLevel={activeInterviewData.experienceLevel}
                  duration={activeInterviewData.duration}
                  onFinishInterview={(report) => {
                    refreshHistory();
                    setActiveReportData(report);
                    navigate('/report/' + report.id);
                  }}
                  onExit={() => handleViewChange('/dashboard')}
                />
              </div>
            )}

            {/* View 4: Resume Setup */}
            {currentView === 'resume-setup' && (
              <div className="flex-grow flex items-center justify-center p-4 md:p-6 overflow-hidden w-full h-full">
                <div className="max-w-4xl w-full max-h-full overflow-hidden">
                  <div className="bg-bg-card border border-border-muted rounded-xl p-6 md:p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    <div className="mb-6 border-b border-border-muted pb-5">
                      <h1 className="font-headline-lg text-3xl font-bold text-text-primary mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-success text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>
                        Configure Resume Interview Session
                      </h1>
                      <p className="font-body-md text-text-secondary text-sm">
                        Set up your AI-driven practice environment. Upload or paste your resume, choose your experience level, and questions count.
                      </p>
                    </div>

                    {resumeError && (
                      <div className="bg-danger/10 border border-danger/30 text-danger p-4 rounded mb-6 text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined">error</span>
                        {resumeError}
                      </div>
                    )}

                    {resumeLoading ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-6">
                        <div className="w-16 h-16 border-4 border-success border-t-transparent rounded-full animate-spin"></div>
                        <h3 className="font-headline-md text-xl font-bold text-success">Analyzing Resume & Generating Questions</h3>
                        <p className="text-text-secondary text-center text-sm max-w-sm">
                          Gemini is reviewing your projects, work experiences, and tech skills to tailor custom mock questions. This will take a moment...
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleStartResumeInterview} className="space-y-6">
                        
                        {/* 1. Resume Source Options (Side-by-Side) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex flex-col">
                            <label className="block font-label-md text-sm font-semibold text-on-surface mb-2">Option 1: Upload Resume File (PDF / TXT)</label>
                            <div
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                  setResumeFile(e.dataTransfer.files[0]);
                                  setResumeError('');
                                }
                              }}
                              onClick={() => fileInputRef.current?.click()}
                              className="flex-grow border border-dashed border-border-muted hover:border-success bg-background/30 rounded-lg p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 group h-[120px] min-h-[120px]"
                            >
                              <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".pdf,.txt"
                                className="hidden"
                              />
                              <span className="material-symbols-outlined text-2xl text-text-secondary group-hover:text-success transition-colors">cloud_upload</span>
                              {resumeFile ? (
                                <div className="w-full px-2">
                                  <p className="font-body-sm text-body-sm font-bold text-success truncate max-w-full text-center">{resumeFile.name}</p>
                                  <p className="font-code-md text-code-md text-text-secondary">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                                </div>
                              ) : (
                                <div>
                                  <p className="font-body-sm text-body-sm font-bold text-on-surface text-center">Drag & drop resume or click to browse</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col">
                            <label className="block font-label-md text-sm font-semibold text-on-surface mb-2">Option 2: Paste Resume Text</label>
                            <textarea
                              value={resumeText}
                              onChange={(e) => {
                                setResumeText(e.target.value);
                                if (e.target.value.trim()) setResumeFile(null);
                              }}
                              placeholder="Paste your professional experience, skills, and projects here..."
                              className="w-full flex-grow bg-surface-variant border border-border-muted rounded-lg py-2.5 px-4 font-body-sm text-body-sm text-on-surface h-[120px] min-h-[120px] focus:outline-none focus:border-success focus:ring-1 focus:ring-success placeholder-text-secondary/35 resize-none outline-none"
                            />
                          </div>
                        </div>

                        {/* 2. Question Count & Est Duration Sliders (Side-by-Side) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <div className="flex justify-between mb-3">
                              <label className="font-label-md text-sm font-semibold text-on-surface">Question Count</label>
                              <span className="font-code-md text-sm font-bold text-success">{resumeQuestionCount}</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="15"
                              value={resumeQuestionCount}
                              onChange={(e) => setResumeQuestionCount(Number(e.target.value))}
                              className="w-full accent-success bg-surface-variant rounded-full h-2 appearance-none cursor-pointer outline-none"
                            />
                            <div className="flex justify-between text-text-secondary font-label-md text-[10px] mt-1">
                              <span>1 question</span>
                              <span>15 questions</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-3">
                              <label className="font-label-md text-sm font-semibold text-on-surface">Est. Duration</label>
                              <span className="font-code-md text-sm font-bold text-success">{resumeQuestionCount * 2} mins</span>
                            </div>
                            <input
                              type="range"
                              min="5"
                              max="30"
                              value={resumeQuestionCount * 2}
                              disabled
                              className="w-full accent-success bg-surface-variant rounded-full h-2 appearance-none outline-none opacity-50"
                            />
                            <div className="flex justify-between text-text-secondary font-label-md text-[10px] mt-1">
                              <span>5 mins</span>
                              <span>30 mins</span>
                            </div>
                          </div>
                        </div>

                        {/* 3. Experience Level Selector */}
                        <div>
                          <label className="block font-label-md text-sm font-semibold text-on-surface mb-3">Target Experience Level</label>
                          <div className="flex gap-2 p-1 bg-surface-variant rounded border border-border-muted">
                            {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level) => (
                              <label key={level} className="flex-1 cursor-pointer">
                                <input
                                  type="radio"
                                  name="resumeExperienceLevel"
                                  value={level}
                                  checked={resumeExperienceLevel === level}
                                  onChange={() => setResumeExperienceLevel(level)}
                                  className="peer sr-only"
                                />
                                <div className="text-center py-2 px-1 rounded font-body-sm text-xs text-on-surface-variant border border-transparent peer-checked:bg-bg-card peer-checked:text-success peer-checked:border-success/20 transition-colors font-semibold">
                                  {level}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-6 flex gap-4 border-t border-border-muted w-full">
                          <button
                            type="button"
                            onClick={() => handleViewChange('/dashboard')}
                            className="flex-1 py-2.5 border border-border-muted rounded text-text-primary font-semibold text-sm hover:bg-surface-variant transition-colors text-center"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-2.5 bg-success text-white rounded font-semibold text-sm hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                          >
                            Start AI Interview
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* View 5: Resume Interview in Progress */}
            {currentView === 'resume-interview' && activeInterviewData && (
              <div className="flex-1 flex flex-col min-h-0 w-full">
                <InterviewPage
                  isEmbedded={true}
                  questions={activeInterviewData.questions}
                  topic={activeInterviewData.topic}
                  experienceLevel={activeInterviewData.experienceLevel}
                  duration={activeInterviewData.duration}
                  onFinishInterview={(report) => {
                    refreshHistory();
                    setActiveReportData(report);
                    navigate('/report/' + report.id);
                  }}
                  onExit={() => handleViewChange('/dashboard')}
                />
              </div>
            )}

            {/* View 6: History list of past interviews */}
            {currentView === 'history' && (
              <div className="p-container-margin max-w-[1200px] w-full mx-auto space-y-container-margin text-left pb-16">
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
                      onClick={() => handleViewChange('/standard-practice')}
                      className="bg-primary text-white font-bold py-2 px-6 rounded text-xs hover:bg-opacity-90 transition-all cursor-pointer border border-border-muted"
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
                                    onClick={() => handleViewChange('/report/' + session.id)}
                                    className="text-primary hover:underline font-bold text-xs inline-flex items-center gap-0.5 cursor-pointer border border-primary/20 hover:border-primary/50 py-1 px-3 rounded hover:bg-primary/5 transition-all"
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
            )}

            {/* View 7: Historical Report */}
            {currentView === 'report' && (
              <div className="flex-1 w-full overflow-y-auto animate-fadeIn">
                <ReportPage
                  isEmbedded={true}
                  reportId={activeReportId}
                  reportData={activeReportData}
                  onBack={() => handleViewChange('/history')}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {isStartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-bg-card border border-border-muted rounded-xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col p-6 text-left">
            <h3 className="font-headline-md text-headline-md font-bold text-text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">play_arrow</span>
              Choose Practice Mode
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsStartModalOpen(false);
                  handleViewChange('/standard-practice');
                }}
                className="w-full bg-surface-container-low hover:bg-surface-variant border border-border-muted hover:border-primary p-4 rounded-lg flex items-start gap-3 transition-colors text-left cursor-pointer group"
              >
                <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5">terminal</span>
                <div>
                  <h4 className="font-body-sm text-body-sm font-bold text-text-primary group-hover:text-primary transition-colors">Standard Stack Interview</h4>
                  <p className="font-label-md text-label-md text-text-secondary mt-1 leading-normal">Choose Java, Spring, React, or custom topics, question counts, and experience level difficulty.</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsStartModalOpen(false);
                  handleViewChange('/resume-practice');
                }}
                className="w-full bg-surface-container-low hover:bg-surface-variant border border-border-muted hover:border-success p-4 rounded-lg flex items-start gap-3 transition-colors text-left cursor-pointer group"
              >
                <span className="material-symbols-outlined text-success text-xl shrink-0 mt-0.5">cloud_upload</span>
                <div>
                  <h4 className="font-body-sm text-body-sm font-bold text-text-primary group-hover:text-success transition-colors">Resume-Based Assessment</h4>
                  <p className="font-label-md text-label-md text-text-secondary mt-1 leading-normal">Upload PDF/TXT or paste in your resume details. We will extract skills and tailor custom AI questions.</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setIsStartModalOpen(false)}
              className="mt-5 w-full py-2 bg-surface-variant hover:bg-surface-container-highest text-on-surface rounded-lg font-label-md text-label-md transition-colors cursor-pointer border border-border-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* FIXED Mobile Bottom Navigation Bar (switches view states) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-xl bg-surface-container-highest border-t border-border-muted shadow-lg flex justify-around items-center h-16 px-4">
        <button
          onClick={() => handleViewChange('/dashboard')}
          className={`flex flex-col items-center justify-center rounded-xl py-1 px-3 scale-90 duration-75 cursor-pointer font-bold ${
            currentView === 'analytics' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined">home</span>
          <span className="font-label-md text-label-md mt-1">Home</span>
        </button>

        <button
          onClick={() => handleViewChange('/standard-practice')}
          className={`flex flex-col items-center justify-center rounded-xl py-1 px-3 scale-90 duration-75 cursor-pointer font-bold ${
            currentView === 'standard-setup' || currentView === 'standard-interview' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined">code</span>
          <span className="font-label-md text-label-md mt-1">Practice</span>
        </button>

        <button
          onClick={() => handleViewChange('/history')}
          className={`flex flex-col items-center justify-center rounded-xl py-1 px-3 scale-90 duration-75 cursor-pointer font-bold ${
            currentView === 'history' || currentView === 'report' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined">bar_chart</span>
          <span className="font-label-md text-label-md mt-1">History</span>
        </button>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="flex flex-col items-center justify-center text-on-surface-variant active:bg-surface-variant scale-90 duration-75 p-2 rounded cursor-pointer font-semibold"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-label-md text-label-md mt-1">Logout</span>
        </button>
      </nav>

    </div>
  );
};

export default Dashboard;
