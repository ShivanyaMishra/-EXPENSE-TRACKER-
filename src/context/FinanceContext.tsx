import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Transaction, 
  Budget, 
  SavingsGoal, 
  MonthlySavingsTarget, 
  NotificationItem, 
  ExpenseCategory, 
  PaymentMethod,
  AIAdvisorReport,
  FinancialHealthScore,
  CategorySummary,
  ProductSpendingMetric,
  UserProfile,
  ChatSession,
  ChatMessage,
  AISettings
} from '../types/finance';
import { 
  INITIAL_TRANSACTIONS, 
  INITIAL_BUDGETS, 
  INITIAL_SAVINGS_GOALS, 
  INITIAL_SAVINGS_TARGETS,
  INITIAL_PROFILE,
  INITIAL_CHATS,
  INITIAL_AI_SETTINGS
} from '../data/initialData';
import { 
  getTransactionsForMonth, 
  getPreviousMonth, 
  calculateCategoryBreakdown,
  calculateProductLevelMetrics,
  calculateFinancialHealthScore,
  generateDeterministicAdvisorReport,
  evaluateTransactionWarnings,
  detectAnomalies,
  formatCurrency
} from '../utils/analytics';

interface FinanceContextType {
  // Active state
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  savingsTargets: MonthlySavingsTarget[];
  selectedMonth: string; // 'YYYY-MM'
  setSelectedMonth: (month: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  strictBudgetMode: boolean;
  setStrictBudgetMode: (val: boolean) => void;
  notifications: NotificationItem[];
  unreadNotificationCount: number;

  // Personal Profile (Requirement 25 & 26)
  userProfile: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => void;

  // Conversational AI Assistant & Chats (Requirement 28, 29, 30, 38)
  chatSessions: ChatSession[];
  activeChatId: string;
  setActiveChatId: (id: string) => void;
  createNewChat: () => string;
  deleteChatSession: (id: string) => void;
  renameChatSession: (id: string, newTitle: string) => void;
  clearAllChats: () => void;
  addMessageToChat: (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  aiSettings: AISettings;
  updateAISettings: (settings: Partial<AISettings>) => void;

  // Selected Month Computed Metrics
  monthTransactions: Transaction[];
  prevMonthTransactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  totalSaved: number;
  savingsRate: number;
  prevTotalExpenses: number;
  spendingChangePct: number;
  remainingMonthlyBudget: number;
  totalMonthlyBudgetLimit: number;
  categoryBreakdown: CategorySummary[];
  productMetrics: ProductSpendingMetric[];
  healthScore: FinancialHealthScore;
  advisorReport: AIAdvisorReport;

  // Achievement status
  currentMonthlySavingsTarget: number;
  isMonthlySavingsAchieved: boolean;
  monthlySavingsDiff: number;

  // CRUD Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => { warning?: string; blocked?: boolean };
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  bulkDeleteTransactions: (ids: string[]) => void;
  
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;

  setMonthlySavingsTarget: (month: string, targetAmount: number) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  evaluateCandidateTransaction: (amount: number, category: ExpenseCategory) => ReturnType<typeof evaluateTransactionWarnings>;

  // Data Management (Requirement 27)
  deleteAllTransactions: () => void;
  resetBudgets: () => void;
  resetSavingsGoals: () => void;
  clearAIInsights: () => void;
  resetNotifications: () => void;
  resetAllFinancialData: () => void;
  factoryReset: () => void;
  resetToInitialData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from localStorage with safe fallback
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('aether_transactions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed reading transactions from localStorage', e);
    }
    return INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem('aether_budgets');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed reading budgets', e);
    }
    return INITIAL_BUDGETS;
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem('aether_savings_goals');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed reading savings goals', e);
    }
    return INITIAL_SAVINGS_GOALS;
  });

  const [savingsTargets, setSavingsTargets] = useState<MonthlySavingsTarget[]>(() => {
    try {
      const saved = localStorage.getItem('aether_savings_targets');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed reading savings targets', e);
    }
    return INITIAL_SAVINGS_TARGETS;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('aether_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PROFILE;
  });

  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('aether_chats');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CHATS;
  });

  const [activeChatId, setActiveChatId] = useState<string>(() => {
    return INITIAL_CHATS[0]?.id || 'chat-default-1';
  });

  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    try {
      const saved = localStorage.getItem('aether_ai_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_AI_SETTINGS;
  });

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [strictBudgetMode, setStrictBudgetMode] = useState<boolean>(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('aether_notifications');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'notif-init-1',
        type: 'budget_warning',
        title: 'Food Budget Warning',
        message: 'You have crossed 80% of your Food & Dining budget (₹5,270 / ₹6,000).',
        timestamp: '2026-10-27T19:30:00Z',
        read: false,
        linkTab: 'budgets',
      },
      {
        id: 'notif-init-2',
        type: 'unusual_transaction',
        title: 'High Single Purchase',
        message: 'Mechanical Keyboard (₹2,400) is higher than normal Shopping expenses.',
        timestamp: '2026-10-12T17:35:00Z',
        read: false,
        linkTab: 'ai-assistant',
      },
      {
        id: 'notif-init-3',
        type: 'savings_progress',
        title: 'New Laptop Goal Progress',
        message: 'You have completed 40% of your ₹80,000 goal. Keep going!',
        timestamp: '2026-10-15T09:00:00Z',
        read: true,
        linkTab: 'savings-goals',
      }
    ];
  });

  // Sync states to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aether_transactions', JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('aether_budgets', JSON.stringify(budgets));
    } catch (e) {
      console.error(e);
    }
  }, [budgets]);

  useEffect(() => {
    try {
      localStorage.setItem('aether_savings_goals', JSON.stringify(savingsGoals));
    } catch (e) {
      console.error(e);
    }
  }, [savingsGoals]);

  useEffect(() => {
    try {
      localStorage.setItem('aether_savings_targets', JSON.stringify(savingsTargets));
    } catch (e) {
      console.error(e);
    }
  }, [savingsTargets]);

  useEffect(() => {
    try {
      localStorage.setItem('aether_profile', JSON.stringify(userProfile));
    } catch (e) {
      console.error(e);
    }
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('aether_chats', JSON.stringify(chatSessions));
    } catch (e) {
      console.error(e);
    }
  }, [chatSessions]);

  useEffect(() => {
    try {
      localStorage.setItem('aether_ai_settings', JSON.stringify(aiSettings));
    } catch (e) {
      console.error(e);
    }
  }, [aiSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('aether_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  // Derived current month and previous month transactions
  const monthTransactions = useMemo(() => {
    return getTransactionsForMonth(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  const prevMonth = useMemo(() => getPreviousMonth(selectedMonth), [selectedMonth]);

  const prevMonthTransactions = useMemo(() => {
    return getTransactionsForMonth(transactions, prevMonth);
  }, [transactions, prevMonth]);

  // Total Income & Expenses
  const totalIncome = useMemo(() => {
    return monthTransactions
      .filter(t => t.isIncome)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const totalExpenses = useMemo(() => {
    return monthTransactions
      .filter(t => !t.isIncome)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const prevTotalExpenses = useMemo(() => {
    return prevMonthTransactions
      .filter(t => !t.isIncome)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [prevMonthTransactions]);

  const spendingChangePct = useMemo(() => {
    if (prevTotalExpenses === 0) return totalExpenses > 0 ? 100 : 0;
    return ((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100;
  }, [totalExpenses, prevTotalExpenses]);

  const currentBalance = totalIncome - totalExpenses;
  const totalSaved = Math.max(0, currentBalance);
  const savingsRate = totalIncome > 0 ? (totalSaved / totalIncome) * 100 : 0;

  // Monthly Budget limit & Remaining
  const totalMonthlyBudgetLimit = useMemo(() => {
    return budgets.reduce((sum, b) => sum + b.limitAmount, 0);
  }, [budgets]);

  const remainingMonthlyBudget = Math.max(0, totalMonthlyBudgetLimit - totalExpenses);

  // Category Breakdown
  const categoryBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(monthTransactions, prevMonthTransactions);
  }, [monthTransactions, prevMonthTransactions]);

  // Product metrics
  const productMetrics = useMemo(() => {
    return calculateProductLevelMetrics(monthTransactions, prevMonthTransactions);
  }, [monthTransactions, prevMonthTransactions]);

  // Financial Health Score
  const healthScore = useMemo(() => {
    return calculateFinancialHealthScore(totalIncome, totalExpenses, budgets, monthTransactions);
  }, [totalIncome, totalExpenses, budgets, monthTransactions]);

  // Deterministic AI Report
  const advisorReport = useMemo(() => {
    return generateDeterministicAdvisorReport(monthTransactions, prevMonthTransactions, transactions, selectedMonth);
  }, [monthTransactions, prevMonthTransactions, transactions, selectedMonth]);

  // Monthly savings achievement
  const currentMonthlySavingsTarget = useMemo(() => {
    const found = savingsTargets.find(st => st.month === selectedMonth);
    return found ? found.targetAmount : (userProfile.monthlySavingsTarget || 10000);
  }, [savingsTargets, selectedMonth, userProfile.monthlySavingsTarget]);

  const isMonthlySavingsAchieved = totalSaved >= currentMonthlySavingsTarget;
  const monthlySavingsDiff = totalSaved - currentMonthlySavingsTarget;

  // Evaluator function for forms
  const evaluateCandidateTransaction = (amount: number, category: ExpenseCategory) => {
    return evaluateTransactionWarnings(amount, category, monthTransactions, budgets, transactions);
  };

  // Notification helper
  const pushNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Transaction CRUD
  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>): { warning?: string; blocked?: boolean } => {
    if (!txData.isIncome) {
      const evalResult = evaluateCandidateTransaction(txData.amount, txData.category);
      if (evalResult.isExceeded) {
        pushNotification({
          type: 'budget_exceeded',
          title: `🚨 ${txData.category} Budget Exceeded`,
          message: evalResult.warningMessage,
          linkTab: 'budgets',
        });

        if (strictBudgetMode) {
          return {
            warning: evalResult.warningMessage,
            blocked: true,
          };
        }
      } else if (evalResult.hasWarning) {
        pushNotification({
          type: 'budget_warning',
          title: `⚠️ ${txData.category} Spending Warning`,
          message: evalResult.warningMessage,
          linkTab: 'budgets',
        });
      }
    }

    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [newTx, ...prev]);
    return {};
  };

  const updateTransaction = (id: string, updatedFields: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updatedFields } : t));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const bulkDeleteTransactions = (ids: string[]) => {
    const idSet = new Set(ids);
    setTransactions(prev => prev.filter(t => !idSet.has(t.id)));
  };

  // Budgets CRUD
  const addBudget = (bData: Omit<Budget, 'id'>) => {
    const newBudget: Budget = { ...bData, id: `b-${Date.now()}` };
    setBudgets(prev => [...prev, newBudget]);
  };

  const updateBudget = (id: string, fields: Partial<Budget>) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...fields } : b));
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  // Savings Goals CRUD
  const addSavingsGoal = (gData: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = { ...gData, id: `sg-${Date.now()}` };
    setSavingsGoals(prev => [...prev, newGoal]);
  };

  const updateSavingsGoal = (id: string, fields: Partial<SavingsGoal>) => {
    setSavingsGoals(prev => prev.map(g => g.id === id ? { ...g, ...fields } : g));
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== id));
  };

  const contributeToGoal = (id: string, amount: number) => {
    setSavingsGoals(prev => prev.map(g => {
      if (g.id === id) {
        const nextAmount = g.currentAmount + amount;
        if (nextAmount >= g.targetAmount && g.currentAmount < g.targetAmount) {
          pushNotification({
            type: 'savings_achieved',
            title: `🎉 Savings Goal Reached!`,
            message: `Congratulations! You successfully completed your goal: "${g.name}" with ${formatCurrency(nextAmount)} saved!`,
            linkTab: 'savings-goals',
          });
        }
        return { ...g, currentAmount: nextAmount };
      }
      return g;
    }));
  };

  const setMonthlySavingsTarget = (month: string, targetAmount: number) => {
    setSavingsTargets(prev => {
      const idx = prev.findIndex(st => st.month === month);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { month, targetAmount };
        return updated;
      }
      return [...prev, { month, targetAmount }];
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Profile operations
  const updateProfile = (profileFields: Partial<UserProfile>) => {
    setUserProfile(prev => ({
      ...prev,
      ...profileFields,
      updatedAt: new Date().toISOString(),
    }));
  };

  // Chat management
  const createNewChat = () => {
    const newSession: ChatSession = {
      id: `chat-${Date.now()}`,
      title: 'New Financial Query',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `Hi ${userProfile.fullName.split(' ')[0] || 'there'}! I'm your AetherAI financial assistant. Ask me anything about your expenses, budgets, savings goals, or where to trim spending.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]
    };
    setChatSessions(prev => [newSession, ...prev]);
    setActiveChatId(newSession.id);
    return newSession.id;
  };

  const deleteChatSession = (id: string) => {
    setChatSessions(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (activeChatId === id && filtered.length > 0) {
        setActiveChatId(filtered[0].id);
      }
      return filtered;
    });
  };

  const renameChatSession = (id: string, newTitle: string) => {
    setChatSessions(prev => prev.map(c => c.id === id ? { ...c, title: newTitle, updatedAt: new Date().toISOString() } : c));
  };

  const clearAllChats = () => {
    const freshSession: ChatSession = {
      id: `chat-${Date.now()}`,
      title: 'General Consultation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `Chat history cleared. How can I assist with your finances today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]
    };
    setChatSessions([freshSession]);
    setActiveChatId(freshSession.id);
  };

  const addMessageToChat = (sessionId: string, msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        // Auto-generate a title if it's the first user question
        let updatedTitle = s.title;
        if (s.messages.length <= 1 && msg.role === 'user') {
          updatedTitle = msg.content.slice(0, 28) + (msg.content.length > 28 ? '...' : '');
        }
        return {
          ...s,
          title: updatedTitle,
          updatedAt: new Date().toISOString(),
          messages: [...s.messages, newMsg]
        };
      }
      return s;
    }));
  };

  const updateAISettings = (newSettings: Partial<AISettings>) => {
    setAiSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Data Management operations (Section 27)
  const deleteAllTransactions = () => {
    setTransactions([]);
    localStorage.removeItem('aether_transactions');
    pushNotification({
      type: 'monthly_summary',
      title: 'Ledger Cleared',
      message: 'All transaction history has been deleted.',
    });
  };

  const resetBudgets = () => {
    setBudgets(INITIAL_BUDGETS);
    localStorage.setItem('aether_budgets', JSON.stringify(INITIAL_BUDGETS));
  };

  const resetSavingsGoals = () => {
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    localStorage.setItem('aether_savings_goals', JSON.stringify(INITIAL_SAVINGS_GOALS));
  };

  const clearAIInsights = () => {
    clearAllChats();
  };

  const resetNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('aether_notifications');
  };

  const resetAllFinancialData = () => {
    // Resets transactions, budgets, goals, targets, notifications, chats
    // IMPORTANT: DOES NOT delete the user's profile! (Requirement 27)
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setSavingsTargets(INITIAL_SAVINGS_TARGETS);
    clearAllChats();
    setNotifications([]);
    setSelectedMonth('2026-10');
    localStorage.removeItem('aether_transactions');
    localStorage.removeItem('aether_budgets');
    localStorage.removeItem('aether_savings_goals');
    localStorage.removeItem('aether_savings_targets');
    localStorage.removeItem('aether_notifications');
    localStorage.removeItem('aether_chats');
  };

  const factoryReset = () => {
    // Complete hard reset: includes resetting profile to default (Requirement 27)
    resetAllFinancialData();
    setUserProfile(INITIAL_PROFILE);
    setAiSettings(INITIAL_AI_SETTINGS);
    setStrictBudgetMode(false);
    localStorage.clear();
  };

  const resetToInitialData = () => {
    resetAllFinancialData();
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        savingsGoals,
        savingsTargets,
        selectedMonth,
        setSelectedMonth,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        strictBudgetMode,
        setStrictBudgetMode,
        notifications,
        unreadNotificationCount,

        userProfile,
        updateProfile,

        chatSessions,
        activeChatId,
        setActiveChatId,
        createNewChat,
        deleteChatSession,
        renameChatSession,
        clearAllChats,
        addMessageToChat,
        aiSettings,
        updateAISettings,

        monthTransactions,
        prevMonthTransactions,
        totalIncome,
        totalExpenses,
        currentBalance,
        totalSaved,
        savingsRate,
        prevTotalExpenses,
        spendingChangePct,
        remainingMonthlyBudget,
        totalMonthlyBudgetLimit,
        categoryBreakdown,
        productMetrics,
        healthScore,
        advisorReport,

        currentMonthlySavingsTarget,
        isMonthlySavingsAchieved,
        monthlySavingsDiff,

        addTransaction,
        updateTransaction,
        deleteTransaction,
        bulkDeleteTransactions,

        addBudget,
        updateBudget,
        deleteBudget,

        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        contributeToGoal,

        setMonthlySavingsTarget,
        markNotificationAsRead,
        clearAllNotifications,
        evaluateCandidateTransaction,

        deleteAllTransactions,
        resetBudgets,
        resetSavingsGoals,
        clearAIInsights,
        resetNotifications,
        resetAllFinancialData,
        factoryReset,
        resetToInitialData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}

