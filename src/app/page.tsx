'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTransactions } from '@/context/TransactionContext';
import { useAuth } from '@/context/AuthContext';
import { TransactionType } from '@/types';
import { formatINR, formatDate } from '@/lib/formatters';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { ScrollPageBridge } from '@/components/layout/ScrollPageBridge';
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
  Receipt,
  ChevronDown,
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

// Rich Custom Tooltip that clearly shows Money Values
const CustomChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isIncome = data.type === 'income';
    const isExpense = data.type === 'expense';

    return (
      <div className="bg-[#0D1522] border border-white/20 rounded-xl p-3 shadow-2xl text-white select-none min-w-[190px] pointer-events-none">
        <p className="text-xs font-semibold text-[#F7F7F5] truncate max-w-[210px]">
          {data.description || 'Running Balance'}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {data.date}
        </p>

        <div className="mt-2 pt-2 border-t border-white/10 space-y-1 text-xs">
          {(isIncome || isExpense) && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{isIncome ? 'Inflow (+)' : 'Outflow (-)'}:</span>
              <span className={`font-semibold ${isIncome ? 'text-[#238B6F]' : 'text-[#D95763]'}`}>
                {isIncome ? `+ ${formatINR(data.amount)}` : `− ${formatINR(data.amount)}`}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between font-bold pt-0.5">
            <span className="text-slate-300">Fund Balance:</span>
            <span className="text-emerald-400 tabular-nums">{formatINR(data.balance)}</span>
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

  // 1. Multi-point Chronological Balance Trajectory for Smooth Chart
  const chartData = useMemo(() => {
    const sorted = [...activeTransactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (sorted.length === 0) {
      return [
        { axisLabel: 'Start', date: 'Initial', balance: 0, amount: 0, type: 'initial', description: 'Opening Balance' },
        { axisLabel: 'Current', date: 'Now', balance: summary.currentBalance, amount: 0, type: 'current', description: 'Available Funds' },
      ];
    }

    let runningBalance = 0;
    const points: any[] = [];

    // Starting baseline
    points.push({
      axisLabel: 'Start',
      date: formatDate(sorted[0].date),
      balance: 0,
      amount: 0,
      type: 'initial',
      description: 'Opening Baseline',
    });

    sorted.forEach((tx, idx) => {
      if (tx.type === 'income') {
        runningBalance += tx.amount;
      } else {
        runningBalance -= tx.amount;
      }

      points.push({
        axisLabel: idx === sorted.length - 1 ? 'Now' : formatDate(tx.date),
        date: formatDate(tx.date),
        balance: runningBalance,
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
      });
    });

    return points;
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
              <span className="text-slate-400">Available church funds</span>
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
                {formatINR(summary.totalIncome)}
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
                {formatINR(summary.totalExpenses)}
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

        {/* 2. CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Cash Flow Overview Chart (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#ECE9E2] rounded-[20px] p-6 flex flex-col justify-between shadow-[0_2px_10px_-3px_rgba(20,28,40,0.04)]">
            <div className="pb-4 border-b border-[#ECE9E2] flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#1C1C1E]">Cash Flow Overview</h2>
                <p className="text-xs text-[#737373] mt-0.5">Chronological trajectory of church funds (INR ₹)</p>
              </div>
            </div>

            <div className="h-72 sm:h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D1522" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0D1522" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="axisLabel"
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
                  <Tooltip content={<CustomChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#0D1522"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#balanceGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fund Breakdown Chart (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-[#ECE9E2] rounded-[20px] p-6 flex flex-col justify-between shadow-[0_2px_10px_-3px_rgba(20,28,40,0.04)]">
            <div className="pb-4 border-b border-[#ECE9E2]">
              <h2 className="text-base font-semibold text-[#1C1C1E]">Fund Breakdown</h2>
              <p className="text-xs text-[#737373] mt-0.5">Distribution by category</p>
            </div>

            <div className="h-52 w-full flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0D1522',
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

            {/* Clean Category List without Internal Scrollbar */}
            <div className="space-y-2 pt-3 border-t border-[#ECE9E2]">
              {categoryData.slice(0, 4).map((cat) => (
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

              {categoryData.length > 4 && (
                <div className="pt-1">
                  <Link
                    href="/transactions"
                    className="text-[11px] font-medium text-[#238B6F] hover:text-[#1e785f] inline-flex items-center gap-1 transition-colors"
                  >
                    <span>View all {categoryData.length} categories in transactions</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              )}
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
