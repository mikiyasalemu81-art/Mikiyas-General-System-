import React from 'react';
import { Transaction } from '../../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, Car, Briefcase, Tag, Layers } from 'lucide-react';

interface FinanceChartsProps {
  transactions: Transaction[];
}

export const FinanceCharts: React.FC<FinanceChartsProps> = ({ transactions }) => {
  // 1. Group transactions over time (sorted by date)
  const dateMap = new Map<string, { date: string; income: number; expense: number }>();
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

  sorted.forEach((tx) => {
    const parts = tx.date.split('-');
    const shortLabel = parts.length === 3 ? `${parts[1]}/${parts[2]}` : tx.date;

    const current = dateMap.get(shortLabel) || { date: shortLabel, income: 0, expense: 0 };
    if (tx.type === 'income') {
      current.income += tx.amount;
    } else {
      current.expense += tx.amount;
    }
    dateMap.set(shortLabel, current);
  });

  const timelineData = Array.from(dateMap.values());

  // 2. Category Breakdown Data in ETB
  let transportExpense = 0;
  let clientExpense = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'expense') {
      if (tx.category === 'Transport') transportExpense += tx.amount;
      if (tx.category === 'Clients') clientExpense += tx.amount;
    }
  });

  const totalExpense = transportExpense + clientExpense;
  const transportPct = totalExpense > 0 ? Math.round((transportExpense / totalExpense) * 100) : 0;
  const clientPct = totalExpense > 0 ? Math.round((clientExpense / totalExpense) * 100) : 0;

  const categoryPieData = [
    { name: 'Transport', value: transportExpense, color: '#0ea5e9' },
    { name: 'Clients', value: clientExpense, color: '#f43f5e' },
  ].filter(item => item.value > 0);

  // 3. Reason Breakdown Data in ETB (Expense Breakdown by Reason)
  const reasonMap = new Map<string, { amount: number; category: string }>();
  transactions.forEach((tx) => {
    if (tx.type === 'expense') {
      const reasonKey = (tx.reason || tx.note || 'General Expense').trim();
      const existing = reasonMap.get(reasonKey) || { amount: 0, category: tx.category };
      reasonMap.set(reasonKey, { amount: existing.amount + tx.amount, category: tx.category });
    }
  });

  const reasonList = Array.from(reasonMap.entries())
    .map(([reason, data]) => ({
      reason,
      category: data.category,
      amount: data.amount,
      pct: totalExpense > 0 ? Math.round((data.amount / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Income vs Expenses Over Time */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Income vs. Expenses Timeline
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cashflow comparison in ETB over time
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-bold">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                In
              </span>
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                Out
              </span>
            </div>
          </div>

          <div className="h-52 w-full pt-2">
            {timelineData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 p-4 text-center">
                <span>0 ETB Recorded</span>
                <span className="text-[11px] text-slate-500 mt-1">Tap "+ Record Entry" above to add income or expenses.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: '#94a3b8' }} 
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#94a3b8' }} 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `${val}`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs shadow-xl border border-slate-700">
                            <p className="font-bold mb-1 text-slate-300">{label}</p>
                            {payload.map((entry, index) => (
                              <p key={`item-${index}`} className="flex items-center justify-between gap-3 font-mono">
                                <span style={{ color: entry.color }}>{entry.name}:</span>
                                <span className="font-bold">ETB {Number(entry.value).toLocaleString()}</span>
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Category Breakdown in ETB */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                <PieIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Expense Category Breakdown
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Transport vs. Clients distribution in ETB
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-44 w-full flex items-center justify-center">
              {categoryPieData.length === 0 ? (
                <div className="text-xs text-slate-400 text-center">No expenses recorded yet (0 ETB)</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={65}
                      paddingAngle={4}
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          return (
                            <div className="p-2 rounded-xl bg-slate-900 text-white text-xs shadow-xl border border-slate-700">
                              <span className="font-bold">{data.name}: </span>
                              <span className="font-mono">ETB {Number(data.value).toLocaleString()}</span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5" />
                    Transport
                  </span>
                  <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                    {transportPct}%
                  </span>
                </div>
                <div className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white">
                  ETB {transportExpense.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    Clients
                  </span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    {clientPct}%
                  </span>
                </div>
                <div className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white">
                  ETB {clientExpense.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart 3: Expense Breakdown by Reason */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Expense Breakdown by Reason
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track exactly where money went (reasons ranked by spending)
              </p>
            </div>
          </div>
          {reasonList.length > 0 && (
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
              {reasonList.length} Unique Reasons
            </span>
          )}
        </div>

        {reasonList.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
            No expenses recorded yet. When you record an expense with a reason (e.g. "bought a phone charger", "bus fare to meeting"), it will be analyzed here.
          </div>
        ) : (
          <div className="space-y-3">
            {reasonList.map((item, idx) => (
              <div key={item.reason} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-500 shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {item.reason}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono shrink-0">
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      ETB {item.amount.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-bold text-rose-500">
                      ({item.pct}%)
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-rose-500 transition-all duration-300"
                    style={{ width: `${Math.max(5, item.pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
