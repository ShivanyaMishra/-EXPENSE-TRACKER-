import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  ShieldCheck,
  Table,
  Printer
} from 'lucide-react';
import { exportComprehensiveExcel, exportCSV } from '../../utils/exportExcel';
import { formatCurrency } from '../../utils/analytics';

export const ReportsView: React.FC = () => {
  const { 
    selectedMonth, 
    transactions, 
    monthTransactions, 
    categoryBreakdown, 
    budgets, 
    savingsGoals, 
    advisorReport, 
    healthScore,
    totalIncome,
    totalExpenses
  } = useFinance();

  const [exportScope, setExportScope] = useState<'month' | 'all'>('month');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const activeTransactions = exportScope === 'month' ? monthTransactions : transactions;

  const handleExportExcel = () => {
    exportComprehensiveExcel({
      month: selectedMonth,
      transactions: activeTransactions,
      categoryBreakdown,
      budgets,
      savingsGoals,
      advisorReport,
      healthScore,
      totalIncome,
      totalExpenses,
    }, `AetherFinance_Comprehensive_${selectedMonth}.xlsx`);

    setDownloadSuccess('Multi-sheet Excel workbook generated and downloaded successfully!');
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleExportCSV = () => {
    exportCSV(activeTransactions, `AetherFinance_Ledger_${selectedMonth}.csv`);
    setDownloadSuccess('CSV export downloaded successfully!');
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-3xl p-6 border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Reports & Financial Export
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Generate 6-sheet professional Excel workbooks or raw CSV data
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setExportScope('month')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              exportScope === 'month' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
            }`}
          >
            {selectedMonth} Data
          </button>
          <button
            onClick={() => setExportScope('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              exportScope === 'all' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
            }`}
          >
            Full Lifetime History
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Main Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Comprehensive Multi-Sheet Excel Card (Requirement 19) */}
        <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-cyan-500/30 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white">
              Professional 6-Sheet Excel Workbook
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Produces a multi-tab financial report with distinct spreadsheets for executive auditing, monthly comparison, and tax preparation.
            </p>

            <div className="mt-5 space-y-2 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <p className="font-bold text-cyan-300 text-[11px] uppercase tracking-wider">
                Workbook Manifest:
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <span className="flex items-center gap-1.5">• Sheet 1: Transactions</span>
                <span className="flex items-center gap-1.5">• Sheet 2: Monthly Summary</span>
                <span className="flex items-center gap-1.5">• Sheet 3: Category Analysis</span>
                <span className="flex items-center gap-1.5">• Sheet 4: Budgets</span>
                <span className="flex items-center gap-1.5">• Sheet 5: Savings Goals</span>
                <span className="flex items-center gap-1.5">• Sheet 6: AI Insights</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleExportExcel}
            className="mt-6 w-full py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Download Comprehensive Excel (.xlsx)</span>
          </button>
        </div>

        {/* CSV & Print Export Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white">
              Raw Ledger CSV & PDF Print
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Preserves the original Python CSV export format for backwards compatibility with legacy pipelines, pandas scripts, and accounting software.
            </p>

            <div className="mt-5 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-200">Format Specifications:</p>
              <p>• Comma-separated values (UTF-8)</p>
              <p>• Columns: ID, Date, Description, Category, Amount, Payment Method, Notes</p>
              <p>• Active count: {activeTransactions.length} records</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportCSV}
              className="flex-1 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Raw CSV</span>
            </button>
            <button
              onClick={handlePrintSummary}
              className="py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-800 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Snapshot Preview Table */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800">
        <h3 className="font-bold text-white text-base mb-1">Executive Export Snapshot</h3>
        <p className="text-xs text-slate-400 mb-4">Key figures aggregated for export validation</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 block">Total Income</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">{formatCurrency(totalIncome)}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 block">Total Expenses</span>
            <span className="font-mono font-bold text-rose-400 text-sm">{formatCurrency(totalExpenses)}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 block">Net Saved</span>
            <span className="font-mono font-bold text-cyan-300 text-sm">{formatCurrency(Math.max(0, totalIncome - totalExpenses))}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 block">Health Rating</span>
            <span className="font-bold text-white text-sm">{healthScore.rating} ({healthScore.totalScore}/100)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
