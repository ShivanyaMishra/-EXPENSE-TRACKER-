import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  CreditCard, 
  Calendar, 
  Box, 
  ChevronRight,
  Filter,
  DollarSign,
  Activity,
  Layers
} from 'lucide-react';
import { formatCurrency, calculatePaymentMethodBreakdown } from '../../utils/analytics';
import { ExpenseCategory, PaymentMethod } from '../../types/finance';

export const AnalyticsView: React.FC = () => {
  const { 
    monthTransactions, 
    prevMonthTransactions, 
    transactions, 
    selectedMonth, 
    categoryBreakdown, 
    productMetrics,
    totalExpenses,
    advisorReport,
    setActiveTab
  } = useFinance();

  const [timeScope, setTimeScope] = useState<'month' | 'all'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const currentList = useMemo(() => {
    const list = timeScope === 'month' ? monthTransactions : transactions;
    const expenses = list.filter(t => !t.isIncome);
    if (selectedCategory !== 'ALL') {
      return expenses.filter(t => t.category === selectedCategory);
    }
    return expenses;
  }, [timeScope, monthTransactions, transactions, selectedCategory]);

  const paymentBreakdown = useMemo(() => {
    return calculatePaymentMethodBreakdown(currentList);
  }, [currentList]);

  // Daily Spending distribution for active month
  const [year, month] = selectedMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailySpending = new Array(daysInMonth).fill(0);
  currentList.forEach(t => {
    const day = parseInt(t.date.split('-')[2], 10);
    if (day >= 1 && day <= daysInMonth) {
      dailySpending[day - 1] += t.amount;
    }
  });

  const maxDaily = Math.max(1, ...dailySpending);

  // Largest transactions
  const largestTransactions = useMemo(() => {
    return [...currentList].sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [currentList]);

  // Average transaction value
  const avgTxValue = currentList.length > 0 
    ? Math.round(currentList.reduce((s, t) => s + t.amount, 0) / currentList.length) 
    : 0;

  const categoryColors: Record<string, string> = {
    'Food': '#06b6d4',
    'Transport': '#3b82f6',
    'Bills': '#8b5cf6',
    'Shopping': '#ec4899',
    'Entertainment': '#f59e0b',
    'Health': '#10b981',
    'Other': '#94a3b8',
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Analytics Header & 3D Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-3xl p-6 border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Advanced Financial Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Multi-dimensional spending velocity, payment methods, and MoM trend variance
          </p>
        </div>

        <button
          onClick={() => setActiveTab('3d-analytics')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Box className="w-4 h-4 stroke-[2.5]" />
          <span>Launch 3D Spatial Space</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel-subtle p-4 rounded-2xl border border-slate-800">
          <span className="text-slate-400 text-xs block">Average Transaction Value</span>
          <p className="text-xl font-bold font-mono text-white mt-1">
            {formatCurrency(avgTxValue)}
          </p>
          <span className="text-[11px] text-slate-400">per logged expense</span>
        </div>

        <div className="glass-panel-subtle p-4 rounded-2xl border border-slate-800">
          <span className="text-slate-400 text-xs block">Transaction Frequency</span>
          <p className="text-xl font-bold font-mono text-cyan-300 mt-1">
            {currentList.length} items
          </p>
          <span className="text-[11px] text-slate-400">across {daysInMonth} calendar days</span>
        </div>

        <div className="glass-panel-subtle p-4 rounded-2xl border border-slate-800">
          <span className="text-slate-400 text-xs block">Weekly Run-Rate</span>
          <p className="text-xl font-bold font-mono text-indigo-300 mt-1">
            {formatCurrency(advisorReport.weeklyAverage)}
          </p>
          <span className="text-[11px] text-slate-400">calculated rolling pace</span>
        </div>

        <div className="glass-panel-subtle p-4 rounded-2xl border border-slate-800">
          <span className="text-slate-400 text-xs block">Active Product Portfolio</span>
          <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {productMetrics.length} items
          </p>
          <span className="text-[11px] text-slate-400">distinct items categorized</span>
        </div>
      </div>

      {/* Daily Spending Bar Chart (Requirement 11) */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-white text-base">Daily Spending Histogram</h3>
            <p className="text-xs text-slate-400 mt-0.5">Day-by-day expense distribution for {selectedMonth}</p>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            Peak: {formatCurrency(maxDaily)}
          </span>
        </div>

        <div className="mt-6 h-48 flex items-end gap-1 sm:gap-2">
          {dailySpending.map((amt, idx) => {
            const heightPct = (amt / maxDaily) * 100;
            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center group relative h-full justify-end"
              >
                {/* Tooltip */}
                {amt > 0 && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-white whitespace-nowrap pointer-events-none z-10">
                    Day {idx + 1}: {formatCurrency(amt)}
                  </div>
                )}
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    amt > 0
                      ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 group-hover:brightness-125'
                      : 'bg-slate-800/40 h-1'
                  }`}
                  style={{ height: amt > 0 ? `${Math.max(4, heightPct)}%` : '4px' }}
                />
                <span className="text-[9px] font-mono text-slate-500 mt-2">
                  {(idx + 1) % 5 === 0 || idx === 0 ? idx + 1 : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Category Breakdown (Donut/Bars) + Payment Method Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white text-base">Category Distribution</h3>
            <span className="text-xs text-slate-400 font-mono">Total {formatCurrency(totalExpenses)}</span>
          </div>

          <div className="mt-4 space-y-3">
            {categoryBreakdown.map((c) => (
              <div key={c.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: categoryColors[c.category] || '#94a3b8' }}
                    />
                    <span className="font-semibold text-slate-200">{c.category}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-white font-bold">{formatCurrency(c.total)}</span>
                    <span className="text-slate-400 text-[11px]">({c.percentage.toFixed(1)}%)</span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${c.percentage}%`,
                      backgroundColor: categoryColors[c.category] || '#94a3b8',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods Analysis (Requirement 13) */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-base">Payment Method Analytics</h3>
            </div>
            <span className="text-xs text-slate-400">Cash vs UPI vs Cards</span>
          </div>

          <div className="mt-4 space-y-3">
            {paymentBreakdown.map((pm) => (
              <div
                key={pm.method}
                className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-white">{pm.method}</p>
                  <p className="text-[11px] text-slate-400">{pm.count} transactions processed</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-white">{formatCurrency(pm.total)}</p>
                  <p className="text-[11px] font-mono text-cyan-400">{pm.percentage.toFixed(1)}% of total</p>
                </div>
              </div>
            ))}

            {paymentBreakdown.length === 0 && (
              <p className="text-center py-6 text-xs text-slate-500">No payment data logged.</p>
            )}
          </div>
        </div>
      </div>

      {/* Largest Transactions Card (Requirement 11) */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800">
        <h3 className="font-bold text-white text-base mb-1">Largest Recorded Transactions</h3>
        <p className="text-xs text-slate-400 mb-4">Highest individual transactions requiring executive monitoring</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {largestTransactions.map((tx, idx) => (
            <div
              key={tx.id}
              className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                  #{idx + 1} High Value
                </span>
                <p className="text-xs font-bold text-white mt-0.5 truncate max-w-[150px]">
                  {tx.description}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {tx.date} • {tx.category}
                </p>
              </div>
              <span className="text-sm font-mono font-bold text-rose-400">
                {formatCurrency(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
