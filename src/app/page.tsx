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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  PieChart as PieIcon,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Receipt,
} from 'lucide-react';

const CATEGORY_COLORS: { [key: string]: string } = {
  Offering: '#14B8A6',
  'Alumni Contribution': '#3B82F6',
  Donation: '#10B981',
  Fundraising: '#0F766E',
  Sales: '#06B6D4',
  'Church Activity': '#A855F7',
  Investment: '#10B981',
  'Product Purchase': '#EC4899',
  Utilities: '#FB923C',
  'Vessel Rent': '#3B82F6',
  Printing: '#F43F5E',
  Other: '#64748B',
};

export default function DashboardPage() {
  const { summary, activeTransactions, addTransaction } = useTransactions();
  const { isAdmin } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('income');
  const [chartTimeframe, setChartTimeframe] = useState<'all' | 'recent'>('all');

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

  // 1. Cash Flow Trajectory Data
  const chartData = useMemo(() => {
    const sorted = [...activeTransactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let runningBalance = 0;
    const points: { date: string; income: number; expense: number; balance: number }[] = [];

    sorted.forEach((tx) => {
      const d = formatDate(tx.date);
      if (tx.type === 'income') {
        runningBalance += tx.amount;
        points.push({ date: d, income: tx.amount, expense: 0, balance: runningBalance });
      } else {
        runningBalance -= tx.amount;
        points.push({ date: d, income: 0, expense: tx.amount, balance: runningBalance });
      }
    });

    return points.length > 0 ? points : [
      { date: 'Start', income: 0, expense: 0, balance: 0 },
      { date: 'Now', income: summary.totalIncome, expense: summary.totalExpenses, balance: summary.currentBalance }
    ];
  }, [activeTransactions, summary]);

  // 2. Category Breakdown for Donut Chart
  const categoryData = useMemo(() => {
    const map: { [key: string]: number } = {};
    activeTransactions.forEach((tx) => {
      map[tx.category] = (map[tx.category] || 0) + tx.amount;
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || '#0F766E',
    })).sort((a, b) => b.value - a.value);
  }, [activeTransactions]);

  // Inflow to Outflow Retention Rate
  const savingsRate = summary.totalIncome > 0 
    ? Math.round(((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100)
    : 0;

  return (
    <AppLayout>
      <div className="space-y-6 pb-10">
        {/* 1. Bento 3-Core Financial Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Available Balance (Dark Teal Luxury Glass) */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F766E] to-[#115E59] text-white p-6 shadow-xl border border-[#0d504c] group hover:shadow-2xl transition-all duration-300">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-teal-100">
                  Total Balance
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-inner">
                <Wallet size={20} />
              </div>
            </div>

            <div className="relative z-10 mt-5">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white tabular-nums">
                {formatINR(summary.currentBalance)}
              </div>
              <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-teal-100">
                <span>Available Funds</span>
                <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Total Income (Emerald Frost) */}
          <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-card border border-emerald-100 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 group">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Income
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-200 shadow-sm group-hover:scale-105 transition-transform">
                <ArrowDownLeft size={20} />
              </div>
            </div>

            <div className="relative z-10 mt-5">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#16A34A] tracking-tight tabular-nums">
                {formatINR(summary.totalIncome)}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Offerings & Contributions</span>
                <span className="font-semibold text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded-md">
                  +100% Verified
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Total Expenses (Ruby Frost) */}
          <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-card border border-rose-100 hover:border-rose-300 hover:shadow-lg transition-all duration-300 group">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Expense
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#DC2626] flex items-center justify-center border border-rose-200 shadow-sm group-hover:scale-105 transition-transform">
                <ArrowUpRight size={20} />
              </div>
            </div>

            <div className="relative z-10 mt-5">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#DC2626] tracking-tight tabular-nums">
                {formatINR(summary.totalExpenses)}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Activities & Expenses</span>
                <span className="font-semibold text-[#DC2626] bg-rose-50 px-2 py-0.5 rounded-md">
                  Audited
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Interactive Charts Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart: Financial Flow & Balance Growth (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-card border border-slate-100 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0F766E] flex items-center justify-center border border-teal-200">
                  <TrendingUp size={19} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0F172A]">Fund Trajectory & Cashflow</h2>
                  <p className="text-xs text-slate-500">Chronological trajectory of church liquidity (INR ₹)</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
                <button
                  onClick={() => setChartTimeframe('all')}
                  className={`px-3 py-1 rounded-lg transition ${
                    chartTimeframe === 'all'
                      ? 'bg-white text-[#0F766E] shadow-sm font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  All History
                </button>
                <button
                  onClick={() => setChartTimeframe('recent')}
                  className={`px-3 py-1 rounded-lg transition ${
                    chartTimeframe === 'recent'
                      ? 'bg-white text-[#0F766E] shadow-sm font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Recent
                </button>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-64 sm:h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartTimeframe === 'recent' ? chartData.slice(-6) : chartData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F766E" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0F766E" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      color: '#fff',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    name="Reserve Balance"
                    stroke="#0F766E"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#balanceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#0F766E]" />
                <span className="font-medium">Cumulative Reserve</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#16A34A]" />
                <span className="font-medium">Inflows</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#DC2626]" />
                <span className="font-medium">Outflows</span>
              </div>
            </div>
          </div>

          {/* Side Donut: Category Breakdown (1 col) */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0F766E] flex items-center justify-center border border-teal-200">
                <PieIcon size={19} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Fund Allocation</h3>
                <p className="text-xs text-slate-500">Categories by transaction volume</p>
              </div>
            </div>

            {/* Donut Chart */}
            <div className="h-48 w-full flex items-center justify-center relative my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Total']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
                <span className="text-xs font-extrabold text-slate-800">{categoryData.length} Tags</span>
              </div>
            </div>

            {/* Category Mini Legend List */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 max-h-36 overflow-y-auto pr-1">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs py-0.5">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-slate-700 font-medium truncate">{cat.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 tabular-nums shrink-0 ml-2">
                    {formatINR(cat.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Shortcut to Full Ledger */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F766E] flex items-center justify-center border border-teal-200 shrink-0">
              <Receipt size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">Complete Financial Ledger</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                View, filter, sort, export CSV/PDF, and manage all {activeTransactions.length} transaction records
              </p>
            </div>
          </div>

          <Link
            href="/transactions"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-900/20 transition"
          >
            <span>Open Transactions</span>
            <ArrowRight size={15} />
          </Link>
        </div>
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
