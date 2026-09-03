'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTransactions } from '@/context/TransactionContext';
import { useAuth } from '@/context/AuthContext';
import { Transaction, TransactionType } from '@/types';
import { formatINR, formatDate } from '@/lib/formatters';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { DeleteConfirmModal } from '@/components/transactions/DeleteConfirmModal';
import { exportToCSV, exportToPDF } from '@/lib/exportUtils';
import { FluidDropdown } from '@/components/ui/fluid-dropdown';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import {
  Search,
  ArrowUpDown,
  MoreVertical,
  Edit2,
  Trash2,
  FileSpreadsheet,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  Tag,
  GraduationCap,
  TrendingUp,
  Printer,
  Gift,
  Building,
  Zap,
  ShoppingBag,
  Clock,
  History,
  LayoutDashboard,
  Receipt,
} from 'lucide-react';

export default function TransactionsPage() {
  const {
    activeTransactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    settings,
  } = useTransactions();
  const { isAdmin } = useAuth();

  const [isExiting, setIsExiting] = useState(false);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Modals & Action Menu
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addType, setAddType] = useState<TransactionType>('income');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  // Distinct categories
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    activeTransactions.forEach((t) => set.add(t.category));
    return Array.from(set);
  }, [activeTransactions]);

  // Filtered dataset
  const filteredTransactions = useMemo(() => {
    return activeTransactions.filter((tx) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDesc = tx.description.toLowerCase().includes(q);
        const matchesCat = tx.category.toLowerCase().includes(q);
        const matchesAmount = tx.amount.toString().includes(q);
        if (!matchesDesc && !matchesCat && !matchesAmount) return false;
      }

      // 2. Type Filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) {
        return false;
      }

      // 3. Category Filter
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) {
        return false;
      }

      // 4. Date Filter
      if (dateFilter === 'this_month') {
        const txDate = new Date(tx.date);
        const now = new Date();
        if (
          txDate.getMonth() !== now.getMonth() ||
          txDate.getFullYear() !== now.getFullYear()
        ) {
          return false;
        }
      } else if (dateFilter === 'last_month') {
        const txDate = new Date(tx.date);
        const now = new Date();
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        if (txDate.getMonth() !== lastMonth || txDate.getFullYear() !== year) {
          return false;
        }
      } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
        const txDate = new Date(tx.date).getTime();
        const start = new Date(customStartDate).getTime();
        const end = new Date(customEndDate).getTime() + 86400000;
        if (txDate < start || txDate > end) return false;
      }

      return true;
    }).sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [
    activeTransactions,
    searchQuery,
    typeFilter,
    categoryFilter,
    dateFilter,
    customStartDate,
    customEndDate,
    sortOrder,
  ]);

  // Aggregate Totals
  const filteredTotals = useMemo(() => {
    let income = 0;
    let expenses = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      else expenses += t.amount;
    });
    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }, [filteredTransactions]);

  const handleSaveModal = async (data: any) => {
    try {
      if (editingTx) {
        await editTransaction(editingTx.id, data);
        toast.success('Transaction Updated', {
          description: `Updated record for ${data.description}`,
        });
      } else {
        await addTransaction(data);
        const isInc = data.type === 'income';
        toast.success(isInc ? 'Income Recorded' : 'Expense Recorded', {
          description: `${isInc ? '+' : '-'} ₹${Number(data.amount).toLocaleString('en-IN')} for ${data.description}`,
        });
      }
      setEditingTx(null);
      setIsAddOpen(false);
    } catch (err: any) {
      toast.error('Operation Failed', {
        description: err?.message || 'Please check your input values.',
      });
      throw err;
    }
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      toast.success('Record Deleted', {
        description: `Successfully removed transaction`,
      });
      setDeletingTx(null);
    } catch (err: any) {
      toast.error('Deletion Failed', {
        description: err?.message || 'Could not remove transaction.',
      });
    }
  };

  const handleDownloadCSV = () => {
    exportToCSV(filteredTransactions, settings?.churchName || 'Salt and Light Crew');
    toast.success('CSV Download Started', {
      description: `Exported ${filteredTransactions.length} records to spreadsheet.`,
    });
  };

  const handleDownloadPDF = () => {
    exportToPDF(filteredTransactions, settings?.churchName || 'Salt and Light Crew');
    toast.success('PDF Statement Generated', {
      description: `Statement with ${filteredTransactions.length} records downloaded.`,
    });
  };

  return (
    <AppLayout>
      <div className={`space-y-6 pb-2 transition-all duration-200 ${isExiting ? 'opacity-0 translate-y-4' : 'animate-page-enter-down'}`}>
        
        {/* 1. Page Header & Export Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Transactions
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                {filteredTransactions.length} {filteredTransactions.length === 1 ? 'record' : 'records'}
              </span>
            </div>
          </div>

          {/* Export Actions Toolbar */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
              title="Download CSV Spreadsheet"
            >
              <FileSpreadsheet size={15} className="text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
              title="Download PDF Financial Statement"
            >
              <FileText size={15} className="text-rose-600" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* 2. Compact Financial Summary Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Income Summary */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Income</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2 tabular-nums tracking-tight">
              +{formatINR(filteredTotals.income)}
            </div>
          </div>

          {/* Expense Summary */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Expenses</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <ArrowUpDown size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-2 tabular-nums tracking-tight">
              −{formatINR(filteredTotals.expenses)}
            </div>
          </div>

          {/* Net Balance */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Balance</span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-primary flex items-center justify-center border border-teal-100">
                <Tag size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tabular-nums tracking-tight">
              {formatINR(filteredTotals.balance)}
            </div>
          </div>
        </div>

        {/* 3. Streamlined Filter Toolbar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search transactions by description, category, or amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Segmented Type Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/60 shrink-0">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  typeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('income')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  typeFilter === 'income'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('expense')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  typeFilter === 'expense'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                Expense
              </button>
            </div>

            {/* Category Dropdown */}
            <div className="w-full md:w-48 shrink-0">
              <FluidDropdown
                categories={[
                  { id: 'all', label: 'All Categories', icon: Tag, color: '#0F766E' },
                  ...allCategories.map((c) => ({
                    id: c,
                    label: c,
                    icon: c === 'Alumni Contribution' ? GraduationCap : c === 'Investment' ? TrendingUp : c === 'Printing' ? Printer : c === 'Offering' ? Gift : c === 'Vessel Rent' ? Building : c === 'Utilities' ? Zap : c === 'Sales' ? ShoppingBag : c === 'Donation' ? Sparkles : Tag,
                    color: '#0F766E',
                  })),
                ]}
                selectedId={categoryFilter}
                onSelect={(cat) => setCategoryFilter(cat.id)}
              />
            </div>

            {/* Date Preset Dropdown */}
            <div className="w-full md:w-44 shrink-0">
              <FluidDropdown
                categories={[
                  { id: 'all', label: 'All Time Range', icon: Calendar, color: '#0F766E' },
                  { id: 'this_month', label: 'This Month', icon: Clock, color: '#059669' },
                  { id: 'last_month', label: 'Last Month', icon: History, color: '#2563EB' },
                ]}
                selectedId={dateFilter}
                onSelect={(cat) => setDateFilter(cat.id)}
              />
            </div>
          </div>
        </div>

        {/* 4. Streamlined Minimal Transactions Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th
                    className="py-3.5 px-5 cursor-pointer hover:text-slate-900 select-none transition"
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Date</span>
                      <ArrowUpDown size={12} className="text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Transaction Details</th>
                  <th className="py-3.5 px-5 text-right">Amount (INR ₹)</th>
                  <th className="py-3.5 px-4 text-right w-16">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-slate-500">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                        <Receipt size={22} />
                      </div>
                      <p className="font-bold text-slate-800 text-sm">No transactions found</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        No financial records match your current filters or search query.
                      </p>
                      {(searchQuery || typeFilter !== 'all' || categoryFilter !== 'all' || dateFilter !== 'all') && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setTypeFilter('all');
                            setCategoryFilter('all');
                            setDateFilter('all');
                          }}
                          className="mt-3 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                        >
                          Reset all filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isIncome = tx.type === 'income';

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* 1. Date */}
                        <td className="py-4 px-5 text-xs text-slate-500 font-medium whitespace-nowrap align-middle">
                          <span className="bg-slate-100 border border-slate-200/60 px-2 py-1 rounded-md text-slate-700 font-medium">
                            {formatDate(tx.date)}
                          </span>
                        </td>

                        {/* 2. Combined Transaction Column */}
                        <td className="py-4 px-4 align-middle">
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                isIncome ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 text-xs sm:text-sm truncate group-hover:text-primary transition-colors">
                                {tx.description}
                              </p>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                                <span className={`font-semibold ${isIncome ? 'text-emerald-700' : 'text-rose-700'}`}>
                                  {isIncome ? 'Income' : 'Expense'}
                                </span>
                                <span>·</span>
                                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                                  {tx.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 3. Amount */}
                        <td className="py-4 px-5 text-right font-bold whitespace-nowrap tabular-nums align-middle">
                          <span className={isIncome ? 'text-emerald-600' : 'text-rose-600'}>
                            {isIncome ? `+ ${formatINR(tx.amount)}` : `− ${formatINR(tx.amount)}`}
                          </span>
                        </td>

                        {/* 4. Actions (Overflow Popover Menu) */}
                        <td className="py-4 px-4 text-right whitespace-nowrap align-middle">
                          {!isAdmin ? (
                            <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                              View only
                            </span>
                          ) : (
                            <Popover
                              open={openPopoverId === tx.id}
                              onOpenChange={(isOpen) =>
                                setOpenPopoverId(isOpen ? tx.id : null)
                              }
                            >
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer inline-flex items-center justify-center"
                                  aria-label="Transaction options"
                                >
                                  <MoreVertical size={16} />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                align="end"
                                sideOffset={4}
                                className="w-32 p-1.5 bg-white rounded-xl shadow-dropdown border border-slate-200 text-left z-50 animate-fadeIn"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenPopoverId(null);
                                    setEditingTx(tx);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition cursor-pointer"
                                >
                                  <Edit2 size={13} className="text-slate-400" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenPopoverId(null);
                                    setDeletingTx(tx);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                >
                                  <Trash2 size={13} />
                                  <span>Delete</span>
                                </button>
                              </PopoverContent>
                            </Popover>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Edit / Add Modal */}
      <TransactionModal
        isOpen={isAddOpen || Boolean(editingTx)}
        onClose={() => {
          setIsAddOpen(false);
          setEditingTx(null);
        }}
        initialType={addType}
        editingTransaction={editingTx}
        onSave={handleSaveModal}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingTx)}
        transaction={deletingTx}
        onClose={() => setDeletingTx(null)}
        onConfirm={handleConfirmDelete}
      />
    </AppLayout>
  );
}
