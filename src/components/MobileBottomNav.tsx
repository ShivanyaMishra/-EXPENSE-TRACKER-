import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Bot, 
  PieChart, 
  Menu,
  Plus
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenAddModal: () => void;
  onOpenMobileMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenAddModal,
  onOpenMobileMenu,
}) => {
  const { activeTab, setActiveTab } = useFinance();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Ledger', icon: ReceiptText },
    { id: 'ai-assistant', label: 'Assistant', icon: Bot, isAi: true },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090b10]/95 backdrop-blur-xl border-t border-slate-800/90 pb-safe shadow-2xl">
      <div className="flex items-center justify-around h-16 px-1.5 max-w-lg mx-auto">
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all active:scale-95 cursor-pointer ${
                isActive ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${
                isActive ? 'bg-cyan-500/15 text-cyan-400' : ''
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* Center Quick Add floating button */}
        <button
          onClick={onOpenAddModal}
          aria-label="Add Expense"
          className="flex flex-col items-center justify-center -mt-6 mx-1 group cursor-pointer active:scale-90 transition-transform"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-cyan-400 via-sky-400 to-blue-600 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/40 ring-4 ring-[#090b10]">
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <span className="text-[9px] font-bold text-cyan-300 mt-0.5 tracking-wide uppercase">Add</span>
        </button>

        {navItems.slice(2).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all active:scale-95 cursor-pointer ${
                isActive ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${
                isActive 
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-sm shadow-cyan-500/30' 
                  : item.isAi ? 'text-cyan-400' : ''
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* More Menu toggle */}
        <button
          onClick={onOpenMobileMenu}
          aria-label="More navigation items"
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-slate-400 hover:text-slate-200 active:scale-95 cursor-pointer"
        >
          <div className="p-1 rounded-xl">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">More</span>
        </button>
      </div>
    </nav>
  );
};
