import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit2, 
  MessageSquare, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  ShieldAlert, 
  RotateCcw,
  User,
  Info,
  ChevronRight,
  Receipt
} from 'lucide-react';
import { formatCurrency } from '../../utils/analytics';
import { ChatMessage, ChatInsightCard } from '../../types/finance';

export const AIAssistantView: React.FC = () => {
  const { 
    chatSessions, 
    activeChatId, 
    setActiveChatId, 
    createNewChat, 
    deleteChatSession, 
    renameChatSession, 
    clearAllChats, 
    addMessageToChat, 
    userProfile, 
    selectedMonth, 
    totalIncome, 
    totalExpenses, 
    savingsRate, 
    healthScore, 
    advisorReport, 
    productMetrics, 
    categoryBreakdown, 
    budgets, 
    savingsGoals, 
    monthTransactions,
    setActiveTab
  } = useFinance();

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');
  const [showMobileHistory, setShowMobileHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeSession = chatSessions.find(s => s.id === activeChatId) || chatSessions[0];

  // Quick Action Buttons (Requirement 35)
  const quickActions = [
    'Where am I overspending?',
    'Where am I wasting money?',
    'Analyze my month',
    'How can I save more?',
    'Compare with last month',
    'Check my budgets',
    'Can I afford ₹3,000 today?',
    'Show my top expenses'
  ];

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isTyping]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || inputMessage).trim();
    if (!textToSend || isTyping || !activeSession) return;

    // Append user message
    addMessageToChat(activeSession.id, {
      role: 'user',
      content: textToSend,
    });
    setInputMessage('');
    setIsTyping(true);

    try {
      // Build structured context without sending raw private dumps (Requirement 39)
      const topP = productMetrics[0];
      const financialContext = {
        month: selectedMonth,
        totalIncome,
        totalExpenses,
        savingsRate: `${savingsRate.toFixed(1)}%`,
        healthScore: healthScore.totalScore,
        topCategory: advisorReport.highestSpendingCategory,
        topCategoryAmount: categoryBreakdown[0]?.total || 0,
        topCategoryPct: advisorReport.highestCategoryPercentage,
        topItem: topP ? topP.description : 'Food Delivery',
        topItemAmount: topP ? topP.totalAmount : 3420,
        topItemCount: topP ? topP.transactionCount : 9,
        highestExpense: advisorReport.highestIndividualExpense,
        frequentItems: advisorReport.frequentlyPurchasedItems,
        increasingCategories: advisorReport.spendingIncreasingCategories,
        decreasingCategories: advisorReport.spendingDecreasingCategories,
        anomalies: advisorReport.unusualTransactions.map(a => ({
          description: a.transaction.description,
          amount: a.transaction.amount,
          category: a.transaction.category,
          factor: a.factor
        })),
        dailyAverage: advisorReport.dailyAverage,
        projectedMonthEnd: advisorReport.projectedMonthEnd,
        budgetsStatus: budgets.map(b => {
          const spent = monthTransactions.filter(t => !t.isIncome && t.category === b.category).reduce((s, t) => s + t.amount, 0);
          return { category: b.category, limit: b.limitAmount, spent, pct: (spent / b.limitAmount) * 100 };
        })
      };

      const profileContext = {
        occupation: userProfile.occupation,
        monthlyIncome: userProfile.monthlyIncome,
        monthlySavingsTarget: userProfile.monthlySavingsTarget,
        riskPreference: userProfile.riskPreference,
        essentialCategories: userProfile.essentialCategories,
        discretionaryCategories: userProfile.discretionaryCategories,
      };

      // Query server endpoint with conversation history for multi-turn context
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          history: activeSession.messages.map(m => ({ role: m.role, content: m.content })),
          financialContext,
          profileContext,
        })
      });

      const data = await res.json();
      addMessageToChat(activeSession.id, {
        role: 'assistant',
        content: data.reply || 'Analysis completed.',
        insightCard: data.insightCard,
      });
    } catch (err) {
      console.error(err);
      addMessageToChat(activeSession.id, {
        role: 'assistant',
        content: `I analyzed your accounts locally: for ${selectedMonth}, your total expenses are ${formatCurrency(totalExpenses)}, led by ${advisorReport.highestSpendingCategory}. Trimming discretionary ${productMetrics[0]?.description || 'items'} by 25-30% recovers ~${formatCurrency(Math.round((productMetrics[0]?.totalAmount || 3000) * 0.3))}.`,
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleStartRename = (s: { id: string; title: string }) => {
    setEditingSessionId(s.id);
    setRenameText(s.title);
  };

  const handleConfirmRename = (id: string) => {
    if (renameText.trim()) {
      renameChatSession(id, renameText.trim());
    }
    setEditingSessionId(null);
  };

  return (
    <div className="h-[calc(100vh-10rem)] sm:h-[calc(100vh-9rem)] lg:h-[calc(100vh-8.5rem)] flex flex-col lg:flex-row gap-4 animate-in fade-in duration-300">
      {/* Desktop Sessions Sidebar */}
      <div className="hidden lg:flex w-64 glass-panel rounded-3xl p-4 border border-slate-800 flex-col justify-between shrink-0">
        <div>
          {/* New Chat Button */}
          <button
            onClick={() => createNewChat()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer mb-4"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Chat</span>
          </button>

          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-2 mb-2">
            Conversation History
          </div>

          {/* Session List */}
          <div className="space-y-1 max-h-[460px] overflow-y-auto">
            {chatSessions.map((s) => {
              const isActive = s.id === activeSession?.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setActiveChatId(s.id)}
                  className={`group flex items-center justify-between p-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate flex-1 mr-2">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    {editingSessionId === s.id ? (
                      <input
                        type="text"
                        value={renameText}
                        onChange={(e) => setRenameText(e.target.value)}
                        onBlur={() => handleConfirmRename(s.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleConfirmRename(s.id)}
                        autoFocus
                        className="bg-slate-900 border border-cyan-500 rounded px-1.5 py-0.5 text-xs text-white outline-none w-full"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="truncate">{s.title}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartRename(s);
                      }}
                      className="p-1 hover:text-white"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {chatSessions.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChatSession(s.id);
                        }}
                        className="p-1 hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clear All Chats */}
        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              if (window.confirm('Clear all conversation history?')) {
                clearAllChats();
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] text-slate-500 hover:text-rose-400 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Mobile Slide-over Drawer for Chat History */}
      {showMobileHistory && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={() => setShowMobileHistory(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in"
          />
          <div className="relative z-10 w-72 bg-[#090b10] border-r border-slate-800 p-4 flex flex-col justify-between h-full shadow-2xl animate-in slide-in-from-left">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Chats ({chatSessions.length})
                </span>
                <button
                  onClick={() => setShowMobileHistory(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <button
                onClick={() => {
                  createNewChat();
                  setShowMobileHistory(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs shadow-md mb-3"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Chat</span>
              </button>

              <div className="space-y-1 max-h-[60vh] overflow-y-auto">
                {chatSessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setActiveChatId(s.id);
                      setShowMobileHistory(false);
                    }}
                    className={`p-2.5 rounded-xl text-xs font-medium cursor-pointer flex items-center justify-between ${
                      s.id === activeSession?.id
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <span className="truncate">{s.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Clear all conversation history?')) {
                  clearAllChats();
                  setShowMobileHistory(false);
                }
              }}
              className="py-2 text-xs text-rose-400 border-t border-slate-800 text-center"
            >
              Clear Chat History
            </button>
          </div>
        </div>
      )}

      {/* Main Conversational Workspace */}
      <div className="flex-1 glass-panel rounded-3xl border border-slate-800 flex flex-col overflow-hidden">
        {/* Chat Topbar */}
        <div className="h-14 sm:h-16 px-4 sm:px-6 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/40">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-[140px] sm:max-w-none">
                  AetherAI Assistant
                </h2>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate max-w-[150px] sm:max-w-none">
                {selectedMonth} • {userProfile.fullName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileHistory(true)}
              className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-cyan-400 font-semibold"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chats</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>Model:</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                gemini-3.8-flash
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Suggestion Chips (Requirement 35) */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-900/30 overflow-x-auto flex gap-2 shrink-0 scrollbar-none">
          {quickActions.map((qa) => (
            <button
              key={qa}
              onClick={() => handleSend(qa)}
              disabled={isTyping}
              className="text-xs whitespace-nowrap bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {qa}
            </button>
          ))}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeSession?.messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser 
                    ? 'bg-gradient-to-tr from-cyan-500 to-indigo-600 text-slate-950 font-bold text-xs' 
                    : 'bg-slate-900 border border-slate-800 text-cyan-400'
                }`}>
                  {isUser ? 'U' : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Body */}
                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-medium rounded-tr-none shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900/80 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                  }`}>
                    {msg.content}
                  </div>

                  {/* Optional Rich AI Insight Card (Requirement 36) */}
                  {msg.insightCard && (
                    <div className="p-4 rounded-2xl glass-panel-glow border border-cyan-500/40 text-xs space-y-2.5 max-w-md animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{msg.insightCard.title}</span>
                        {msg.insightCard.trendPercentage !== undefined && (
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            msg.insightCard.trendPercentage > 0 
                              ? 'bg-rose-500/15 text-rose-300' 
                              : 'bg-emerald-500/15 text-emerald-300'
                          }`}>
                            {msg.insightCard.trendPercentage > 0 ? '+' : ''}{msg.insightCard.trendPercentage}% MoM
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {msg.insightCard.amount !== undefined && (
                          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Outlay Amount</span>
                            <span className="font-mono font-bold text-white text-sm">
                              {formatCurrency(msg.insightCard.amount)}
                            </span>
                          </div>
                        )}
                        {msg.insightCard.percentage !== undefined && (
                          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Share of Total</span>
                            <span className="font-mono font-bold text-cyan-300 text-sm">
                              {msg.insightCard.percentage.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>

                      {msg.insightCard.potentialSaving && (
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
                          💰 <strong>Potential Savings:</strong> {msg.insightCard.potentialSaving}
                        </div>
                      )}

                      <button
                        onClick={() => {
                          if (msg.insightCard?.linkTab) setActiveTab(msg.insightCard.linkTab);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-all cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>{msg.insightCard.actionText || 'View Transactions in Ledger'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <span className="text-[10px] text-slate-500 font-mono block px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 max-w-md">
              <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-cyan-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Evaluating real transaction data & formulating advice...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Console */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about your finances (e.g. 'Where am I wasting money?', 'Can I afford ₹3,000?')..."
              className="flex-1 bg-slate-900/90 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="px-5 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
