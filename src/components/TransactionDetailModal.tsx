import React from 'react';
import { Transaction } from '../types/finance';
import { X, Calendar, Tag, CreditCard, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '../utils/analytics';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel-glow rounded-3xl p-6 shadow-2xl border border-slate-700/80">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
              Transaction Details
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              {transaction.description}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Display */}
        <div className="my-6 p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/60 to-slate-800/40 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Total Transacted</p>
            <p className={`text-2xl font-black font-mono mt-1 ${
              transaction.isIncome ? 'text-emerald-400' : 'text-slate-100'
            }`}>
              {transaction.isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider ${
            transaction.isIncome 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {transaction.isIncome ? 'Income' : 'Expense'}
          </span>
        </div>

        {/* Field Details */}
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Date
            </span>
            <span className="font-semibold text-slate-200">{transaction.date}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-cyan-400" /> Category
            </span>
            <span className="font-semibold text-slate-200 px-2 py-0.5 rounded-md bg-slate-800">
              {transaction.category}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-cyan-400" /> Payment Method
            </span>
            <span className="font-semibold text-slate-200">{transaction.paymentMethod}</span>
          </div>

          {transaction.notes && (
            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-2 mb-1">
                <FileText className="w-3.5 h-3.5 text-cyan-400" /> Notes
              </span>
              <p className="text-slate-300 italic pl-5">{transaction.notes}</p>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
            <span>Reference ID:</span>
            <span className="font-mono">{transaction.id}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              if (window.confirm(`Delete transaction "${transaction.description}"?`)) {
                onDelete(transaction.id);
                onClose();
              }
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => {
              onEdit(transaction);
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-md shadow-cyan-500/20"
          >
            Edit Expense
          </button>
        </div>
      </div>
    </div>
  );
};
