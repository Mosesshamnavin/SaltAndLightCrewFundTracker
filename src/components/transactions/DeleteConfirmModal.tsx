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
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-4">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Soft Delete Financial Record</h3>
          <p className="text-sm text-slate-500 mt-1">
            Are you sure you want to remove this record? It will be excluded from all balance calculations and recorded in the audit trail.
          </p>

          {/* Details Card */}
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Category:</span>
              <span className="font-semibold text-slate-800">{transaction.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount:</span>
              <span className={`font-bold ${transaction.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatINR(transaction.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date:</span>
              <span className="font-medium text-slate-700">{formatDate(transaction.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Description:</span>
              <span className="font-medium text-slate-700 truncate max-w-[200px]">{transaction.description}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            <ShieldAlert size={15} className="shrink-0" />
            <span>Audit record will preserve this action for church transparency.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-sm transition disabled:opacity-50"
          >
            <Trash2 size={16} />
            {isDeleting ? 'Removing...' : 'Confirm Soft Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
