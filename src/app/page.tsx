'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTransactions } from '@/context/TransactionContext';
import { useAuth } from '@/context/AuthContext';
import { TransactionType } from '@/types';
import { formatINR, formatDate } from '@/lib/formatters';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { ScrollPageBridge } from '@/components/layout/ScrollPageBridge';
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
      <div className="bg-[#0D1522] border border-white/20 rounded-xl p-3.5 shadow-2xl text-white select-none min-w-[210px] pointer-events-none">
        <p className="text-xs font-semibold text-[#F7F7F5]">{data.date}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{data.transactionCount} {data.transactionCount === 1 ? 'record' : 'records'}</p>

        <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#238B6F]" />
              Total Inflow:
            </span>
            <span className="font-semibold text-[#238B6F]">+{formatINR(data.income)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#D95763]" />
              Total Outflow:
            </span>
            <span className="font-semibold text-[#D95763]">−{formatINR(data.expense)}</span>
          </div>

          <div className="flex items-center justify-between font-bold pt-1.5 border-t border-white/10">
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
      <div className={`space-y-5 pb-2 transition-all duration-200 ${isExiting ? 'opacity-0 -translate-y-4' : 'animate-page-enter'}`}>
        
        {/* 1. TOP 3 FINANCIAL METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Available Balance */}
          <div className="bg-[#0D1522] text-white rounded-[20px] p-6 border border-[#162234] flex flex-col justify-between relative overflow-hidden shadow-[0_4px_20px_-4px_rgba(13,21,34,0.12)]">
            {/* Subtle Top Inner Amber Highlight */}
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/25 to-transparent pointer-events-none" />

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">Available balance</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F7F7F5] mt-3 tabular-nums">
                {formatINR(summary.currentBalance)}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span className="text-slate-400">Available youth funds</span>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded">
                Active
              </span>
            </div>
          </div>

          {/* Card 2: Total Income */}
          <div className="bg-white border border-[#ECE9E2] rounded-[20px] p-6 flex flex-col justify-between shadow-[0_2px_10px_-3px_rgba(20,28,40,0.04)] hover:shadow-[0_6px_20px_-4px_rgba(20,28,40,0.06)] transition-all duration-200">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#737373]">Total income</span>
                <span className="w-2 h-2 rounded-full bg-[#238B6F]" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-[#1C1C1E] mt-3 tracking-tight tabular-nums">
                +{formatINR(summary.totalIncome)}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#ECE9E2] flex items-center justify-between text-xs text-[#737373]">
              <span>+ money received</span>
              <span className="text-[11px] font-semibold text-[#238B6F] bg-emerald-50 px-2 py-0.5 rounded">
                Verified
              </span>
            </div>
          </div>

          {/* Card 3: Total Expense */}
          <div className="bg-white border border-[#ECE9E2] rounded-[20px] p-6 flex flex-col justify-between shadow-[0_2px_10px_-3px_rgba(20,28,40,0.04)] hover:shadow-[0_6px_20px_-4px_rgba(20,28,40,0.06)] transition-all duration-200">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#737373]">Total expense</span>
                <span className="w-2 h-2 rounded-full bg-[#D95763]" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-[#1C1C1E] mt-3 tracking-tight tabular-nums">
                −{formatINR(summary.totalExpenses)}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#ECE9E2] flex items-center justify-between text-xs text-[#737373]">
              <span>money spent</span>
              <span className="text-[11px] font-semibold text-[#D95763] bg-rose-50 px-2 py-0.5 rounded">
                Audited
              </span>
            </div>
          </div>
        </div>

        {/* 2. REFINED OPTION 1 FINANCIAL CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left: Inflow vs. Outflow Grouped Bar Comparison (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#ECE9E2] rounded-[20px] p-6 flex flex-col justify-between shadow-[0_2px_10px_-3px_rgba(20,28,40,0.04)]">
            <div className="pb-4 border-b border-[#ECE9E2] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-[#1C1C1E]">Inflow vs. Outflow</h2>
                <p className="text-xs text-[#737373] mt-0.5">Comparison of total receipts and expenditures</p>
              </div>

              {/* Legend & Net Status Pill */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 text-xs font-medium text-[#737373]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#238B6F]" />
                    Income
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#D95763]" />
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0EC" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={{ stroke: '#ECE9E2' }}
                    tick={{ fill: '#737373', fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#737373', fontSize: 11 }}
                    tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#238B6F"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={38}
                  />
                  <Bar
                    dataKey="expense"
                    name="Expense"
                    fill="#D95763"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={38}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Net Insight Ribbon */}
            <div className="mt-2 pt-3 border-t border-[#ECE9E2] flex items-center justify-between text-xs">
              <span className="text-[#737373]">Net Growth:</span>
              <span className="font-semibold text-[#238B6F] bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                <ArrowUpRight size={13} />
                +{formatINR(summary.currentBalance)} Surplus
              </span>
            </div>
          </div>

          {/* Right: Pure Expense Distribution & Allocation (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-[#ECE9E2] rounded-[20px] p-6 flex flex-col justify-between shadow-[0_2px_10px_-3px_rgba(20,28,40,0.04)]">
            <div className="pb-3 border-b border-[#ECE9E2] flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#1C1C1E]">Expense Distribution</h2>
                <p className="text-xs text-[#737373] mt-0.5">Where youth funds are spent</p>
              </div>
              <span className="text-xs font-bold text-[#D95763] bg-rose-50 px-2 py-0.5 rounded tabular-nums">
                −{formatINR(expenseData.totalExp)}
              </span>
            </div>

            {/* Visual Stacked Multi-Segment Segment Bar */}
            <div className="my-3 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#737373]">
                <span>Category allocation</span>
                <span>{expenseData.list.length} {expenseData.list.length === 1 ? 'category' : 'categories'}</span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-100 p-0.5 gap-0.5">
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
            <div className="space-y-2.5 my-1">
              {expenseData.list.length === 0 ? (
                <p className="text-xs text-[#737373] py-4 text-center">No expenses recorded yet.</p>
              ) : (
                expenseData.list.slice(0, 3).map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="text-[#1C1C1E] font-medium truncate">{cat.name}</span>
                        <span className="text-[10px] font-mono text-[#737373] bg-black/[0.04] px-1.5 py-0.2 rounded">
                          {cat.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <span className="font-semibold text-[#1C1C1E] tabular-nums shrink-0 ml-2">
                        {formatINR(cat.amount)}
                      </span>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="w-full h-1 bg-black/[0.04] rounded-full overflow-hidden">
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
            <div className="mt-2 pt-3 border-t border-[#ECE9E2] flex items-center justify-between text-xs text-[#737373]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#238B6F]" />
                Fund Retention: <strong className="text-[#1C1C1E] font-semibold">{retentionRate}%</strong>
              </span>

              <Link
                href="/transactions"
                className="text-[11px] font-medium text-[#238B6F] hover:text-[#1e785f] inline-flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ArrowRight size={11} />
              </Link>
            </div>

          </div>
        </div>

        {/* 3. Scroll-driven Page Bridge to Transactions Ledger */}
        <ScrollPageBridge
          targetRoute="/transactions"
          targetTitle="Continue to Transactions Ledger"
          targetSubtitle="Scroll to view detailed transaction ledger"
          readyText="Transactions Ready"
          icon={Receipt}
          onTransitionStart={() => setIsExiting(true)}
        />

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
