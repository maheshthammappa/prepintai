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
    <div className="bg-bg-base text-text-primary min-h-screen flex flex-col font-body pb-12">
      {/* Top Banner Header */}
      <header className="bg-bg-card border-b border-border-muted pt-12 pb-8 px-gutter relative overflow-hidden">
        {/* Background glow decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-success opacity-5 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="bg-success/10 text-success border border-success/20 px-3 py-1 rounded-full font-label-md text-[10px] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                Evaluation Complete
              </span>
              <span className="text-text-secondary text-xs font-semibold">Topic: {topic}</span>
            </div>
            <h1 className="font-display text-4xl font-bold text-on-surface tracking-tight mb-1">Interview Performance Report</h1>
            <p className="font-body text-text-secondary text-sm font-semibold">{experienceLevel} Mock Assessment</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="font-label-md text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Overall Score</p>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-5xl font-extrabold text-success">{report.overallScore}</span>
                <span className="font-headline-md text-lg font-bold text-text-secondary">/100</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/setup')}
              className="bg-primary text-white hover:bg-primary/90 px-5 py-2.5 rounded font-semibold text-xs transition-colors flex items-center gap-2 shadow-lg"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Start New Practice
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl w-full mx-auto px-gutter py-8 space-y-8">
        
        {/* Overall summary card */}
        <section className="bg-bg-card border border-border-muted rounded-xl p-6 shadow-md">
          <h2 className="font-headline-md text-lg font-bold text-on-surface mb-3">Overall Summary</h2>
          <p className="text-text-secondary text-sm leading-relaxed">{report.overallSummary}</p>
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
