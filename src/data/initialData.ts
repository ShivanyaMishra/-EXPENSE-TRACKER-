import { 
  Transaction, 
  Budget, 
  SavingsGoal, 
  MonthlySavingsTarget,
  UserProfile,
  ChatSession,
  AISettings
} from '../types/finance';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // October 2026 Incomes
  {
    id: 'tx-inc-1',
    date: '2026-10-01',
    description: 'Monthly Salary Credit',
    category: 'Other',
    amount: 75000,
    paymentMethod: 'Bank Transfer',
    isIncome: true,
    notes: 'Primary monthly tech salary',
    createdAt: '2026-10-01T09:00:00Z',
  },
  {
    id: 'tx-inc-2',
    date: '2026-10-15',
    description: 'Freelance UI Design',
    category: 'Other',
    amount: 15000,
    paymentMethod: 'UPI',
    isIncome: true,
    notes: 'Consulting client project',
    createdAt: '2026-10-15T14:30:00Z',
  },

  // October 2026 - Food Delivery (9 transactions totaling ₹3,420 as in user prompt)
  { id: 'tx-fd-1', date: '2026-10-02', description: 'Food Delivery', category: 'Food', amount: 380, paymentMethod: 'UPI', notes: 'Dinner Swiggy', createdAt: '2026-10-02T20:10:00Z' },
  { id: 'tx-fd-2', date: '2026-10-04', description: 'Food Delivery', category: 'Food', amount: 420, paymentMethod: 'UPI', notes: 'Zomato lunch', createdAt: '2026-10-04T13:15:00Z' },
  { id: 'tx-fd-3', date: '2026-10-07', description: 'Food Delivery', category: 'Food', amount: 310, paymentMethod: 'Credit Card', notes: 'Late evening snacks', createdAt: '2026-10-07T22:00:00Z' },
  { id: 'tx-fd-4', date: '2026-10-10', description: 'Food Delivery', category: 'Food', amount: 490, paymentMethod: 'UPI', notes: 'Weekend pizza', createdAt: '2026-10-10T19:40:00Z' },
  { id: 'tx-fd-5', date: '2026-10-12', description: 'Food Delivery', category: 'Food', amount: 350, paymentMethod: 'UPI', notes: 'Biryani bowl', createdAt: '2026-10-12T13:30:00Z' },
  { id: 'tx-fd-6', date: '2026-10-16', description: 'Food Delivery', category: 'Food', amount: 280, paymentMethod: 'UPI', notes: 'Healthy salad box', createdAt: '2026-10-16T12:45:00Z' },
  { id: 'tx-fd-7', date: '2026-10-19', description: 'Food Delivery', category: 'Food', amount: 410, paymentMethod: 'Debit Card', notes: 'Dinner combo', createdAt: '2026-10-19T20:30:00Z' },
  { id: 'tx-fd-8', date: '2026-10-23', description: 'Food Delivery', category: 'Food', amount: 390, paymentMethod: 'UPI', notes: 'Pasta dinner', createdAt: '2026-10-23T20:00:00Z' },
  { id: 'tx-fd-9', date: '2026-10-27', description: 'Food Delivery', category: 'Food', amount: 390, paymentMethod: 'UPI', notes: 'Bao & momos', createdAt: '2026-10-27T19:15:00Z' },

  // October 2026 - Coffee (12 transactions totaling ₹1,850 as in user prompt)
  { id: 'tx-c-1', date: '2026-10-01', description: 'Coffee', category: 'Food', amount: 150, paymentMethod: 'UPI', notes: 'Morning latte', createdAt: '2026-10-01T08:30:00Z' },
  { id: 'tx-c-2', date: '2026-10-03', description: 'Coffee', category: 'Food', amount: 160, paymentMethod: 'UPI', notes: 'Espresso', createdAt: '2026-10-03T09:10:00Z' },
  { id: 'tx-c-3', date: '2026-10-05', description: 'Coffee', category: 'Food', amount: 140, paymentMethod: 'UPI', notes: 'Filter coffee', createdAt: '2026-10-05T08:45:00Z' },
  { id: 'tx-c-4', date: '2026-10-08', description: 'Coffee', category: 'Food', amount: 170, paymentMethod: 'Credit Card', notes: 'Cold brew', createdAt: '2026-10-08T15:20:00Z' },
  { id: 'tx-c-5', date: '2026-10-11', description: 'Coffee', category: 'Food', amount: 150, paymentMethod: 'UPI', notes: 'Cafe visit', createdAt: '2026-10-11T10:00:00Z' },
  { id: 'tx-c-6', date: '2026-10-13', description: 'Coffee', category: 'Food', amount: 160, paymentMethod: 'UPI', notes: 'Iced Americano', createdAt: '2026-10-13T11:00:00Z' },
  { id: 'tx-c-7', date: '2026-10-15', description: 'Coffee', category: 'Food', amount: 150, paymentMethod: 'Cash', notes: 'Cafe roasters', createdAt: '2026-10-15T09:15:00Z' },
  { id: 'tx-c-8', date: '2026-10-18', description: 'Coffee', category: 'Food', amount: 160, paymentMethod: 'UPI', notes: 'Cappuccino', createdAt: '2026-10-18T16:30:00Z' },
  { id: 'tx-c-9', date: '2026-10-21', description: 'Coffee', category: 'Food', amount: 150, paymentMethod: 'UPI', notes: 'Morning brew', createdAt: '2026-10-21T08:30:00Z' },
  { id: 'tx-c-10', date: '2026-10-24', description: 'Coffee', category: 'Food', amount: 160, paymentMethod: 'UPI', notes: 'Flat white', createdAt: '2026-10-24T10:15:00Z' },
  { id: 'tx-c-11', date: '2026-10-26', description: 'Coffee', category: 'Food', amount: 150, paymentMethod: 'Credit Card', notes: 'Cafe meeting', createdAt: '2026-10-26T14:00:00Z' },
  { id: 'tx-c-12', date: '2026-10-29', description: 'Coffee', category: 'Food', amount: 150, paymentMethod: 'UPI', notes: 'Work session cafe', createdAt: '2026-10-29T11:30:00Z' },

  // October 2026 - Uber / Cabs (8 transactions totaling ₹2,100 as in user prompt)
  { id: 'tx-u-1', date: '2026-10-02', description: 'Uber', category: 'Transport', amount: 280, paymentMethod: 'UPI', notes: 'Office commute', createdAt: '2026-10-02T09:00:00Z' },
  { id: 'tx-u-2', date: '2026-10-06', description: 'Uber', category: 'Transport', amount: 260, paymentMethod: 'UPI', notes: 'Return ride', createdAt: '2026-10-06T18:45:00Z' },
  { id: 'tx-u-3', date: '2026-10-09', description: 'Uber', category: 'Transport', amount: 240, paymentMethod: 'Credit Card', notes: 'Airport drop share', createdAt: '2026-10-09T07:15:00Z' },
  { id: 'tx-u-4', date: '2026-10-14', description: 'Uber', category: 'Transport', amount: 310, paymentMethod: 'UPI', notes: 'Rain surge ride', createdAt: '2026-10-14T19:30:00Z' },
  { id: 'tx-u-5', date: '2026-10-17', description: 'Uber', category: 'Transport', amount: 250, paymentMethod: 'UPI', notes: 'Client meeting', createdAt: '2026-10-17T11:20:00Z' },
  { id: 'tx-u-6', date: '2026-10-20', description: 'Uber', category: 'Transport', amount: 270, paymentMethod: 'UPI', notes: 'Metro connector', createdAt: '2026-10-20T08:50:00Z' },
  { id: 'tx-u-7', date: '2026-10-25', description: 'Uber', category: 'Transport', amount: 230, paymentMethod: 'Credit Card', notes: 'Weekend trip', createdAt: '2026-10-25T15:00:00Z' },
  { id: 'tx-u-8', date: '2026-10-28', description: 'Uber', category: 'Transport', amount: 260, paymentMethod: 'UPI', notes: 'Commute home', createdAt: '2026-10-28T19:00:00Z' },

  // Other October 2026 Expenses (Bills, Shopping, Entertainment, Health)
  { id: 'tx-b-1', date: '2026-10-03', description: 'Electricity & High-speed Fiber', category: 'Bills', amount: 2450, paymentMethod: 'Bank Transfer', notes: 'Monthly utility bill', createdAt: '2026-10-03T10:00:00Z' },
  { id: 'tx-b-2', date: '2026-10-05', description: 'Apartment Maintenance', category: 'Bills', amount: 3200, paymentMethod: 'Bank Transfer', notes: 'Quarterly maintenance share', createdAt: '2026-10-05T12:00:00Z' },
  { id: 'tx-s-1', date: '2026-10-12', description: 'Mechanical Keyboard & Desk Mat', category: 'Shopping', amount: 2400, paymentMethod: 'Credit Card', notes: 'Ergonomic workspace upgrade', createdAt: '2026-10-12T17:30:00Z' },
  { id: 'tx-s-2', date: '2026-10-22', description: 'Autumn Casual Apparel', category: 'Shopping', amount: 1400, paymentMethod: 'Debit Card', notes: 'Zara sale', createdAt: '2026-10-22T16:00:00Z' },
  { id: 'tx-e-1', date: '2026-10-11', description: 'IMAX Cinema Tickets & Popcorn', category: 'Entertainment', amount: 1250, paymentMethod: 'Credit Card', notes: 'Sci-fi premiere with friends', createdAt: '2026-10-11T20:30:00Z' },
  { id: 'tx-e-2', date: '2026-10-18', description: 'Cloud Streaming & Audio Subs', category: 'Entertainment', amount: 899, paymentMethod: 'Credit Card', notes: 'Spotify & Netflix Premium', createdAt: '2026-10-18T00:05:00Z' },
  { id: 'tx-h-1', date: '2026-10-09', description: 'Multivitamins & Gym Whey', category: 'Health', amount: 1650, paymentMethod: 'UPI', notes: 'Monthly fitness supplement refill', createdAt: '2026-10-09T18:00:00Z' },

  // September 2026 Historical Data (for MoM calculations, trends, anomaly baselines)
  { id: 'tx-sep-inc', date: '2026-09-01', description: 'Monthly Salary Credit', category: 'Other', amount: 75000, paymentMethod: 'Bank Transfer', isIncome: true, createdAt: '2026-09-01T09:00:00Z' },
  { id: 'tx-sep-1', date: '2026-09-03', description: 'Food Delivery', category: 'Food', amount: 2850, paymentMethod: 'UPI', notes: 'September delivery total', createdAt: '2026-09-03T12:00:00Z' },
  { id: 'tx-sep-2', date: '2026-09-05', description: 'Coffee', category: 'Food', amount: 1550, paymentMethod: 'UPI', notes: 'September cafes', createdAt: '2026-09-05T12:00:00Z' },
  { id: 'tx-sep-3', date: '2026-09-07', description: 'Uber', category: 'Transport', amount: 1950, paymentMethod: 'UPI', notes: 'September rides', createdAt: '2026-09-07T12:00:00Z' },
  { id: 'tx-sep-4', date: '2026-09-10', description: 'Electricity & High-speed Fiber', category: 'Bills', amount: 2400, paymentMethod: 'Bank Transfer', createdAt: '2026-09-10T12:00:00Z' },
  { id: 'tx-sep-5', date: '2026-09-15', description: 'Sneakers', category: 'Shopping', amount: 3200, paymentMethod: 'Credit Card', createdAt: '2026-09-15T12:00:00Z' },
  { id: 'tx-sep-6', date: '2026-09-20', description: 'Concert Passes', category: 'Entertainment', amount: 1800, paymentMethod: 'UPI', createdAt: '2026-09-20T12:00:00Z' },
  { id: 'tx-sep-7', date: '2026-09-25', description: 'Dental Checkup', category: 'Health', amount: 1200, paymentMethod: 'Credit Card', createdAt: '2026-09-25T12:00:00Z' },
];

export const INITIAL_BUDGETS: Budget[] = [
  {
    id: 'b-1',
    name: 'Food & Dining Out',
    category: 'Food',
    limitAmount: 6000,
    warningThreshold: 0.80, // 80% as in user prompt
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    rollover: true,
  },
  {
    id: 'b-2',
    name: 'Urban Commute & Cabs',
    category: 'Transport',
    limitAmount: 3000,
    warningThreshold: 0.80,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    rollover: false,
  },
  {
    id: 'b-3',
    name: 'Discretionary Shopping',
    category: 'Shopping',
    limitAmount: 4000,
    warningThreshold: 0.85,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    rollover: false,
  },
  {
    id: 'b-4',
    name: 'Fixed Utilities & Bills',
    category: 'Bills',
    limitAmount: 7000,
    warningThreshold: 0.90,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    rollover: false,
  },
  {
    id: 'b-5',
    name: 'Leisure & Entertainment',
    category: 'Entertainment',
    limitAmount: 3000,
    warningThreshold: 0.75,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    rollover: false,
  },
];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'sg-1',
    name: 'New Laptop',
    targetAmount: 80000,
    currentAmount: 32000,
    targetDate: '2027-06-30',
    category: 'Technology',
    monthlyTarget: 6000,
  },
  {
    id: 'sg-2',
    name: 'Emergency Cushion Fund',
    targetAmount: 150000,
    currentAmount: 95000,
    targetDate: '2027-12-31',
    category: 'Safety',
    monthlyTarget: 5000,
  },
  {
    id: 'sg-3',
    name: 'Japan Travel Odyssey',
    targetAmount: 120000,
    currentAmount: 48000,
    targetDate: '2027-04-15',
    category: 'Travel',
    monthlyTarget: 10000,
  },
];

export const INITIAL_SAVINGS_TARGETS: MonthlySavingsTarget[] = [
  { month: '2026-09', targetAmount: 10000 },
  { month: '2026-10', targetAmount: 10000 },
  { month: '2026-11', targetAmount: 12000 },
];

export const INITIAL_PROFILE: UserProfile = {
  fullName: 'Commander Mishra',
  avatarUrl: '',
  age: 28,
  occupation: 'Staff Software Engineer',
  monthlyIncome: 75000,
  otherIncome: 15000,
  fixedMonthlyExpenses: 18000,
  expectedMonthlySavings: 25000,
  existingSavings: 120000,
  debtLoans: 0,
  preferredCurrency: '₹',
  cityCountry: 'Bengaluru, India',
  financialPreference: 'High-Yield Wealth Accumulation & Tech Growth',
  monthlySpendingLimit: 32000,
  monthlySavingsTarget: 10000,
  preferredSavingsGoal: 'New Laptop',
  riskPreference: 'Balanced',
  essentialCategories: ['Food', 'Bills', 'Health', 'Transport'],
  discretionaryCategories: ['Shopping', 'Entertainment', 'Other'],
  recurringPayments: [
    { name: 'Apartment Maintenance', amount: 3200, frequency: 'Monthly' },
    { name: 'Electricity & Fiber Broadband', amount: 2450, frequency: 'Monthly' },
    { name: 'Streaming & Audio Subscriptions', amount: 899, frequency: 'Monthly' }
  ],
  updatedAt: '2026-10-01T00:00:00Z',
};

export const INITIAL_CHATS: ChatSession[] = [
  {
    id: 'chat-default-1',
    title: 'October Spending Review',
    createdAt: '2026-10-15T10:00:00Z',
    updatedAt: '2026-10-15T10:05:00Z',
    messages: [
      {
        id: 'msg-1',
        role: 'assistant',
        content: `Hi Commander! I'm your personal financial assistant. I have synchronized your October 2026 transactions, active category budgets, and personal profile goals.\n\nAsk me anything about your spending, savings runway, or budget limits.`,
        timestamp: '10:00 AM',
      },
      {
        id: 'msg-2',
        role: 'user',
        content: 'Where am I spending the most this month?',
        timestamp: '10:01 AM',
      },
      {
        id: 'msg-3',
        role: 'assistant',
        content: `**FACT:** Your highest spending category this month is **Food** with **₹8,690** recorded across 21 transactions.\n\n**ANALYSIS:** Food represents **38.7%** of your total monthly expenditures and is currently around **11.6%** of your monthly income (₹75,000).\n\n**ADVICE:** Within Food, your top repeated product is Food Delivery (₹3,420 across 9 orders) followed by Cafe Coffee (₹1,850 across 12 visits). Trimming Food Delivery by 30% could effortlessly return ~₹1,026 to your savings cushion.`,
        timestamp: '10:01 AM',
        insightCard: {
          title: 'Top Category Driver: Food',
          category: 'Food',
          amount: 8690,
          percentage: 38.7,
          trendPercentage: 18.2,
          potentialSaving: '₹1,026 - ₹1,500/month',
          actionText: 'View Food Transactions',
          linkTab: 'transactions',
        }
      }
    ]
  }
];

export const INITIAL_AI_SETTINGS: AISettings = {
  enabled: true,
  provider: 'gemini',
  personalizeWithProfile: true,
  tone: 'professional',
};

