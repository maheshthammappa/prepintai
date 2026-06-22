import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQuestions } from '../services/api';

const SetupPage = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('React');
  const [customTopic, setCustomTopic] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Level');
  const [questionCount, setQuestionCount] = useState(10);
  const [duration, setDuration] = useState(45);
  const [mode, setMode] = useState('text');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const selectedTopic = topic === 'custom' ? customTopic : topic;
    if (!selectedTopic.trim()) {
      setError('Please provide a valid topic.');
      setLoading(false);
      return;
    }

    try {
      const response = await generateQuestions(selectedTopic, experienceLevel, questionCount);
      setLoading(false);
      navigate('/interview', {
        state: {
          questions: response.questions,
          topic: selectedTopic,
          experienceLevel,
          mode
        }
      });
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to generate interview questions. Please make sure the backend server is running and try again.');
    }
  };

  return (
    <div className="bg-bg-base text-text-primary min-h-screen w-full flex items-center justify-center p-gutter relative font-body overflow-y-auto">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #30363D 1px, transparent 1px), linear-gradient(to bottom, #30363D 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.1 }}></div>
      
      <div className="w-full max-w-3xl relative z-10 my-8">
        {loading ? (
          <div className="bg-bg-card border border-border-muted rounded-xl p-12 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <h2 className="font-headline-md text-2xl font-bold text-center text-primary">Generating Interview Questions</h2>
            <p className="text-text-secondary text-center text-sm max-w-md">Our AI is designing a customized set of {questionCount} questions for {topic === 'custom' ? customTopic : topic} ({experienceLevel}). This will take just a moment...</p>
          </div>
        ) : (
          <div className="bg-bg-card border border-border-muted rounded-xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <div className="mb-8 border-b border-border-muted pb-6">
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
              {/* Topic Selection Grid */}
              <div>
                <label className="block font-label-md text-sm font-semibold text-on-surface mb-3">Select Topic / Technology</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { id: 'React', label: 'React', icon: 'javascript', iconColor: 'text-primary' },
                    { id: 'Java', label: 'Java', icon: 'terminal', iconColor: 'text-warning' },
                    { id: 'DSA', label: 'DSA', icon: 'data_object', iconColor: 'text-success' },
                    { id: 'System Design', label: 'System Design', icon: 'account_tree', iconColor: 'text-tertiary-container' },
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
                      <div className="p-3 border border-border-muted rounded hover:border-primary peer-checked:border-primary peer-checked:bg-surface-variant transition-colors flex flex-col items-center justify-center gap-2 text-center h-24">
                        <span className={`material-symbols-outlined ${item.iconColor}`} style={{ fontSize: '28px' }}>{item.icon}</span>
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

              {/* Experience Level Selector */}
              <div>
                <label className="block font-label-md text-sm font-semibold text-on-surface mb-3">Target Experience Level</label>
                <div className="flex gap-2 p-1 bg-surface-variant rounded border border-border-muted">
                  {['Junior-Level', 'Mid-Level', 'Senior-Level', 'Architect / Lead'].map((level) => (
                    <label key={level} className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="experienceLevel"
                        value={level}
                        checked={experienceLevel === level}
                        onChange={() => setExperienceLevel(level)}
                        className="peer sr-only"
                      />
                      <div className="text-center py-2 px-1 rounded font-body-sm text-xs text-on-surface-variant peer-checked:bg-bg-card peer-checked:text-primary peer-checked:border peer-checked:border-primary/20 transition-all font-semibold">
                        {level}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question Count & Est Duration */}
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
                  <label className="block font-label-md text-sm font-semibold text-on-surface mb-3">Est. Duration (minutes)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full bg-surface-variant border border-border-muted rounded py-2 px-4 font-code-md text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <span className="absolute right-4 top-2 text-text-secondary material-symbols-outlined text-sm">schedule</span>
                  </div>
                </div>
              </div>

              {/* Modality Selector */}
              <div className="border-t border-border-muted pt-6">
                <label className="block font-label-md text-sm font-semibold text-on-surface mb-3">Answer Modality</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <input
                        type="radio"
                        name="mode"
                        value="text"
                        checked={mode === 'text'}
                        onChange={() => setMode('text')}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 border-2 border-outline rounded-full peer-checked:border-primary transition-colors"></div>
                      <div className="absolute w-2.5 h-2.5 bg-primary rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                    </div>
                    <span className="font-body-sm text-sm text-on-surface group-hover:text-primary transition-colors flex items-center gap-2 font-semibold">
                      <span class="material-symbols-outlined text-[20px]">keyboard</span> Text Editor
                    </span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <input
                        type="radio"
                        name="mode"
                        value="speech"
                        checked={mode === 'speech'}
                        onChange={() => setMode('speech')}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 border-2 border-outline rounded-full peer-checked:border-primary transition-colors"></div>
                      <div className="absolute w-2.5 h-2.5 bg-primary rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                    </div>
                    <span className="font-body-sm text-sm text-on-surface group-hover:text-primary transition-colors flex items-center gap-2 font-semibold">
                      <span class="material-symbols-outlined text-[20px]">mic</span> Speech-to-Text (Voice)
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 flex justify-end gap-4 border-t border-border-muted">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-6 py-2 border border-border-muted rounded text-text-primary font-semibold text-sm hover:bg-surface-variant transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-primary-container text-on-primary-container rounded font-semibold text-sm hover:bg-primary transition-colors flex items-center gap-2 shadow-lg"
                >
                  Start AI Interview
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupPage;
