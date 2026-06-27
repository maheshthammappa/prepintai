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
    <div className="w-full flex flex-col font-body relative h-full min-h-full">
      <main className="flex-1 flex p-2 relative w-full z-10">
        <div className="w-full max-w-4xl relative z-10 my-auto mx-auto">
          <div className="bg-bg-card border border-border-muted rounded-xl p-6 md:p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] min-h-[600px] flex flex-col">
            <div className="mb-6 border-b border-border-muted pb-5 shrink-0">
              <h1 className="font-headline-lg text-3xl font-bold text-text-primary mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>
                Configure Resume Interview Session
              </h1>
              <p className="font-body-md text-text-secondary text-sm">
                Set up your AI-driven practice environment. Upload or paste your resume, choose your experience level, and questions count.
              </p>
            </div>

            {resumeError && (
              <div className="bg-danger/10 border border-danger/30 text-danger p-4 rounded mb-6 text-sm flex items-center gap-2 shrink-0">
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
              <form onSubmit={onSubmit} className="flex-1 flex flex-col">
                <div className="space-y-6 flex-1">
                {/* 1. Resume Source Options (Side-by-Side) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="block font-label-md text-sm font-semibold text-on-surface mb-3">Option 1: Upload Resume File (PDF / TXT)</label>
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
                      className="flex-grow border border-dashed border-border-muted hover:border-primary bg-background/30 rounded-lg p-2 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1 group h-[92px] min-h-[92px]"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={onFileChange}
                        accept=".pdf,.txt"
                        className="hidden"
                      />
                      <span className="material-symbols-outlined text-2xl text-text-secondary group-hover:text-primary transition-colors">cloud_upload</span>
                      {resumeFile ? (
                        <div className="w-full px-2">
                          <p className="font-body-sm text-body-sm font-bold text-primary truncate max-w-full text-center">{resumeFile.name}</p>
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
                    <label className="block font-label-md text-sm font-semibold text-on-surface mb-3">Option 2: Paste Resume Text</label>
                    <textarea
                      value={resumeText}
                      onChange={onTextChange}
                      placeholder="Paste your professional experience, skills, and projects here..."
                      className="w-full flex-grow bg-bg-base border border-border-muted text-on-surface text-sm rounded-md py-2.5 px-3 h-[92px] min-h-[92px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-text-secondary/50 resize-none"
                    />
                  </div>
                </div>

                {/* 2. Question Count & Est Duration Sliders (Side-by-Side) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between mb-3">
                      <label className="font-label-md text-sm font-semibold text-on-surface">Question Count</label>
                      <span className="font-code-md text-sm font-bold text-primary">{resumeQuestionCount}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={resumeQuestionCount}
                      onChange={(e) => onQuestionCountChange(Number(e.target.value))}
                      className="w-full accent-primary bg-surface-variant rounded-full h-2 appearance-none cursor-pointer outline-none"
                    />
                    <div className="flex justify-between text-text-secondary font-label-md text-[10px] mt-1">
                      <span>1 question</span>
                      <span>15 questions</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-3">
                      <label className="font-label-md text-sm font-semibold text-on-surface">Est. Duration</label>
                      <span className="font-code-md text-sm font-bold text-primary">{resumeQuestionCount * 2} mins</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      value={resumeQuestionCount * 2}
                      disabled
                      className="w-full accent-primary bg-surface-variant rounded-full h-2 appearance-none outline-none opacity-50"
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
                        <div className="text-center py-2 px-1 rounded font-body-sm text-xs text-on-surface-variant border border-transparent peer-checked:bg-bg-card peer-checked:text-primary peer-checked:border-primary/20 transition-colors font-semibold">
                          {level}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 flex gap-4 border-t border-border-muted w-full mt-6 shrink-0">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-surface-variant text-text-primary border border-border-muted font-semibold py-2.5 px-5 rounded-md hover:bg-outline-variant active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-on-primary font-bold py-2.5 px-5 rounded-md shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Start AI Interview
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResumeInterviewComponent;
