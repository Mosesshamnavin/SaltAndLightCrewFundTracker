'use client';

import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTransactions } from '@/context/TransactionContext';
import { formatINR, formatINRCompact, formatDate } from '@/lib/formatters';
import {
  calculateCategoryBreakdown,
  filterActiveTransactions,
} from '@/lib/financial-calculations/calculations';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Calendar,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart3,
} from 'lucide-react';

export default function ReportsPage() {
  const { activeTransactions } = useTransactions();
  const [rangePreset, setRangePreset] = useState<string>('this-month');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  // Calculate target date range
  const { filtered, rangeLabel } = useMemo(() => {
    const now = new Date();
    let startDate: string | null = null;
    let endDate: string | null = null;
    let label = 'Current Month';

    if (rangePreset === 'this-month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      startDate = start.toISOString().split('T')[0];
      endDate = end.toISOString().split('T')[0];
      label = `This Month (${new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(now)})`;
    } else if (rangePreset === 'last-month') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      startDate = start.toISOString().split('T')[0];
      endDate = end.toISOString().split('T')[0];
      label = `Last Month (${new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(start)})`;
    } else if (rangePreset === 'last-3-months') {
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      startDate = start.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
      label = 'Last 3 Months';
    } else if (rangePreset === 'this-year') {
      startDate = `${now.getFullYear()}-01-01`;
      endDate = `${now.getFullYear()}-12-31`;
      label = `Year ${now.getFullYear()}`;
    } else if (rangePreset === 'custom') {
      startDate = customStart || '1970-01-01';
      endDate = customEnd || '2099-12-31';
      label = `Custom (${customStart ? formatDate(customStart) : 'Start'} to ${customEnd ? formatDate(customEnd) : 'End'})`;
    }

    const res = activeTransactions.filter((t) => {
      if (!t.date) return false;
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      return true;
    });

    return { filtered: res, rangeLabel: label };
  }, [activeTransactions, rangePreset, customStart, customEnd]);

  // Aggregate Metrics
  const incomeTotal = useMemo(
    () => filtered.filter((t) => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
    [filtered]
  );

  const expenseTotal = useMemo(
    () => filtered.filter((t) => t.type === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
    [filtered]
  );

  const netBalance = incomeTotal - expenseTotal;

  // Breakdown by Category
  const incomeBreakdown = useMemo(() => calculateCategoryBreakdown(filtered, 'income'), [filtered]);
  const expenseBreakdown = useMemo(() => calculateCategoryBreakdown(filtered, 'expense'), [filtered]);

  const PIE_COLORS = ['#059669', '#0c8ee9', '#6d28d9', '#d97706', '#0284c7', '#10b981', '#f59e0b'];
  const EXPENSE_PIE_COLORS = ['#e11d48', '#f97316', '#8b5cf6', '#ec4899', '#f43f5e', '#64748b', '#06b6d4'];

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Financial Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Clear, transparent income vs expense statements & category allocations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm transition"
            >
              <Printer size={15} />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Preset Selector Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'this-month', label: 'This Month' },
              { id: 'last-month', label: 'Last Month' },
              { id: 'last-3-months', label: 'Last 3 Months' },
              { id: 'this-year', label: 'This Year' },
              { id: 'custom', label: 'Custom Range' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setRangePreset(btn.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  rangePreset === btn.id
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {rangePreset === 'custom' && (
            <div className="flex items-center gap-2 pt-2 md:pt-0">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          )}
        </div>

        {/* 3 Summary Cards for Chosen Period */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Income */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-emerald-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Period Income</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <ArrowDownLeft size={20} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {formatINR(incomeTotal)}
              </div>
              <p className="text-xs text-slate-500 mt-1">{rangeLabel}</p>
            </div>
          </div>

          {/* Expenses */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-rose-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Period Expenses</span>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                <ArrowUpRight size={20} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">
                {formatINR(expenseTotal)}
              </div>
              <p className="text-xs text-slate-500 mt-1">{rangeLabel}</p>
            </div>
          </div>

          {/* Net Balance */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-brand-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Net Surplus / Balance</span>
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200">
                <Wallet size={20} />
              </div>
            </div>
            <div className="mt-3">
              <div className={`text-2xl sm:text-3xl font-extrabold ${netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                {formatINR(netBalance)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {netBalance >= 0 ? 'Surplus recorded' : 'Deficit for period'}
              </p>
            </div>
          </div>
        </div>

        {/* Category Breakdown Breakdown Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income by Category */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-card border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <PieIcon size={16} className="text-emerald-600" />
                Income Sources Breakdown
              </h3>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Total: {formatINR(incomeTotal)}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {incomeBreakdown.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">No income records in this period.</p>
              ) : (
                incomeBreakdown.map((item, idx) => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{item.category}</span>
                      <span className="font-medium text-slate-600">
                        {formatINR(item.amount)} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Expenses by Category */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-card border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <PieIcon size={16} className="text-rose-600" />
                Expense Allocations Breakdown
              </h3>
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full">
                Total: {formatINR(expenseTotal)}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {expenseBreakdown.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">No expense records in this period.</p>
              ) : (
                expenseBreakdown.map((item, idx) => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{item.category}</span>
                      <span className="font-medium text-slate-600">
                        {formatINR(item.amount)} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: EXPENSE_PIE_COLORS[idx % EXPENSE_PIE_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Detailed Transactions for the Report */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800">
              Statement Activity ({filtered.length} transactions)
            </h3>
            <span className="text-xs text-slate-500">{rangeLabel}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Income (INR ₹)</th>
                  <th className="py-3 px-4 text-right">Expense (INR ₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No records for this selected period.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {formatDate(t.date)}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{t.category}</td>
                      <td className="py-2.5 px-4 text-slate-600 truncate max-w-sm">{t.description}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-600 whitespace-nowrap">
                        {t.type === 'income' ? formatINR(t.amount) : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-rose-600 whitespace-nowrap">
                        {t.type === 'expense' ? formatINR(t.amount) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
