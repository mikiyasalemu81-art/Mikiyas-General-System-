import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FinanceCategory, TransactionType } from '../../types';
import { X, Calendar, Tag, FileText, Plus, AlertCircle } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addTransaction, addBanner } = useApp();
  const [type, setType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<FinanceCategory>('Clients');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    if (!reason.trim()) {
      addBanner({
        type: 'info',
        title: 'Reason is Required',
        message: 'Please enter a reason for this transaction (e.g. "bought a phone charger", "bus fare to meeting").',
      });
      return;
    }

    addTransaction({
      amount: num,
      date,
      category,
      type,
      reason: reason.trim(),
      note: note.trim() || reason.trim(),
    });

    addBanner({
      type: 'info',
      title: `${type === 'income' ? 'Income Added (+)' : 'Expense Deducted (-)'}`,
      message: `ETB ${num.toLocaleString()} for ${category} • Reason: "${reason.trim()}"`,
    });

    setAmount('');
    setReason('');
    setNote('');
    setHasAttemptedSubmit(false);
    onClose();
  };

  const isReasonInvalid = hasAttemptedSubmit && !reason.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Record Transaction
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Transport and Clients financial tracking in ETB (Birr)
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Income vs Expense Toggle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  if (category === 'Transport') setCategory('Clients');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  type === 'income'
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                + Income (I Gain Money)
              </button>

              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  type === 'expense'
                    ? 'bg-rose-500 border-rose-500 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                - Expense (I Lose / Spend)
              </button>
            </div>
          </div>

          {/* Amount in ETB */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Amount (ETB - Ethiopian Birr)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400">
                ETB
              </span>
              <input
                type="number"
                step="any"
                min="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder-slate-400 text-base font-mono font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
                autoFocus
              />
            </div>
          </div>

          {/* REQUIRED REASON FIELD - ALWAYS VISIBLE */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Reason <span className="text-rose-500">* Required</span>
              </label>
              {isReasonInvalid && (
                <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Cannot be empty
                </span>
              )}
            </div>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder='e.g. "bought a phone charger", "paid client invoice", "bus fare to meeting"'
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none font-medium transition-colors ${
                  isReasonInvalid
                    ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/30 focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 focus:ring-2 focus:ring-sky-500'
                }`}
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Every income or expense must have a specific reason to track your financial habits.
            </p>
          </div>

          {/* Category: strictly Transport and Clients */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Category (Transport or Clients)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCategory('Transport')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  category === 'Transport'
                    ? 'bg-sky-500 border-sky-500 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                🚗 Transport
              </button>

              <button
                type="button"
                onClick={() => setCategory('Clients')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  category === 'Clients'
                    ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                💼 Clients
              </button>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Additional Details (Optional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional notes or reference numbers"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!amount || !reason.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Save Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
