import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { formatCurrency, getPreviousMonth, getNextMonth } from '../../utils/analytics';
import { Transaction } from '../../types/finance';

export const CalendarView: React.FC = () => {
  const { selectedMonth, setSelectedMonth, monthTransactions } = useFinance();

  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Calculate calendar grid
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 is Sunday

  // Map expenses per day
  const dayTransactionsMap = new Map<number, Transaction[]>();
  for (let i = 1; i <= daysInMonth; i++) {
    dayTransactionsMap.set(i, []);
  }

  monthTransactions.forEach(t => {
    const day = parseInt(t.date.split('-')[2], 10);
    if (day >= 1 && day <= daysInMonth) {
      dayTransactionsMap.get(day)?.push(t);
    }
  });

  const selectedDayTransactions = selectedDay ? dayTransactionsMap.get(selectedDay) || [] : [];
  const selectedDayTotal = selectedDayTransactions
    .filter(t => !t.isIncome)
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-3xl p-6 border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Expense Calendar Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Daily spending density calendar with transaction inspection
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-1.5">
          <button
            onClick={() => setSelectedMonth(getPreviousMonth(selectedMonth))}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 font-semibold text-xs text-white">
            {monthName}
          </span>
          <button
            onClick={() => setSelectedMonth(getNextMonth(selectedMonth))}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Calendar Matrix */}
        <div className="lg:col-span-2 glass-panel rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-slate-800">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-semibold text-slate-400 pb-2 sm:pb-3 border-b border-slate-800">
            <div><span className="sm:hidden">S</span><span className="hidden sm:inline">Sun</span></div>
            <div><span className="sm:hidden">M</span><span className="hidden sm:inline">Mon</span></div>
            <div><span className="sm:hidden">T</span><span className="hidden sm:inline">Tue</span></div>
            <div><span className="sm:hidden">W</span><span className="hidden sm:inline">Wed</span></div>
            <div><span className="sm:hidden">T</span><span className="hidden sm:inline">Thu</span></div>
            <div><span className="sm:hidden">F</span><span className="hidden sm:inline">Fri</span></div>
            <div><span className="sm:hidden">S</span><span className="hidden sm:inline">Sat</span></div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mt-2 sm:mt-3">
            {/* Blank leading days */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`blank-${idx}`} className="h-14 sm:h-20 rounded-xl sm:rounded-2xl bg-slate-900/20 border border-transparent" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const txList = dayTransactionsMap.get(dayNum) || [];
              const dayExpense = txList.filter(t => !t.isIncome).reduce((s, t) => s + t.amount, 0);
              const isSelected = selectedDay === dayNum;

              let heatBg = 'bg-slate-900/60 border-slate-800/80';
              if (dayExpense > 3000) heatBg = 'bg-rose-500/15 border-rose-500/40 text-rose-300';
              else if (dayExpense > 1000) heatBg = 'bg-amber-500/15 border-amber-500/40 text-amber-300';
              else if (dayExpense > 0) heatBg = 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300';

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`h-14 sm:h-20 p-1 sm:p-2 rounded-xl sm:rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${heatBg} ${
                    isSelected ? 'ring-2 ring-cyan-400 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]' : 'hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-300">
                      {dayNum}
                    </span>
                    {dayExpense > 0 && (
                      <span className="sm:hidden w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    )}
                  </div>

                  {dayExpense > 0 && (
                    <div className="text-right w-full overflow-hidden">
                      {/* Compact on mobile */}
                      <span className="sm:hidden text-[9px] font-mono font-bold truncate block">
                        {dayExpense >= 1000 ? `₹${(dayExpense / 1000).toFixed(1)}k` : `₹${dayExpense}`}
                      </span>

                      {/* Full on tablet/desktop */}
                      <span className="hidden sm:block text-[11px] font-mono font-bold truncate">
                        {formatCurrency(dayExpense)}
                      </span>
                      <span className="hidden sm:block text-[9px] text-slate-400">
                        {txList.length} tx
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Inspector */}
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {selectedDay ? `Day ${selectedDay} • ${monthName}` : 'Select a Day'}
              </h3>
              {selectedDay && (
                <span className="text-xs font-mono font-bold text-cyan-400">
                  Total: {formatCurrency(selectedDayTotal)}
                </span>
              )}
            </div>

            <div className="mt-4 space-y-2.5 max-h-[400px] overflow-y-auto">
              {!selectedDay ? (
                <div className="py-16 text-center text-xs text-slate-500">
                  Click on any day in the matrix to view specific transactions.
                </div>
              ) : selectedDayTransactions.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500">
                  No transactions recorded on this day.
                </div>
              ) : (
                selectedDayTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        {tx.isIncome ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        {tx.description}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {tx.category} • {tx.paymentMethod}
                      </p>
                    </div>
                    <span className={`text-xs font-mono font-bold ${
                      tx.isIncome ? 'text-emerald-400' : 'text-slate-200'
                    }`}>
                      {tx.isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
            Daily granularity synchronized with ledger
          </div>
        </div>
      </div>
    </div>
  );
};
