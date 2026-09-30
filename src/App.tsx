import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { DashboardView } from './components/views/DashboardView';
import { TransactionsView } from './components/views/TransactionsView';
import { AIAdvisorView } from './components/views/AIAdvisorView';
import { AIAssistantView } from './components/views/AIAssistantView';
import { ProfileView } from './components/views/ProfileView';
import { BudgetsView } from './components/views/BudgetsView';
import { SavingsGoalsView } from './components/views/SavingsGoalsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { ThreeDAnalyticsView } from './components/views/ThreeDAnalyticsView';
import { CalendarView } from './components/views/CalendarView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';
import { TransactionModal } from './components/TransactionModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Transaction } from './types/finance';

function MainApp() {
  const { activeTab } = useFinance();

  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Transaction Modal state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsTxModalOpen(true);
  };

  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTxModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[#090b10] text-slate-100">
      {/* Sidebar Navigation: Desktop sticky + Mobile off-canvas drawer */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar
          onOpenAddModal={handleOpenAddModal}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-3 sm:p-5 lg:p-8 pb-24 lg:pb-12 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'transactions' && (
            <TransactionsView
              onOpenAddModal={handleOpenAddModal}
              onOpenEditModal={handleOpenEditModal}
            />
          )}
          {activeTab === 'ai-assistant' && <AIAssistantView />}
          {activeTab === 'ai-advisor' && <AIAdvisorView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === '3d-analytics' && <ThreeDAnalyticsView />}
          {activeTab === 'budgets' && <BudgetsView />}
          {activeTab === 'savings-goals' && <SavingsGoalsView />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'export' && <ReportsView />}
          {activeTab === 'profile' && <ProfileView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <MobileBottomNav
        onOpenAddModal={handleOpenAddModal}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* Global Add/Edit Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        editTransaction={editingTransaction}
      />
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <MainApp />
    </FinanceProvider>
  );
}
