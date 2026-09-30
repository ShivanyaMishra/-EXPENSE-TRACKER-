import { 
  Transaction, 
  Budget, 
  ExpenseCategory, 
  ProductSpendingMetric, 
  CategorySummary, 
  AnomalyDetectionResult, 
  FinancialHealthScore,
  AIAdvisorReport,
  PaymentMethod
} from '../types/finance';

/**
 * Filter transactions by month string 'YYYY-MM'
 */
export function getTransactionsForMonth(transactions: Transaction[], yearMonth: string): Transaction[] {
  return transactions.filter(t => t.date.startsWith(yearMonth));
}

/**
 * Format currency amount with Rupee symbol and commas
 */
export function formatCurrency(amount: number): string {
  return `₹${Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Get previous month string 'YYYY-MM' from 'YYYY-MM'
 */
export function getPreviousMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  const prevDate = new Date(year, month - 2, 1);
  const y = prevDate.getFullYear();
  const m = String(prevDate.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Get next month string 'YYYY-MM' from 'YYYY-MM'
 */
export function getNextMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  const nextDate = new Date(year, month, 1);
  const y = nextDate.getFullYear();
  const m = String(nextDate.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Compute Product-Level Expense Analysis (Requirement 4)
 */
export function calculateProductLevelMetrics(
  currentTransactions: Transaction[],
  previousTransactions: Transaction[] = []
): ProductSpendingMetric[] {
  const expenseCurrent = currentTransactions.filter(t => !t.isIncome);
  const totalExpense = expenseCurrent.reduce((acc, t) => acc + t.amount, 0);

  // Group by trimmed, lowercase product description
  const groups = new Map<string, {
    canonicalName: string;
    category: ExpenseCategory;
    totalAmount: number;
    count: number;
  }>();

  for (const t of expenseCurrent) {
    const key = t.description.trim().toLowerCase();
    const existing = groups.get(key);
    if (existing) {
      existing.totalAmount += t.amount;
      existing.count += 1;
    } else {
      groups.set(key, {
        canonicalName: t.description.trim(),
        category: t.category,
        totalAmount: t.amount,
        count: 1,
      });
    }
  }

  // Previous month grouped for MoM trend
  const prevGroups = new Map<string, number>();
  for (const t of previousTransactions.filter(t => !t.isIncome)) {
    const key = t.description.trim().toLowerCase();
    prevGroups.set(key, (prevGroups.get(key) || 0) + t.amount);
  }

  const result: ProductSpendingMetric[] = [];

  for (const [, item] of groups.entries()) {
    const key = item.canonicalName.toLowerCase();
    const prevAmount = prevGroups.get(key);
    let trendPercentage: number | undefined = undefined;
    if (prevAmount && prevAmount > 0) {
      trendPercentage = ((item.totalAmount - prevAmount) / prevAmount) * 100;
    }

    const percentageOfTotal = totalExpense > 0 ? (item.totalAmount / totalExpense) * 100 : 0;
    const averageAmount = item.count > 0 ? item.totalAmount / item.count : item.totalAmount;
    
    // Generate deterministic saving tip
    const save30 = Math.round(item.totalAmount * 0.3);
    const savingTip = item.count > 2 
      ? `Reducing this by 30% could save approximately ₹${save30.toLocaleString('en-IN')} this month.`
      : `High single purchase; review if this can be spread or negotiated.`;

    result.push({
      description: item.canonicalName,
      category: item.category,
      totalAmount: item.totalAmount,
      transactionCount: item.count,
      averageAmount,
      percentageOfTotal,
      previousMonthAmount: prevAmount,
      trendPercentage,
      savingTip,
    });
  }

  // Sort descending by total spent
  return result.sort((a, b) => b.totalAmount - a.totalAmount);
}

/**
 * Category Summary calculation
 */
export function calculateCategoryBreakdown(
  currentTransactions: Transaction[],
  previousTransactions: Transaction[] = []
): CategorySummary[] {
  const expenseCurrent = currentTransactions.filter(t => !t.isIncome);
  const totalExpense = expenseCurrent.reduce((acc, t) => acc + t.amount, 0);

  const categories: ExpenseCategory[] = [
    'Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Investment', 'Other'
  ];

  const currentMap = new Map<ExpenseCategory, { total: number; count: number }>();
  for (const c of categories) {
    currentMap.set(c, { total: 0, count: 0 });
  }

  for (const t of expenseCurrent) {
    const curr = currentMap.get(t.category) || { total: 0, count: 0 };
    curr.total += t.amount;
    curr.count += 1;
    currentMap.set(t.category, curr);
  }

  const prevMap = new Map<ExpenseCategory, number>();
  for (const t of previousTransactions.filter(t => !t.isIncome)) {
    prevMap.set(t.category, (prevMap.get(t.category) || 0) + t.amount);
  }

  const summaries: CategorySummary[] = [];

  for (const c of categories) {
    const data = currentMap.get(c)!;
    if (data.count === 0 && (!prevMap.has(c) || prevMap.get(c) === 0)) {
      continue; // Skip categories with zero activity
    }

    const prevTotal = prevMap.get(c) || 0;
    let trend = 0;
    if (prevTotal > 0) {
      trend = ((data.total - prevTotal) / prevTotal) * 100;
    } else if (data.total > 0) {
      trend = 100;
    }

    summaries.push({
      category: c,
      total: data.total,
      count: data.count,
      percentage: totalExpense > 0 ? (data.total / totalExpense) * 100 : 0,
      previousMonthTotal: prevTotal,
      trendPercentage: trend,
    });
  }

  return summaries.sort((a, b) => b.total - a.total);
}

/**
 * Detect spending anomalies statistically (Requirement 14)
 */
export function detectAnomalies(allTransactions: Transaction[], monthTransactions: Transaction[]): AnomalyDetectionResult[] {
  const expenses = allTransactions.filter(t => !t.isIncome);
  const categoryStats = new Map<ExpenseCategory, { amounts: number[] }>();

  for (const t of expenses) {
    if (!categoryStats.has(t.category)) {
      categoryStats.set(t.category, { amounts: [] });
    }
    categoryStats.get(t.category)!.amounts.push(t.amount);
  }

  const anomalies: AnomalyDetectionResult[] = [];
  const currentExpenses = monthTransactions.filter(t => !t.isIncome);

  for (const t of currentExpenses) {
    const stats = categoryStats.get(t.category);
    if (!stats || stats.amounts.length < 3) continue;

    // Calculate mean and standard deviation
    const sum = stats.amounts.reduce((a, b) => a + b, 0);
    const mean = sum / stats.amounts.length;
    const variance = stats.amounts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / stats.amounts.length;
    const stdDev = Math.sqrt(variance);

    // If transaction is unusually high: factor >= 2.3x mean and > mean + 1.8 * stdDev
    if (t.amount > 1000 && t.amount >= mean * 2.2 && t.amount > mean + 1.8 * stdDev) {
      const factor = Number((t.amount / (mean || 1)).toFixed(1));
      anomalies.push({
        transaction: t,
        categoryAverage: Math.round(mean),
        factor,
        reason: `${formatCurrency(t.amount)} is ${factor}x higher than your typical ${t.category} average of ${formatCurrency(mean)}.`,
      });
    }
  }

  return anomalies.sort((a, b) => b.transaction.amount - a.transaction.amount);
}

/**
 * Real-time warning check for a candidate transaction (Requirement 6)
 */
export function evaluateTransactionWarnings(
  candidateAmount: number,
  candidateCategory: ExpenseCategory,
  currentMonthTransactions: Transaction[],
  budgets: Budget[],
  historyTransactions: Transaction[] = []
): {
  hasWarning: boolean;
  isExceeded: boolean;
  warningMessage: string;
  projectedSpending: number;
  limitAmount: number;
  percentage: number;
} {
  const categoryBudget = budgets.find(b => b.category === candidateCategory);
  
  // Current category spending this month
  const currentCategorySpent = currentMonthTransactions
    .filter(t => !t.isIncome && t.category === candidateCategory)
    .reduce((sum, t) => sum + t.amount, 0);

  const projectedSpending = currentCategorySpent + candidateAmount;

  if (categoryBudget) {
    const limit = categoryBudget.limitAmount;
    const thresholdPct = categoryBudget.warningThreshold * 100;
    const projectedPct = (projectedSpending / limit) * 100;

    if (projectedSpending > limit) {
      const excess = projectedSpending - limit;
      return {
        hasWarning: true,
        isExceeded: true,
        warningMessage: `🚨 Budget Exceeded: This transaction will push your ${candidateCategory} spending ${formatCurrency(excess)} above your monthly limit of ${formatCurrency(limit)}.`,
        projectedSpending,
        limitAmount: limit,
        percentage: projectedPct,
      };
    }

    if (projectedPct >= thresholdPct) {
      return {
        hasWarning: true,
        isExceeded: false,
        warningMessage: `⚠️ Spending Warning: This transaction will take your ${candidateCategory} spending to ${projectedPct.toFixed(1)}% of your monthly budget (${formatCurrency(projectedSpending)} / ${formatCurrency(limit)}). Consider reviewing this expense.`,
        projectedSpending,
        limitAmount: limit,
        percentage: projectedPct,
      };
    }
  }

  // Also check against historical category average if no budget or within budget
  const categoryHistory = historyTransactions.filter(t => !t.isIncome && t.category === candidateCategory);
  if (categoryHistory.length >= 4) {
    const histAvg = categoryHistory.reduce((acc, t) => acc + t.amount, 0) / categoryHistory.length;
    if (candidateAmount >= histAvg * 3 && candidateAmount > 2000) {
      return {
        hasWarning: true,
        isExceeded: false,
        warningMessage: `⚠️ Unusual Expense Pattern: ${formatCurrency(candidateAmount)} is significantly higher than your typical ${candidateCategory} transactions (historical average ${formatCurrency(histAvg)}).`,
        projectedSpending,
        limitAmount: 0,
        percentage: 0,
      };
    }
  }

  return {
    hasWarning: false,
    isExceeded: false,
    warningMessage: '',
    projectedSpending,
    limitAmount: categoryBudget ? categoryBudget.limitAmount : 0,
    percentage: categoryBudget ? (projectedSpending / categoryBudget.limitAmount) * 100 : 0,
  };
}

/**
 * Measurable Financial Health Score Calculation (Requirement 2)
 * Based strictly on real mathematical criteria:
 * - Budget adherence (max 25 pts)
 * - Savings rate (max 25 pts)
 * - Warning/overage penalties (max 20 pts)
 * - Category concentration risk (max 15 pts)
 * - Recurring commitments ratio (max 15 pts)
 */
export function calculateFinancialHealthScore(
  income: number,
  expenses: number,
  budgets: Budget[],
  monthTransactions: Transaction[]
): FinancialHealthScore {
  // 1. Budget adherence (0 - 25)
  let budgetScore = 25;
  let budgetDetails = 'All category budgets within safe thresholds.';
  
  if (budgets.length > 0) {
    let exceededCount = 0;
    let warningCount = 0;
    for (const b of budgets) {
      const spent = monthTransactions
        .filter(t => !t.isIncome && t.category === b.category)
        .reduce((sum, t) => sum + t.amount, 0);
      const ratio = spent / b.limitAmount;
      if (ratio > 1.0) exceededCount++;
      else if (ratio >= b.warningThreshold) warningCount++;
    }

    if (exceededCount > 0) {
      budgetScore = Math.max(5, 25 - exceededCount * 8 - warningCount * 3);
      budgetDetails = `${exceededCount} budget(s) exceeded and ${warningCount} near threshold.`;
    } else if (warningCount > 0) {
      budgetScore = Math.max(14, 25 - warningCount * 4);
      budgetDetails = `${warningCount} budget(s) in warning range.`;
    }
  } else {
    budgetScore = 18;
    budgetDetails = 'No category budgets set; set budgets to boost your score.';
  }

  // 2. Savings rate (0 - 25)
  const savings = Math.max(0, income - expenses);
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  let savingsScore = 0;
  let savingsDetails = '';

  if (savingsRate >= 30) {
    savingsScore = 25;
    savingsDetails = `Superb savings rate of ${savingsRate.toFixed(1)}% (benchmark: 20%+).`;
  } else if (savingsRate >= 20) {
    savingsScore = 22;
    savingsDetails = `Healthy savings rate of ${savingsRate.toFixed(1)}%.`;
  } else if (savingsRate >= 10) {
    savingsScore = 16;
    savingsDetails = `Moderate savings rate of ${savingsRate.toFixed(1)}%. Target 20%+ for safety.`;
  } else if (savingsRate > 0) {
    savingsScore = 10;
    savingsDetails = `Low savings rate of ${savingsRate.toFixed(1)}%. Expenses consume most income.`;
  } else {
    savingsScore = 2;
    savingsDetails = `Negative or zero savings rate; expenses exceed or match monthly income.`;
  }

  // 3. Warning index (0 - 20)
  let warningScore = 20;
  const expenseTransactions = monthTransactions.filter(t => !t.isIncome);
  const anomalies = detectAnomalies(monthTransactions, monthTransactions);
  if (anomalies.length > 0) {
    warningScore = Math.max(8, 20 - anomalies.length * 4);
  }
  const warningDetails = anomalies.length === 0 
    ? 'Zero anomalous spikes detected.' 
    : `${anomalies.length} high anomalous transactions detected.`;

  // 4. Category concentration (0 - 15)
  // If one category accounts for >50% of total expenses, concentration risk
  const breakdown = calculateCategoryBreakdown(monthTransactions);
  let concentrationScore = 15;
  let concentrationDetails = 'Spending is well distributed across multiple categories.';
  if (breakdown.length > 0 && breakdown[0].percentage > 55) {
    concentrationScore = 8;
    concentrationDetails = `High concentration in ${breakdown[0].category} (${breakdown[0].percentage.toFixed(1)}% of total).`;
  } else if (breakdown.length > 0 && breakdown[0].percentage > 40) {
    concentrationScore = 12;
    concentrationDetails = `Moderate concentration in ${breakdown[0].category} (${breakdown[0].percentage.toFixed(1)}%).`;
  }

  // 5. Recurring expense ratio (0 - 15)
  // Identify recurring (subscriptions, rent, utilities)
  const billsTotal = breakdown.find(b => b.category === 'Bills')?.total || 0;
  const recurringRatio = expenses > 0 ? (billsTotal / expenses) * 100 : 0;
  let recurringScore = 15;
  let recurringDetails = 'Healthy balance between fixed commitments and flexible spending.';
  if (recurringRatio > 65) {
    recurringScore = 9;
    recurringDetails = `Fixed bills represent ${recurringRatio.toFixed(1)}% of spending, limiting flexibility.`;
  }

  const totalScore = Math.min(100, Math.round(budgetScore + savingsScore + warningScore + concentrationScore + recurringScore));

  let rating: FinancialHealthScore['rating'] = 'Moderate';
  if (totalScore >= 85) rating = 'Exceptional';
  else if (totalScore >= 70) rating = 'Strong';
  else if (totalScore >= 50) rating = 'Moderate';
  else if (totalScore >= 35) rating = 'At Risk';
  else rating = 'Critical';

  return {
    totalScore,
    rating,
    factors: {
      budgetAdherence: { score: budgetScore, max: 25, details: budgetDetails },
      savingsRate: { score: savingsScore, max: 25, details: savingsDetails },
      warningIndex: { score: warningScore, max: 20, details: warningDetails },
      categoryConcentration: { score: concentrationScore, max: 15, details: concentrationDetails },
      recurringExpenseRatio: { score: recurringScore, max: 15, details: recurringDetails },
    },
    summary: `Your financial health score is ${totalScore}/100 (${rating}). Strengths: ${savingsRate >= 20 ? 'Solid savings' : 'Disciplined budgeting'}. Focus area: ${budgetScore < 20 ? 'Budget enforcement' : 'Discretionary moderation'}.`,
  };
}

/**
 * Generate Structured AI Advisor Report (Requirement 3, 4, 15, 16)
 * Pure deterministic calculations that can be enriched by LLM
 */
export function generateDeterministicAdvisorReport(
  monthTransactions: Transaction[],
  prevMonthTransactions: Transaction[],
  allTransactions: Transaction[],
  currentYearMonth: string
): AIAdvisorReport {
  const expenses = monthTransactions.filter(t => !t.isIncome);
  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);

  // Highest spending category
  const categories = calculateCategoryBreakdown(monthTransactions, prevMonthTransactions);
  const topCat = categories[0] || { category: 'Other', percentage: 0 };

  // Highest individual expense
  let maxExpense: Transaction | null = null;
  for (const t of expenses) {
    if (!maxExpense || t.amount > maxExpense.amount) {
      maxExpense = t;
    }
  }

  // Product level analysis
  const products = calculateProductLevelMetrics(monthTransactions, prevMonthTransactions);
  const frequentItems = products
    .filter(p => p.transactionCount >= 2)
    .slice(0, 5)
    .map(p => ({ description: p.description, count: p.transactionCount, total: p.totalAmount }));

  // Recurring expenses (transactions occurring consistently)
  const recurringMap = new Map<string, number>();
  for (const t of allTransactions.filter(t => !t.isIncome)) {
    const key = t.description.trim().toLowerCase();
    recurringMap.set(key, (recurringMap.get(key) || 0) + 1);
  }
  const recurringExpenses = products
    .filter(p => (recurringMap.get(p.description.toLowerCase()) || 0) >= 2)
    .slice(0, 4)
    .map(p => ({
      description: p.description,
      estimatedMonthly: p.totalAmount,
      frequency: p.transactionCount >= 4 ? 'Weekly or frequent' : 'Monthly regular',
    }));

  // Anomalies
  const unusual = detectAnomalies(allTransactions, monthTransactions);

  // Increasing / decreasing categories
  const increasing = categories
    .filter(c => c.trendPercentage > 5 && c.previousMonthTotal > 0)
    .map(c => ({ category: c.category, increasePct: Math.round(c.trendPercentage) }));

  const decreasing = categories
    .filter(c => c.trendPercentage < -5 && c.previousMonthTotal > 0)
    .map(c => ({ category: c.category, decreasePct: Math.round(Math.abs(c.trendPercentage)) }));

  // Date parsing for day averages
  const daysInMonth = new Date(
    Number(currentYearMonth.split('-')[0]), 
    Number(currentYearMonth.split('-')[1]), 
    0
  ).getDate();

  // Find unique days active or up to current day
  const dailyAverage = totalExpense > 0 ? Math.round(totalExpense / daysInMonth) : 0;
  const weeklyAverage = Math.round(dailyAverage * 7);
  const monthlyAverage = totalExpense;

  // Projected month-end
  const now = new Date();
  const [currY, currM] = currentYearMonth.split('-').map(Number);
  const isCurrentRunningMonth = now.getFullYear() === currY && (now.getMonth() + 1) === currM;
  const currentDay = isCurrentRunningMonth ? Math.max(1, now.getDate()) : daysInMonth;
  const projectedMonthEnd = currentDay > 0 ? Math.round((totalExpense / currentDay) * daysInMonth) : totalExpense;

  // Practical advice steps
  const actions: string[] = [];
  if (products.length > 0 && products[0].transactionCount > 1) {
    const topP = products[0];
    const cut = Math.round(topP.totalAmount * 0.25);
    actions.push(`Reduce ${topP.description} purchases by 25% to capture ~${formatCurrency(cut)} in monthly savings.`);
  }
  if (increasing.length > 0) {
    actions.push(`Spending on ${increasing[0].category} surged by ${increasing[0].increasePct}% compared to last month. Set an active cap on this.`);
  }
  if (unusual.length > 0) {
    actions.push(`Audit ${unusual[0].transaction.description} (${formatCurrency(unusual[0].transaction.amount)}) which was ${unusual[0].factor}x higher than usual.`);
  }
  if (actions.length === 0) {
    actions.push('Maintain your current disciplined burn rate and channel excess cashflow into your high-yield savings goals.');
  }

  const executiveSummary = `Your highest spending category this month is ${topCat.category}, accounting for ${topCat.percentage.toFixed(1)}% of total expenses. Your highest single expense was ${maxExpense ? `${formatCurrency(maxExpense.amount)} on ${maxExpense.description}` : 'none'}. ${increasing.length > 0 ? `You spent ${increasing[0].increasePct}% more on ${increasing[0].category} compared with last month.` : 'Category expenditures stayed controlled.'}`;

  return {
    highestSpendingCategory: topCat.category,
    highestCategoryPercentage: topCat.percentage,
    highestIndividualExpense: maxExpense ? {
      description: maxExpense.description,
      amount: maxExpense.amount,
      category: maxExpense.category,
      date: maxExpense.date,
    } : null,
    frequentlyPurchasedItems: frequentItems,
    recurringExpenses,
    unusualTransactions: unusual,
    spendingIncreasingCategories: increasing,
    spendingDecreasingCategories: decreasing,
    dailyAverage,
    weeklyAverage,
    monthlyAverage,
    projectedMonthEnd,
    executiveSummary,
    practicalActionPlan: actions,
  };
}

/**
 * Breakdown by payment method (Requirement 13)
 */
export function calculatePaymentMethodBreakdown(transactions: Transaction[]): {
  method: PaymentMethod;
  total: number;
  count: number;
  percentage: number;
}[] {
  const expenses = transactions.filter(t => !t.isIncome);
  const total = expenses.reduce((s, t) => s + t.amount, 0);

  const map = new Map<PaymentMethod, { total: number; count: number }>();
  const methods: PaymentMethod[] = ['UPI', 'Credit Card', 'Debit Card', 'Cash', 'Bank Transfer', 'Other'];

  for (const m of methods) {
    map.set(m, { total: 0, count: 0 });
  }

  for (const t of expenses) {
    const curr = map.get(t.paymentMethod || 'Other') || { total: 0, count: 0 };
    curr.total += t.amount;
    curr.count += 1;
    map.set(t.paymentMethod || 'Other', curr);
  }

  const list = [];
  for (const m of methods) {
    const data = map.get(m)!;
    if (data.count > 0) {
      list.push({
        method: m,
        total: data.total,
        count: data.count,
        percentage: total > 0 ? (data.total / total) * 100 : 0,
      });
    }
  }

  return list.sort((a, b) => b.total - a.total);
}
