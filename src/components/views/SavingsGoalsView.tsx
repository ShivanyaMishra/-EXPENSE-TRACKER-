import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types/finance';
import { 
  Target, 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles, 
  PiggyBank, 
  X, 
  Calendar, 
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Award
} from 'lucide-react';
import { formatCurrency } from '../../utils/analytics';
import confetti from 'canvas-confetti';

export const SavingsGoalsView: React.FC = () => {
  const { 
    savingsGoals, 
    addSavingsGoal, 
    updateSavingsGoal, 
    deleteSavingsGoal, 
    contributeToGoal,
    selectedMonth,
    totalSaved,
    currentMonthlySavingsTarget,
    setMonthlySavingsTarget,
    isMonthlySavingsAchieved,
    monthlySavingsDiff,
    savingsRate
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2027-06-30');
  const [monthlyTargetInput, setMonthlyTargetInput] = useState('');
  const [editingMonthlyTarget, setEditingMonthlyTarget] = useState(false);
  const [newMonthlyTargetVal, setNewMonthlyTargetVal] = useState(String(currentMonthlySavingsTarget));

  const handleOpenCreate = () => {
    setEditingGoal(null);
    setName('');
    setTargetAmount('50000');
    setCurrentAmount('10000');
    setTargetDate('2027-06-30');
    setMonthlyTargetInput('5000');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (g: SavingsGoal) => {
    setEditingGoal(g);
    setName(g.name);
    setTargetAmount(String(g.targetAmount));
    setCurrentAmount(String(g.currentAmount));
    setTargetDate(g.targetDate);
    setMonthlyTargetInput(String(g.monthlyTarget || Math.round((g.targetAmount - g.currentAmount) / 6)));
    setIsModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount) || 0;
    const monthly = parseFloat(monthlyTargetInput) || undefined;

    if (!name.trim() || isNaN(target) || target <= 0) return;

    if (editingGoal) {
      updateSavingsGoal(editingGoal.id, {
        name: name.trim(),
        targetAmount: target,
        currentAmount: current,
        targetDate,
        monthlyTarget: monthly,
      });
    } else {
      addSavingsGoal({
        name: name.trim(),
        targetAmount: target,
        currentAmount: current,
        targetDate,
        monthlyTarget: monthly,
      });
    }
    setIsModalOpen(false);
  };

  const handleContributeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeGoalId) return;
    const amt = parseFloat(contributeAmount);
    if (!isNaN(amt) && amt > 0) {
      contributeToGoal(contributeGoalId, amt);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      setContributeGoalId(null);
      setContributeAmount('');
    }
  };

  const handleSaveMonthlyTarget = () => {
    const val = parseFloat(newMonthlyTargetVal);
    if (!isNaN(val) && val > 0) {
      setMonthlySavingsTarget(selectedMonth, val);
      setEditingMonthlyTarget(false);
    }
  };

  // Month title formatter
  const [year, month] = selectedMonth.split('-').map(Number);
  const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* SECTION 8: SAVINGS APPRECIATION / ACHIEVEMENT SYSTEM */}
      <div className={`rounded-3xl p-6 sm:p-8 border transition-all ${
        isMonthlySavingsAchieved
          ? 'glass-panel-glow border-emerald-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30'
          : 'glass-panel border-slate-800'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Award className={`w-5 h-5 ${isMonthlySavingsAchieved ? 'text-emerald-400' : 'text-cyan-400'}`} />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Monthly Savings Achievement Matrix • {monthName}
              </span>
            </div>

            <h2 className="text-2xl font-black text-white mt-1">
              {isMonthlySavingsAchieved ? '🎉 Savings Goal Achieved!' : 'Monthly Capital Retention'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed max-w-xl">
              {isMonthlySavingsAchieved
                ? `You saved ${formatCurrency(totalSaved)} this month against your target of ${formatCurrency(currentMonthlySavingsTarget)} (Achievement: ${((totalSaved / currentMonthlySavingsTarget) * 100).toFixed(0)}%). Excellent consistency.`
                : `Target not reached yet for ${monthName}. Saved: ${formatCurrency(totalSaved)} of ${formatCurrency(currentMonthlySavingsTarget)}. Keep discipline—small daily habit adjustments recover this difference.`}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left min-w-[130px]">
              <span className="text-[11px] text-slate-400 block">Monthly Target</span>
              {editingMonthlyTarget ? (
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    value={newMonthlyTargetVal}
                    onChange={(e) => setNewMonthlyTargetVal(e.target.value)}
                    className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-white font-mono"
                  />
                  <button
                    onClick={handleSaveMonthlyTarget}
                    className="px-2 py-0.5 bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-base font-bold font-mono text-white">
                    {formatCurrency(currentMonthlySavingsTarget)}
                  </span>
                  <button
                    onClick={() => setEditingMonthlyTarget(true)}
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left min-w-[130px]">
              <span className="text-[11px] text-slate-400 block">Actual Savings</span>
              <span className="text-base font-bold font-mono text-emerald-400 mt-0.5 block">
                {formatCurrency(totalSaved)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left min-w-[120px]">
              <span className="text-[11px] text-slate-400 block">Savings Rate</span>
              <span className="text-base font-bold font-mono text-cyan-300 mt-0.5 block">
                {savingsRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* AI Suggestions for Next Month if missed */}
        {!isMonthlySavingsAchieved && (
          <div className="mt-5 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> AI Suggestions for Next Month:
            </span>
            <p>
              Target gap: <strong className="text-amber-400">{formatCurrency(Math.abs(monthlySavingsDiff))}</strong>.
              Review your top repeated expenses (such as dining and delivery). Reducing them by 25% recovers ~{formatCurrency(Math.abs(monthlySavingsDiff) * 0.6)} effortlessly without impacting fixed essentials.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 7: SAVINGS GOALS SYSTEM */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Long-Term Capital Goals
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Specific target funds with AI-computed monthly savings runways
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Goal</span>
          </button>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savingsGoals.map((g) => {
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);
            const pct = Math.min(100, (g.currentAmount / (g.targetAmount || 1)) * 100);
            
            // Calculate months remaining to target date
            const today = new Date();
            const targetD = new Date(g.targetDate);
            const diffMonths = Math.max(1, (targetD.getFullYear() - today.getFullYear()) * 12 + (targetD.getMonth() - today.getMonth()));
            const recommendedMonthly = Math.round(remaining / diffMonths);

            return (
              <div
                key={g.id}
                className="glass-panel rounded-3xl p-6 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white text-base">{g.name}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Target Date: {g.targetDate}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                      {pct.toFixed(0)}%
                    </span>
                  </div>

                  {/* Amounts */}
                  <div className="mt-5 flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-black font-mono text-white">
                        {formatCurrency(g.currentAmount)}
                      </span>
                      <span className="text-xs font-mono text-slate-400 ml-1">
                        / {formatCurrency(g.targetAmount)}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      Left: {formatCurrency(remaining)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* AI Guidance Callout (Requirement 7) */}
                  <div className="mt-4 p-3 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-slate-300">
                    <p className="flex items-center gap-1 font-semibold text-cyan-300">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> AI Guidance:
                    </p>
                    <p className="mt-0.5">
                      To reach your goal by {new Date(g.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}, you need to save approximately <strong className="text-white font-mono">{formatCurrency(recommendedMonthly)}/month</strong>.
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setContributeGoalId(g.id);
                      setContributeAmount('2000');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-colors"
                  >
                    <PiggyBank className="w-3.5 h-3.5" />
                    <span>Contribute ₹</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(g)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete savings goal "${g.name}"?`)) {
                          deleteSavingsGoal(g.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contribute Modal */}
      {contributeGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm glass-panel-glow rounded-3xl p-6 shadow-2xl border border-cyan-500/30">
            <h3 className="text-base font-bold text-white">Contribute to Savings Goal</h3>
            <p className="text-xs text-slate-400 mt-1">Allocate surplus cash directly to this fund</p>

            <form onSubmit={handleContributeSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Contribution Amount (₹)
                </label>
                <input
                  type="number"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  placeholder="2000"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-sm text-white font-mono outline-none"
                  autoFocus
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setContributeGoalId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
                >
                  Confirm Contribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md glass-panel-glow rounded-3xl p-6 shadow-2xl border border-cyan-500/30">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., New Laptop, Emergency Fund"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Target Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="80000"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Currently Saved (₹)
                  </label>
                  <input
                    type="number"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="32000"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  required
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
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
