// ─────────────────────────────────────────────────────────────────────────────
// components/layout/ResumeInterviewComponent.jsx
// (previously: inline JSX inside pages/Dashboard.jsx — the 'resume-setup' view)
//
// PURPOSE: Resume-based interview setup form — rendered INSIDE Dashboard's main area.
// This is a COMPONENT, not a standalone page.
//
// Loaded by Dashboard when: currentView === 'resume-setup'
// Route that triggers it:   /resume-practice
//
// Props received from Dashboard:
//   resumeFile            → currently selected file object (or null)
//   resumeText            → paste text value
//   resumeExperienceLevel → selected experience level
//   resumeQuestionCount   → selected question count
//   resumeLoading         → true while AI is generating questions
//   resumeError           → error string if something goes wrong
//   fileInputRef          → ref forwarded to the hidden <input type="file">
//   onFileChange(e)       → handler for file selection
//   onTextChange(e)       → handler for textarea change
//   onExperienceLevelChange(level) → handler for level selection
//   onQuestionCountChange(count)   → handler for slider change
//   onSubmit(e)           → form submit handler
//   onCancel()            → callback to go back to dashboard
// ─────────────────────────────────────────────────────────────────────────────

const ResumeInterviewComponent = ({
  resumeFile,
  resumeText,
  resumeExperienceLevel,
  resumeQuestionCount,
  resumeLoading,
  resumeError,
  fileInputRef,
  onFileChange,
  onTextChange,
  onExperienceLevelChange,
  onQuestionCountChange,
  onSubmit,
  onCancel
}) => {
  return (
    <div className="flex-grow overflow-y-auto p-4 md:p-6 w-full h-full custom-scrollbar">
      <div className="max-w-4xl w-full mx-auto min-h-full flex flex-col justify-center py-4">
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
            <form onSubmit={onSubmit} className="space-y-6">
              
              {/* 1. Resume Source Options (Side-by-Side) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="block font-label-md text-sm font-semibold text-on-surface mb-2">Option 1: Upload Resume File (PDF / TXT)</label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        const syntheticEvent = { target: { files: e.dataTransfer.files } };
                        onFileChange(syntheticEvent);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-grow border border-dashed border-border-muted hover:border-success bg-background/30 rounded-lg p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 group h-[120px] min-h-[120px]"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={onFileChange}
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
                    onChange={onTextChange}
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
                    onChange={(e) => onQuestionCountChange(Number(e.target.value))}
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
                        onChange={() => onExperienceLevelChange(level)}
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
                  onClick={onCancel}
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
  );
};

export default ResumeInterviewComponent;
