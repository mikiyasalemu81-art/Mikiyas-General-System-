import React, { useState, useRef, useEffect } from 'react';
import { Transaction, ChatMessage } from '../../types';
import { getDailyFinancialTip, queryChadAssistant, computeFinancialStats } from '../../services/advisor';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  Lightbulb, 
  Send, 
  Bot, 
  ArrowRight, 
  Trash2,
  Brain,
  User,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface AdvisorPanelProps {
  transactions: Transaction[];
}

export const AdvisorPanel: React.FC<AdvisorPanelProps> = ({ transactions }) => {
  const { profile, tasks, apps, addBanner } = useApp();
  const [query, setQuery] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'm-init',
      role: 'assistant',
      content: `Hey Mikiyas! 👋 I'm Chad, your personal assistant. We can chat about anything—how your day is going, ideas for Imako Solution, your tasks, time limits, or finances. How can I help you right now?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAsking]);

  const dailyTip = getDailyFinancialTip(transactions);
  const stats = computeFinancialStats(transactions);

  const handleAsk = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = (customQuery || query).trim();
    if (!q || isAsking) return;

    setApiError(null);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setQuery('');
    setIsAsking(true);

    const contextData = {
      userName: profile.name || 'Mikiyas',
      netBalance: stats.netBalance,
      tasksCount: tasks.length,
      pendingTasks: tasks.filter(t => !t.completed).map(t => t.title),
      blockedAppsCount: apps.filter(a => a.isBlocked).length
    };

    try {
      const response = await queryChadAssistant(q, messages, contextData);
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        reasoning: response.reasoning,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorText = err?.message || 'Error communicating with assistant API.';
      setApiError(errorText);

      // Requirement 5: Show the real error to the user in a small banner instead of canned fallback
      addBanner({
        type: 'blocked',
        title: 'Assistant API Error',
        message: errorText
      });

      const assistantErrorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ ${errorText}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantErrorMsg]);
    } finally {
      setIsAsking(false);
    }
  };

  const sampleQuestions = [
    'hi',
    'What is my mistake to gain this amount of money?',
    'How should I price an Imako client web app in ETB?',
    'Give me a strategy to cut transit expenses in Addis',
  ];

  return (
    <div className="space-y-4">
      {/* MODE (a): Daily Tip Card */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          dailyTip.severity === 'warning'
            ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60'
            : dailyTip.severity === 'success'
            ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/60'
            : 'bg-sky-50/70 dark:bg-sky-950/20 border-sky-300 dark:border-sky-900/60'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              dailyTip.severity === 'warning'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                : dailyTip.severity === 'success'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                : 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300'
            }`}
          >
            <Lightbulb className="w-5 h-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                Mode A • Daily Tip (ETB)
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {dailyTip.title}
              </h4>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              {dailyTip.advice}
            </p>

            <div className="mt-2 p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <ArrowRight className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span>{dailyTip.impact}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODE (b): Chad AI Personal Assistant & Brain */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20 shrink-0">
              <Brain className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  Chad • Personal Assistant & Advisor
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                  Server Route /api/chat
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Powered by Groq • General assistant with full conversation memory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setMessages([{
                  id: 'm-init-reset',
                  role: 'assistant',
                  content: `Conversation restarted! Hey Mikiyas, what can I do for you right now?`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }]);
                setApiError(null);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Restart conversation"
              aria-label="Restart chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs">
          <span className="text-[11px] text-slate-400 font-semibold mr-1 shrink-0">Try:</span>
          {sampleQuestions.map((qText, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAsk(undefined, qText)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-sky-50 hover:text-sky-700 dark:bg-slate-800 dark:hover:bg-sky-950/40 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap transition-colors border border-transparent hover:border-sky-300 dark:hover:border-sky-800"
            >
              {qText}
            </button>
          ))}
        </div>

        {/* Chat Message Scroll Window */}
        <div className="h-72 sm:h-80 overflow-y-auto space-y-3 p-3 sm:p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 my-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-sky-600 text-white'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm rounded-tl-none font-sans'
                }`}
              >
                {/* Thinking Process Accordion */}
                {msg.reasoning && (
                  <details className="mb-2.5 p-2 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-[11px] group">
                    <summary className="cursor-pointer font-bold flex items-center gap-1.5 text-sky-600 dark:text-sky-400 select-none hover:opacity-80">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      <span>🧠 Internal Thinking Process</span>
                      <span className="text-[10px] text-slate-400 font-mono ml-auto">Click to expand</span>
                    </summary>
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 whitespace-pre-wrap font-mono text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
                      {msg.reasoning}
                    </div>
                  </details>
                )}

                <div className="whitespace-pre-wrap font-sans selection:bg-sky-200 selection:text-sky-900">
                  {msg.content}
                </div>

                <div
                  className={`text-[9px] mt-1.5 font-mono ${
                    msg.role === 'user' ? 'text-sky-200 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isAsking && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                  Chad is thinking...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleAsk} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Talk with Chad about anything, tasks, or finances..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            disabled={isAsking}
          />
          <button
            type="submit"
            disabled={isAsking || !query.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all active:scale-95 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
