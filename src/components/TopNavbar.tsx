import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Bell, 
  Plus, 
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldAlert,
  Menu
} from 'lucide-react';
import { getPreviousMonth, getNextMonth } from '../utils/analytics';

interface TopNavbarProps {
  onOpenAddModal: () => void;
  onToggleMobileMenu?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ 
  onOpenAddModal, 
  onToggleMobileMenu 
}) => {
  const { 
    selectedMonth, 
    setSelectedMonth, 
    searchQuery, 
    setSearchQuery, 
    notifications, 
    unreadNotificationCount,
    markNotificationAsRead,
    clearAllNotifications,
    setActiveTab,
    strictBudgetMode,
    userProfile,
  } = useFinance();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Parse YYYY-MM to readable name e.g. "October 2026"
  const formatMonthTitle = (ym: string) => {
    const [year, month] = ym.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const handlePrevMonth = () => {
    setSelectedMonth(getPreviousMonth(selectedMonth));
  };

  const handleNextMonth = () => {
    setSelectedMonth(getNextMonth(selectedMonth));
  };

  return (
    <header className="sticky top-0 z-40 h-16 sm:h-18 border-b border-slate-800/80 bg-[#090b10]/90 backdrop-blur-xl px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
      {/* Left: Mobile Menu Toggle & Month Navigator */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            aria-label="Toggle Navigation Drawer"
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Compact & Touch-Friendly Month Navigator */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-0.5 sm:p-1 shadow-inner">
          <button
            onClick={handlePrevMonth}
            aria-label="Previous Month"
            className="p-1 sm:p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 rounded-lg transition-all"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-0.5 sm:py-1 font-semibold text-slate-200 text-xs sm:text-sm tracking-wide">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
            <span className="whitespace-nowrap">{formatMonthTitle(selectedMonth)}</span>
          </div>

          <button
            onClick={handleNextMonth}
            aria-label="Next Month"
            className="p-1 sm:p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 rounded-lg transition-all"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {strictBudgetMode && (
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-medium">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Strict Budget</span>
          </div>
        )}
      </div>

      {/* Center Search Bar for Medium & Desktop Screens */}
      <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search transactions, products..."
          className="w-full bg-slate-900/70 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 transition-all outline-none"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Mobile Search Toggle Icon */}
        <button
          onClick={() => setShowMobileSearch(!showMobileSearch)}
          className="md:hidden p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick Add Expense Button (Desktop / Tablet) */}
        <button
          onClick={onOpenAddModal}
          className="hidden sm:flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold px-3 sm:px-4 py-2 rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all text-xs sm:text-sm cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Expense</span>
        </button>

        {/* Notifications Icon & Responsive Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            aria-label="View notifications"
            className="relative p-2 sm:p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white transition-all"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm glass-panel rounded-2xl shadow-2xl p-4 z-50 border border-slate-700/60 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-slate-200 text-xs sm:text-sm">Notifications</span>
                  <span className="bg-cyan-500/20 text-cyan-300 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-mono">
                    {unreadNotificationCount} new
                  </span>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 py-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No recent notifications. You're all caught up!
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.linkTab) setActiveTab(n.linkTab);
                        setShowNotifMenu(false);
                      }}
                      className={`p-3 rounded-xl hover:bg-slate-800/40 transition-colors cursor-pointer flex gap-3 ${
                        !n.read ? 'bg-cyan-500/5' : ''
                      }`}
                    >
                      <div className="mt-0.5">
                        {n.type === 'budget_exceeded' ? (
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                        ) : n.type === 'budget_warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-cyan-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-200 truncate">{n.title}</p>
                          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Status Avatar */}
        <div 
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-800 cursor-pointer hover:opacity-85 transition-opacity"
          title="Open Profile"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-md">
            <div className="w-full h-full bg-[#090b10] rounded-[10px] flex items-center justify-center font-bold text-[11px] sm:text-xs text-cyan-300">
              {userProfile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AF'}
            </div>
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">{userProfile.fullName}</p>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live Synced
            </p>
          </div>
        </div>
      </div>

      {/* Collapsible Search Input for Mobile Screen */}
      {showMobileSearch && (
        <div className="md:hidden absolute top-16 left-0 right-0 p-3 bg-[#090b10] border-b border-slate-800 z-50 flex items-center gap-2 animate-in slide-in-from-top-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              autoFocus
              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowMobileSearch(false)}
            className="p-2 text-xs text-slate-400 font-semibold"
          >
            Cancel
          </button>
        </div>
      )}
    </header>
  );
};
