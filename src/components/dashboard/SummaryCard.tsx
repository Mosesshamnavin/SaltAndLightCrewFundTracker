import React from 'react';
import { formatINR } from '@/lib/formatters';
import { LucideIcon, Wallet, ArrowDownLeft, ArrowUpRight, CalendarDays, TrendingUp, TrendingDown } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  amount: number;
  explanation: string;
  iconType: 'balance' | 'income' | 'expense' | 'month';
  isHighlighted?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  amount,
  explanation,
  iconType,
  isHighlighted = false,
}) => {
  const getIcon = () => {
    switch (iconType) {
      case 'balance':
        return <Wallet className="text-white" size={24} />;
      case 'income':
        return <ArrowDownLeft className="text-emerald-600" size={24} />;
      case 'expense':
        return <ArrowUpRight className="text-rose-600" size={24} />;
      case 'month':
        return <CalendarDays className="text-brand-600" size={24} />;
    }
  };

  const isPositive = amount >= 0;

  if (isHighlighted) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 text-white p-6 shadow-xl border border-brand-700/50">
        {/* Background glow circle */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-brand-500/20 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-200">
            {title}
          </span>
          <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            {getIcon()}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {formatINR(amount)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-brand-200">
            {isPositive ? (
              <span className="inline-flex items-center text-emerald-300 font-semibold">
                <TrendingUp size={14} className="mr-0.5" /> Healthy Reserve
              </span>
            ) : (
              <span className="inline-flex items-center text-rose-300 font-semibold">
                <TrendingDown size={14} className="mr-0.5" /> Deficit Alert
              </span>
            )}
            <span>•</span>
            <span className="truncate">{explanation}</span>
          </div>
        </div>
      </div>
    );
  }

  const getBorderColor = () => {
    switch (iconType) {
      case 'income':
        return 'border-emerald-100 hover:border-emerald-200';
      case 'expense':
        return 'border-rose-100 hover:border-rose-200';
      case 'month':
        return 'border-brand-100 hover:border-brand-200';
      default:
        return 'border-slate-100';
    }
  };

  const getIconBg = () => {
    switch (iconType) {
      case 'income':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'expense':
        return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'month':
        return 'bg-brand-50 text-brand-600 border-brand-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getAmountColor = () => {
    switch (iconType) {
      case 'income':
        return 'text-emerald-700';
      case 'expense':
        return 'text-rose-700';
      case 'month':
        return isPositive ? 'text-slate-800' : 'text-rose-600';
      default:
        return 'text-slate-900';
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white p-6 shadow-card hover:shadow-card-hover transition border ${getBorderColor()}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${getIconBg()}`}>
          {getIcon()}
        </div>
      </div>

      <div className="mt-4">
        <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${getAmountColor()}`}>
          {formatINR(amount)}
        </div>
        <p className="mt-2 text-xs text-slate-500 leading-relaxed truncate">
          {explanation}
        </p>
      </div>
    </div>
  );
};
