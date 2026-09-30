export type PaymentMethod = 'UPI' | 'Credit Card' | 'Debit Card' | 'Cash' | 'Bank Transfer' | 'Other';

export type ExpenseCategory = 
  | 'Food' 
  | 'Transport' 
  | 'Bills' 
  | 'Shopping' 
  | 'Entertainment' 
  | 'Health' 
  | 'Investment'
  | 'Other';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string; // Product / item name e.g., 'Food Delivery', 'Coffee', 'Uber'
  category: ExpenseCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  isIncome?: boolean; // Default false (expense)
  createdAt: string;
}

export interface Budget {
  id: string;
  name: string;
  category: ExpenseCategory;
  limitAmount: number;
  warningThreshold: number; // e.g., 0.80 (80%)
  startDate: string;
  endDate: string;
  rollover?: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category?: string;
  monthlyTarget?: number;
}

export interface MonthlySavingsTarget {
  month: string; // YYYY-MM
  targetAmount: number;
}

export interface NotificationItem {
  id: string;
  type: 'budget_warning' | 'budget_exceeded' | 'spending_increased' | 'savings_achieved' | 'savings_progress' | 'unusual_transaction' | 'monthly_summary';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkTab?: string;
}

export interface ProductSpendingMetric {
  description: string;
  category: ExpenseCategory;
  totalAmount: number;
  transactionCount: number;
  averageAmount: number;
  percentageOfTotal: number;
  previousMonthAmount?: number;
  trendPercentage?: number; // e.g. +18%
  savingTip?: string;
}

export interface AnomalyDetectionResult {
  transaction: Transaction;
  categoryAverage: number;
  factor: number; // e.g., 3.5x higher
  reason: string;
}

export interface CategorySummary {
  category: ExpenseCategory;
  total: number;
  count: number;
  percentage: number;
  previousMonthTotal: number;
  trendPercentage: number;
}

export interface FinancialHealthScore {
  totalScore: number; // 0 - 100
  rating: 'Exceptional' | 'Strong' | 'Moderate' | 'At Risk' | 'Critical';
  factors: {
    budgetAdherence: { score: number; max: 25; details: string };
    savingsRate: { score: number; max: 25; details: string };
    warningIndex: { score: number; max: 20; details: string };
    categoryConcentration: { score: number; max: 15; details: string };
    recurringExpenseRatio: { score: number; max: 15; details: string };
  };
  summary: string;
}

export interface UserProfile {
  fullName: string;
  avatarUrl?: string;
  age?: number;
  occupation?: string;
  monthlyIncome: number;
  otherIncome?: number;
  fixedMonthlyExpenses?: number;
  expectedMonthlySavings?: number;
  existingSavings?: number;
  debtLoans?: number;
  preferredCurrency: string;
  cityCountry?: string;
  financialPreference?: string;
  monthlySpendingLimit?: number;
  monthlySavingsTarget?: number;
  preferredSavingsGoal?: string;
  riskPreference: 'Conservative' | 'Balanced' | 'Aggressive';
  essentialCategories: ExpenseCategory[];
  discretionaryCategories: ExpenseCategory[];
  recurringPayments?: Array<{ name: string; amount: number; frequency: string }>;
  updatedAt: string;
}

export interface ChatInsightCard {
  title: string;
  category?: string;
  amount?: number;
  percentage?: number;
  trendPercentage?: number;
  potentialSaving?: string;
  actionText?: string;
  linkTab?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  insightCard?: ChatInsightCard;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface AISettings {
  enabled: boolean;
  provider: 'gemini' | 'openai';
  personalizeWithProfile: boolean;
  tone: 'professional' | 'encouraging' | 'direct';
}

export interface AIAdvisorReport {
  highestSpendingCategory: string;
  highestCategoryPercentage: number;
  highestIndividualExpense: { description: string; amount: number; category: string; date: string } | null;
  frequentlyPurchasedItems: { description: string; count: number; total: number }[];
  recurringExpenses: { description: string; estimatedMonthly: number; frequency: string }[];
  unusualTransactions: AnomalyDetectionResult[];
  spendingIncreasingCategories: { category: string; increasePct: number }[];
  spendingDecreasingCategories: { category: string; decreasePct: number }[];
  dailyAverage: number;
  weeklyAverage: number;
  monthlyAverage: number;
  projectedMonthEnd: number;
  executiveSummary: string;
  practicalActionPlan: string[];
}
