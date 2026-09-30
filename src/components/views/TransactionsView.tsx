import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { 
  Transaction, 
  ExpenseCategory, 
  PaymentMethod 
} from '../../types/finance';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Eye, 
  Plus, 
  ArrowUpDown, 
  Calendar, 
  Tag, 
  CreditCard,
  CheckSquare,
  Square,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  LayoutGrid,
  Table as TableIcon,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatCurrency } from '../../utils/analytics';
import { TransactionDetailModal } from '../TransactionDetailModal';

interface TransactionsViewProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenAddModal,
  onOpenEditModal,
}) => {
  const { 
    monthTransactions, 
    transactions, 
    selectedMonth, 
    deleteTransaction, 
    bulkDeleteTransactions 
  } = useFinance();

  // View presentation mode: 'cards' or 'table'
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Filters & Search
  const [filterScope, setFilterScope] = useState<'month' | 'all'>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [inspectTx, setInspectTx] = useState<Transaction | null>(null);
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);

  // Source list based on scope
  const sourceList = filterScope === 'month' ? monthTransactions : transactions;

  // Filtered & Sorted list
  const filteredTransactions = useMemo(() => {
    return sourceList.filter((tx) => {
      // Search
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesDesc = tx.description.toLowerCase().includes(query);
        const matchesCat = tx.category.toLowerCase().includes(query);
        const matchesNotes = (tx.notes || '').toLowerCase().includes(query);
        const matchesMethod = (tx.paymentMethod || '').toLowerCase().includes(query);
        if (!matchesDesc && !matchesCat && !matchesNotes && !matchesMethod) return false;
      }

      // Category
      if (categoryFilter !== 'ALL' && tx.category !== categoryFilter) return false;

      // Payment method
      if (paymentFilter !== 'ALL' && tx.paymentMethod !== paymentFilter) return false;

      // Type (income vs expense)
      if (typeFilter === 'EXPENSE' && tx.isIncome) return false;
      if (typeFilter === 'INCOME' && !tx.isIncome) return false;

      // Amount bounds
      if (minAmount && tx.amount < parseFloat(minAmount)) return false;
      if (maxAmount && tx.amount > parseFloat(maxAmount)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date') {
        const comp = new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortOrder === 'asc' ? comp : -comp;
      }
      if (sortBy === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      if (sortBy === 'description') {
        return sortOrder === 'asc' 
          ? a.description.localeCompare(b.description) 
          : b.description.localeCompare(a.description);
      }
      return 0;
    });
  }, [sourceList, searchTerm, categoryFilter, paymentFilter, typeFilter, minAmount, maxAmount, sortBy, sortOrder]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map(t => t.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDeleteConfirm = () => {
    bulkDeleteTransactions(selectedIds);
    setSelectedIds([]);
    setShowBulkConfirmModal(false);
  };

  const activeFiltersCount = (categoryFilter !== 'ALL' ? 1 : 0) + 
    (paymentFilter !== 'ALL' ? 1 : 0) + 
    (typeFilter !== 'ALL' ? 1 : 0) + 
    (minAmount ? 1 : 0) + 
    (maxAmount ? 1 : 0) +
    (searchTerm ? 1 : 0);

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            Transaction Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {filteredTransactions.length} transactions recorded ({filterScope === 'month' ? selectedMonth : 'All Time'})
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Card / Table View Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-cyan-500/20 text-cyan-300 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-300 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          {selectedIds.length > 0 && (
            <button
              onClick={() => setShowBulkConfirmModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar with Mobile Collapsible Drawer */}
      <div className="glass-panel-subtle rounded-2xl p-3 sm:p-4 border border-slate-800 space-y-3">
        {/* Top search & mobile filter toggle row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product, note, category..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>

          {/* Toggle advanced filters button for mobile */}
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className={`sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
              showFiltersMobile || activeFiltersCount > 0
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Collapsible filters block (visible on desktop or when toggled on mobile) */}
        <div className={`${showFiltersMobile ? 'block' : 'hidden'} sm:block space-y-3 pt-1 sm:pt-0`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {/* Scope Selector */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Timeline Scope</label>
              <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setFilterScope('month')}
                  className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                    filterScope === 'month' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                  }`}
                >
                  {selectedMonth}
                </button>
                <button
                  onClick={() => setFilterScope('all')}
                  className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                    filterScope === 'all' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                  }`}
                >
                  All History
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Bills">Bills</option>
                <option value="Shopping">Shopping</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Health">Health</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Payment Method Filter */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Payment Method</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="ALL">All Methods</option>
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Flow Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="ALL">All Flows</option>
                <option value="EXPENSE">Expenses Only</option>
                <option value="INCOME">Income Only</option>
              </select>
            </div>
          </div>

          {/* Secondary Min/Max Amount and Sort */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 text-[11px]">Amount ₹:</span>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="Min"
                className="w-18 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 font-mono outline-none text-xs"
              />
              <span className="text-slate-600">-</span>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="Max"
                className="w-18 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 font-mono outline-none text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Sort:</span>
              <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                <button
                  onClick={() => setSortBy('date')}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                    sortBy === 'date' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                  }`}
                >
                  Date
                </button>
                <button
                  onClick={() => setSortBy('amount')}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                    sortBy === 'amount' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                  }`}
                >
                  Amount
                </button>
                <button
                  onClick={() => setSortBy('description')}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                    sortBy === 'description' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                  }`}
                >
                  Item
                </button>
              </div>

              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                title="Toggle sort direction"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction List: Card Mode (Mobile First) vs Table Mode */}
      {viewMode === 'cards' ? (
        <div className="space-y-3">
          {/* Quick Select All bar for cards */}
          <div className="flex items-center justify-between px-2 text-xs text-slate-400">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer py-1"
            >
              {selectedIds.length > 0 && selectedIds.length === filteredTransactions.length ? (
                <CheckSquare className="w-4 h-4 text-cyan-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span>
                {selectedIds.length > 0 
                  ? `${selectedIds.length} of ${filteredTransactions.length} selected` 
                  : 'Select All'}
              </span>
            </button>
            <span className="text-[11px] font-mono">{filteredTransactions.length} records</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTransactions.map((tx) => {
              const isSelected = selectedIds.includes(tx.id);
              return (
                <div
                  key={tx.id}
                  onClick={() => setInspectTx(tx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none active:scale-[0.99] ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                      : 'glass-panel-subtle border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectOne(tx.id);
                        }}
                        aria-label="Select transaction"
                        className="p-1 -ml-1 text-slate-400 hover:text-white cursor-pointer mt-0.5"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-mono text-slate-400">{tx.date}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                            {tx.category}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                            {tx.paymentMethod}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm sm:text-base mt-1 line-clamp-1">
                          {tx.description}
                        </h4>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className={`text-base sm:text-lg font-extrabold font-mono ${
                        tx.isIncome ? 'text-emerald-400' : 'text-slate-100'
                      }`}>
                        {tx.isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${
                        tx.isIncome ? 'text-emerald-400' : 'text-slate-500'
                      }`}>
                        {tx.isIncome ? 'Income' : 'Expense'}
                      </span>
                    </div>
                  </div>

                  {tx.notes && (
                    <p className="mt-2 text-xs text-slate-400 italic line-clamp-2 pl-6">
                      "{tx.notes}"
                    </p>
                  )}

                  {/* Card bottom actions */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs pl-6">
                    <span className="text-[10px] font-mono text-slate-500">ID: {tx.id.slice(-6)}</span>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setInspectTx(tx)}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenEditModal(tx)}
                        className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete expense "${tx.description}"?`)) {
                            deleteTransaction(tx.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="glass-panel rounded-2xl p-8 text-center text-xs text-slate-500">
              No transactions match the selected filters.
            </div>
          )}
        </div>
      ) : (
        /* Transaction Table (Desktop & Tablet) */
        <div className="glass-panel rounded-2xl sm:rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                  <th className="py-3.5 px-4 w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="text-slate-400 hover:text-white"
                    >
                      {selectedIds.length > 0 && selectedIds.length === filteredTransactions.length ? (
                        <CheckSquare className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-3 font-semibold">Date</th>
                  <th className="py-3.5 px-3 font-semibold">Description / Product</th>
                  <th className="py-3.5 px-3 font-semibold">Category</th>
                  <th className="py-3.5 px-3 font-semibold text-right">Amount</th>
                  <th className="py-3.5 px-3 font-semibold">Payment Method</th>
                  <th className="py-3.5 px-3 font-semibold">Notes</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTransactions.map((tx) => {
                  const isSelected = selectedIds.includes(tx.id);
                  return (
                    <tr
                      key={tx.id}
                      onDoubleClick={() => setInspectTx(tx)}
                      className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                        isSelected ? 'bg-cyan-500/5' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleSelectOne(tx.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          {tx.isIncome ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          )}
                          <span>{tx.description}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium text-[11px]">
                          {tx.category}
                        </span>
                      </td>
                      <td className={`py-3.5 px-3 text-right font-mono font-bold whitespace-nowrap ${
                        tx.isIncome ? 'text-emerald-400' : 'text-slate-100'
                      }`}>
                        {tx.isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3.5 px-3 text-slate-300 whitespace-nowrap">
                        {tx.paymentMethod}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400 truncate max-w-xs">
                        {tx.notes || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectTx(tx)}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenEditModal(tx)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete expense "${tx.description}"?`)) {
                                deleteTransaction(tx.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredTransactions.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-500">
                No transactions match the selected filters.
              </div>
            )}
          </div>

          {/* Ledger Footer Summary */}
          <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Showing {filteredTransactions.length} records</span>
            <span className="text-[11px] italic">
              Tip: Double-click any row to view full details modal
            </span>
          </div>
        </div>
      )}

      {/* Details Popup Modal */}
      <TransactionDetailModal
        transaction={inspectTx}
        onClose={() => setInspectTx(null)}
        onEdit={(tx) => onOpenEditModal(tx)}
        onDelete={(id) => deleteTransaction(id)}
      />

      {/* Bulk Delete Confirmation Modal (Requirement 12) */}
      {showBulkConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm glass-panel-glow rounded-3xl p-6 border border-rose-500/40 shadow-2xl text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Confirm Bulk Delete</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-rose-400">{selectedIds.length}</strong> selected transactions? This operation cannot be reversed.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowBulkConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-500/25"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
