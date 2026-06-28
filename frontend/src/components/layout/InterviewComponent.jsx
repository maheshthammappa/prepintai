// ─────────────────────────────────────────────────────────────────────────────
// components/layout/InterviewComponent.jsx
// (previously: pages/InterviewPage.jsx)
//
// PURPOSE: The live interview screen — rendered INSIDE Dashboard's main area.
// This is a COMPONENT, not a standalone page. It has no URL of its own.
//
// Loaded by Dashboard when: currentView === 'standard-interview' or 'resume-interview'
//
// Props received from Dashboard:
//   questions        → array of question objects from Gemini AI
//   topic            → the selected topic (e.g. 'Java')
//   experienceLevel  → the selected level (e.g. 'Intermediate')
//   duration         → time limit in minutes
//   onFinishInterview(report) → callback when user submits + evaluation is done
//   onExit()         → callback when user exits mid-session
//   isEmbedded       → true when inside Dashboard
//
// Flow:
//   Shows questions + timer → user types/speaks answers
//   → handleSubmitInterview → evaluateInterview() API
//   → onFinishInterview(report) → Dashboard switches to ViewReportComponent
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { evaluateInterview } from '../../services/api';

const InterviewComponent = ({ 
  questions: propQuestions, 
  topic: propTopic, 
  experienceLevel: propLevel, 
  duration: propDuration,
  onFinishInterview,
  onExit,
  isEmbedded = false
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve state parameters from location
  const { questions: routeQuestions = [], topic: routeTopic = '', experienceLevel: routeLevel = '', duration = 15 } = location.state || {};

  // Check if we have a saved session in progress
  const getSavedSession = () => {
    try {
      const saved = sessionStorage.getItem('prepintai_active_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.questions && parsed.questions.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load saved session", e);
    }
    return null;
  };

  const savedSession = getSavedSession();

  const questions = savedSession ? savedSession.questions : (propQuestions || routeQuestions);
  const topic = savedSession ? savedSession.topic : (propTopic || routeTopic);
  const experienceLevel = savedSession ? savedSession.experienceLevel : (propLevel || routeLevel);

  const [currentIndex, setCurrentIndex] = useState(() => {
    return savedSession ? savedSession.currentIndex : 0;
  });
  const [answers, setAnswers] = useState(() => {
    return savedSession ? savedSession.answers : {};
  });
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(() => {
    return savedSession ? savedSession.timeLeft : (propDuration || duration) * 60;
  });

  const recognitionRef = useRef(null);

  // Redirect to setup if accessed directly without state
  useEffect(() => {
    if (questions.length === 0 && !isEmbedded) {
      navigate('/standard-practice');
    }
  }, [questions, navigate, isEmbedded]);

  // Save state to sessionStorage on any changes
  useEffect(() => {
    if (questions.length > 0 && !loading) {
      const sessionData = {
        topic,
        experienceLevel,
        questions,
        answers,
        currentIndex,
        timeLeft
      };
      sessionStorage.setItem('prepintai_active_session', JSON.stringify(sessionData));
    }
  }, [answers, currentIndex, timeLeft, questions, topic, experienceLevel, loading]);

  const activeQuestion = questions[currentIndex] || {};

  // Track word count of active answer
  const activeAnswer = answers[activeQuestion.id] || '';
  const trimmedText = activeAnswer.trim();
  const wordCount = trimmedText ? trimmedText.split(/\s+/).length : 0;

  const handleAnswerChange = (e) => {
    setAnswers({
      ...answers,
      [activeQuestion.id]: e.target.value
    });
  };

  // Web Speech API Integration
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setAnswers((prev) => {
          const currentText = prev[activeQuestion.id] || '';
          return {
            ...prev,
            [activeQuestion.id]: currentText ? `${currentText} ${transcript}` : transcript
          };
        });
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error: ', e);
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, [activeQuestion.id]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by your current browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkip = () => {
    setAnswers({
      ...answers,
      [activeQuestion.id]: '(Skipped / Left Blank)'
    });
    handleNext();
  };

  const handleSubmitInterview = useCallback(async () => {
    setLoading(true);
    setError('');
    
    // Clear active session upon submission
    sessionStorage.removeItem('prepintai_active_session');

    // Format payload
    const formattedAnswers = questions.map((q) => ({
      questionId: q.id,
      questionText: q.questionText,
      userAnswer: answers[q.id] || '(Skipped / Left Blank)'
    }));

    try {
      const report = await evaluateInterview(topic, experienceLevel, formattedAnswers);
      setLoading(false);
      if (onFinishInterview) {
        onFinishInterview(report, topic, experienceLevel);
      } else {
        navigate('/report', { state: { report, topic, experienceLevel } });
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to submit interview for AI evaluation. Please verify your backend server connection and try again.');
    }
  }, [questions, answers, topic, experienceLevel, onFinishInterview, navigate]);

  // Helper to format remaining seconds into MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Live Countdown Timer Interval
  useEffect(() => {
    if (loading) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading]);

  // Auto-submit when time runs out
  const hasAutoSubmitted = useRef(false);
  useEffect(() => {
    if (timeLeft === 0 && !loading && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      handleSubmitInterview();
    }
  }, [timeLeft, loading, handleSubmitInterview]);

  if (questions.length === 0) return null;

  return (
    <div className={isEmbedded ? "w-full flex flex-col font-body relative md:h-full min-h-full" : "bg-bg-base text-text-primary min-h-screen md:h-screen w-full flex flex-col font-body relative overflow-y-auto md:overflow-hidden"}>
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[80vh] relative z-10">
          {!isEmbedded && (
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #30363D 1px, transparent 1px), linear-gradient(to bottom, #30363D 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.1 }}></div>
          )}
          <div className="bg-bg-card border border-border-muted rounded-xl p-12 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center space-y-6 max-w-lg z-10">
            <div className="w-16 h-16 border-4 border-success border-t-transparent rounded-full animate-spin"></div>
            <h2 className="font-headline-md text-2xl font-bold text-center text-success">AI Evaluation in Progress</h2>
            <p className="text-text-secondary text-center text-sm">Gemini is analyzing your answers, calculating scores, identifying strengths & weaknesses, and preparing a model suggested answer for each question. Please hold on...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Top Header (standalone mode only) */}
          {!isEmbedded && (
            <header className="h-16 border-b border-border-muted bg-surface-container-low shrink-0 relative z-20 flex items-center w-full">
              <div className="max-w-[1300px] w-full mx-auto px-4 md:px-6 flex justify-between items-center">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => {
                    sessionStorage.removeItem('prepintai_active_session');
                    if (onExit) onExit();
                    else navigate('/standard-practice');
                  }}
                >
                  <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>neurology</span>
                  </div>
                  <span className="font-headline-md text-xl font-extrabold text-primary tracking-tight">PrepIntAI</span>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.removeItem('prepintai_active_session');
                      if (onExit) onExit();
                      else navigate('/standard-practice');
                    }}
                    className="bg-surface-variant text-text-primary border border-border-muted font-semibold py-2 px-4 rounded-md hover:bg-outline-variant active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    Exit Session
                  </button>
                </div>
              </div>
            </header>
          )}

          {/* Background Grid Pattern (standalone mode only) */}
          {!isEmbedded && (
            <div className="absolute inset-0 pointer-events-none animate-fadeIn" style={{ backgroundImage: 'linear-gradient(to right, #30363D 1px, transparent 1px), linear-gradient(to bottom, #30363D 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.1 }}></div>
          )}

          {/* Centered Workspace Container */}
          <main className={isEmbedded ? "flex-1 flex flex-col md:items-center justify-center p-2 relative z-10 md:overflow-hidden" : "flex-1 flex flex-col md:items-center justify-center px-4 md:px-6 py-4 md:py-5 relative z-10 md:overflow-hidden"}>
            <div className="w-full max-w-[1300px] bg-bg-card border border-border-muted rounded-xl p-5 md:p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col gap-4 md:gap-5 md:h-full md:overflow-hidden">
              
              {/* Card Header: Session Details & Timer & Progress Bar */}
              <div className="flex justify-between items-center border-b border-border-muted pb-3 shrink-0 gap-4 flex-wrap">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-[9px] md:text-[12px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-[9px] md:text-[15px] text-text-secondary px-2 py-0.5 rounded font-semibold">
                    {topic} ( {experienceLevel} )
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:block w-20 md:w-28 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    ></div>
                  </div>
                  {/* Timer Display */}
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors shrink-0 ${
                    timeLeft < 60 
                      ? 'bg-danger/10 border-danger/30 text-danger animate-pulse font-bold' 
                      : 'bg-surface-variant/30 border-border-muted text-text-primary'
                  }`}>
                    <span className={`material-symbols-outlined text-[15px] ${timeLeft < 60 ? 'text-danger' : 'text-primary'}`}>
                      {timeLeft < 60 ? 'alarm' : 'timer'}
                    </span>
                    <span className="font-code text-xs font-bold leading-none tracking-wider">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  
                  {isEmbedded && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to exit the current session? Your progress will be lost.")) {
                          sessionStorage.removeItem('prepintai_active_session');
                          if (onExit) onExit();
                        }
                      }}
                      className="flex items-center justify-center p-1.5 rounded-md text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors shrink-0 ml-1 border border-transparent hover:border-danger/20"
                      title="Exit Session"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Error Banner inside card */}
              {error && (
                <div className="bg-danger/10 border border-danger/30 text-danger p-4 rounded text-xs flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                  </div>
                  <button onClick={() => setError('')} className="text-danger hover:underline text-xs">Dismiss</button>
                </div>
              )}

              {/* Two-Column Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 flex-1 md:overflow-hidden">
                {/* Left Column: Question and Tips */}
                <div className="md:col-span-6 flex flex-col gap-4 md:overflow-hidden md:h-full">
                  {/* Active Question Box */}
                  <div className="bg-bg-base border border-border-muted rounded-lg p-4 flex flex-col md:flex-1 md:min-h-0 md:overflow-hidden">
                    <div className="flex items-center gap-2 mb-2 shrink-0">
                      <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>quiz</span>
                      <span className="text-text-secondary font-label-md text-xs font-bold uppercase tracking-wider">Active Question</span>
                    </div>
                    <div className="md:flex-1 md:overflow-y-auto pr-1">
                      <h2 className="font-headline-md text-sm leading-relaxed text-on-surface">
                        {activeQuestion.questionText}
                      </h2>
                    </div>
                  </div>

                  {/* Tips Section */}
                  <div className="bg-bg-base border border-border-muted rounded-lg p-4 flex flex-col md:flex-1 md:min-h-0 md:overflow-hidden">
                    <div className="flex items-center gap-2 mb-2 shrink-0">
                      <span className="material-symbols-outlined text-[16px] text-warning" style={{ fontVariationSettings: "'FILL' 1" }}>tips_and_updates</span>
                      <h4 className="font-label-md text-xs font-bold text-text-secondary uppercase tracking-wider">
                        Tips & Strategy
                      </h4>
                    </div>
                    <ul className="text-[11px] md:text-xs text-text-secondary space-y-1 leading-relaxed md:overflow-y-auto pr-1 md:flex-1">
                      <li className="flex items-start gap-2">
                        <span className="text-primary shrink-0 mt-0.5">•</span>
                        <span><strong>Structure:</strong> Define core concept, add details, and highlight "Why".</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary shrink-0 mt-0.5">•</span>
                        <span><strong>Voice:</strong> Speak clearly. You can edit the text manually at any time.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary shrink-0 mt-0.5">•</span>
                        <span><strong>Tech:</strong> Explain key constructs, patterns, and trade-offs.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary shrink-0 mt-0.5">•</span>
                        <span><strong>Stuck?</strong> Describe your logic and how you would troubleshoot.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Right Column: Editor */}
                <div className="md:col-span-6 flex flex-col min-h-[300px] md:h-full md:overflow-hidden md:min-h-0">
                  {/* Response Editor Container */}
                  <div className="flex flex-col bg-bg-base border border-border-muted rounded-lg p-3 md:p-4 relative flex-1 min-h-0 focus-within:border-primary transition-colors">
                    <textarea
                      value={activeAnswer}
                      onChange={handleAnswerChange}
                      className="w-full flex-1 bg-transparent resize-none focus:outline-none focus:ring-0 text-on-surface font-body-md text-[13px] md:text-sm leading-relaxed placeholder-text-secondary/30 outline-none"
                      placeholder="Begin typing your response here, or click the microphone icon below to start dictating..."
                      spellCheck="false"
                    />

                    <div className="flex justify-between items-center border-t border-border-muted pt-2.5 mt-3 md:pt-3 md:mt-4 shrink-0">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={toggleRecording}
                          className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors shadow shadow-black/20 active:scale-95 duration-100 group relative ${isRecording ? 'bg-danger text-white hover:bg-danger/80' : 'bg-primary-container text-on-primary-container hover:bg-primary'}`}
                        >
                          <span className="material-symbols-outlined text-[18px] md:text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {isRecording ? 'stop' : 'mic'}
                          </span>
                          {isRecording && (
                            <span className="absolute inset-0 rounded-full border border-danger opacity-0 animate-ping"></span>
                          )}
                        </button>
                        {isRecording && (
                          <span className="text-[11px] md:text-xs text-danger font-semibold animate-pulse flex items-center gap-1">
                            Dictating...
                          </span>
                        )}
                      </div>

                      <div className="font-code-md text-[10px] md:text-xs text-text-secondary bg-surface-variant/30 border border-border-muted px-2 py-0.5 md:px-2.5 md:py-1 rounded">
                        <span className="text-on-surface font-bold">{wordCount}</span> words
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex justify-between items-center border-t border-border-muted pt-4 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="text-text-secondary hover:text-primary hover:bg-primary/10 rounded-md py-2 px-2 md:px-3 font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </button>

                </div>

                <div className="flex items-center gap-2.5 md:gap-3">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="bg-surface-variant text-text-primary border border-border-muted font-semibold py-2 px-4 rounded-md hover:bg-outline-variant active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                  >
                    Skip
                  </button>
                  {currentIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-primary text-on-primary font-bold py-2 px-3 md:px-5 rounded-md shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <span className="hidden sm:inline">Next Question</span>
                      <span className="sm:hidden">Next</span>
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitInterview}
                      className="bg-success text-white font-bold py-2 px-3 md:px-5 rounded-md shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <span className="hidden sm:inline">Submit Interview</span>
                      <span className="sm:hidden">Submit</span>
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          </main>
        </>
      )}
    </div>
  );
};

export default InterviewComponent;
