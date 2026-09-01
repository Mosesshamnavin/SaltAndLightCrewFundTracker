'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
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

  // Row Action Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      <div className="space-y-6 pb-12">
        
        {/* 1. Page Header & Export Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1C1C1E] tracking-tight">
              Transactions
            </h1>
            <p className="text-xs text-[#737373] mt-0.5">
              {filteredTransactions.length} {filteredTransactions.length === 1 ? 'record' : 'records'} in ledger
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#EAEAEA] text-xs font-medium text-[#1C1C1E] hover:bg-[#FAFAF8] transition shadow-xs cursor-pointer"
              title="Download CSV"
            >
              <FileSpreadsheet size={14} className="text-[#238B6F]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#EAEAEA] text-xs font-medium text-[#1C1C1E] hover:bg-[#FAFAF8] transition shadow-xs cursor-pointer"
              title="Download PDF"
            >
              <FileText size={14} className="text-[#D95763]" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* 2. Compact Financial Summary Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-[20px] p-5 border border-[#EAEAEA] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#737373]">Total income</span>
              <span className="w-2 h-2 rounded-full bg-[#238B6F]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#1C1C1E] mt-2 tabular-nums">
              +{formatINR(filteredTotals.income)}
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-5 border border-[#EAEAEA] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#737373]">Total expense</span>
              <span className="w-2 h-2 rounded-full bg-[#D95763]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#1C1C1E] mt-2 tabular-nums">
              −{formatINR(filteredTotals.expenses)}
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-5 border border-[#EAEAEA] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#737373]">Balance amount</span>
              <span className="w-2 h-2 rounded-full bg-[#18212F]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#18212F] mt-2 tabular-nums">
              {formatINR(filteredTotals.balance)}
            </div>
          </div>
        </div>

        {/* 3. Streamlined Filter Bar */}
        <div className="bg-white rounded-[20px] p-4 border border-[#EAEAEA] space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#FAFAF8] border border-[#EAEAEA] rounded-lg text-xs sm:text-sm text-[#1C1C1E] placeholder-[#737373] focus:outline-none focus:border-[#18212F] focus:bg-white transition"
              />
            </div>

            {/* Segmented Type Filter */}
            <div className="flex items-center gap-1 p-1 bg-[#F0F0EE] rounded-lg shrink-0">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                  typeFilter === 'all'
                    ? 'bg-[#18212F] text-white shadow-xs'
                    : 'text-[#737373] hover:text-[#1C1C1E]'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('income')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                  typeFilter === 'income'
                    ? 'bg-[#238B6F] text-white shadow-xs'
                    : 'text-[#737373] hover:text-[#1C1C1E]'
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('expense')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                  typeFilter === 'expense'
                    ? 'bg-[#D95763] text-white shadow-xs'
                    : 'text-[#737373] hover:text-[#1C1C1E]'
                }`}
              >
                Expense
              </button>
            </div>

            {/* Category Dropdown */}
            <div className="w-full md:w-48 shrink-0">
              <FluidDropdown
                categories={[
                  { id: 'all', label: 'All Categories', icon: Tag, color: '#18212F' },
                  ...allCategories.map((c) => ({
                    id: c,
                    label: c,
                    icon: c === 'Alumni Contribution' ? GraduationCap : c === 'Investment' ? TrendingUp : c === 'Printing' ? Printer : c === 'Offering' ? Gift : c === 'Vessel Rent' ? Building : c === 'Utilities' ? Zap : c === 'Sales' ? ShoppingBag : c === 'Donation' ? Sparkles : Tag,
                    color: '#18212F',
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
                  { id: 'all', label: 'All Time Range', icon: Calendar, color: '#18212F' },
                  { id: 'this_month', label: 'This Month', icon: Clock, color: '#238B6F' },
                  { id: 'last_month', label: 'Last Month', icon: History, color: '#3B82F6' },
                ]}
                selectedId={dateFilter}
                onSelect={(cat) => setDateFilter(cat.id)}
              />
            </div>
          </div>
        </div>

        {/* 4. Streamlined Minimal Transactions Table */}
        <div className="bg-white rounded-[20px] border border-[#EAEAEA] overflow-hidden" ref={menuRef}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAFAF8] border-b border-[#EAEAEA] text-[11px] font-semibold text-[#737373]">
                  <th
                    className="py-3.5 px-5 cursor-pointer hover:text-[#1C1C1E] select-none transition"
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Date</span>
                      <ArrowUpDown size={11} />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Transaction</th>
                  <th className="py-3.5 px-5 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-right w-16">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA] text-xs sm:text-sm">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-[#737373]">
                      <p className="font-semibold text-[#1C1C1E] text-sm">No transactions match</p>
                      <p className="text-xs text-[#737373] mt-1">
                        Try adjusting your search terms or filters
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isIncome = tx.type === 'income';
                    const isMenuOpen = activeMenuId === tx.id;

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-[#FAFAF8] transition-colors"
                      >
                        {/* 1. Date */}
                        <td className="py-4 px-5 text-xs text-[#737373] font-medium whitespace-nowrap align-middle">
                          {formatDate(tx.date)}
                        </td>

                        {/* 2. Combined Transaction Column */}
                        <td className="py-4 px-4 align-middle">
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                isIncome ? 'bg-[#238B6F]' : 'bg-[#D95763]'
                              }`}
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-[#1C1C1E] text-xs sm:text-sm truncate">
                                {tx.description}
                              </p>
                              <p className="text-[11px] text-[#737373] mt-0.5">
                                {isIncome ? 'Income' : 'Expense'} · {tx.category}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* 3. Amount */}
                        <td className="py-4 px-5 text-right font-semibold whitespace-nowrap tabular-nums align-middle">
                          <span className={isIncome ? 'text-[#238B6F]' : 'text-[#D95763]'}>
                            {isIncome ? `+ ${formatINR(tx.amount)}` : `− ${formatINR(tx.amount)}`}
                          </span>
                        </td>

                        {/* 4. Actions (Overflow Menu) */}
                        <td className="py-4 px-4 text-right whitespace-nowrap relative align-middle">
                          {!isAdmin ? (
                            <span className="text-[11px] text-[#737373]">View only</span>
                          ) : (
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveMenuId(isMenuOpen ? null : tx.id)
                                }
                                className="p-1.5 rounded-lg text-[#737373] hover:text-[#1C1C1E] hover:bg-black/[0.04] transition cursor-pointer"
                                aria-label="Transaction options"
                              >
                                <MoreVertical size={16} />
                              </button>

                              {/* Minimal Overflow Actions Dropdown */}
                              {isMenuOpen && (
                                <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-[#EAEAEA] py-1 z-30 animate-fadeIn text-left">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      setEditingTx(tx);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#1C1C1E] hover:bg-[#FAFAF8] transition cursor-pointer"
                                  >
                                    <Edit2 size={13} className="text-[#737373]" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      setDeletingTx(tx);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#D95763] hover:bg-rose-50 transition cursor-pointer"
                                  >
                                    <Trash2 size={13} />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
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
