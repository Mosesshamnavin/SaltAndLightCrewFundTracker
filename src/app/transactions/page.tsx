'use client';

import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTransactions } from '@/context/TransactionContext';
import { useAuth } from '@/context/AuthContext';
import { Transaction, TransactionType } from '@/types';
import { formatINR, formatDate } from '@/lib/formatters';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { DeleteConfirmModal } from '@/components/transactions/DeleteConfirmModal';
import { exportToCSV, exportToPDF } from '@/lib/exportUtils';
import { FluidDropdown } from '@/components/ui/fluid-dropdown';
import { toast } from 'sonner';
import {
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  FileSpreadsheet,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  Plus,
  Tag,
  HeartHandshake,
  Zap,
  ShoppingBag,
  Building,
  Clock,
  CalendarDays,
  History,
  GraduationCap,
  TrendingUp,
  Printer,
  Gift,
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

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addType, setAddType] = useState<TransactionType>('income');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

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

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setDateFilter('all');
    toast.info('Filters Reset');
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Header & Export Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-2.5">
              <span>Financial Transactions Ledger</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0F766E] font-bold border border-teal-200">
                {filteredTransactions.length} Records
              </span>
            </h1>
         
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-xs font-semibold text-slate-700 shadow-sm transition"
              title="Download CSV Spreadsheet"
            >
              <FileSpreadsheet size={15} className="text-[#16A34A]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-xs font-semibold text-slate-700 shadow-sm transition"
              title="Download PDF Statement"
            >
              <FileText size={15} className="text-[#DC2626]" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Ribbon for Filtered Data */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Income</span>
              <div className="text-xl font-extrabold text-[#16A34A] mt-1 tabular-nums">
                +{formatINR(filteredTotals.income)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center border border-emerald-200">
              <ArrowDownLeft size={18} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Expense</span>
              <div className="text-xl font-extrabold text-[#DC2626] mt-1 tabular-nums">
                −{formatINR(filteredTotals.expenses)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#DC2626] flex items-center justify-center border border-rose-200">
              <ArrowUpRight size={18} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Balance Amount</span>
              <div className="text-xl font-extrabold text-[#0F766E] mt-1 tabular-nums">
                {formatINR(filteredTotals.balance)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center border border-teal-200">
              <CheckCircle2 size={18} />
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-100 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Box */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search description, category, amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition"
              />
            </div>

            {/* 1. Fluid Dropdown Type Filter */}
            <div className="relative">
              <FluidDropdown
                categories={[
                  { id: 'all', label: 'All Types', icon: Layers, color: '#0F766E' },
                  { id: 'income', label: 'Income', icon: ArrowDownLeft, color: '#16A34A' },
                  { id: 'expense', label: 'Expense', icon: ArrowUpRight, color: '#DC2626' },
                ]}
                selectedId={typeFilter}
                onSelect={(cat) => setTypeFilter(cat.id as any)}
              />
            </div>

            {/* 2. Fluid Dropdown Category Filter */}
            <div className="relative">
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

            {/* 3. Fluid Dropdown Date Preset */}
            <div className="relative">
              <FluidDropdown
                categories={[
                  { id: 'all', label: 'All Time Range', icon: Calendar, color: '#0F766E' },
                  { id: 'this_month', label: 'This Month', icon: Clock, color: '#14B8A6' },
                  { id: 'last_month', label: 'Last Month', icon: History, color: '#3B82F6' },
                ]}
                selectedId={dateFilter}
                onSelect={(cat) => setDateFilter(cat.id)}
              />
            </div>
          </div>

          {/* Quick Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Filter size={12} /> Tags:
            </span>
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                categoryFilter === 'all'
                  ? 'bg-[#0F766E] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  categoryFilter === cat
                    ? 'bg-[#0F766E] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}

            {(searchQuery || typeFilter !== 'all' || categoryFilter !== 'all' || dateFilter !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="ml-auto text-xs text-[#0F766E] hover:underline font-semibold flex items-center gap-1"
              >
                <RefreshCw size={11} /> Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Transactions Ledger Table */}
        <div className="bg-white rounded-3xl shadow-card border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th
                    className="py-4 px-5 cursor-pointer hover:text-slate-800 select-none transition"
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Date</span>
                      <ArrowUpDown size={12} className="text-slate-400" />
                    </div>
                  </th>
                  <th className="py-4 px-4">Type</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Description</th>
                  <th className="py-4 px-4 text-right">Inflow (+)</th>
                  <th className="py-4 px-4 text-right">Outflow (-)</th>
                  <th className="py-4 px-4">Audited By</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <div className="max-w-xs mx-auto space-y-2">
                        <History size={36} className="mx-auto text-slate-300 stroke-1" />
                        <p className="font-bold text-slate-700 text-sm">No transactions match</p>
                        <p className="text-xs text-slate-400">
                          Try adjusting search keywords or resetting filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isIncome = tx.type === 'income';
                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-50/80 transition group"
                      >
                        {/* Date */}
                        <td className="py-4 px-5 font-semibold text-slate-700 whitespace-nowrap">
                          {formatDate(tx.date)}
                        </td>

                        {/* Type Badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {isIncome ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                              <ArrowDownLeft size={12} /> Income
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-[#DC2626] border border-rose-200">
                              <ArrowUpRight size={12} /> Expense
                            </span>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4 font-bold text-slate-800 whitespace-nowrap">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                            {tx.category}
                          </span>
                        </td>

                        {/* Description */}
                        <td className="py-4 px-4 text-slate-600 max-w-xs truncate font-medium" title={tx.description}>
                          {tx.description}
                        </td>

                        {/* Income Amount */}
                        <td className="py-4 px-4 text-right font-black text-[#16A34A] whitespace-nowrap tabular-nums">
                          {isIncome ? formatINR(tx.amount) : '—'}
                        </td>

                        {/* Expense Amount */}
                        <td className="py-4 px-4 text-right font-black text-[#DC2626] whitespace-nowrap tabular-nums">
                          {!isIncome ? formatINR(tx.amount) : '—'}
                        </td>

                        {/* Created By */}
                        <td className="py-4 px-4 text-slate-500 whitespace-nowrap text-xs">
                          {tx.createdByName || 'Staff'}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          {!isAdmin ? (
                            <span className="text-[11px] text-slate-400 italic">View only</span>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setEditingTx(tx)}
                                title="Edit record"
                                className="p-1.5 text-slate-400 hover:text-[#0F766E] hover:bg-teal-50 rounded-xl transition"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                onClick={() => setDeletingTx(tx)}
                                title="Delete record"
                                className="p-1.5 text-slate-400 hover:text-[#DC2626] hover:bg-rose-50 rounded-xl transition"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
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
