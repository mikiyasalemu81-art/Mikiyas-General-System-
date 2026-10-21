import React, { useState, useRef, useEffect } from 'react';
import { Transaction, ChatMessage } from '../../types';
import { getDailyFinancialTip, queryGroqAdvisor } from '../../services/advisor';
import { storageService } from '../../services/storage';
import { 
  Sparkles, 
  Lightbulb, 
  Send, 
  Bot, 
  ArrowRight, 
  Key, 
  RefreshCw, 
  Check, 
  User, 
  Trash2,
  Cpu
} from 'lucide-react';

interface AdvisorPanelProps {
  transactions: Transaction[];
}

export const AdvisorPanel: React.FC<AdvisorPanelProps> = ({ transactions }) => {
  const [query, setQuery] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'm-init',
      role: 'assistant',
      content: `Hello Mikiyas! I'm your Groq-powered AI Financial Advisor for Imako Solution. Ask me anything about your ETB cashflow, mistakes, client project pricing, or transport budgeting in Ethiopia!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => storageService.getGroqApiKey());
  const [keySaved, setKeySaved] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAsking]);

  // Mode (a): Daily Tip Card
  const dailyTip = getDailyFinancialTip(transactions);

  const handleAsk = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = (customQuery || query).trim();
    if (!q || isAsking) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsAsking(true);

    try {
      const aiReply = await queryGroqAdvisor(q, messages, transactions);
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I ran into a connection issue with Groq. Please verify your internet connection or check your API key.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveGroqApiKey(apiKeyInput.trim());
    setKeySaved(true);
    setTimeout(() => {
      setKeySaved(false);
      setShowKeyModal(false);
    }, 800);
  };

  const sampleQuestions = [
    'What is my mistake to gain this amount of money?',
    'How can I cut transport expenses in Addis?',
    'How should I price an Imako client project in ETB?',
    'Review my current cashflow balance',
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

      {/* MODE (b): Groq AI Financial Advisor with Real Brain */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        {/* Header with Brain badge and API settings */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20 shrink-0">
              <Cpu className="w-4 h-4 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  Groq AI Financial Brain
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Powered by Groq • Analyzes your live ETB finances
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setMessages([{
                id: 'm-init-reset',
                role: 'assistant',
                content: `Chat history cleared. What financial question can I help you with in ETB?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }])}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Clear conversation"
              aria-label="Clear chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setShowKeyModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Manage Groq API Key"
            >
              <Key className="w-3 h-3 text-amber-500" />
              <span className="hidden sm:inline">Groq Key</span>
            </button>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs">
          <span className="text-[11px] text-slate-400 font-semibold mr-1 shrink-0">Ideas:</span>
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
        <div className="h-64 sm:h-72 overflow-y-auto space-y-3 p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80 my-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.role === 'user'
                    ? 'bg-sky-600 text-white'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm rounded-tl-none font-sans'
                }`}
              >
                {msg.content}
                <div
                  className={`text-[9px] mt-1 font-mono ${
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
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.4s]" />
                <span className="font-medium text-[11px] ml-1">Groq is thinking with your ETB data...</span>
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
            placeholder="Ask anything about your money, mistakes, rates in ETB..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
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

      {/* Groq Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Key className="w-4 h-4 text-amber-500" />
              <span>Groq API Configuration</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Your key is saved locally in this browser.
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Groq API Key
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-sm"
                >
                  {keySaved ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{keySaved ? 'Saved!' : 'Save Key'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
