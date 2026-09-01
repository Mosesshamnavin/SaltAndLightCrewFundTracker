'use client';

import React from 'react';
import { PlusCircle, MinusCircle, Eye } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface QuickActionBarProps {
  onAddIncome: () => void;
  onAddExpense: () => void;
}

export const QuickActionBar: React.FC<QuickActionBarProps> = ({
  onAddIncome,
  onAddExpense,
}) => {
  const { isAdmin } = useAuth();

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-card border border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      <div>
        <h3 className="text-sm font-bold text-slate-800">Quick Transaction Entry</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {!isAdmin
            ? 'User Mode: Read-only access to view all transparent balances and records.'
            : 'Record tithes, offerings, donations or church expenses in one click.'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {!isAdmin ? (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3.5 py-2 rounded-xl">
            <Eye size={16} className="text-slate-400" />
            <span>Read-Only User Access</span>
          </div>
        ) : (
          <>
            <button
              onClick={onAddIncome}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-sm shadow-sm shadow-emerald-200 transition"
            >
              <PlusCircle size={18} />
              <span>Add Income</span>
            </button>

            <button
              onClick={onAddExpense}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-semibold text-sm shadow-sm shadow-rose-200 transition"
            >
              <MinusCircle size={18} />
              <span>Add Expense</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
