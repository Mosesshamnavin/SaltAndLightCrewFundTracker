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

    let rangeLabel = 'This Month';
    if (rangePreset === 'this-month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      startDate = start.toISOString().split('T')[0];
      endDate = end.toISOString().split('T')[0];
      rangeLabel = `This Month (${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`;
    } else if (rangePreset === 'last-month') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      startDate = start.toISOString().split('T')[0];
      endDate = end.toISOString().split('T')[0];
      rangeLabel = `Last Month (${start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`;
    } else if (rangePreset === 'last-3-months') {
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      startDate = start.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
      rangeLabel = 'Last 3 Months';
    } else if (rangePreset === 'this-year') {
      startDate = `${now.getFullYear()}-01-01`;
      endDate = `${now.getFullYear()}-12-31`;
      rangeLabel = `This Year (${now.getFullYear()})`;
    } else if (rangePreset === 'custom') {
      startDate = customStart || '1970-01-01';
      endDate = customEnd || '2099-12-31';
      rangeLabel = customStart && customEnd ? `${customStart} to ${customEnd}` : 'Custom Range';
    }

    const res = activeTransactions.filter((t) => {
      if (!t.date) return false;
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      return true;
    });

    return { filtered: res, rangeLabel };
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
      <div className="space-y-6 pb-4 animate-page-enter">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Financial Reports
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                {rangeLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-xs transition-all cursor-pointer active:scale-[0.98]"
            >
              <Printer size={15} className="text-primary" />
              <span>Print / Save PDF Report</span>
            </button>
          </div>
        </div>

        {/* Preset Selector Bar */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-card border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/60">
            {[
              { id: 'this-month', label: 'This Month' },
              { id: 'last-month', label: 'Last Month' },
              { id: 'last-3-months', label: 'Last 3 Months' },
              { id: 'this-year', label: 'This Year' },
              { id: 'custom', label: 'Custom Range' },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setRangePreset(btn.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  rangePreset === btn.id
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {rangePreset === 'custom' && (
            <div className="flex items-center gap-2 pt-1 md:pt-0">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary"
              />
              <span className="text-xs text-slate-400 font-medium">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary"
              />
            </div>
          )}
        </div>

        {/* 3 Summary Cards for Chosen Period */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Income */}
          <div className="bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover border border-slate-200/80 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Income</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <ArrowDownLeft size={18} />
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tabular-nums tracking-tight">
                +{formatINR(incomeTotal)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{rangeLabel}</p>
            </div>
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Money received</span>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">Money In</span>
            </div>
          </div>

          {/* Expenses */}
          <div className="bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover border border-slate-200/80 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Expenses</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <ArrowUpRight size={18} />
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 tabular-nums tracking-tight">
                −{formatINR(expenseTotal)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{rangeLabel}</p>
            </div>
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Money spent</span>
              <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px]">Money Out</span>
            </div>
          </div>

          {/* Net Balance */}
          <div className="bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover border border-slate-200/80 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Remaining Balance</span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-primary flex items-center justify-center border border-teal-100">
                <Wallet size={18} />
              </div>
            </div>
            <div className="my-3">
              <div className={`text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight ${netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                {formatINR(netBalance)}
              </div>
            </div>
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Period result</span>
              <span className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                netBalance >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
              }`}>
                {netBalance >= 0 ? 'Surplus' : 'Deficit'}
              </span>
            </div>
          </div>
        </div>

        {/* Category Breakdown Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income by Category */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200/80">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieIcon size={16} className="text-emerald-600" />
                <span>Income Breakdown</span>
              </h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-lg tabular-nums">
                +{formatINR(incomeTotal)}
              </span>
            </div>

            <div className="mt-4 space-y-3.5">
              {incomeBreakdown.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <p className="text-xs font-medium text-slate-600">No income records in this period</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Try choosing a wider date range</p>
                </div>
              ) : (
                incomeBreakdown.map((item, idx) => (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800">{item.category}</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {formatINR(item.amount)} <span className="text-slate-400 font-normal">({item.percentage}%)</span>
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
          <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200/80">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieIcon size={16} className="text-rose-600" />
                <span>Expense Breakdown</span>
              </h3>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200/60 px-2.5 py-0.5 rounded-lg tabular-nums">
                −{formatINR(expenseTotal)}
              </span>
            </div>

            <div className="mt-4 space-y-3.5">
              {expenseBreakdown.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <p className="text-xs font-medium text-slate-600">No expense records in this period</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Expenses will show here as they occur</p>
                </div>
              ) : (
                expenseBreakdown.map((item, idx) => (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800">{item.category}</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {formatINR(item.amount)} <span className="text-slate-400 font-normal">({item.percentage}%)</span>
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
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/80 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Transactions in Period ({filtered.length} records)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{rangeLabel}</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 text-slate-700">
              Report View
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-5 text-right">Income (INR ₹)</th>
                  <th className="py-3 px-5 text-right">Expense (INR ₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <p className="font-semibold text-slate-700 text-xs">No records for this selected period</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Select a different time range or add transactions</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-medium text-slate-600 whitespace-nowrap">
                        <span className="bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded text-xs">
                          {formatDate(t.date)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{t.category}</td>
                      <td className="py-3.5 px-4 text-slate-600 truncate max-w-sm">{t.description}</td>
                      <td className="py-3.5 px-5 text-right font-bold text-emerald-600 tabular-nums whitespace-nowrap">
                        {t.type === 'income' ? `+ ${formatINR(t.amount)}` : '—'}
                      </td>
                      <td className="py-3.5 px-5 text-right font-bold text-rose-600 tabular-nums whitespace-nowrap">
                        {t.type === 'expense' ? `− ${formatINR(t.amount)}` : '—'}
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
