import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProjectIntake } from '../../types';
import { generateAntigravityPrompt } from '../../services/intakeGenerator';
import { ClarifyingQuestionsStep } from './ClarifyingQuestionsStep';
import { GeneratedPromptModal } from './GeneratedPromptModal';
import { 
  X, 
  Briefcase, 
  Plus, 
  Sparkles, 
  FolderOpen, 
  Calendar, 
  DollarSign, 
  Link2, 
  FileText, 
  ArrowRight,
  Trash2,
  ExternalLink
} from 'lucide-react';

export const ProjectIntakeModal: React.FC = () => {
  const { 
    projects, 
    saveProjectIntake, 
    deleteProjectIntake, 
    isIntakeModalOpen, 
    setIsIntakeModalOpen,
    addBanner 
  } = useApp();

  // Wizard state: 'form' | 'questions'
  const [step, setStep] = useState<'form' | 'questions'>('form');
  const [activeTab, setActiveTab] = useState<'new' | 'saved'>('new');

  // Form Fields
  const [projectId, setProjectId] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [projectType, setProjectType] = useState('');
  const [description, setDescription] = useState('');
  const [referenceLinks, setReferenceLinks] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Prompt Modal Popup state
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [generatedPromptText, setGeneratedPromptText] = useState('');

  if (!isIntakeModalOpen) return null;

  // Handle New Project submission -> generates clarifying questions
  const handleInitialFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !projectType.trim() || !description.trim()) return;

    const id = projectId || `proj-${Date.now()}`;
    setProjectId(id);
    setStep('questions');
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  // Generate final expert-level Antigravity prompt and open modal popup
  const handleGenerateFinalPrompt = () => {
    const intakeData: ProjectIntake = {
      id: projectId || `proj-${Date.now()}`,
      clientName: clientName.trim(),
      projectType: projectType.trim(),
      description: description.trim(),
      referenceLinks: referenceLinks.trim(),
      budget: budget.trim(),
      deadline: deadline.trim(),
      createdAt: new Date().toISOString(),
      answers,
    };

    const prompt = generateAntigravityPrompt(intakeData);
    intakeData.generatedPrompt = prompt;

    // Save locally
    saveProjectIntake(intakeData);
    setGeneratedPromptText(prompt);
    setIsPromptModalOpen(true);

    addBanner({
      type: 'info',
      title: 'Antigravity Prompt Generated',
      message: `Prompt created for ${intakeData.clientName} and saved locally.`,
    });
  };

  // Reopen an existing project from local storage
  const handleOpenSavedProject = (proj: ProjectIntake) => {
    setProjectId(proj.id);
    setClientName(proj.clientName);
    setProjectType(proj.projectType);
    setDescription(proj.description);
    setReferenceLinks(proj.referenceLinks || '');
    setBudget(proj.budget || '');
    setDeadline(proj.deadline || '');
    setAnswers(proj.answers || {});

    if (proj.generatedPrompt) {
      setGeneratedPromptText(proj.generatedPrompt);
      setIsPromptModalOpen(true);
    } else {
      setStep('questions');
    }
  };

  const resetForm = () => {
    setProjectId('');
    setClientName('');
    setProjectType('');
    setDescription('');
    setReferenceLinks('');
    setBudget('');
    setDeadline('');
    setAnswers({});
    setStep('form');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-fade-in">
        <div
          className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative animate-slide-up"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/70">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-rose-500 to-sky-600 text-white shadow-md shadow-rose-500/20">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Imako Solution • Project Intake & Prompt Generator
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Generate 20+ clarifying questions & export expert Antigravity prompts
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                resetForm();
                setIsIntakeModalOpen(false);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation: New Project vs Saved Projects */}
          {step === 'form' && (
            <div className="px-6 pt-3 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('new')}
                className={`pb-2.5 font-bold transition-all border-b-2 ${
                  activeTab === 'new'
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                + New Project Intake
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('saved')}
                className={`pb-2.5 font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'saved'
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Saved Projects ({projects.length})</span>
              </button>
            </div>
          )}

          {/* Body Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {step === 'form' && activeTab === 'new' && (
              <form onSubmit={handleInitialFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Client Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Client Name
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. EthioPay Financial Solutions"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                      required
                    />
                  </div>

                  {/* Project Type */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Project Type
                    </label>
                    <input
                      type="text"
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      placeholder="e.g. Fintech Merchant Portal & PWA"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Project Description / Brief
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the client's problem, main user workflow, and target deliverables..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    required
                  />
                </div>

                {/* Reference Links */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Reference Links / Inspiration
                  </label>
                  <div className="relative">
                    <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={referenceLinks}
                      onChange={(e) => setReferenceLinks(e.target.value)}
                      placeholder="e.g. https://stripe.com, https://linear.app"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Budget */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Budget / Compensation
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="e.g. $4,500 or 250,000 ETB"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Target Launch Deadline
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 active:scale-95 transition-all"
                  >
                    <span>Generate Clarifying Questions (20+)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Saved Projects List */}
            {step === 'form' && activeTab === 'saved' && (
              <div className="space-y-3">
                {projects.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
                    No saved projects yet. Fill out the "New Project Intake" form to generate and save one.
                  </div>
                ) : (
                  projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {proj.clientName}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                            {proj.projectType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {proj.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-mono">
                          <span>Budget: {proj.budget || 'TBD'}</span>
                          <span>•</span>
                          <span>Deadline: {proj.deadline || 'Flexible'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenSavedProject(proj)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 border border-sky-200 dark:border-sky-800 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                          <span>Open Prompt</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProjectIntake(proj.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Step 2: Clarifying Questions */}
            {step === 'questions' && (
              <ClarifyingQuestionsStep
                answers={answers}
                onAnswerChange={handleAnswerChange}
                onGeneratePrompt={handleGenerateFinalPrompt}
                onBack={() => setStep('form')}
              />
            )}
          </div>
        </div>
      </div>

      {/* Step 3: Generated Prompt Modal Popup with Copy to Clipboard */}
      <GeneratedPromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        promptText={generatedPromptText}
        projectTitle={`${clientName} (${projectType})`}
      />
    </>
  );
};
