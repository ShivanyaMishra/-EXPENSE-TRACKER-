import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  ExpenseCategory, 
  PaymentMethod, 
  Transaction 
} from '../types/finance';
import { 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Info
} from 'lucide-react';
import { formatCurrency } from '../utils/analytics';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  editTransaction,
}) => {
  const { 
    addTransaction, 
    updateTransaction, 
    evaluateCandidateTransaction, 
    strictBudgetMode,
    selectedMonth
  } = useFinance();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');
  const [isIncome, setIsIncome] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Real-time warning state
  const [warningState, setWarningState] = useState<{
    hasWarning: boolean;
    isExceeded: boolean;
    warningMessage: string;
    projectedSpending: number;
    limitAmount: number;
    percentage: number;
  }>({
    hasWarning: false,
    isExceeded: false,
    warningMessage: '',
    projectedSpending: 0,
    limitAmount: 0,
    percentage: 0,
  });

  const categories: ExpenseCategory[] = [
    'Food',
    'Transport',
    'Bills',
    'Shopping',
    'Entertainment',
    'Health',
    'Investment',
    'Other'
  ];

  const paymentMethods: PaymentMethod[] = [
    'UPI',
    'Credit Card',
    'Debit Card',
    'Cash',
    'Bank Transfer',
    'Other'
  ];

  // Initialize form when opened or edit transaction changes
  useEffect(() => {
    if (editTransaction) {
      setDescription(editTransaction.description);
      setAmount(String(editTransaction.amount));
      setCategory(editTransaction.category);
      setDate(editTransaction.date);
      setPaymentMethod(editTransaction.paymentMethod);
      setNotes(editTransaction.notes || '');
      setIsIncome(Boolean(editTransaction.isIncome));
    } else {
      setDescription('');
      setAmount('');
      setCategory('Food');
      // Default to selectedMonth or today if matching
      const today = new Date().toISOString().split('T')[0];
      const initialDate = today.startsWith(selectedMonth) ? today : `${selectedMonth}-01`;
      setDate(initialDate);
      setPaymentMethod('UPI');
      setNotes('');
      setIsIncome(false);
    }
    setErrorMessage('');
  }, [editTransaction, isOpen, selectedMonth]);

  // Real-time warning evaluation whenever amount or category changes
  useEffect(() => {
    if (isIncome) {
      setWarningState({
        hasWarning: false,
        isExceeded: false,
        warningMessage: '',
        projectedSpending: 0,
        limitAmount: 0,
        percentage: 0,
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      const result = evaluateCandidateTransaction(numAmount, category);
      setWarningState(result);
    } else {
      setWarningState({
        hasWarning: false,
        isExceeded: false,
        warningMessage: '',
        projectedSpending: 0,
        limitAmount: 0,
        percentage: 0,
      });
    }
  }, [amount, category, isIncome]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!description.trim()) {
      setErrorMessage('Please enter an expense/item name.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Amount must be a valid positive number.');
      return;
    }

    if (!date) {
      setErrorMessage('Please select a valid date.');
      return;
    }

    if (editTransaction) {
      updateTransaction(editTransaction.id, {
        description: description.trim(),
        amount: parsedAmount,
        category,
        date,
        paymentMethod,
        notes: notes.trim(),
        isIncome,
      });
      onClose();
    } else {
      const result = addTransaction({
        description: description.trim(),
        amount: parsedAmount,
        category,
        date,
        paymentMethod,
        notes: notes.trim(),
        isIncome,
      });

      if (result.blocked) {
        setErrorMessage(result.warning || 'Transaction blocked by strict budget enforcement.');
        return;
      }

      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col glass-panel-glow rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl border border-cyan-500/30 overflow-hidden">
        {/* Glowing backdrop accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              {editTransaction ? 'Edit Transaction' : 'Record Transaction'}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Live automated budget matching & anomaly audit
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Income / Expense Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-900/90 border border-slate-800 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setIsIncome(false)}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !isIncome
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => setIsIncome(true)}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isIncome
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Income / Credit
            </button>
          </div>

          {/* Description / Product Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {isIncome ? 'Income Source / Description' : 'Item / Product / Description'}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isIncome ? 'e.g., Monthly Salary, Freelance project' : 'e.g., Food Delivery, Coffee, Uber ride'}
              className="w-full bg-slate-900/80 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono">₹</span>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-900/80 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all"
              />
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-slate-900/80 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-all"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-900/80 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-all"
              >
                {paymentMethods.map((m) => (
                  <option key={m} value={m} className="bg-slate-900 text-white">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Client meeting, split bill with Rahul"
              className="w-full bg-slate-900/80 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>

          {/* REAL-TIME TRANSACTION WARNING SYSTEM PREVIEW */}
          {!isIncome && warningState.hasWarning && (
            <div
              className={`p-3.5 rounded-2xl border transition-all animate-in fade-in duration-150 ${
                warningState.isExceeded
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                  : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {warningState.isExceeded ? (
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="text-xs">
                  <p className="font-semibold text-white">
                    {warningState.isExceeded ? '🚨 Budget Exceeded Alert' : '⚠️ Spending Warning'}
                  </p>
                  <p className="mt-1 leading-relaxed text-slate-300">
                    {warningState.warningMessage}
                  </p>
                  {strictBudgetMode && warningState.isExceeded && (
                    <p className="mt-1.5 text-rose-400 font-bold">
                      Strict Budget Mode is enabled. Submission will be blocked.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={strictBudgetMode && warningState.isExceeded}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
                strictBudgetMode && warningState.isExceeded
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/20 active:scale-95'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{editTransaction ? 'Save Changes' : 'Confirm Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
