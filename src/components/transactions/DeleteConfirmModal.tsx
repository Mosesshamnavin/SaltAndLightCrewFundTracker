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
          <div className="mx-auto w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-[#D95763] mb-3">
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-base font-bold text-[#1C1C1E]">Delete Transaction</h3>
          <p className="text-xs text-[#737373] mt-1">
            Are you sure you want to delete this record? This action will be recorded in the audit log.
          </p>

          {/* Details Card */}
          <div className="mt-4 p-3.5 rounded-xl bg-[#FAFAF8] border border-[#EAEAEA] text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#737373]">Category:</span>
              <span className="font-semibold text-[#1C1C1E]">{transaction.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#737373]">Amount:</span>
              <span className={`font-semibold ${transaction.type === 'income' ? 'text-[#238B6F]' : 'text-[#D95763]'}`}>
                {formatINR(transaction.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#737373]">Date:</span>
              <span className="font-medium text-[#1C1C1E]">{formatDate(transaction.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#737373]">Description:</span>
              <span className="font-medium text-[#1C1C1E] truncate max-w-[200px]">{transaction.description}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#FAFAF8] border-t border-[#EAEAEA] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-[#EAEAEA] text-xs font-medium text-[#737373] hover:bg-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#D95763] hover:bg-[#c44955] text-white text-xs font-medium shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            <Trash2 size={13} />
            {isDeleting ? 'Deleting...' : 'Delete Record'}
          </button>
        </div>
      </div>
    </div>
  );
};
