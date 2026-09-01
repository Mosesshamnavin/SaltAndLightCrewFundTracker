'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { MonthlyBreakdown } from '@/types';
import { formatINRCompact, formatINR } from '@/lib/formatters';
import { BarChart3, TrendingUp } from 'lucide-react';

interface OverviewChartsProps {
  data: MonthlyBreakdown[];
}

export const OverviewCharts: React.FC<OverviewChartsProps> = ({ data }) => {
  const [chartType, setChartType] = useState<'comparison' | 'net'>('comparison');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1">
          <p className="font-bold text-slate-200 border-b border-slate-700 pb-1 mb-1.5">{label} Breakdown</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-semibold text-white">{formatINR(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-card border border-slate-100">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            {chartType === 'comparison' ? (
              <>
                <BarChart3 size={18} className="text-brand-600" />
                Monthly Income vs Expenses
              </>
            ) : (
              <>
                <TrendingUp size={18} className="text-emerald-600" />
                Monthly Net Cash Flow Trend
              </>
            )}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time financial comparison across {new Date().getFullYear()} in INR (₹)
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setChartType('comparison')}
            className={`px-3 py-1.5 rounded-lg transition ${
              chartType === 'comparison'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Income vs Expense
          </button>
          <button
            onClick={() => setChartType('net')}
            className={`px-3 py-1.5 rounded-lg transition ${
              chartType === 'net'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Net Balance Trend
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 sm:h-80 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'comparison' ? (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatINRCompact(val)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
              />
              <Bar
                name="Income"
                dataKey="income"
                fill="#059669"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                name="Expense"
                dataKey="expense"
                fill="#e11d48"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          ) : (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0c8ee9" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0c8ee9" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatINRCompact(val)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                name="Net Balance"
                type="monotone"
                dataKey="balance"
                stroke="#0c8ee9"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#balanceGradient)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
