import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { evaluateInterview } from '../services/api';

const InterviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve state parameters
  const { questions = [], topic = '', experienceLevel = '', mode = 'text' } = location.state || {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);

  const recognitionRef = useRef(null);

  // Redirect to setup if accessed directly without state
  useEffect(() => {
    if (questions.length === 0) {
      navigate('/setup');
    }
  }, [questions, navigate]);

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
    setShowHint(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    setShowHint(false);
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

  const handleSubmitInterview = async () => {
    setLoading(true);
    setError('');

    // Format payload
    const formattedAnswers = questions.map((q) => ({
      questionId: q.id,
      questionText: q.questionText,
      userAnswer: answers[q.id] || '(Skipped / Left Blank)'
    }));

    try {
      const report = await evaluateInterview(topic, experienceLevel, formattedAnswers);
      setLoading(false);
      navigate('/report', { state: { report, topic, experienceLevel } });
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to submit interview for AI evaluation. Please verify your backend server connection and try again.');
    }
  };

  if (questions.length === 0) return null;

  return (
    <div className="bg-bg-base text-text-primary h-screen w-full flex flex-col overflow-hidden font-body">
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-bg-base relative">
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #30363D 1px, transparent 1px), linear-gradient(to bottom, #30363D 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.1 }}></div>
          <div className="bg-bg-card border border-border-muted rounded-xl p-12 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center space-y-6 max-w-lg z-10">
            <div className="w-16 h-16 border-4 border-success border-t-transparent rounded-full animate-spin"></div>
            <h2 className="font-headline-md text-2xl font-bold text-center text-success">AI Evaluation in Progress</h2>
            <p className="text-text-secondary text-center text-sm">Gemini is analyzing your answers, calculating scores, identifying strengths & weaknesses, and preparing a model suggested answer for each question. Please hold on...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Top Header */}
          <header className="flex justify-between items-center h-16 px-gutter border-b border-border-muted bg-surface-container-low shrink-0">
            <div className="flex items-center gap-4">
              <span className="font-headline-md text-xl font-bold text-primary">PrepIntAI</span>
              <span className="h-4 w-px bg-border-muted"></span>
              <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">{topic} ({experienceLevel})</span>
            </div>
            {error && (
              <div className="hidden lg:flex items-center gap-2 text-xs text-danger bg-danger/10 border border-danger/20 py-1.5 px-3 rounded">
                <span className="material-symbols-outlined text-sm">warning</span>
                Evaluation Failed. Try submitting again.
              </div>
            )}
          </header>

          {/* Main workspace */}
          <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #30363D 1px, transparent 1px), linear-gradient(to bottom, #30363D 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.05 }}></div>

            {/* Left Panel: Question details (40%) */}
            <section className="w-full md:w-[40%] flex flex-col bg-bg-base border-r border-border-muted h-full z-10">
              <div className="p-card-padding border-b border-border-muted shrink-0">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="font-headline-md text-lg font-bold text-on-surface">Question #{currentIndex + 1}</h1>
                  <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-label-md text-xs font-semibold">
                    Active
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-card-padding text-on-surface-variant space-y-6">
                <div className="font-body-md text-md leading-relaxed text-text-primary">
                  {activeQuestion.questionText}
                </div>

                <div className="pt-4 border-t border-border-muted">
                  <h4 className="font-label-md text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Tips</h4>
                  <ul className="list-disc pl-5 text-xs text-text-secondary space-y-1.5">
                    <li>Be structured and concise in your response.</li>
                    <li>If it's a coding topic, describe algorithms or key syntax constructs.</li>
                    <li>If you don't know the answer, explain your approach or logical steps.</li>
                  </ul>
                </div>

                {/* Hint Accordion */}
                <div className="border border-border-muted rounded-lg overflow-hidden bg-bg-card">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="w-full flex justify-between items-center font-label-md text-xs font-semibold p-3 hover:bg-surface-variant transition-colors text-on-surface text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-warning text-sm">lightbulb</span>
                      Need a hint?
                    </span>
                    <span className={`material-symbols-outlined transition-transform duration-200 ${showHint ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>
                  {showHint && (
                    <div className="p-3 border-t border-border-muted text-xs text-text-secondary bg-surface-container-low leading-relaxed">
                      Try defining the core concepts first, then elaborate on details or give examples. Ensure you highlight the "Why" behind this topic.
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Right Panel: Editor/Answer Area (60%) */}
            <section className="w-full md:w-[60%] flex flex-col bg-surface-container-low h-full relative z-10 border-t md:border-t-0 border-border-muted">
              {/* Editor Header */}
              <div className="h-12 border-b border-border-muted flex items-center px-4 bg-bg-card shrink-0 justify-between">
                <span className="text-text-secondary font-label-md text-xs font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">format_align_left</span>
                  Response Editor {mode === 'speech' && '(Voice Enabled)'}
                </span>
                {isRecording && (
                  <span className="text-xs text-danger font-semibold flex items-center gap-1.5 animate-pulse">
                    <span className="w-2.5 h-2.5 bg-danger rounded-full"></span>
                    Dictating...
                  </span>
                )}
              </div>

              {/* Textarea Area */}
              <div className="flex-1 relative p-4 pb-20">
                <textarea
                  value={activeAnswer}
                  onChange={handleAnswerChange}
                  className="w-full h-full bg-transparent resize-none border-none focus:outline-none focus:ring-0 text-on-surface font-body-md text-sm leading-relaxed placeholder-text-secondary/40 outline-none"
                  placeholder={mode === 'speech' ? "Click the microphone below to start dictating your response, or type directly here..." : "Begin typing your response here..."}
                  spellCheck="false"
                />

                {/* Floating Action Area */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
                  {/* Voice Button */}
                  {mode === 'speech' ? (
                    <button
                      type="button"
                      onClick={toggleRecording}
                      className={`pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-lg active:scale-95 duration-100 group relative ${isRecording ? 'bg-danger text-white hover:bg-danger/80' : 'bg-primary-container text-on-primary-container hover:bg-primary'}`}
                    >
                      <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {isRecording ? 'stop' : 'mic'}
                      </span>
                      {isRecording && (
                        <span className="absolute inset-0 rounded-full border border-danger opacity-0 animate-ping"></span>
                      )}
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {/* Character/Word Count */}
                  <div className="font-code-md text-xs text-text-secondary bg-bg-card border border-border-muted px-3 py-1.5 rounded pointer-events-auto">
                    <span className="text-on-surface font-bold">{wordCount}</span> words
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* Error Banner */}
          {error && (
            <div className="bg-danger/10 border-t border-danger/20 text-danger p-3 text-xs flex items-center justify-between px-gutter shrink-0">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </span>
              <button onClick={() => setError('')} className="text-danger hover:underline">Dismiss</button>
            </div>
          )}

          {/* Bottom Action Footer */}
          <footer className="h-16 border-t border-border-muted bg-bg-card flex items-center justify-between px-gutter shrink-0 z-20">
            <div className="flex items-center gap-3 md:w-1/3">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 text-text-secondary hover:text-on-surface disabled:opacity-30 disabled:hover:text-text-secondary font-semibold text-xs py-2 px-3 rounded hover:bg-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
                Previous
              </button>
            </div>

            <div className="hidden md:flex flex-col items-center justify-center w-1/3">
              <span className="font-label-md text-xs text-text-secondary mb-1.5">Question {currentIndex + 1} of {questions.length}</span>
              <div className="w-48 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 md:w-1/3">
              {currentIndex < questions.length - 1 ? (
                <>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-text-secondary hover:text-on-surface font-semibold text-xs px-4 py-2 rounded border border-border-muted hover:bg-surface-variant transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-primary text-white font-semibold text-xs px-4 py-2 rounded flex items-center gap-1 hover:bg-opacity-90 active:scale-95 duration-100"
                  >
                    Next Question
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitInterview}
                  className="bg-success text-white font-semibold text-xs px-5 py-2 rounded flex items-center gap-1 hover:bg-opacity-90 active:scale-95 duration-100 shadow-md"
                >
                  Submit Interview
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </button>
              )}
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export default InterviewPage;
