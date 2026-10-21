import React, { useState } from 'react';
import { IntakeQuestion, ProjectIntake } from '../../types';
import { INTAKE_QUESTIONS } from '../../services/intakeGenerator';
import { Sparkles, CheckCircle, ArrowRight, HelpCircle, ChevronRight, Zap } from 'lucide-react';

interface ClarifyingQuestionsStepProps {
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, answer: string) => void;
  onGeneratePrompt: () => void;
  onBack: () => void;
  isGenerating?: boolean;
}

export const ClarifyingQuestionsStep: React.FC<ClarifyingQuestionsStepProps> = ({
  answers,
  onAnswerChange,
  onGeneratePrompt,
  onBack,
  isGenerating = false,
}) => {
  // Group questions by category
  const categories: string[] = Array.from(new Set(INTAKE_QUESTIONS.map((q) => q.category)));
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]);

  // Compute overall progress
  const answeredCount = Object.values(answers).filter((a) => a && a.trim().length > 0).length;
  const totalCount = INTAKE_QUESTIONS.length;
  const progressPercent = Math.round((answeredCount / totalCount) * 100);

  const currentQuestions = INTAKE_QUESTIONS.filter((q) => q.category === activeCategory);

  // Quick fill all remaining with recommended suggestions (ADHD convenience feature!)
  const handleAutoFillRemaining = () => {
    INTAKE_QUESTIONS.forEach((q) => {
      if (!answers[q.id] && q.suggestedAnswers && q.suggestedAnswers.length > 0) {
        onAnswerChange(q.id, q.suggestedAnswers[0]);
      }
    });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Progress & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Project Clarification Questions
            </h3>
            <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
              ({answeredCount}/{totalCount} answered)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select suggestions or type custom answers to build your Antigravity prompt
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleAutoFillRemaining}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 shadow-sm transition-all"
            title="Auto-fill unanswered questions with recommended presets"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Fast Preset Fill</span>
          </button>

          <button
            type="button"
            onClick={onGeneratePrompt}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white shadow-md shadow-sky-500/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Prompt</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => {
          const catQuestions = INTAKE_QUESTIONS.filter((q) => q.category === cat);
          const catAnswered = catQuestions.filter((q) => answers[q.id]?.trim()).length;
          const isComplete = catAnswered === catQuestions.length;
          const isActive = activeCategory === cat;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>{cat}</span>
              {isComplete ? (
                <CheckCircle className="w-3 h-3 text-emerald-400" />
              ) : (
                <span className="text-[10px] opacity-75 font-mono">
                  {catAnswered}/{catQuestions.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Questions in the Active Category */}
      <div className="space-y-4">
        {currentQuestions.map((q, idx) => {
          const currentAnswer = answers[q.id] || '';

          return (
            <div
              key={q.id}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    Q{idx + 1} • {q.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {q.question}
                  </h4>
                  {q.helpText && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {q.helpText}
                    </p>
                  )}
                </div>

                {currentAnswer.trim() && (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                )}
              </div>

              {/* Suggestion Chips */}
              {q.suggestedAnswers && q.suggestedAnswers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {q.suggestedAnswers.map((suggestion, sIdx) => {
                    const isSelected = currentAnswer === suggestion;
                    return (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => onAnswerChange(q.id, suggestion)}
                        className={`text-xs px-2.5 py-1 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300 font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {suggestion}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Freeform Answer Input */}
              <div>
                <input
                  type="text"
                  value={currentAnswer}
                  onChange={(e) => onAnswerChange(q.id, e.target.value)}
                  placeholder="Or enter custom answer..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          ← Back to Project Details
        </button>

        <button
          type="button"
          onClick={onGeneratePrompt}
          disabled={isGenerating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 active:scale-95 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate Antigravity Prompt</span>
        </button>
      </div>
    </div>
  );
};
