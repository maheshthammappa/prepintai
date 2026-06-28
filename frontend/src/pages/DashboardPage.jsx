// ─────────────────────────────────────────────────────────────────────────────
// pages/DashboardPage.jsx — THE APP SHELL & ROUTING ORCHESTRATOR
//
// PURPOSE:
//   This is the ONLY protected page that renders for ALL authenticated routes
//   (/dashboard, /interview, /history, /profile, etc.).
//   It acts as a persistent "Shell" (Sidebar + Top Navbar) that wraps the
//   actual content, preventing the sidebar from re-rendering when you click links.
//
// DATA FLOW & ARCHITECTURE:
//   1. Route Detection (useEffect):
//      The component constantly watches `location.pathname` (the browser URL).
//      When the URL changes (e.g. user goes to "/history"), the `useEffect`
//      updates the `currentView` state variable to "history".
//
//   2. The "Switch" statement (Conditional Rendering):
//      Down in the `<main>` area, React looks at the `currentView` state.
//      If it equals "history", it mounts `<HistoryComponent />`. 
//      If it equals "profile", it mounts `<ProfileComponent />`.
//      
//   3. Safe Navigation Interceptor:
//      `handleViewChange(newPath)` is used for all sidebar clicks. It checks
//      if the user is currently taking an interview (`currentView === 'standard-interview'`).
//      If they are, it pops up a warning before letting them navigate away.
//
//   4. Global States managed here:
//      This file fetches the user's `history` from the backend once on mount,
//      and passes that data down as props to the inner components that need it.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { getHistory, generateQuestionsFromResume } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ── Components loaded into the main content area ──────────────────────────
import DashboardComponent from '../components/layout/DashboardComponent';
import StandardInterviewComponent from '../components/layout/StandardInterviewComponent';
import ResumeInterviewComponent from '../components/layout/ResumeInterviewComponent';
import InterviewComponent from '../components/layout/InterviewComponent';
import ViewReportComponent from '../components/layout/ViewReportComponent';
import HistoryComponent from '../components/layout/HistoryComponent';
import ProfileComponent from '../components/layout/ProfileComponent';
import QuickQAComponent from '../components/layout/QuickQAComponent';

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const { user, logout } = useAuth();

  // Active subpage data
  const [activeInterviewData, setActiveInterviewData] = useState(null);
  const [activeReportId, setActiveReportId] = useState(id || null);
  const [activeReportData, setActiveReportData] = useState(null);

  // Navigation shell views
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
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/qa')) return 'quick-qa';
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
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Resume Upload State Variables
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
    } else if (path.includes('/profile')) {
      setCurrentView('profile');
    } else if (path.includes('/qa')) {
      setCurrentView('quick-qa');
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
  // Dynamic Metric Calculations
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
    <div className="text-on-surface font-body-md h-screen w-full flex flex-col overflow-hidden relative bg-transparent">
      
      {/* Heatmap cell CSS — used by DashboardComponent */}
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

      {/* ── FIXED TopNavBar Header ────────────────────────────────────────── */}
      <header className="bg-background border-b border-border-muted h-16 flex justify-between items-center px-gutter fixed top-0 left-0 right-0 z-30 w-full shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
          <span 
            className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-1.5 cursor-pointer" 
            onClick={() => handleViewChange('/dashboard')}
          >
            PREPINTAI
          </span>
        </div>

        {/* Global Search (decorative mockup) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">search</span>
          <input
            className="w-full bg-bg-base border border-border-muted text-on-surface text-sm rounded-md py-1.5 pl-9 pr-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            placeholder="Search questions, topics..."
            type="text"
            disabled
          />
        </div>

        <div className="flex items-center gap-4 relative">
          <button 
            onClick={() => navigate('/')}
            className="h-10 w-10 rounded-md border border-border-muted hover:border-primary bg-surface-container-high flex items-center justify-center font-bold text-sm text-text-secondary hover:text-primary transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer" 
            title="Go Home"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
          </button>

          <button 
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="h-10 w-10 rounded-md border border-border-muted hover:border-primary overflow-hidden flex-shrink-0 cursor-pointer bg-surface-container-high flex items-center justify-center font-bold text-sm text-primary transition-all shadow-sm hover:shadow active:scale-95" 
            title="Profile Menu"
          >
            {user?.username ? user.username.charAt(0).toUpperCase() : 'M'}
          </button>

          {/* Profile Dropdown */}
          {isProfileDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileDropdownOpen(false)}
              ></div>
              <div className="absolute top-12 right-0 w-48 bg-bg-card border border-border-muted rounded-md shadow-lg z-50 overflow-hidden py-1 animate-fadeIn">
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    handleViewChange('/profile');
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-surface-variant transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* ── Body: Sidebar + Main Content ──────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden pt-16 pb-16 md:pb-0 relative w-full">
        
        {/* FIXED Left Collapsible Sidebar */}
        <nav 
          className={`bg-surface-container-low flex flex-col py-4 z-40 transition-all duration-300 fixed left-0 top-16 bottom-0 ${
            isSidebarOpen ? 'w-80 lg:w-96 translate-x-0 border-r border-border-muted' : 'w-0 -translate-x-full overflow-hidden border-none'
          }`}
        >
          <div className="px-5 mb-6 mt-2">
            <p className="text-sm font-medium text-text-secondary mt-2">WELCOME</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-primary mb-2 mt-1 truncate" title={user?.username.toUpperCase() || 'Developer'}>
              {user?.username.toUpperCase() || 'Developer'}
            </p>
            <p className="text-sm font-medium text-text-secondary mt-2">
              Ready to mock practice?
            </p>
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
              onClick={() => { handleViewChange('/dashboard'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
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
              onClick={() => { handleViewChange('/profile'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
              className={
                currentView === 'profile'
                  ? "bg-secondary-container text-on-secondary-container border-l-4 border-primary px-3 py-2 flex items-center gap-3 rounded-r-sm font-label-md text-label-md text-left w-full cursor-pointer font-bold"
                  : "text-on-surface-variant hover:bg-surface-variant px-3 py-2 flex items-center gap-3 rounded-sm transition-all duration-200 border-l-4 border-transparent hover:border-border-muted font-label-md text-label-md text-left w-full cursor-pointer"
              }
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
              Profile
            </button>

            <button
              onClick={() => { handleViewChange('/standard-practice'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
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
              onClick={() => { handleViewChange('/resume-practice'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
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
              onClick={() => { handleViewChange('/history'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
              className={
                currentView === 'history' || currentView === 'report'
                  ? "bg-secondary-container text-on-secondary-container border-l-4 border-primary px-3 py-2 flex items-center gap-3 rounded-r-sm font-label-md text-label-md text-left w-full cursor-pointer font-bold"
                  : "text-on-surface-variant hover:bg-surface-variant px-3 py-2 flex items-center gap-3 rounded-sm transition-all duration-200 border-l-4 border-transparent hover:border-border-muted font-label-md text-label-md text-left w-full cursor-pointer"
              }
            >
              <span className="material-symbols-outlined text-[18px]">history</span>
              History
            </button>

            <button
              onClick={() => { handleViewChange('/qa'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
              className={
                currentView === 'quick-qa'
                  ? "bg-secondary-container text-on-secondary-container border-l-4 border-primary px-3 py-2 flex items-center gap-3 rounded-r-sm font-label-md text-label-md text-left w-full cursor-pointer font-bold"
                  : "text-on-surface-variant hover:bg-surface-variant px-3 py-2 flex items-center gap-3 rounded-sm transition-all duration-200 border-l-4 border-transparent hover:border-border-muted font-label-md text-label-md text-left w-full cursor-pointer"
              }
            >
              <span className="material-symbols-outlined text-[18px]">forum</span>
              Quick Q&A
            </button>
          </div>


        </nav>

        {/* Floating Sidebar Toggle Handle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`fixed top-20 z-40 p-1 rounded-r-md border border-l-0 border-border-muted bg-surface-container-low text-text-secondary hover:text-on-surface hover:bg-surface-variant transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center ${isSidebarOpen ? 'left-80 lg:left-96' : 'left-0'}`}
          style={{ height: '64px', width: '24px' }}
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          <span className="material-symbols-outlined text-[20px] select-none">
            {isSidebarOpen ? 'chevron_left' : 'chevron_right'}
          </span>
        </button>

        {/* ── MAIN CONTENT AREA ─────────────────────────────────────────────
            All content views load here. The sidebar offset (pl-80/pl-96) pushes
            content to the right. A shared inner wrapper adds consistent horizontal
            padding so NO view starts flush against the sidebar edge. */}
        <main 
          className={`flex-1 flex flex-col min-h-0 relative z-10 transition-all duration-300 ${
            ['analytics', 'history', 'report', 'profile', 'standard-setup', 'resume-setup'].includes(currentView) 
              ? 'overflow-y-auto' 
              : ['standard-interview', 'resume-interview'].includes(currentView)
                ? 'overflow-y-auto md:overflow-hidden'
                : 'overflow-hidden'
          } ${
            isSidebarOpen ? 'md:pl-80 lg:pl-96' : 'md:pl-0'
          }`}
        >
          {/* ── Shared content gutter: all views share this padding ── */}
          <div className="flex-1 flex flex-col w-full min-h-0 px-4 md:px-8">

            {/* ── View 1: Dashboard Home (analytics overview) ── */}
            {currentView === 'analytics' && (
              <DashboardComponent
                history={history}
                loading={loading}
                error={error}
                hasRealHistory={hasRealHistory}
                totalInterviews={totalInterviews}
                averageScore={averageScore}
                improvementRate={improvementRate}
                activeStreak={activeStreak}
                heatmapWeeks={heatmapWeeks}
                timelineItems={timelineItems}
                onViewChange={handleViewChange}
              />
            )}

            {/* ── View 2: Standard Interview Setup ── */}
            {currentView === 'standard-setup' && (
              <StandardInterviewComponent
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
            )}

            {/* ── View 3: Standard Interview in Progress ── */}
            {currentView === 'standard-interview' && activeInterviewData && (
              <InterviewComponent
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
            )}

            {/* ── View 4: Resume Interview Setup ── */}
            {currentView === 'resume-setup' && (
              <ResumeInterviewComponent
                resumeFile={resumeFile}
                resumeText={resumeText}
                resumeExperienceLevel={resumeExperienceLevel}
                resumeQuestionCount={resumeQuestionCount}
                resumeLoading={resumeLoading}
                resumeError={resumeError}
                fileInputRef={fileInputRef}
                onFileChange={handleFileChange}
                onTextChange={(e) => {
                  setResumeText(e.target.value);
                  if (e.target.value.trim()) setResumeFile(null);
                }}
                onExperienceLevelChange={setResumeExperienceLevel}
                onQuestionCountChange={setResumeQuestionCount}
                onSubmit={handleStartResumeInterview}
                onCancel={() => handleViewChange('/dashboard')}
              />
            )}

            {/* ── View 5: Resume Interview in Progress ── */}
            {currentView === 'resume-interview' && activeInterviewData && (
              <InterviewComponent
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
            )}

            {/* ── View 6: Interview History Table ── */}
            {currentView === 'history' && (
              <HistoryComponent
                history={history}
                loading={loading}
                onViewChange={handleViewChange}
              />
            )}

            {/* ── View 7: View Report (from history or fresh) ── */}
            {currentView === 'report' && (
              <ViewReportComponent
                isEmbedded={true}
                reportId={activeReportId}
                reportData={activeReportData}
                onBack={() => handleViewChange('/history')}
              />
            )}

            {/* ── View 8: Profile Settings ── */}
            {currentView === 'profile' && (
              <ProfileComponent user={user} />
            )}

            {/* ── View 9: Quick Q&A ── */}
            {currentView === 'quick-qa' && (
              <QuickQAComponent />
            )}
          </div>
        </main>
      </div>

      {/* ── Start Interview Modal ─────────────────────────────────────────── */}
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
              className="w-full bg-surface-variant text-text-primary border border-border-muted font-semibold py-2 px-5 rounded-md hover:bg-outline-variant active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* FIXED Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-surface-container-highest border-t border-border-muted shadow-lg flex justify-around items-center h-16">
        <button
          onClick={() => handleViewChange('/dashboard')}
          className={`flex flex-col items-center justify-center flex-1 h-full scale-90 duration-75 cursor-pointer font-bold border-t-2 transition-all ${
            currentView === 'analytics' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined">home</span>
          <span className="font-label-md text-label-md mt-1">Home</span>
        </button>

        <button
          onClick={() => handleViewChange('/standard-practice')}
          className={`flex flex-col items-center justify-center flex-1 h-full scale-90 duration-75 cursor-pointer font-bold border-t-2 transition-all ${
            currentView === 'standard-setup' || currentView === 'standard-interview' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined">code</span>
          <span className="font-label-md text-label-md mt-1">Practice</span>
        </button>

        <button
          onClick={() => handleViewChange('/history')}
          className={`flex flex-col items-center justify-center flex-1 h-full scale-90 duration-75 cursor-pointer font-bold border-t-2 transition-all ${
            currentView === 'history' || currentView === 'report' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'
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
          className="flex flex-col items-center justify-center flex-1 h-full text-on-surface-variant active:bg-surface-variant scale-90 duration-75 border-t-2 border-transparent cursor-pointer font-semibold"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-label-md text-label-md mt-1">Logout</span>
        </button>
      </nav>

    </div>
  );
};

export default DashboardPage;
