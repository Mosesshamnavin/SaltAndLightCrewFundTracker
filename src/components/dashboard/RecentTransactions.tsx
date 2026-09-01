'use client';

import React from 'react';
import Link from 'next/link';
import { Transaction } from '@/types';
import { formatINR, formatDate } from '@/lib/formatters';
import { ArrowDownLeft, ArrowUpRight, ArrowRight, History, Plus } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onAddClick?: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  onAddClick,
}) => {
  const recent = transactions.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-card border border-slate-100 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <History size={17} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Recent Transactions</h3>
              <p className="text-xs text-slate-500">Latest financial ledger activity</p>
            </div>
          </div>
          <Link
            href="/transactions"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline"
          >
            <span>View all</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* List */}
        <div className="divide-y divide-slate-100 mt-2">
          {recent.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-slate-500">No transactions recorded yet.</p>
              {onAddClick && (
                <button
                  onClick={onAddClick}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition"
                >
                  <Plus size={14} /> Add First Record
                </button>
              )}
            </div>
          ) : (
            recent.map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between gap-3 group hover:bg-slate-50/70 -mx-2 px-2 rounded-xl transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {isIncome ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="font-medium text-slate-500">{tx.category}</span>
                        <span>•</span>
                        <span>{formatDate(tx.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm font-bold ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatINR(tx.amount)}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {tx.createdByName ? `by ${tx.createdByName.split(' ')[0]}` : 'Recorded'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {recent.length > 0 && (
        <div className="pt-4 border-t border-slate-100 mt-2 text-center">
          <Link
            href="/transactions"
            className="w-full py-2 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <span>Open Complete Ledger ({transactions.length} total)</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
};
