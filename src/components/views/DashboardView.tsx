import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowDownRight, 
  ArrowUpRight, 
  PiggyBank, 
  Percent, 
  Scale, 
  Sparkles, 
  AlertTriangle, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  BarChart2,
  Calendar
} from 'lucide-react';
import { formatCurrency } from '../../utils/analytics';
import confetti from 'canvas-confetti';

export const DashboardView: React.FC = () => {
  const { 
    selectedMonth, 
    totalIncome, 
    totalExpenses, 
    currentBalance, 
    totalSaved, 
    savingsRate, 
    prevTotalExpenses,
    spendingChangePct,
    remainingMonthlyBudget, 
    totalMonthlyBudgetLimit,
    monthTransactions,
    categoryBreakdown,
    productMetrics,
    healthScore,
    advisorReport,
    budgets,
    savingsGoals,
    setActiveTab,
    currentMonthlySavingsTarget,
    isMonthlySavingsAchieved,
    monthlySavingsDiff
  } = useFinance();

  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  // Trigger celebratory confetti
  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b']
    });
    setShowCelebrationModal(true);
  };

  // Month title formatter
  const [year, month] = selectedMonth.split('-').map(Number);
  const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Determine top expense category
  const topCategory = categoryBreakdown[0] || { category: 'None', total: 0, percentage: 0 };

  // Calculate day-by-day cumulative spending for mini-sparkline/area
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailySpendMap = new Array(daysInMonth).fill(0);
  for (const t of monthTransactions.filter(t => !t.isIncome)) {
    const day = parseInt(t.date.split('-')[2], 10);
    if (day >= 1 && day <= daysInMonth) {
      dailySpendMap[day - 1] += t.amount;
    }
  }

  // Cumulative series
  let running = 0;
  const cumulativeSeries = dailySpendMap.map((d) => {
    running += d;
    return running;
  });
  const maxCumulative = Math.max(1, running);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Welcome & Month Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-3xl p-6 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              Personal Financial Matrix
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Good Day, Commander
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Active financial intelligence reporting for <span className="text-cyan-300 font-semibold">{monthName}</span>
          </p>
        </div>

        {/* Quick Month-Target Banner */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Monthly Target:</span>
              <span className="text-xs font-mono font-bold text-slate-200">
                {formatCurrency(currentMonthlySavingsTarget)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isMonthlySavingsAchieved ? (
                <button
                  onClick={triggerCelebration}
                  className="text-xs font-bold text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  🎉 Achieved ({formatCurrency(totalSaved)})
                </button>
              ) : (
                <span className="text-xs font-medium text-amber-400">
                  Gap: {formatCurrency(Math.abs(monthlySavingsDiff))}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 6 Key Financial Overview Cards (Requirement 2 & 21) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Total Income */}
        <div className="glass-panel-subtle rounded-2xl p-4 border border-slate-800/80 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Income</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-lg font-bold font-mono text-emerald-400">
            {formatCurrency(totalIncome)}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            {monthTransactions.filter(t => t.isIncome).length} deposits credited
          </p>
        </div>

        {/* Total Expenses */}
        <div className="glass-panel-subtle rounded-2xl p-4 border border-slate-800/80 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Expenses</span>
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-lg font-bold font-mono text-rose-400">
            {formatCurrency(totalExpenses)}
          </p>
          <div className="flex items-center gap-1 text-[10px] mt-1">
            {spendingChangePct > 0 ? (
              <span className="text-rose-400 flex items-center">
                +{spendingChangePct.toFixed(1)}% MoM
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center">
                {spendingChangePct.toFixed(1)}% MoM
              </span>
            )}
          </div>
        </div>

        {/* Current Balance */}
        <div className="glass-panel-subtle rounded-2xl p-4 border border-slate-800/80 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Current Balance</span>
            <Wallet className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-lg font-bold font-mono text-cyan-300">
            {formatCurrency(currentBalance)}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Net monthly cash balance</p>
        </div>

        {/* Total Saved */}
        <div className="glass-panel-subtle rounded-2xl p-4 border border-slate-800/80 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Saved</span>
            <PiggyBank className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-lg font-bold font-mono text-indigo-300">
            {formatCurrency(totalSaved)}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Accumulated this month</p>
        </div>

        {/* Savings Rate */}
        <div className="glass-panel-subtle rounded-2xl p-4 border border-slate-800/80 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Savings Rate</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-lg font-bold font-mono text-amber-300">
            {savingsRate.toFixed(1)}%
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Benchmark: 20.0%+</p>
        </div>

        {/* Remaining Monthly Budget */}
        <div className="glass-panel-subtle rounded-2xl p-4 border border-slate-800/80 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Remaining Budget</span>
            <Scale className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-lg font-bold font-mono text-sky-300">
            {formatCurrency(remainingMonthlyBudget)}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            of {formatCurrency(totalMonthlyBudgetLimit)} cap
          </p>
        </div>
      </div>

      {/* Secondary Month Stats Row (Requirement 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/60 text-xs">
        <div>
          <span className="text-slate-500 block">This Month's Spending:</span>
          <span className="font-mono font-semibold text-slate-200">{formatCurrency(totalExpenses)}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Previous Month's Spending:</span>
          <span className="font-mono font-semibold text-slate-200">{formatCurrency(prevTotalExpenses)}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Largest Expense Category:</span>
          <span className="font-semibold text-cyan-300">{topCategory.category} ({formatCurrency(topCategory.total)})</span>
        </div>
        <div>
          <span className="text-slate-500 block">Total Transactions:</span>
          <span className="font-mono font-semibold text-slate-200">{monthTransactions.length} items logged</span>
        </div>
      </div>

      {/* Grid: Financial Health Score (Left) + Spending Overview Chart (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FINANCIAL HEALTH SECTION (Requirement 2: transparent measurable calculation) */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Financial Health</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                healthScore.totalScore >= 80 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : healthScore.totalScore >= 60 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {healthScore.rating}
              </span>
            </div>

            {/* Score Ring Display */}
            <div className="my-5 flex items-center justify-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-slate-800"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-cyan-400 transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * healthScore.totalScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold font-mono text-white">
                    {healthScore.totalScore}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">
                    / 100 PTS
                  </span>
                </div>
              </div>
            </div>

            {/* Measurable Factor Breakdown (No fake score!) */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Budget Adherence</span>
                <span className="font-mono text-cyan-300">{healthScore.factors.budgetAdherence.score}/25</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Savings Rate Target</span>
                <span className="font-mono text-cyan-300">{healthScore.factors.savingsRate.score}/25</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Anomaly & Warning Safety</span>
                <span className="font-mono text-cyan-300">{healthScore.factors.warningIndex.score}/20</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Category Concentration</span>
                <span className="font-mono text-cyan-300">{healthScore.factors.categoryConcentration.score}/15</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Fixed vs Discretionary Ratio</span>
                <span className="font-mono text-cyan-300">{healthScore.factors.recurringExpenseRatio.score}/15</span>
              </div>
            </div>
          </div>

          <p className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 italic leading-relaxed">
            {healthScore.summary}
          </p>
        </div>

        {/* SPENDING OVERVIEW (Area / Line Curve Chart) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">Spending Velocity Curve</h3>
                <p className="text-xs text-slate-400 mt-0.5">Cumulative daily outlays through {monthName}</p>
              </div>
              <button
                onClick={() => setActiveTab('analytics')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold transition-colors"
              >
                <span>Full Analytics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Interactive SVG Area Chart */}
            <div className="mt-6 h-52 relative flex items-end">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${daysInMonth} 100`}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="25" x2={daysInMonth} y2="25" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                <line x1="0" y1="50" x2={daysInMonth} y2="50" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                <line x1="0" y1="75" x2={daysInMonth} y2="75" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />

                {/* Path Area */}
                {cumulativeSeries.length > 0 && (
                  <>
                    <polygon
                      points={`0,100 ${cumulativeSeries.map((v, i) => `${i},${100 - (v / maxCumulative) * 90}`).join(' ')} ${daysInMonth - 1},100`}
                      fill="url(#spendGradient)"
                    />
                    <polyline
                      points={cumulativeSeries.map((v, i) => `${i},${100 - (v / maxCumulative) * 90}`).join(' ')}
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="2"
                    />
                  </>
                )}
              </svg>

              {/* Day markers on axis */}
              <div className="absolute -bottom-5 w-full flex justify-between text-[9px] font-mono text-slate-500">
                <span>Day 1</span>
                <span>Day 10</span>
                <span>Day 20</span>
                <span>Day {daysInMonth}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between text-xs pt-4 border-t border-slate-800">
            <span className="text-slate-400">Daily Average: <strong className="text-white font-mono">{formatCurrency(advisorReport.dailyAverage)}</strong></span>
            <span className="text-slate-400">Projected Month-End: <strong className="text-cyan-300 font-mono">{formatCurrency(advisorReport.projectedMonthEnd)}</strong></span>
          </div>
        </div>
      </div>

      {/* Grid: Top Spending Items + Budget Status (Requirement 4 & 5 & 21) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TOP SPENDING ITEMS (Requirement 4: Product-level expense analysis) */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base">Top Spending Items (Products)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Specific items generating highest outlays</p>
            </div>
            <button
              onClick={() => setActiveTab('ai-advisor')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Analyze Items →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {productMetrics.slice(0, 4).map((item, idx) => (
              <div
                key={item.description}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/30 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-cyan-400">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{item.description}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.transactionCount} transactions • Avg {formatCurrency(item.averageAmount)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold font-mono text-white">
                    {formatCurrency(item.totalAmount)}
                  </p>
                  <p className="text-[11px] text-cyan-400 font-mono">
                    {item.percentageOfTotal.toFixed(1)}% of expenses
                  </p>
                </div>
              </div>
            ))}

            {productMetrics.length === 0 && (
              <p className="text-center py-6 text-xs text-slate-500">No product transactions recorded yet.</p>
            )}
          </div>
        </div>

        {/* BUDGET STATUS PROGRESS BARS (Requirement 5 & 21) */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base">Smart Budget Status</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time threshold monitoring</p>
            </div>
            <button
              onClick={() => setActiveTab('budgets')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Manage Budgets →
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {budgets.slice(0, 4).map((b) => {
              const spent = monthTransactions
                .filter(t => !t.isIncome && t.category === b.category)
                .reduce((s, t) => s + t.amount, 0);
              const pct = (spent / b.limitAmount) * 100;
              const isExceeded = spent > b.limitAmount;
              const isWarning = pct >= (b.warningThreshold * 100);

              let statusColor = 'bg-cyan-500';
              let badgeText = 'Normal';
              let badgeColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';

              if (isExceeded) {
                statusColor = 'bg-rose-500';
                badgeText = 'Exceeded';
                badgeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
              } else if (pct >= 90) {
                statusColor = 'bg-rose-400';
                badgeText = 'Critical';
                badgeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
              } else if (isWarning) {
                statusColor = 'bg-amber-400';
                badgeText = 'Warning';
                badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
              } else if (pct >= 70) {
                statusColor = 'bg-amber-300';
                badgeText = 'Attention';
                badgeColor = 'text-amber-300 bg-amber-500/10 border-amber-500/20';
              }

              return (
                <div key={b.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{b.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400">
                        {formatCurrency(spent)} / {formatCurrency(b.limitAmount)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                        {pct.toFixed(1)}% • {badgeText}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${statusColor}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: AI Financial Insight Preview + Savings Goals Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI FINANCIAL INSIGHT (Requirement 21) */}
        <div className="glass-panel-glow rounded-3xl p-6 border border-cyan-500/30 relative overflow-hidden">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">AI Financial Insight</h3>
          </div>

          <p className="mt-4 text-sm text-slate-200 leading-relaxed font-normal">
            "{advisorReport.executiveSummary}"
          </p>

          <div className="mt-4 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200">
            💡 <strong>Actionable Opportunity:</strong> {advisorReport.practicalActionPlan[0] || 'Keep discretionary budgets tightly bounded.'}
          </div>

          <div className="mt-5 flex items-center justify-end">
            <button
              onClick={() => setActiveTab('ai-advisor')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <span>View Full AI Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SAVINGS GOALS PREVIEW (Requirement 7 & 21) */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base">Savings Goals</h3>
              <p className="text-xs text-slate-400 mt-0.5">Progress toward capital targets</p>
            </div>
            <button
              onClick={() => setActiveTab('savings-goals')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              View All Goals →
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {savingsGoals.slice(0, 2).map((goal) => {
              const pct = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
              return (
                <div key={goal.id} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-white">{goal.name}</span>
                    <span className="font-mono text-cyan-300 font-semibold">
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{pct.toFixed(0)}% Saved</span>
                    <span>Target: {goal.targetDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Celebration Modal (Requirement 8) */}
      {showCelebrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md glass-panel-glow rounded-3xl p-8 text-center border border-cyan-500/40 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/30 mb-4 animate-bounce">
              🎉
            </div>
            <h3 className="text-2xl font-black text-white">Savings Target Achieved!</h3>
            <p className="text-sm text-cyan-300 font-semibold mt-1">
              You saved {formatCurrency(totalSaved)} this month!
            </p>

            <div className="my-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Monthly Target:</span>
                <span className="font-mono font-bold text-white">{formatCurrency(currentMonthlySavingsTarget)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Actual Savings:</span>
                <span className="font-mono font-bold text-emerald-400">{formatCurrency(totalSaved)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Achievement Rate:</span>
                <span className="font-mono font-bold text-cyan-400">
                  {((totalSaved / currentMonthlySavingsTarget) * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 italic">
              "Outstanding consistency. Your capital cushion is expanding with mathematical precision."
            </p>

            <button
              onClick={() => setShowCelebrationModal(false)}
              className="mt-6 w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/25"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
