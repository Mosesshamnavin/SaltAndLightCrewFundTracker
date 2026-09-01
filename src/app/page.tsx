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
  ArrowRight,
  TrendingUp,
  PieChart as PieIcon,
  Clock,
} from 'lucide-react';

const CATEGORY_COLORS: { [key: string]: string } = {
  Offering: '#238B6F',
  'Alumni Contribution': '#3B82F6',
  Donation: '#10B981',
  Fundraising: '#0F766E',
  Sales: '#06B6D4',
  'Church Activity': '#8B5CF6',
  Investment: '#10B981',
  'Product Purchase': '#EC4899',
  Utilities: '#F59E0B',
  'Vessel Rent': '#3B82F6',
  Printing: '#D95763',
  Other: '#737373',
};

export default function DashboardPage() {
  const { summary, activeTransactions, addTransaction } = useTransactions();
  const { isAdmin } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('income');

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

  // 1. Grouped Cash Flow Data for Clean X-Axis
  const chartData = useMemo(() => {
    const sorted = [...activeTransactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let runningBalance = 0;
    const dateMap = new Map<string, { date: string; balance: number; income: number; expense: number }>();

    sorted.forEach((tx) => {
      const d = formatDate(tx.date);
      if (tx.type === 'income') {
        runningBalance += tx.amount;
      } else {
        runningBalance -= tx.amount;
      }

      const existing = dateMap.get(d) || { date: d, balance: runningBalance, income: 0, expense: 0 };
      if (tx.type === 'income') existing.income += tx.amount;
      else existing.expense += tx.amount;
      existing.balance = runningBalance;
      dateMap.set(d, existing);
    });

    const points = Array.from(dateMap.values());

    return points.length > 0 ? points : [
      { date: 'Initial', income: 0, expense: 0, balance: 0 },
      { date: 'Current', income: summary.totalIncome, expense: summary.totalExpenses, balance: summary.currentBalance }
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
      color: CATEGORY_COLORS[name] || '#238B6F',
    })).sort((a, b) => b.value - a.value);
  }, [activeTransactions]);

  // 3. Latest 5 Transactions for Activity Feed
  const recentTransactions = useMemo(() => {
    return [...activeTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [activeTransactions]);

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        
        {/* 1. FINANCIAL HIERARCHY CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Dominant Available Balance Card (7 cols) */}
          <div className="lg:col-span-7 bg-[#18212F] text-white rounded-[20px] p-6 sm:p-7 border border-[#18212F] flex flex-col justify-between shadow-xs">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-300">
                Available balance
              </p>
              <div className="text-4xl sm:text-5xl font-bold tracking-tight text-white mt-3 tabular-nums">
                {formatINR(summary.currentBalance)}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Available church funds
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#238B6F]" />
                <span>Income <strong className="text-white font-semibold tabular-nums">{formatINR(summary.totalIncome)}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D95763]" />
                <span>Expenses <strong className="text-white font-semibold tabular-nums">{formatINR(summary.totalExpenses)}</strong></span>
              </div>
            </div>
          </div>

          {/* Secondary Summary Cards (5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
            {/* Total Income */}
            <div className="bg-white border border-[#EAEAEA] rounded-[20px] p-5 sm:p-6 flex flex-col justify-between transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#737373]">Total income</span>
                <span className="w-2 h-2 rounded-full bg-[#238B6F]" />
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-bold text-[#1C1C1E] tracking-tight tabular-nums">
                  {formatINR(summary.totalIncome)}
                </div>
                <p className="text-xs text-[#737373] mt-1">
                  + money received
                </p>
              </div>
            </div>

            {/* Total Expense */}
            <div className="bg-white border border-[#EAEAEA] rounded-[20px] p-5 sm:p-6 flex flex-col justify-between transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#737373]">Total expense</span>
                <span className="w-2 h-2 rounded-full bg-[#D95763]" />
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-bold text-[#1C1C1E] tracking-tight tabular-nums">
                  {formatINR(summary.totalExpenses)}
                </div>
                <p className="text-xs text-[#737373] mt-1">
                  money spent
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Cash Flow Overview Chart (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#EAEAEA] rounded-[20px] p-6 flex flex-col justify-between">
            <div className="pb-4 border-b border-[#EAEAEA] flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#1C1C1E]">Cash Flow Overview</h2>
                <p className="text-xs text-[#737373] mt-0.5">Income and expenses over time</p>
              </div>
            </div>

            <div className="h-60 sm:h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#18212F" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#18212F" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={{ stroke: '#EAEAEA' }}
                    tick={{ fill: '#737373', fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#737373', fontSize: 11 }}
                    tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18212F',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      padding: '8px 12px',
                    }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Balance']}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#18212F"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#balanceGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fund Breakdown Chart (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-[#EAEAEA] rounded-[20px] p-6 flex flex-col justify-between">
            <div className="pb-4 border-b border-[#EAEAEA]">
              <h2 className="text-base font-semibold text-[#1C1C1E]">Fund Breakdown</h2>
              <p className="text-xs text-[#737373] mt-0.5">Distribution by category</p>
            </div>

            <div className="h-44 w-full flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18212F',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#FFFFFF',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Total']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Clean Category List */}
            <div className="space-y-1.5 pt-3 border-t border-[#EAEAEA] max-h-32 overflow-y-auto pr-1">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs py-0.5">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-[#1C1C1E] font-medium truncate">{cat.name}</span>
                  </div>
                  <span className="font-semibold text-[#1C1C1E] tabular-nums shrink-0 ml-2">
                    {formatINR(cat.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. RECENT TRANSACTIONS ACTIVITY FEED */}
        <div className="bg-white border border-[#EAEAEA] rounded-[20px] p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#EAEAEA]">
            <div>
              <h2 className="text-base font-semibold text-[#1C1C1E]">Recent Transactions</h2>
              <p className="text-xs text-[#737373] mt-0.5">Latest church financial activity</p>
            </div>
            <Link
              href="/transactions"
              className="text-xs font-medium text-[#238B6F] hover:text-[#1e785f] inline-flex items-center gap-1 transition-colors"
            >
              <span>View all</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-[#EAEAEA]">
            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#737373]">
                No recent transactions recorded yet.
              </div>
            ) : (
              recentTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <div
                    key={tx.id}
                    className="py-3.5 flex items-center justify-between hover:bg-[#FAFAF8] px-2 -mx-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isIncome ? 'bg-[#238B6F]' : 'bg-[#D95763]'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-[#1C1C1E] truncate">
                          {tx.description}
                        </p>
                        <p className="text-[11px] text-[#737373] mt-0.5">
                          {isIncome ? 'Income' : 'Expense'} · {tx.category} · {formatDate(tx.date)}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`text-xs sm:text-sm font-semibold tabular-nums whitespace-nowrap ml-4 ${
                        isIncome ? 'text-[#238B6F]' : 'text-[#D95763]'
                      }`}
                    >
                      {isIncome ? `+ ${formatINR(tx.amount)}` : `− ${formatINR(tx.amount)}`}
                    </div>
                  </div>
                );
              })
            )}
          </div>
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
