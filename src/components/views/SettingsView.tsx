import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { 
  Settings, 
  ShieldAlert, 
  RotateCcw, 
  Sparkles, 
  Database, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle,
  Download,
  Trash2,
  Lock,
  Layers,
  Sliders,
  X,
  FileSpreadsheet
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    strictBudgetMode, 
    setStrictBudgetMode, 
    transactions,
    budgets,
    savingsGoals,
    userProfile,
    aiSettings,
    updateAISettings,
    deleteAllTransactions,
    resetBudgets,
    resetSavingsGoals,
    clearAIInsights,
    resetNotifications,
    resetAllFinancialData,
    factoryReset
  } = useFinance();

  const [activeSubTab, setActiveSubTab] = useState<'general' | 'ai' | 'data'>('general');

  // Confirmation Modals State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    requireTypeReset?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    requireTypeReset: false,
    onConfirm: () => {},
  });

  const [typedConfirmation, setTypedConfirmation] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [aiStatus, setAiStatus] = useState<{
    configured: boolean;
    checking: boolean;
  }>({
    configured: false,
    checking: true,
  });

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setAiStatus({
          configured: Boolean(data.geminiConfigured),
          checking: false,
        });
      })
      .catch(() => {
        setAiStatus({
          configured: false,
          checking: false,
        });
      });
  }, []);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleExportJSON = () => {
    const backupData = {
      userProfile,
      transactions,
      budgets,
      savingsGoals,
      aiSettings,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AetherFinance_Snapshot_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('Offline JSON snapshot exported.');
  };

  return (
    <div className="space-y-6 pb-14 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            System Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Budget rules, AI model configuration, and comprehensive data management
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('general')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeSubTab === 'general' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            General & Rules
          </button>
          <button
            onClick={() => setActiveSubTab('ai')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeSubTab === 'ai' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Assistant
          </button>
          <button
            onClick={() => setActiveSubTab('data')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeSubTab === 'data' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            Data Management
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* SUB-TAB 1: GENERAL & RULES */}
      {activeSubTab === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strict Budget Mode */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Strict Budget Enforcement</h3>
              </div>

              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                When enabled, AetherFinance will <strong>prevent</strong> any transaction that would push spending over a category monthly limit. By default, warnings inform rather than block.
              </p>

              <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
                Current Status: <strong className={strictBudgetMode ? 'text-amber-400' : 'text-slate-300'}>
                  {strictBudgetMode ? 'ENFORCED (Hard Cap)' : 'INFORMATIONAL (Soft Cap)'}
                </strong>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Enforce Hard Limit</span>
              <button
                onClick={() => setStrictBudgetMode(!strictBudgetMode)}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                  strictBudgetMode ? 'bg-cyan-400 justify-end' : 'bg-slate-800 justify-start'
                }`}
              >
                <span className={`w-5 h-5 rounded-full ${strictBudgetMode ? 'bg-slate-950' : 'bg-slate-500'}`} />
              </button>
            </div>
          </div>

          {/* Backup Snapshot */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <Database className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Offline Backup Archive</h3>
              </div>

              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                Download a clean, unencrypted JSON backup of your current profile, transactions ledger, smart budgets, and savings goals.
              </p>

              <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-0.5 font-mono">
                <p>Transactions: {transactions.length} records</p>
                <p>Budgets: {budgets.length} configured</p>
                <p>Savings Goals: {savingsGoals.length} tracked</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <button
                onClick={handleExportJSON}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export JSON Archive</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AI ASSISTANT SETTINGS (Requirement 38 & 39) */}
      {activeSubTab === 'ai' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">AI Assistant Configuration</h3>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold ${
                aiStatus.configured ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}>
                {aiStatus.configured ? 'Server API Active' : 'Fallback Active'}
              </span>
            </div>

            <div className="space-y-5 mt-5 text-xs">
              {/* Enable / Disable AI Assistant */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div>
                  <p className="font-bold text-white">Enable AI Assistant</p>
                  <p className="text-[11px] text-slate-400">Activate generative conversational features across the app</p>
                </div>
                <input
                  type="checkbox"
                  checked={aiSettings.enabled}
                  onChange={(e) => updateAISettings({ enabled: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              {/* Common AI Provider Architecture (Requirement 38) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <label className="block text-slate-300 font-bold mb-1">
                    AI Provider Architecture
                  </label>
                  <select
                    value={aiSettings.provider}
                    onChange={(e) => updateAISettings({ provider: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="gemini">Google Gemini API (gemini-3.8-flash)</option>
                    <option value="openai">OpenAI Compatible Provider</option>
                  </select>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Abstracted behind server-side provider interface
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <label className="block text-slate-300 font-bold mb-1">
                    Advisory Tone Profile
                  </label>
                  <select
                    value={aiSettings.tone}
                    onChange={(e) => updateAISettings({ tone: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="professional">Professional & Analytical (Default)</option>
                    <option value="encouraging">Encouraging & Goal-Centric</option>
                    <option value="direct">Direct & Concise</option>
                  </select>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Calibrates narrative voice in chat and reports
                  </span>
                </div>
              </div>

              {/* Personalization with Profile (Requirement 26 & 38) */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div>
                  <p className="font-bold text-white">Include Profile Context in AI Analysis</p>
                  <p className="text-[11px] text-slate-400">
                    Allows AI to benchmark your spending against your monthly income (₹{userProfile.monthlyIncome.toLocaleString('en-IN')}) and savings target
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={aiSettings.personalizeWithProfile}
                  onChange={(e) => updateAISettings({ personalizeWithProfile: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              {/* Privacy Shield Info (Requirement 39) */}
              <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-slate-300 space-y-1">
                <p className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-cyan-400" /> Zero Raw Data Leakage Privacy Standard:
                </p>
                <p className="leading-relaxed">
                  Financial calculations are computed locally or server-side before prompting. Raw personal identification, credentials, and full database tables are never shared with external APIs.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DATA MANAGEMENT (Requirement 27) */}
      {activeSubTab === 'data' && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>
              Actions in this section modify or erase stored application data. Destructive actions require explicit confirmation.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Delete All Transactions */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">1. Delete All Transactions</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Permanently wipe all logged income and expense records. Budgets and user profile are kept intact.
                </p>
              </div>
              <button
                onClick={() => setConfirmModal({
                  isOpen: true,
                  title: 'Delete All Transactions?',
                  description: 'This action will permanently remove your entire transaction history. This cannot be undone.',
                  onConfirm: () => {
                    deleteAllTransactions();
                    showToast('All transactions deleted.');
                  }
                })}
                className="mt-4 px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all self-start cursor-pointer"
              >
                Delete All Transactions
              </button>
            </div>

            {/* 2. Reset Budgets */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">2. Reset Budgets</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Restore all category budgets and warning thresholds back to benchmark defaults.
                </p>
              </div>
              <button
                onClick={() => setConfirmModal({
                  isOpen: true,
                  title: 'Reset Budgets to Default?',
                  description: 'All custom category limits and threshold rules will be replaced with initial benchmarks.',
                  onConfirm: () => {
                    resetBudgets();
                    showToast('Budgets reset to initial defaults.');
                  }
                })}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all self-start cursor-pointer"
              >
                Reset Budgets
              </button>
            </div>

            {/* 3. Reset Savings Goals */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">3. Reset Savings Goals</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Clear custom goals and restore benchmark savings targets (New Laptop, Emergency Fund).
                </p>
              </div>
              <button
                onClick={() => setConfirmModal({
                  isOpen: true,
                  title: 'Reset Savings Goals?',
                  description: 'Restores initial target milestones and saved balance baselines.',
                  onConfirm: () => {
                    resetSavingsGoals();
                    showToast('Savings goals restored to defaults.');
                  }
                })}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all self-start cursor-pointer"
              >
                Reset Savings Goals
              </button>
            </div>

            {/* 4. Clear AI Insights & Chats */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">4. Clear AI Insights & Chat History</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Erase conversational assistant messages and conversation memory without touching ledger records.
                </p>
              </div>
              <button
                onClick={() => setConfirmModal({
                  isOpen: true,
                  title: 'Clear AI Chat History?',
                  description: 'All previous conversations and queries with AetherAI will be cleared.',
                  onConfirm: () => {
                    clearAIInsights();
                    showToast('AI conversation history cleared.');
                  }
                })}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all self-start cursor-pointer"
              >
                Clear AI History
              </button>
            </div>

            {/* 5. Reset Notifications */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">5. Reset Notifications</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Clear all unread and archived alerts from the top notification tray.
                </p>
              </div>
              <button
                onClick={() => setConfirmModal({
                  isOpen: true,
                  title: 'Clear All Notifications?',
                  description: 'Deletes all stored warning and achievement notices.',
                  onConfirm: () => {
                    resetNotifications();
                    showToast('Notification center cleared.');
                  }
                })}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all self-start cursor-pointer"
              >
                Clear Notifications
              </button>
            </div>

            {/* 6. Reset All Financial Data (Preserves Profile) */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-amber-300">6. Reset All Financial Data</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Restores transactions, budgets, and goals to benchmark seed data. <strong>Preserves your Personal Profile!</strong>
                </p>
              </div>
              <button
                onClick={() => setConfirmModal({
                  isOpen: true,
                  title: 'Reset All Financial Data?',
                  description: 'Transactions, budgets, goals, and chats will reset to default demo data. Your Personal Profile will NOT be deleted.',
                  onConfirm: () => {
                    resetAllFinancialData();
                    showToast('Financial data reset. Personal Profile preserved.');
                  }
                })}
                className="mt-4 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all self-start cursor-pointer"
              >
                Reset Financial Data
              </button>
            </div>
          </div>

          {/* 7. Factory Reset Application (Requirement 27) */}
          <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/30 space-y-3 mt-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-400" />
              <h4 className="text-base font-bold text-white">7. Factory Reset Application</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Complete hard reset of AetherFinance. Erases everything including your <strong>Personal Profile</strong>, custom settings, transactions, and chat memories.
            </p>
            <p className="text-[11px] text-rose-400 font-bold">
              Requires typing "RESET" to confirm.
            </p>

            <button
              onClick={() => {
                setTypedConfirmation('');
                setConfirmModal({
                  isOpen: true,
                  title: 'FACTORY RESET ENTIRE APPLICATION?',
                  description: 'This is irreversible. Everything including your profile will be reset to factory defaults. Type RESET below to confirm:',
                  requireTypeReset: true,
                  onConfirm: () => {
                    factoryReset();
                    showToast('Application factory reset to clean state.');
                  }
                });
              }}
              className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-500/25 transition-all cursor-pointer"
            >
              Factory Reset Application
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md glass-panel-glow rounded-3xl p-6 sm:p-8 border border-rose-500/40 shadow-2xl text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">{confirmModal.title}</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmModal.description}
            </p>

            {confirmModal.requireTypeReset && (
              <div className="space-y-1.5 pt-1">
                <label className="block text-[11px] font-mono text-slate-400">
                  Type <span className="text-rose-400 font-bold">RESET</span> to unlock:
                </label>
                <input
                  type="text"
                  value={typedConfirmation}
                  onChange={(e) => setTypedConfirmation(e.target.value)}
                  placeholder="RESET"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                  autoFocus
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmModal.requireTypeReset && typedConfirmation !== 'RESET'}
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
                  confirmModal.requireTypeReset && typedConfirmation !== 'RESET'
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25 cursor-pointer'
                }`}
              >
                Confirm Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
