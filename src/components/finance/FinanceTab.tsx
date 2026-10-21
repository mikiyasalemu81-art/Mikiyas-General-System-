import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { FinanceCharts } from './FinanceCharts';
import { AdvisorPanel } from './AdvisorPanel';
import { TransactionList } from './TransactionList';
import { AddTransactionModal } from './AddTransactionModal';
import { computeFinancialStats } from '../../services/advisor';
import { 
  Plus, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Sparkles, 
  RotateCcw,
  BadgeAlert
} from 'lucide-react';

export const FinanceTab: React.FC = () => {
  const { transactions, resetFinanceLedger, addBanner } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const stats = computeFinancialStats(transactions);

  const handleResetToZero = () => {
    if (window.confirm('Reset finance ledger to 0 ETB? All recorded entries will be cleared.')) {
      resetFinanceLedger();
      addBanner({
        type: 'info',
        title: 'Ledger Reset',
        message: 'Finances reset to 0 ETB clean balance.',
      });
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* 1. TOP OVERVIEW METRICS IN ETB */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Finance & Cashflow
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                ETB (Birr)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Transport and Clients financial tracking
            </p>
          </div>

          <div className="flex items-center gap-2">
            {transactions.length > 0 && (
              <button
                type="button"
                onClick={handleResetToZero}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                title="Erase money and reset to 0 ETB"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset to 0</span>
              </button>
            )}

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Record Entry</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MetricCard
            label="Total Income"
            value={`ETB ${stats.totalIncome.toLocaleString()}`}
            subtext="Client payments & retainers"
            colorTheme="green"
            icon={<ArrowDownLeft className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          />

          <MetricCard
            label="Total Expenses"
            value={`ETB ${stats.totalExpenses.toLocaleString()}`}
            subtext={`Transport: ETB ${stats.transportExpenses.toLocaleString()} • Clients: ETB ${stats.clientExpenses.toLocaleString()}`}
            colorTheme="red"
            icon={<ArrowUpRight className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
          />

          <MetricCard
            label="Net Balance"
            value={`${stats.netBalance >= 0 ? '+' : '-'}ETB ${Math.abs(stats.netBalance).toLocaleString()}`}
            subtext={stats.totalIncome > 0 ? `${stats.savingsRate}% retained surplus` : 'Starting from 0 ETB'}
            colorTheme={stats.netBalance >= 0 ? 'blue' : 'amber'}
            trend={stats.netBalance >= 0 ? 'success' : 'danger'}
            trendLabel={stats.netBalance >= 0 ? 'Surplus' : 'Deficit'}
            icon={<Wallet className="w-5 h-5 text-sky-600 dark:text-sky-400" />}
          />
        </div>
      </section>

      {/* 2. CHARTS IN ETB: Visual First, Numbers Always Visible */}
      <section className="space-y-2">
        <FinanceCharts transactions={transactions} />
      </section>

      {/* 3. FINANCE ADVISOR: Powered by Groq AI */}
      <section className="space-y-2">
        <AdvisorPanel transactions={transactions} />
      </section>

      {/* 4. TRANSACTION LEDGER IN ETB */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Ledger Transactions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Categorized by Transport and Clients (ETB)
            </p>
          </div>
        </div>

        <TransactionList transactions={transactions} />
      </section>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
