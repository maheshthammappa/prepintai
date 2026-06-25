import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQuestions } from '../services/api';

const SetupPage = ({ onStartInterview, onCancel, isEmbedded = false }) => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('Java');
  const [customTopic, setCustomTopic] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');
  const [questionCount, setQuestionCount] = useState(5);
  const [duration, setDuration] = useState(10);
  const mode = 'text';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Clear stale session storage
    sessionStorage.removeItem('prepintai_active_session');

    const selectedTopic = topic === 'custom' ? customTopic : topic;
    if (!selectedTopic.trim()) {
      setError('Please provide a valid topic.');
      setLoading(false);
      return;
    }

    try {
      const response = await generateQuestions(selectedTopic, experienceLevel, questionCount);
      setLoading(false);
      if (onStartInterview) {
        onStartInterview({
          questions: response.questions,
          topic: selectedTopic,
          experienceLevel,
          duration,
          mode
        });
      } else {
        navigate('/interview', {
          state: {
            questions: response.questions,
            topic: selectedTopic,
            experienceLevel,
            duration,
            mode
          }
        });
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to generate interview questions. Please make sure the backend server is running and try again.');
    }
  };

  return (
    <div className={isEmbedded ? "w-full flex flex-col font-body relative overflow-hidden h-full" : "bg-bg-base text-text-primary h-screen w-full flex flex-col font-body relative overflow-hidden"}>
      {/* Background Grid Pattern */}
      {!isEmbedded && (
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #30363D 1px, transparent 1px), linear-gradient(to bottom, #30363D 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.1 }}></div>
      )}

      {/* Top Header */}
      {!isEmbedded && (
        <header className="h-16 border-b border-border-muted bg-surface-container-low shrink-0 relative z-20 flex items-center w-full">
          <div className="max-w-4xl w-full mx-auto px-4 md:px-6 flex justify-between items-center">
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
      )}

      {/* Main Content Area */}
      <main className={isEmbedded ? "flex-1 flex p-2 overflow-hidden relative w-full z-10" : "flex-1 flex p-4 md:p-6 overflow-y-auto relative w-full z-10"}>
        <div className="w-full max-w-4xl relative z-10 my-auto mx-auto">
          {loading ? (
            <div className="bg-bg-card border border-border-muted rounded-xl p-12 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center space-y-6">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <h2 className="font-headline-md text-2xl font-bold text-center text-primary">Generating Interview Questions</h2>
              <p className="text-text-secondary text-center text-sm max-w-md">Our AI is designing a customized set of {questionCount} questions for {topic === 'custom' ? customTopic : topic} ({experienceLevel}). This will take just a moment...</p>
            </div>
          ) : (
            <div className="bg-bg-card border border-border-muted rounded-xl p-6 md:p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
              <div className="mb-6 border-b border-border-muted pb-5">
                <h1 className="font-headline-lg text-3xl font-bold text-text-primary mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>neurology</span>
                  Configure Interview Session
                </h1>
                <p className="font-body-md text-text-secondary text-sm">Set up your AI-driven practice environment. Choose your stack, experience level, and questions count.</p>
              </div>

              {error && (
                <div className="bg-danger/10 border border-danger/30 text-danger p-4 rounded mb-6 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined">error</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Topic Selection Grid */}
                <div>
                  <label className="block font-label-md text-sm font-semibold text-on-surface mb-3">Select Topic / Technology</label>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    {[
                      { id: 'Java', label: 'Java', icon: 'terminal', iconColor: 'text-warning' },
                      { id: 'Spring Boot', label: 'Spring Boot', icon: 'layers', iconColor: 'text-success' },
                      { id: 'React JS', label: 'React JS', icon: 'react', iconColor: 'text-primary' },
                      { id: 'Deployment', label: 'Deployment', icon: 'rocket_launch', iconColor: 'text-tertiary-container' },
                      { id: 'OS Fundamentals', label: 'OS Fundamentals', icon: 'memory', iconColor: 'text-secondary' },
                      { id: 'custom', label: 'Custom', icon: 'edit_note', iconColor: 'text-text-secondary' }
                    ].map((item) => (
                      <label key={item.id} className="cursor-pointer relative">
                        <input
                          type="radio"
                          name="topic"
                          value={item.id}
                          checked={topic === item.id}
                          onChange={() => setTopic(item.id)}
                          className="peer sr-only"
                        />
                        <div className="p-3 border border-border-muted rounded hover:border-primary peer-checked:border-primary peer-checked:bg-surface-variant transition-colors flex flex-col items-center justify-center gap-2 text-center h-[92px]">
                          {item.icon === 'react' ? (
                            <svg
                              viewBox="-11.5 -10.23174 23 20.46348"
                              className={`w-[28px] h-[28px] ${item.iconColor}`}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.2"
                            >
                              <circle cx="0" cy="0" r="2.05" fill="currentColor" />
                              <g stroke="currentColor">
                                <ellipse rx="11" ry="4.2" />
                                <ellipse rx="11" ry="4.2" transform="rotate(60)" />
                                <ellipse rx="11" ry="4.2" transform="rotate(120)" />
                              </g>
                            </svg>
                          ) : (
                            <span className={`material-symbols-outlined ${item.iconColor}`} style={{ fontSize: '28px' }}>{item.icon}</span>
                          )}
                          <span className="font-label-md text-xs font-semibold">{item.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Custom Topic Input */}
                {topic === 'custom' && (
                  <div className="space-y-2 animate-fadeIn">
                    <label className="block font-label-md text-xs font-semibold text-on-surface">Custom Topic Name</label>
                    <input
                      type="text"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="e.g. Spring Boot Microservices, Node.js, HR Behavioural"
                      className="w-full bg-surface-variant border border-border-muted rounded py-2.5 px-4 font-body-md text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                )}

                {/* 2. Question Count & Est Duration Sliders (Side-by-Side) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between mb-3">
                      <label className="font-label-md text-sm font-semibold text-on-surface">Question Count</label>
                      <span className="font-code-md text-sm font-bold text-primary">{questionCount}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="w-full accent-primary bg-surface-variant rounded-full h-2 appearance-none outline-none cursor-pointer"
                    />
                    <div className="flex justify-between text-text-secondary font-label-md text-[10px] mt-1">
                      <span>1 question</span>
                      <span>15 questions</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-3">
                      <label className="font-label-md text-sm font-semibold text-on-surface">Est. Duration</label>
                      <span className="font-code-md text-sm font-bold text-primary">{duration} mins</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="20"
                      step="1"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full accent-primary bg-surface-variant rounded-full h-2 appearance-none outline-none cursor-pointer"
                    />
                    <div className="flex justify-between text-text-secondary font-label-md text-[10px] mt-1">
                      <span>5 mins</span>
                      <span>20 mins</span>
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
                          name="experienceLevel"
                          value={level}
                          checked={experienceLevel === level}
                          onChange={() => setExperienceLevel(level)}
                          className="peer sr-only"
                        />
                        <div className="text-center py-2 px-1 rounded font-body-sm text-xs text-on-surface-variant border border-transparent peer-checked:bg-bg-card peer-checked:text-primary peer-checked:border-primary/20 transition-colors font-semibold">
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
                    onClick={() => {
                      if (onCancel) onCancel();
                      else navigate('/');
                    }}
                    className="flex-1 py-2.5 border border-border-muted rounded text-text-primary font-semibold text-sm hover:bg-surface-variant transition-colors text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-primary-container text-on-primary-container rounded font-semibold text-sm hover:bg-primary transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    Start AI Interview
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SetupPage;
