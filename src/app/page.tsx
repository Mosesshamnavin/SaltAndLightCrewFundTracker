'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTransactions } from '@/context/TransactionContext';
import { useAuth } from '@/context/AuthContext';
import { TransactionType } from '@/types';
import { formatINR, formatDate } from '@/lib/formatters';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  ArrowRight,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CheckCircle2,
} from 'lucide-react';

const CATEGORY_COLORS: { [key: string]: string } = {
  Offering: '#238B6F',
  'Alumni Contribution': '#3B82F6',
  Donation: '#10B981',
  Fundraising: '#0F766E',
  Sales: '#06B6D4',
  'Youth Activity': '#8B5CF6',
  Investment: '#10B981',
  'Product Purchase': '#EC4899',
  Utilities: '#F59E0B',
  'Vessel Rent': '#3B82F6',
  Printing: '#D95763',
  Other: '#737373',
};

// Rich Interactive Tooltip for Inflow vs Outflow Bar Chart
const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-dropdown text-white select-none min-w-[210px] pointer-events-none">
        <p className="text-xs font-semibold text-slate-100">{data.date}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {data.transactionCount} {data.transactionCount === 1 ? 'record' : 'records'}
        </p>

        <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Total Inflow:
            </span>
            <span className="font-semibold text-emerald-400">+{formatINR(data.income)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Total Outflow:
            </span>
            <span className="font-semibold text-rose-400">−{formatINR(data.expense)}</span>
          </div>

          <div className="flex items-center justify-between font-bold pt-1.5 border-t border-slate-800">
            <span className="text-slate-300">Net Surplus:</span>
            <span className={`tabular-nums ${data.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data.net >= 0 ? `+${formatINR(data.net)}` : `−${formatINR(Math.abs(data.net))}`}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { summary, activeTransactions, addTransaction } = useTransactions();
  const { isAdmin } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('income');
  const [isExiting, setIsExiting] = useState(false);

  const handleSaveTransaction = async (data: any) => {
    try {
      await addTransaction(data);
      const isInc = data.type === 'income';
      toast.success(isInc ? 'Income Recorded' : 'Expense Recorded', {
        description: `${isInc ? '+' : '-'} ₹${Number(data.amount).toLocaleString('en-IN')} for ${data.description}`,
      });
    } catch (err: any) {
      toast.error('Failed to record transaction', {
        description: err?.message || 'Please check your inputs.',
      });
    }
  };

  // 1. Grouped Inflow vs Outflow by Date for Comparison Bar Chart
  const barChartData = useMemo(() => {
    const groups: { [dateStr: string]: { date: string; income: number; expense: number; net: number; transactionCount: number; rawDate: Date } } = {};

    activeTransactions.forEach((tx) => {
      const dateKey = formatDate(tx.date);
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: dateKey,
          income: 0,
          expense: 0,
          net: 0,
          transactionCount: 0,
          rawDate: new Date(tx.date),
        };
      }
      if (tx.type === 'income') {
        groups[dateKey].income += tx.amount;
      } else {
        groups[dateKey].expense += tx.amount;
      }
      groups[dateKey].net = groups[dateKey].income - groups[dateKey].expense;
      groups[dateKey].transactionCount += 1;
    });

    const sorted = Object.values(groups).sort(
      (a, b) => a.rawDate.getTime() - b.rawDate.getTime()
    );

    if (sorted.length === 0) {
      return [{ date: 'Today', income: 0, expense: 0, net: 0, transactionCount: 0 }];
    }

    return sorted;
  }, [activeTransactions]);

  // 2. Pure Expense Breakdown by Category
  const expenseData = useMemo(() => {
    const expenses = activeTransactions.filter((tx) => tx.type === 'expense');
    const totalExp = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    const map: { [key: string]: number } = {};
    expenses.forEach((tx) => {
      map[tx.category] = (map[tx.category] || 0) + tx.amount;
    });

    const list = Object.entries(map).map(([name, amount]) => {
      const percentage = totalExp > 0 ? (amount / totalExp) * 100 : 0;
      return {
        name,
        amount,
        percentage,
        color: CATEGORY_COLORS[name] || '#EC4899',
      };
    }).sort((a, b) => b.amount - a.amount);

    return {
      list,
      totalExp,
      topExpenseCategory: list[0] || null,
    };
  }, [activeTransactions]);

  // 3. Financial Retention Rate
  const retentionRate = useMemo(() => {
    if (summary.totalIncome <= 0) return 0;
    const rate = ((summary.currentBalance) / summary.totalIncome) * 100;
    return Math.max(0, Math.min(100, Math.round(rate)));
  }, [summary]);

  return (
    <AppLayout>
      <div className={`space-y-6 pb-2 transition-all duration-200 ${isExiting ? 'opacity-0 -translate-y-4' : 'animate-page-enter'}`}>
        
        {/* Page Title & Context Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {isAdmin ? 'Treasury Overview' : 'Youth Funds Overview'}
            </h1>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-xs self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-800">INR (₹)</span>
            <span className="text-slate-300">|</span>
            <span>{isAdmin ? 'Admin Console' : 'Member View'}</span>
          </div>
        </div>

        {/* 1. TOP 3 BASIC FINANCIAL METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Available Balance */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between relative group">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Balance</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center border border-teal-100/80 shadow-xs">
                <Wallet size={19} />
              </div>
            </div>

            <div className="my-4">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                {formatINR(summary.currentBalance)}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Balance Status</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Available
              </span>
            </div>
          </div>

          {/* Card 2: Total Income */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Income</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80 shadow-xs">
                <ArrowDownRight size={20} />
              </div>
            </div>

            <div className="my-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 tracking-tight tabular-nums">
                +{formatINR(summary.totalIncome)}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Income received</span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                Money In
              </span>
            </div>
          </div>

          {/* Card 3: Total Expenses */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Expenses</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100/80 shadow-xs">
                <ArrowUpRight size={20} />
              </div>
            </div>

            <div className="my-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-rose-600 tracking-tight tabular-nums">
                −{formatINR(summary.totalExpenses)}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Expenses paid</span>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-md">
                Money Out
              </span>
            </div>
          </div>
        </div>

        {/* 2. ROLE-BASED CONTENT */}
        {!isAdmin ? (
          /* SIMPLE VIEW FOR REGULAR USERS: Simple Recent Activity list with no complex charts */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Recent Activity</h2>
              </div>

              <Link
                href="/transactions"
                className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {activeTransactions.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
                  <Receipt size={22} />
                </div>
                <p className="text-sm font-semibold text-slate-700">No transactions recorded yet</p>
                <p className="text-xs text-slate-400 mt-0.5">Money received and spent will show up here</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeTransactions.slice(0, 5).map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <div key={tx.id} className="py-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isIncome ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                            {tx.description}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span>{formatDate(tx.date)}</span>
                            <span>•</span>
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                              {tx.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-xs sm:text-sm font-bold tabular-nums ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isIncome ? `+ ${formatINR(tx.amount)}` : `− ${formatINR(tx.amount)}`}
                        </span>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {isIncome ? 'Income' : 'Expense'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ADVANCED ANALYTICS VIEW FOR ADMINS ONLY */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Inflow vs. Outflow Grouped Bar Comparison (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between shadow-card hover:shadow-card-hover transition-all">
              <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">Income vs. Expense Analytics</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Timeline of money received and spent</p>
                </div>

                {/* Legend & Status */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-lg">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
                      Income
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-rose-600" />
                      Expense
                    </span>
                  </div>
                </div>
              </div>

              {/* Bar Chart Container */}
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barChartData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                    barGap={6}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={{ stroke: '#E2E8F0' }}
                      tick={{ fill: '#64748B', fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar
                      dataKey="income"
                      name="Income"
                      fill="#059669"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                    />
                    <Bar
                      dataKey="expense"
                      name="Expense"
                      fill="#E11D48"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom Net Insight Ribbon */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Net Result:</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <ArrowUpRight size={13} />
                  +{formatINR(summary.currentBalance)} Surplus
                </span>
              </div>
            </div>

            {/* Right: Pure Expense Distribution & Allocation (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between shadow-card hover:shadow-card-hover transition-all">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">Expense Distribution</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Where youth funds are spent</p>
                </div>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200/60 px-2.5 py-1 rounded-lg tabular-nums">
                  −{formatINR(expenseData.totalExp)}
                </span>
              </div>

              {/* Visual Stacked Multi-Segment Segment Bar */}
              <div className="my-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium">Category allocation</span>
                  <span>{expenseData.list.length} {expenseData.list.length === 1 ? 'category' : 'categories'}</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 p-0.5 gap-0.5 border border-slate-200/50">
                  {expenseData.list.length === 0 ? (
                    <div className="w-full h-full bg-slate-200 rounded-full" />
                  ) : (
                    expenseData.list.map((cat) => (
                      <div
                        key={cat.name}
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: cat.color,
                        }}
                        className="h-full rounded-xs transition-all duration-300"
                        title={`${cat.name}: ${formatINR(cat.amount)} (${cat.percentage.toFixed(1)}%)`}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Category Rows with Progress Bars */}
              <div className="space-y-3 my-2 flex-1">
                {expenseData.list.length === 0 ? (
                  <div className="py-8 text-center flex flex-col items-center justify-center text-slate-400">
                    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-2">
                      <Receipt size={18} />
                    </div>
                    <p className="text-xs font-medium text-slate-600">No expenses recorded yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Expenses will be visualized here as they occur</p>
                  </div>
                ) : (
                  expenseData.list.slice(0, 4).map((cat) => (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                          <span className="text-slate-800 font-semibold truncate">{cat.name}</span>
                          <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {cat.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <span className="font-semibold text-slate-900 tabular-nums shrink-0 ml-2">
                          {formatINR(cat.amount)}
                        </span>
                      </div>

                      {/* Progress Bar Track */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Financial Health Summary Footer */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>Fund Retention:</span>
                  <strong className="text-slate-900 font-bold">{retentionRate}%</strong>
                </span>

                <Link
                  href="/transactions"
                  className="text-xs font-semibold text-primary hover:text-primary-hover inline-flex items-center gap-1 transition-colors"
                >
                  <span>View all</span>
                  <ArrowRight size={12} />
                </Link>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Add Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialType={modalType}
        onSave={handleSaveTransaction}
      />
    </AppLayout>
  );
}
