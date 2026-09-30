import * as XLSX from 'xlsx';
import { 
  Transaction, 
  Budget, 
  SavingsGoal, 
  AIAdvisorReport, 
  CategorySummary, 
  FinancialHealthScore 
} from '../types/finance';
import { formatCurrency } from './analytics';

export interface ExportOptions {
  month: string;
  transactions: Transaction[];
  categoryBreakdown: CategorySummary[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  advisorReport: AIAdvisorReport;
  healthScore: FinancialHealthScore;
  totalIncome: number;
  totalExpenses: number;
}

/**
 * Export Multi-Sheet Professional Excel Workbook (Requirement 19)
 */
export function exportComprehensiveExcel(options: ExportOptions, fileName = 'AetherFinance_Comprehensive_Report.xlsx') {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Transactions
  const txData = options.transactions.map((t, idx) => ({
    'ID': t.id || `TX-${idx + 1}`,
    'Date': t.date,
    'Type': t.isIncome ? 'Income' : 'Expense',
    'Description / Product': t.description,
    'Category': t.category,
    'Amount (₹)': t.amount,
    'Payment Method': t.paymentMethod,
    'Notes': t.notes || '',
    'Timestamp': t.createdAt,
  }));
  const wsTransactions = XLSX.utils.json_to_sheet(txData);
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transactions');

  // Sheet 2: Monthly Summary
  const savings = Math.max(0, options.totalIncome - options.totalExpenses);
  const savingsRate = options.totalIncome > 0 ? (savings / options.totalIncome) * 100 : 0;
  const summaryData = [
    { 'Metric': 'Report Month', 'Value': options.month },
    { 'Metric': 'Total Income (₹)', 'Value': options.totalIncome },
    { 'Metric': 'Total Expenses (₹)', 'Value': options.totalExpenses },
    { 'Metric': 'Net Savings (₹)', 'Value': savings },
    { 'Metric': 'Savings Rate (%)', 'Value': `${savingsRate.toFixed(2)}%` },
    { 'Metric': 'Financial Health Score', 'Value': `${options.healthScore.totalScore}/100 (${options.healthScore.rating})` },
    { 'Metric': 'Daily Average Spend (₹)', 'Value': options.advisorReport.dailyAverage },
    { 'Metric': 'Projected Month-End (₹)', 'Value': options.advisorReport.projectedMonthEnd },
    { 'Metric': 'Total Transactions', 'Value': options.transactions.length },
    { 'Metric': 'Health Summary', 'Value': options.healthScore.summary },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Monthly Summary');

  // Sheet 3: Category Analysis
  const catData = options.categoryBreakdown.map(c => ({
    'Category': c.category,
    'Current Month (₹)': c.total,
    'Share of Spending (%)': `${c.percentage.toFixed(2)}%`,
    'Transaction Count': c.count,
    'Previous Month (₹)': c.previousMonthTotal,
    'Month-over-Month Trend (%)': `${c.trendPercentage >= 0 ? '+' : ''}${c.trendPercentage.toFixed(1)}%`,
  }));
  const wsCategories = XLSX.utils.json_to_sheet(catData);
  XLSX.utils.book_append_sheet(wb, wsCategories, 'Category Analysis');

  // Sheet 4: Budgets
  const budgetData = options.budgets.map(b => {
    const spent = options.transactions
      .filter(t => !t.isIncome && t.category === b.category)
      .reduce((s, t) => s + t.amount, 0);
    const pct = b.limitAmount > 0 ? (spent / b.limitAmount) * 100 : 0;
    const remaining = Math.max(0, b.limitAmount - spent);
    const status = spent > b.limitAmount 
      ? 'EXCEEDED' 
      : pct >= (b.warningThreshold * 100) 
        ? 'WARNING' 
        : 'HEALTHY';

    return {
      'Budget Name': b.name,
      'Category': b.category,
      'Monthly Limit (₹)': b.limitAmount,
      'Spent (₹)': spent,
      'Remaining (₹)': remaining,
      'Utilization (%)': `${pct.toFixed(1)}%`,
      'Warning Threshold (%)': `${(b.warningThreshold * 100).toFixed(0)}%`,
      'Status': status,
      'Rollover Enabled': b.rollover ? 'Yes' : 'No',
    };
  });
  const wsBudgets = XLSX.utils.json_to_sheet(budgetData.length > 0 ? budgetData : [{ 'Status': 'No active budgets defined.' }]);
  XLSX.utils.book_append_sheet(wb, wsBudgets, 'Budgets');

  // Sheet 5: Savings Goals
  const goalsData = options.savingsGoals.map(g => {
    const remaining = Math.max(0, g.targetAmount - g.currentAmount);
    const pct = (g.currentAmount / (g.targetAmount || 1)) * 100;
    return {
      'Goal Name': g.name,
      'Target Amount (₹)': g.targetAmount,
      'Current Saved (₹)': g.currentAmount,
      'Remaining to Save (₹)': remaining,
      'Progress (%)': `${pct.toFixed(1)}%`,
      'Target Date': g.targetDate,
      'Monthly Target (₹)': g.monthlyTarget || Math.round(remaining / 6),
    };
  });
  const wsGoals = XLSX.utils.json_to_sheet(goalsData.length > 0 ? goalsData : [{ 'Status': 'No savings goals set.' }]);
  XLSX.utils.book_append_sheet(wb, wsGoals, 'Savings Goals');

  // Sheet 6: AI Insights
  const aiData = [
    { 'Insight Type': 'Executive Summary', 'Details': options.advisorReport.executiveSummary },
    { 'Insight Type': 'Top Spending Category', 'Details': `${options.advisorReport.highestSpendingCategory} (${options.advisorReport.highestCategoryPercentage.toFixed(1)}% of total)` },
    { 'Insight Type': 'Highest Single Expense', 'Details': options.advisorReport.highestIndividualExpense ? `${options.advisorReport.highestIndividualExpense.description} - ${formatCurrency(options.advisorReport.highestIndividualExpense.amount)} (${options.advisorReport.highestIndividualExpense.category})` : 'None' },
    ...options.advisorReport.practicalActionPlan.map((action, idx) => ({
      'Insight Type': `Action Item ${idx + 1}`,
      'Details': action,
    })),
    ...options.advisorReport.unusualTransactions.map(anom => ({
      'Insight Type': 'Unusual Expense Detected',
      'Details': `${anom.transaction.description}: ${formatCurrency(anom.transaction.amount)} (${anom.factor}x category baseline)`,
    })),
  ];
  const wsAi = XLSX.utils.json_to_sheet(aiData);
  XLSX.utils.book_append_sheet(wb, wsAi, 'AI Insights');

  // Trigger browser download
  XLSX.writeFile(wb, fileName);
}

/**
 * Export simple CSV (preserves original Python functionality from CustomTkinter script)
 */
export function exportCSV(transactions: Transaction[], fileName = 'expenses.csv') {
  const headers = ['ID', 'Date', 'Description', 'Category', 'Amount', 'Payment Method', 'Notes'];
  const rows = transactions.map(t => [
    `"${t.id}"`,
    `"${t.date}"`,
    `"${t.description.replace(/"/g, '""')}"`,
    `"${t.category}"`,
    t.amount.toFixed(2),
    `"${t.paymentMethod}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
