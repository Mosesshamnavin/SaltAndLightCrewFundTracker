'use client';

import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '@/types';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Tag,
  FileText,
  CheckCircle2,
  Gift,
  Coins,
  Sparkles,
  HeartHandshake,
  ShoppingBag,
  Activity,
  Zap,
  Car,
  GraduationCap,
  Printer,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { formatINR } from '@/lib/formatters';
import { FluidDropdown, FluidCategory } from '@/components/ui/fluid-dropdown';
import { DatePicker } from '@/components/ui/date-picker';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert-1';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    type: TransactionType;
    category: string;
    amount: number;
    description: string;
    date: string;
  }) => Promise<void>;
  initialType?: TransactionType;
  editingTransaction?: Transaction | null;
}

const INCOME_CATEGORY_ITEMS: FluidCategory[] = [
  { id: 'Offering', label: 'Offering', icon: Gift, color: '#14B8A6' },
  { id: 'Alumni Contribution', label: 'Alumni Contribution', icon: GraduationCap, color: '#3B82F6' },
  { id: 'Donation', label: 'Donation', icon: Sparkles, color: '#10B981' },
  { id: 'Fundraising', label: 'Fundraising', icon: HeartHandshake, color: '#0F766E' },
  { id: 'Sales', label: 'Sales', icon: ShoppingBag, color: '#06B6D4' },
  { id: 'Other', label: 'Other', icon: Tag, color: '#64748B' },
];

const EXPENSE_CATEGORY_ITEMS: FluidCategory[] = [
  { id: 'Church Activity', label: 'Church Activity', icon: Activity, color: '#A855F7' },
  { id: 'Investment', label: 'Investment', icon: TrendingUp, color: '#10B981' },
  { id: 'Product Purchase', label: 'Product Purchase', icon: ShoppingBag, color: '#EC4899' },
  { id: 'Utilities', label: 'Utilities', icon: Zap, color: '#FB923C' },
  { id: 'Vessel Rent', label: 'Vessel Rent', icon: Car, color: '#3B82F6' },
  { id: 'Printing', label: 'Printing', icon: Printer, color: '#F43F5E' },
  { id: 'Other', label: 'Other', icon: Tag, color: '#64748B' },
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialType = 'income',
  editingTransaction = null,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [category, setCategory] = useState<string>('Offering');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const prevOpenRef = React.useRef(false);
  const prevIdRef = React.useRef<string | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      const isNewOpen = !prevOpenRef.current;
      const isDifferentTx = prevIdRef.current !== editingTransaction?.id;

      if (isNewOpen || isDifferentTx) {
        if (editingTransaction) {
          setType(editingTransaction.type);
          setCategory(editingTransaction.category);
          setAmount(editingTransaction.amount.toString());
          setDescription(editingTransaction.description || '');
          setDate(editingTransaction.date || new Date().toISOString().split('T')[0]);
        } else {
          setType(initialType);
          setCategory(initialType === 'income' ? 'Offering' : 'Church Activity');
          setAmount('');
          setDescription('');
          setDate(new Date().toISOString().split('T')[0]);
        }
        setError('');
      }
    }
    prevOpenRef.current = isOpen;
    prevIdRef.current = editingTransaction?.id;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingTransaction?.id, initialType]);

  // When type changes, set sensible default category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') {
      setCategory('Offering');
    } else {
      setCategory('Church Activity');
    }
  };

  if (!isOpen) return null;

  const currentCategoryItems = type === 'income' ? INCOME_CATEGORY_ITEMS : EXPENSE_CATEGORY_ITEMS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than ₹0');
      return;
    }

    if (!date) {
      setError('Please select a valid date');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a brief description for financial transparency');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        type,
        category,
        amount: parsedAmount,
        description: description.trim(),
        date,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isIncome = type === 'income';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-slate-100 transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-3xl">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {editingTransaction ? 'Edit Transaction' : isIncome ? 'Add Church Income' : 'Add Church Expense'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          {error && (
            <Alert variant="destructive" appearance="light" size="sm" close onClose={() => setError('')}>
              <AlertIcon>
                <AlertCircle className="size-4 text-rose-600" />
              </AlertIcon>
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}

          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl border text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  isIncome
                    ? 'bg-[#238B6F] text-white border-[#238B6F] shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ArrowDownLeft size={16} />
                Income (+)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl border text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  !isIncome
                    ? 'bg-[#D95763] text-white border-[#D95763] shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ArrowUpRight size={16} />
                Expense (-)
              </button>
            </div>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Amount
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-base">
                ₹
              </div>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 bg-slate-50 border rounded-xl font-bold text-slate-900 text-sm focus:outline-none focus:ring-1 focus:bg-white transition ${
                  isIncome
                    ? 'focus:border-[#238B6F] focus:ring-[#238B6F]/20 border-slate-200'
                    : 'focus:border-[#D95763] focus:ring-[#D95763]/20 border-slate-200'
                }`}
              />
            </div>
            {amount && !isNaN(parseFloat(amount)) && (
              <p className="text-xs text-slate-500 mt-1 pl-1">
                Formatted: <span className="font-semibold text-slate-700">{formatINR(parseFloat(amount))}</span>
              </p>
            )}
          </div>

          {/* Category and Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fluid Dropdown Category */}
            <div className="relative z-20">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Tag size={13} className="text-slate-400" />
                Category 
              </label>
              <FluidDropdown
                categories={currentCategoryItems}
                selectedId={category}
                onSelect={(cat) => setCategory(cat.id as any)}
              />
            </div>

            {/* Date Field */}
            <div className="relative z-10">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar size={13} className="text-slate-400" />
                Date 
              </label>
              <DatePicker
                value={date}
                onChange={(val) => setDate(val)}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FileText size={13} className="text-slate-400" />
              Description 
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isIncome
                  ? 'e.g. Sunday Worship Offering, Building Fund Donation...'
                  : 'e.g. Sound system cable repair, Fellowship supplies...'
              }
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#18212F]/20 focus:border-[#18212F] focus:bg-white transition resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-white shadow-xs transition disabled:opacity-50 cursor-pointer ${
                isIncome
                  ? 'bg-[#238B6F] hover:bg-[#1e785f]'
                  : 'bg-[#D95763] hover:bg-[#c44955]'
              }`}
            >
              <CheckCircle2 size={14} />
              {isSubmitting
                ? 'Saving...'
                : editingTransaction
                ? 'Save Changes'
                : isIncome
                ? 'Record Income'
                : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
