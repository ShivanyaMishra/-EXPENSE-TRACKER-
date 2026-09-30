import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { 
  BrainCircuit, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Repeat, 
  ShieldAlert, 
  HelpCircle, 
  Send, 
  RefreshCw, 
  ArrowRight,
  Flame,
  CheckCircle2,
  PieChart,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '../../utils/analytics';

export const AIAdvisorView: React.FC = () => {
  const { 
    selectedMonth, 
    totalIncome, 
    totalExpenses, 
    savingsRate, 
    healthScore, 
    advisorReport, 
    productMetrics,
    categoryBreakdown,
    monthTransactions
  } = useFinance();

  // Chat console state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `Hello! I am your AetherAI financial strategist. I have analyzed your transactions for ${selectedMonth}. Ask me anything about your product expenses, budget cuts, or savings opportunities.`,
      time: 'Just now',
    }
  ]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);
  const [serverInsights, setServerInsights] = useState<{
    executiveNarrative?: string;
    habitsAnalysis?: string;
    savingsRecommendations?: string[];
  } | null>(null);

  // Suggested prompt quick clicks
  const suggestedPrompts = [
    'How much did I spend on Food Delivery vs Coffee?',
    'What is my single highest expense this month?',
    'How can I save ₹3,000 next month without extreme cuts?',
    'Analyze my recurring subscriptions and bills.',
  ];

  // Request enhanced Gemini LLM narrative via backend proxy
  const handleFetchAIEnhancedInsights = async () => {
    setIsGeneratingNarrative(true);
    try {
      const topP = productMetrics[0];
      const payload = {
        month: selectedMonth,
        totalIncome,
        totalExpenses,
        savingsRate,
        healthScore: healthScore.totalScore,
        topCategory: advisorReport.highestSpendingCategory,
        topCategoryPct: advisorReport.highestCategoryPercentage,
        topItem: topP ? topP.description : 'None',
        topItemAmount: topP ? topP.totalAmount : 0,
        topItemCount: topP ? topP.transactionCount : 0,
        highestExpense: advisorReport.highestIndividualExpense,
        frequentItems: advisorReport.frequentlyPurchasedItems,
        increasingCategories: advisorReport.spendingIncreasingCategories,
        decreasingCategories: advisorReport.spendingDecreasingCategories,
        anomalies: advisorReport.unusualTransactions.map(a => ({
          item: a.transaction.description,
          amount: a.transaction.amount,
          category: a.transaction.category,
          factor: a.factor
        })),
        dailyAverage: advisorReport.dailyAverage,
        projectedMonthEnd: advisorReport.projectedMonthEnd,
        productBreakdown: productMetrics.slice(0, 5)
      };

      const res = await fetch('/api/ai/advisor-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setServerInsights({
          executiveNarrative: data.executiveNarrative,
          habitsAnalysis: data.habitsAnalysis,
          savingsRecommendations: data.savingsRecommendations,
        });
      }
    } catch (e) {
      console.error('Failed fetching AI insights:', e);
    } finally {
      setIsGeneratingNarrative(false);
    }
  };

  // Send question to AI Chatbot grounded in financial context
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || chatInput).trim();
    if (!query || isQuerying) return;

    const userMsg = { sender: 'user' as const, text: query, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsQuerying(true);

    try {
      const financialContext = {
        month: selectedMonth,
        totalIncome,
        totalExpenses,
        savingsRate: `${savingsRate.toFixed(1)}%`,
        topCategory: advisorReport.highestSpendingCategory,
        highestExpense: advisorReport.highestIndividualExpense,
        topProducts: productMetrics.slice(0, 5),
        dailyAverage: advisorReport.dailyAverage,
        healthScore: healthScore.totalScore,
      };

      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query, financialContext })
      });
      const data = await res.json();
      const aiReply = data.reply || 'Analysis completed.';

      setChatMessages(prev => [
        ...prev,
        { sender: 'ai', text: aiReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    } catch (e) {
      setChatMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'Sorry, I encountered an issue consulting the AI server. Please verify network or API keys.', time: 'Just now' }
      ]);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="space-y-8 pb-14 animate-in fade-in duration-300">
      {/* Advisor Hero Header */}
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-cyan-500/30 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                AI Financial Strategist & Intelligence Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1.5">
              Deterministic Analytics + Generative Counsel
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Every insight is calculated with mathematical precision from your real transactions, then interpreted by Gemini AI to produce non-hallucinatory, actionable financial advice.
            </p>
          </div>

          <button
            onClick={handleFetchAIEnhancedInsights}
            disabled={isGeneratingNarrative}
            className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer whitespace-nowrap self-start lg:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isGeneratingNarrative ? 'animate-spin' : ''}`} />
            <span>{isGeneratingNarrative ? 'Consulting Gemini...' : 'Synthesize Executive Report'}</span>
          </button>
        </div>

        {/* Narrative Banner */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed">
          <p className="font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Executive Financial Brief:
          </p>
          <p>
            {serverInsights?.executiveNarrative || advisorReport.executiveSummary}
          </p>
          {serverInsights?.habitsAnalysis && (
            <p className="mt-2 text-slate-300 pt-2 border-t border-slate-800/80">
              {serverInsights.habitsAnalysis}
            </p>
          )}
        </div>
      </div>

      {/* 4 Quick Stat Callouts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel-subtle p-4 rounded-2xl border border-slate-800">
          <span className="text-slate-400 text-xs block">Highest Expense Category</span>
          <p className="text-base font-bold text-white mt-1">
            {advisorReport.highestSpendingCategory}
          </p>
          <span className="text-[11px] font-mono text-cyan-400">
            {advisorReport.highestCategoryPercentage.toFixed(1)}% of total outlays
          </span>
        </div>

        <div className="glass-panel-subtle p-4 rounded-2xl border border-slate-800">
          <span className="text-slate-400 text-xs block">Highest Individual Expense</span>
          <p className="text-base font-bold text-white mt-1 truncate">
            {advisorReport.highestIndividualExpense?.description || 'None'}
          </p>
          <span className="text-[11px] font-mono text-rose-400">
            {advisorReport.highestIndividualExpense ? formatCurrency(advisorReport.highestIndividualExpense.amount) : '₹0'}
          </span>
        </div>

        <div className="glass-panel-subtle p-4 rounded-2xl border border-slate-800">
          <span className="text-slate-400 text-xs block">Average Daily Burn Rate</span>
          <p className="text-base font-bold text-white mt-1 font-mono">
            {formatCurrency(advisorReport.dailyAverage)}
          </p>
          <span className="text-[11px] text-slate-400">
            ~{formatCurrency(advisorReport.weeklyAverage)} weekly
          </span>
        </div>

        <div className="glass-panel-subtle p-4 rounded-2xl border border-slate-800">
          <span className="text-slate-400 text-xs block">Estimated Month-End</span>
          <p className="text-base font-bold text-cyan-300 mt-1 font-mono">
            {formatCurrency(advisorReport.projectedMonthEnd)}
          </p>
          <span className="text-[11px] text-slate-400">
            based on current pace
          </span>
        </div>
      </div>

      {/* SECTION 4: PRODUCT-LEVEL EXPENSE ANALYSIS (Requirement 4) */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              Product-Level Expense Breakdown & Advice
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifies which individual products and expense descriptions are costing the most
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            {productMetrics.length} unique products tracked
          </span>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="pb-3 font-semibold">Product / Item</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold text-right">Total Spent</th>
                <th className="pb-3 font-semibold text-center">Transactions</th>
                <th className="pb-3 font-semibold text-right">Avg / Tx</th>
                <th className="pb-3 font-semibold text-right">% of Total</th>
                <th className="pb-3 font-semibold text-center">MoM Trend</th>
                <th className="pb-3 font-semibold pl-4">AI Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {productMetrics.map((p) => (
                <tr key={p.description} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 font-bold text-white">{p.description}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3.5 text-right font-mono font-bold text-slate-200">
                    {formatCurrency(p.totalAmount)}
                  </td>
                  <td className="py-3.5 text-center font-mono text-slate-300">
                    {p.transactionCount}
                  </td>
                  <td className="py-3.5 text-right font-mono text-slate-400">
                    {formatCurrency(p.averageAmount)}
                  </td>
                  <td className="py-3.5 text-right font-mono text-cyan-300 font-semibold">
                    {p.percentageOfTotal.toFixed(1)}%
                  </td>
                  <td className="py-3.5 text-center">
                    {p.trendPercentage !== undefined ? (
                      <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                        p.trendPercentage > 0 
                          ? 'text-rose-400 bg-rose-500/10' 
                          : 'text-emerald-400 bg-emerald-500/10'
                      }`}>
                        {p.trendPercentage > 0 ? '+' : ''}{p.trendPercentage.toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px]">—</span>
                    )}
                  </td>
                  <td className="py-3.5 pl-4 text-cyan-200 text-[11px] max-w-xs">
                    {p.savingTip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Anomaly Detection & Spending Pattern Shifts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* STATISTICAL ANOMALY DETECTION (Requirement 14) */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-white text-base">AI Anomaly Detection</h3>
              <p className="text-xs text-slate-400">Outliers deviating significantly from historical baselines</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {advisorReport.unusualTransactions.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                No statistical anomalies detected. All transaction sizes align with your regular baseline.
              </div>
            ) : (
              advisorReport.unusualTransactions.map((anom) => (
                <div
                  key={anom.transaction.id}
                  className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{anom.transaction.description}</span>
                    <span className="font-mono font-bold text-amber-300">
                      {formatCurrency(anom.transaction.amount)}
                    </span>
                  </div>
                  <p className="text-slate-300">
                    {anom.reason}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Date: {anom.transaction.date} • Category: {anom.transaction.category}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SPENDING PATTERNS & MOM SHIFTS */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-bold text-white text-base">Category Velocity (MoM Trends)</h3>
              <p className="text-xs text-slate-400">Categories accelerating or cooling down compared to last month</p>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {/* Increasing */}
            <div>
              <span className="text-xs font-semibold text-rose-400 flex items-center gap-1 mb-2">
                <TrendingUp className="w-3.5 h-3.5" /> Spending Increasing:
              </span>
              {advisorReport.spendingIncreasingCategories.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No significant category inflation detected.</p>
              ) : (
                <div className="space-y-2">
                  {advisorReport.spendingIncreasingCategories.map((c) => (
                    <div key={c.category} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                      <span className="text-slate-200 font-semibold">{c.category}</span>
                      <span className="font-mono font-bold text-rose-400">+{c.increasePct}% vs last month</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Decreasing */}
            <div>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mb-2">
                <TrendingDown className="w-3.5 h-3.5" /> Spending Decreasing:
              </span>
              {advisorReport.spendingDecreasingCategories.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No category decreases recorded.</p>
              ) : (
                <div className="space-y-2">
                  {advisorReport.spendingDecreasingCategories.map((c) => (
                    <div key={c.category} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                      <span className="text-slate-200 font-semibold">{c.category}</span>
                      <span className="font-mono font-bold text-emerald-400">-{c.decreasePct}% vs last month</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE AI FINANCIAL ADVISOR CHAT CONSOLE */}
      <div className="glass-panel rounded-3xl p-6 border border-cyan-500/20">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              AI
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Ask AetherAI Advisor</h3>
              <p className="text-xs text-slate-400">Query your transactions, simulate cuts, or analyze affordability</p>
            </div>
          </div>
        </div>

        {/* Suggested Prompts */}
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestedPrompts.map((p) => (
            <button
              key={p}
              onClick={() => handleSendMessage(p)}
              className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat History */}
        <div className="mt-4 h-64 overflow-y-auto space-y-3 p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80">
          {chatMessages.map((m, i) => (
            <div
              key={i}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-xl p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-cyan-500 text-slate-950 font-medium'
                    : 'bg-slate-900 border border-slate-800 text-slate-200'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">{m.time}</span>
            </div>
          ))}

          {isQuerying && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 animate-pulse p-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>AetherAI is analyzing your transaction records...</span>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="mt-3 flex gap-2"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type your financial question (e.g., 'How can I save ₹2,000 on Food this month?')..."
            className="flex-1 bg-slate-900/90 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || isQuerying}
            className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
