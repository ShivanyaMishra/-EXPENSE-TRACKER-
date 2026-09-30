import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { 
  User, 
  Wallet, 
  ShieldCheck, 
  Save, 
  Sparkles, 
  CheckCircle2, 
  Briefcase, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Target, 
  TrendingUp, 
  Sliders, 
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { formatCurrency } from '../../utils/analytics';
import { ExpenseCategory } from '../../types/finance';

export const ProfileView: React.FC = () => {
  const { userProfile, updateProfile } = useFinance();

  // Form local state
  const [formData, setFormData] = useState(userProfile);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New recurring payment item in form
  const [newRecName, setNewRecName] = useState('');
  const [newRecAmount, setNewRecAmount] = useState('');

  const allCategories: ExpenseCategory[] = [
    'Food',
    'Transport',
    'Bills',
    'Shopping',
    'Entertainment',
    'Health',
    'Investment',
    'Other'
  ];

  const toggleCategory = (cat: ExpenseCategory, listType: 'essential' | 'discretionary') => {
    if (listType === 'essential') {
      const current = new Set(formData.essentialCategories);
      if (current.has(cat)) current.delete(cat);
      else current.add(cat);
      setFormData(prev => ({ ...prev, essentialCategories: Array.from(current) }));
    } else {
      const current = new Set(formData.discretionaryCategories);
      if (current.has(cat)) current.delete(cat);
      else current.add(cat);
      setFormData(prev => ({ ...prev, discretionaryCategories: Array.from(current) }));
    }
  };

  const handleAddRecurring = () => {
    const amt = parseFloat(newRecAmount);
    if (!newRecName.trim() || isNaN(amt) || amt <= 0) return;

    setFormData(prev => ({
      ...prev,
      recurringPayments: [
        ...(prev.recurringPayments || []),
        { name: newRecName.trim(), amount: amt, frequency: 'Monthly' }
      ]
    }));
    setNewRecName('');
    setNewRecAmount('');
  };

  const handleRemoveRecurring = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      recurringPayments: (prev.recurringPayments || []).filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Calculated discretionary cashflow preview
  const monthlyInc = formData.monthlyIncome + (formData.otherIncome || 0);
  const fixedExp = formData.fixedMonthlyExpenses || 0;
  const savingsTarget = formData.monthlySavingsTarget || 0;
  const calculatedDiscretionaryAllowance = Math.max(0, monthlyInc - fixedExp - savingsTarget);

  return (
    <div className="space-y-6 pb-14 animate-in fade-in duration-300">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-xl">
            <div className="w-full h-full bg-[#090b10] rounded-[14px] flex items-center justify-center text-xl font-black text-cyan-300">
              {formData.fullName.split(' ').map(n => n[0]).join('').slice(0, 2) || 'AF'}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{formData.fullName}</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Active Profile
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {formData.occupation || 'Personal Account'} • {formData.cityCountry || 'Global'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Profile Changes</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Personal profile updated successfully. AI context has been refreshed.</span>
        </div>
      )}

      {/* Profile Metrics Overview Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel-subtle p-4 rounded-2xl border border-slate-800">
          <span className="text-slate-400 text-xs block">Combined Monthly Inflow</span>
          <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {formatCurrency(monthlyInc)}
          </p>
          <span className="text-[11px] text-slate-500">primary + other income</span>
        </div>

        <div className="glass-panel-subtle p-4 rounded-2xl border border-slate-800">
          <span className="text-slate-400 text-xs block">Fixed Commitments</span>
          <p className="text-xl font-bold font-mono text-slate-200 mt-1">
            {formatCurrency(fixedExp)}
          </p>
          <span className="text-[11px] text-slate-500">rent, utilities, baseline bills</span>
        </div>

        <div className="glass-panel-subtle p-4 rounded-2xl border border-slate-800">
          <span className="text-slate-400 text-xs block">Savings Target Buffer</span>
          <p className="text-xl font-bold font-mono text-cyan-300 mt-1">
            {formatCurrency(savingsTarget)}
          </p>
          <span className="text-[11px] text-slate-500">monthly planned savings</span>
        </div>

        <div className="glass-panel-subtle p-4 rounded-2xl border border-slate-800">
          <span className="text-slate-400 text-xs block">Discretionary Allowance</span>
          <p className="text-xl font-bold font-mono text-indigo-300 mt-1">
            {formatCurrency(calculatedDiscretionaryAllowance)}
          </p>
          <span className="text-[11px] text-slate-500">free cashflow for living</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <User className="w-4 h-4 text-cyan-400" />
            Basic Profile Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Occupation
              </label>
              <input
                type="text"
                value={formData.occupation || ''}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                placeholder="e.g., Software Engineer, Designer"
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Age (Optional)
              </label>
              <input
                type="number"
                value={formData.age || ''}
                onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                placeholder="e.g., 28"
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                City / Country
              </label>
              <input
                type="text"
                value={formData.cityCountry || ''}
                onChange={(e) => setFormData({ ...formData, cityCountry: e.target.value })}
                placeholder="e.g., Bengaluru, India"
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Preferred Currency Symbol
              </label>
              <select
                value={formData.preferredCurrency}
                onChange={(e) => setFormData({ ...formData, preferredCurrency: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              >
                <option value="₹">₹ (INR - Indian Rupee)</option>
                <option value="$">$ (USD - US Dollar)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="£">£ (GBP - British Pound)</option>
                <option value="¥">¥ (JPY - Japanese Yen)</option>
                <option value="A$">A$ (AUD - Australian Dollar)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Primary Financial Preference / Focus
              </label>
              <input
                type="text"
                value={formData.financialPreference || ''}
                onChange={(e) => setFormData({ ...formData, financialPreference: e.target.value })}
                placeholder="e.g., Wealth Accumulation, Debt Freedom, Travel"
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Financial Information */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              Financial Information & Baseline Inflow
            </h2>
            <span className="text-[11px] text-slate-500">Sensitive fields are strictly optional</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Primary Monthly Income (₹) *
              </label>
              <input
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) => setFormData({ ...formData, monthlyIncome: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Secondary / Other Income (₹)
              </label>
              <input
                type="number"
                value={formData.otherIncome || ''}
                onChange={(e) => setFormData({ ...formData, otherIncome: parseFloat(e.target.value) || 0 })}
                placeholder="e.g., 15000"
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Fixed Monthly Expenses (₹)
              </label>
              <input
                type="number"
                value={formData.fixedMonthlyExpenses || ''}
                onChange={(e) => setFormData({ ...formData, fixedMonthlyExpenses: parseFloat(e.target.value) || 0 })}
                placeholder="e.g., 18000"
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Expected Monthly Savings (₹)
              </label>
              <input
                type="number"
                value={formData.expectedMonthlySavings || ''}
                onChange={(e) => setFormData({ ...formData, expectedMonthlySavings: parseFloat(e.target.value) || 0 })}
                placeholder="e.g., 25000"
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Existing Liquid Savings / Cushion (₹)
              </label>
              <input
                type="number"
                value={formData.existingSavings || ''}
                onChange={(e) => setFormData({ ...formData, existingSavings: parseFloat(e.target.value) || 0 })}
                placeholder="e.g., 120000"
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Outstanding Debts / Loans (Optional) (₹)
              </label>
              <input
                type="number"
                value={formData.debtLoans || ''}
                onChange={(e) => setFormData({ ...formData, debtLoans: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
              />
            </div>
          </div>

          {/* Recurring Payments List */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Recognized Recurring Monthly Commitments:
            </h3>

            <div className="space-y-2 max-w-lg">
              {(formData.recurringPayments || []).map((rec, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <div>
                    <span className="font-semibold text-white">{rec.name}</span>
                    <span className="text-[10px] text-slate-400 block">{rec.frequency}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-200">{formatCurrency(rec.amount)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRecurring(i)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add recurring sub-form */}
            <div className="mt-3 flex flex-wrap items-center gap-2 max-w-lg">
              <input
                type="text"
                value={newRecName}
                onChange={(e) => setNewRecName(e.target.value)}
                placeholder="Commitment name (e.g. Gym, Netflix)"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
              />
              <input
                type="number"
                value={newRecAmount}
                onChange={(e) => setNewRecAmount(e.target.value)}
                placeholder="₹ Amount"
                className="w-24 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none"
              />
              <button
                type="button"
                onClick={handleAddRecurring}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Financial Preferences & Risk Tuning */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Budgeting & AI Advisory Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Monthly Spending Ceiling (₹)
              </label>
              <input
                type="number"
                value={formData.monthlySpendingLimit || ''}
                onChange={(e) => setFormData({ ...formData, monthlySpendingLimit: parseFloat(e.target.value) || 0 })}
                placeholder="e.g., 32000"
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Monthly Savings (₹)
              </label>
              <input
                type="number"
                value={formData.monthlySavingsTarget || ''}
                onChange={(e) => setFormData({ ...formData, monthlySavingsTarget: parseFloat(e.target.value) || 0 })}
                placeholder="e.g., 10000"
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Budget Recommendation Risk Profile
              </label>
              <select
                value={formData.riskPreference}
                onChange={(e) => setFormData({ ...formData, riskPreference: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              >
                <option value="Conservative">Conservative (Strict Caps & Maximum Safety)</option>
                <option value="Balanced">Balanced (Balanced Flexibility & Solid Savings)</option>
                <option value="Aggressive">Aggressive (High Growth & Investment Bias)</option>
              </select>
            </div>
          </div>

          {/* Essential vs Discretionary Categories Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pt-5 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1.5">
                Categories Considered Essential:
              </label>
              <p className="text-[11px] text-slate-400 mb-3">
                The AI will protect these categories from harsh austerity suggestions.
              </p>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((c) => {
                  const isChecked = formData.essentialCategories.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCategory(c, 'essential')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isChecked
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow'
                          : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}{c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-400 mb-1.5">
                Categories Considered Discretionary:
              </label>
              <p className="text-[11px] text-slate-400 mb-3">
                The AI will first target these when searching for reducible outlays.
              </p>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((c) => {
                  const isChecked = formData.discretionaryCategories.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCategory(c, 'discretionary')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isChecked
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                          : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}{c}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Update Profile & Recalibrate AI Context</span>
          </button>
        </div>
      </form>
    </div>
  );
};
