import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Budget, ExpenseCategory } from '../../types/finance';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Repeat, 
  X,
  Sparkles,
  Info
} from 'lucide-react';
import { formatCurrency } from '../../utils/analytics';

export const BudgetsView: React.FC = () => {
  const { 
    budgets, 
    monthTransactions, 
    addBudget, 
    updateBudget, 
    deleteBudget,
    selectedMonth,
    strictBudgetMode,
    setStrictBudgetMode
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [limitAmount, setLimitAmount] = useState('');
  const [warningThreshold, setWarningThreshold] = useState('80');
  const [startDate, setStartDate] = useState(`${selectedMonth}-01`);
  const [endDate, setEndDate] = useState(`${selectedMonth}-31`);
  const [rollover, setRollover] = useState(false);

  const categories: ExpenseCategory[] = [
    'Food',
    'Transport',
    'Bills',
    'Shopping',
    'Entertainment',
    'Health',
    'Investment',
    'Other'
  ];

  const handleOpenCreate = () => {
    setEditingBudget(null);
    setName('');
    setCategory('Food');
    setLimitAmount('5000');
    setWarningThreshold('80');
    setStartDate(`${selectedMonth}-01`);
    setEndDate(`${selectedMonth}-31`);
    setRollover(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Budget) => {
    setEditingBudget(b);
    setName(b.name);
    setCategory(b.category);
    setLimitAmount(String(b.limitAmount));
    setWarningThreshold(String(Math.round(b.warningThreshold * 100)));
    setStartDate(b.startDate);
    setEndDate(b.endDate);
    setRollover(Boolean(b.rollover));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(limitAmount);
    if (!name.trim() || isNaN(limit) || limit <= 0) return;

    const thresholdDecimal = (parseFloat(warningThreshold) || 80) / 100;

    if (editingBudget) {
      updateBudget(editingBudget.id, {
        name: name.trim(),
        category,
        limitAmount: limit,
        warningThreshold: thresholdDecimal,
        startDate,
        endDate,
        rollover,
      });
    } else {
      addBudget({
        name: name.trim(),
        category,
        limitAmount: limit,
        warningThreshold: thresholdDecimal,
        startDate,
        endDate,
        rollover,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-3xl p-6 border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Smart Budget System
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            5-tier progress bars, automated threshold alerts, and rollover options
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Strict Budget Toggle */}
          <button
            onClick={() => setStrictBudgetMode(!strictBudgetMode)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              strictBudgetMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Strict Budget: {strictBudgetMode ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Budget</span>
          </button>
        </div>
      </div>

      {/* Threshold Guide Card */}
      <div className="p-4 rounded-2xl glass-panel-subtle border border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
          <p className="font-bold">50%</p>
          <p className="text-[10px] text-slate-400">Normal</p>
        </div>
        <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300">
          <p className="font-bold">70%</p>
          <p className="text-[10px] text-slate-400">Attention</p>
        </div>
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <p className="font-bold">80%</p>
          <p className="text-[10px] text-slate-400">Warning</p>
        </div>
        <div className="p-2 rounded-xl bg-rose-400/10 border border-rose-400/20 text-rose-300">
          <p className="font-bold">90%</p>
          <p className="text-[10px] text-slate-400">Critical</p>
        </div>
        <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
          <p className="font-bold">100%+</p>
          <p className="text-[10px] text-slate-400">Exceeded</p>
        </div>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {budgets.map((b) => {
          const spent = monthTransactions
            .filter(t => !t.isIncome && t.category === b.category)
            .reduce((s, t) => s + t.amount, 0);
          const pct = (spent / (b.limitAmount || 1)) * 100;
          const remaining = Math.max(0, b.limitAmount - spent);
          const isExceeded = spent > b.limitAmount;
          const isWarning = pct >= (b.warningThreshold * 100);

          let statusBadge = {
            label: 'Normal',
            color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
            barColor: 'bg-cyan-400',
          };

          if (isExceeded) {
            statusBadge = {
              label: '🚨 Exceeded',
              color: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
              barColor: 'bg-rose-500',
            };
          } else if (pct >= 90) {
            statusBadge = {
              label: 'Critical',
              color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
              barColor: 'bg-rose-400',
            };
          } else if (isWarning) {
            statusBadge = {
              label: '⚠️ Warning',
              color: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
              barColor: 'bg-amber-400',
            };
          } else if (pct >= 70) {
            statusBadge = {
              label: 'Attention',
              color: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
              barColor: 'bg-amber-300',
            };
          }

          return (
            <div
              key={b.id}
              className="glass-panel rounded-3xl p-6 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">{b.name}</h3>
                      {b.rollover && (
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 flex items-center gap-1">
                          <Repeat className="w-3 h-3" /> Rollover
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Category: {b.category}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                </div>

                {/* Amount figures */}
                <div className="mt-5 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black font-mono text-white">
                      {formatCurrency(spent)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono ml-1.5">
                      / {formatCurrency(b.limitAmount)}
                    </span>
                  </div>
                  <span className="text-sm font-bold font-mono text-cyan-300">
                    {pct.toFixed(1)}%
                  </span>
                </div>

                {/* Visual Progress Bar (Requirement 5) */}
                <div className="mt-3 w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${statusBadge.barColor}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                {/* Warning message callout */}
                {isWarning && (
                  <div className={`mt-4 p-3 rounded-2xl text-xs flex items-center gap-2 border ${
                    isExceeded
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}>
                    {isExceeded ? <ShieldAlert className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                    <span>
                      {isExceeded 
                        ? `You have exceeded your ${b.category} budget by ${formatCurrency(spent - b.limitAmount)}!`
                        : `You have crossed ${Math.round(b.warningThreshold * 100)}% of your ${b.category} budget.`}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer info & actions */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Remaining: <strong className="text-slate-200 font-mono">{formatCurrency(remaining)}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete budget "${b.name}"?`)) {
                        deleteBudget(b.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md glass-panel-glow rounded-3xl p-6 shadow-2xl border border-cyan-500/30">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingBudget ? 'Edit Budget' : 'Configure New Budget'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Budget Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Food & Dining Out"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-slate-900 text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Monthly Limit (₹)
                  </label>
                  <input
                    type="number"
                    value={limitAmount}
                    onChange={(e) => setLimitAmount(e.target.value)}
                    placeholder="6000"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Warning Threshold (%)
                  </label>
                  <input
                    type="number"
                    value={warningThreshold}
                    onChange={(e) => setWarningThreshold(e.target.value)}
                    placeholder="80"
                    min="50"
                    max="100"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                    required
                  />
                </div>
              </div>

              {/* Rollover Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <p className="text-xs font-semibold text-white">Enable Rollover</p>
                  <p className="text-[11px] text-slate-400">Roll unused allowance into next month</p>
                </div>
                <input
                  type="checkbox"
                  checked={rollover}
                  onChange={(e) => setRollover(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
