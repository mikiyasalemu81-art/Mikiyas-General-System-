import React, { useState } from 'react';
import { X, Copy, Check, FileText, Sparkles, Terminal } from 'lucide-react';

interface GeneratedPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptText: string;
  projectTitle: string;
}

export const GeneratedPromptModal: React.FC<GeneratedPromptModalProps> = ({
  isOpen,
  onClose,
  promptText,
  projectTitle,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Clipboard write error', e);
    }
  };

  const wordCount = promptText.split(/\s+/).filter(Boolean).length;
  const charCount = promptText.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Generated Antigravity Prompt
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                {projectTitle} • {wordCount} words • {charCount} chars
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy-to-clipboard button */}
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                copied
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20'
              }`}
              title="Copy prompt text to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prompt Content Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-sky-500 selection:text-white bg-slate-50/50 dark:bg-slate-950/50">
          {promptText}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 px-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sky-500" />
            <span>Ready for Antigravity AI pair programming sessions.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
