import React, { useState } from 'react';
import { Transaction } from '../../types';
import { useApp } from '../../context/AppContext';
import { Car, Briefcase, Trash2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const { deleteTransaction } = useApp();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'Transport' | 'Clients'>('all');

  const filtered = transactions.filter((tx) => {
    if (filter === 'income') return tx.type === 'income';
    if (filter === 'expense') return tx.type === 'expense';
    if (filter === 'Transport') return tx.category === 'Transport';
    if (filter === 'Clients') return tx.category === 'Clients';
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: `All (${transactions.length})` },
          { id: 'income', label: 'Income (+)' },
          { id: 'expense', label: 'Expenses (-)' },
          { id: 'Transport', label: 'Transport' },
          { id: 'Clients', label: 'Clients' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as typeof filter)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              filter === item.id
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Transaction Rows */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
          No transactions recorded yet (Current balance: 0 ETB).
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((tx) => {
            const isIncome = tx.type === 'income';
            return (
              <div
                key={tx.id}
                className="group flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      isIncome
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {tx.note}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-medium">
                        {tx.category === 'Transport' ? (
                          <Car className="w-3 h-3 text-sky-500" />
                        ) : (
                          <Briefcase className="w-3 h-3 text-purple-500" />
                        )}
                        {tx.category}
                      </span>
                      <span>•</span>
                      <span className="font-mono">{tx.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`text-sm sm:text-base font-extrabold font-mono ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isIncome ? '+' : '-'}ETB {tx.amount.toLocaleString()}
                  </span>

                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                    title="Delete entry"
                    aria-label="Delete entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
