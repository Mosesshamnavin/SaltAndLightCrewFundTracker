'use client';

import React, { useState } from 'react';
import { Transaction } from '@/types';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';
import { formatINR, formatDate } from '@/lib/formatters';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  transaction,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirm(transaction.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-modal max-w-md w-full overflow-hidden border border-slate-200/80">
        {/* Header */}
        <div className="p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100/80 flex items-center justify-center text-rose-600 mb-3.5 shadow-xs">
            <AlertTriangle size={22} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Delete Transaction Record</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Are you sure you want to delete this record? This action will be recorded in the audit trail.
          </p>

          {/* Details Card */}
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-left text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Category:</span>
              <span className="font-semibold text-slate-900 bg-white border border-slate-200/60 px-2 py-0.5 rounded-md">{transaction.category}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Amount:</span>
              <span className={`font-bold tabular-nums ${transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {transaction.type === 'income' ? `+ ${formatINR(transaction.amount)}` : `− ${formatINR(transaction.amount)}`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Date:</span>
              <span className="font-medium text-slate-700">{formatDate(transaction.date)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Description:</span>
              <span className="font-medium text-slate-800 truncate max-w-[200px]">{transaction.description}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            <Trash2 size={14} />
            <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
