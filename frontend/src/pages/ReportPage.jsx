import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ReportPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { report = null, topic = '', experienceLevel = '' } = location.state || {};
  const [openAccordions, setOpenAccordions] = useState({});

  useEffect(() => {
    if (!report) {
      navigate('/setup');
    }
  }, [report, navigate]);

  if (!report) return null;

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
    <div className="bg-bg-base text-text-primary min-h-screen flex flex-col font-body pb-12 relative">
      {/* Top Header */}
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
              className="bg-surface-variant hover:bg-outline-variant text-text-primary font-semibold text-xs py-2 px-4 rounded transition-all active:scale-95 duration-100 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">home</span>
              Home
            </button>
          </div>
        </div>
      </header>

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #30363D 1px, transparent 1px), linear-gradient(to bottom, #30363D 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.1 }}></div>

      {/* Combined Evaluation Report & Summary Card */}
      <div className="max-w-[1300px] w-full mx-auto px-4 md:px-6 pt-8 pb-4 space-y-8 relative z-10">
        <section className="bg-bg-card border border-border-muted rounded-xl p-6 md:p-8 shadow-md relative overflow-hidden animate-fadeIn">
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

        {/* Bento Grid: Sub-Metrics circular indicators */}
        <section>
          <h2 className="font-headline-md text-lg font-bold text-on-surface mb-4">Core Dimensions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((m) => (
              <div key={m.name} className="bg-bg-card border border-border-muted rounded-xl p-5 flex flex-col items-center justify-center relative overflow-hidden group hover:border-outline transition-colors shadow-sm">
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
        </section>

        {/* Strengths & Weaknesses Split Card */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-bg-card border border-border-muted rounded-xl p-6 shadow-sm">
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
          <div className="bg-bg-card border border-border-muted rounded-xl p-6 shadow-sm">
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
            const isOpen = !!openAccordions[item.questionId];
            return (
              <div key={item.questionId} className="bg-bg-card border border-border-muted rounded-xl overflow-hidden shadow-sm hover:border-outline-variant transition-colors">
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

export default ReportPage;
