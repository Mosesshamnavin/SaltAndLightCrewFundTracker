'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from './Header';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { useTransactions } from '@/context/TransactionContext';
import { useAuth } from '@/context/AuthContext';
import { TransactionType } from '@/types';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('income');
  const { addTransaction } = useTransactions();

  // Redirect to login if user is not signed in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleOpenAddIncome = () => {
    setModalType('income');
    setModalOpen(true);
  };

  const handleOpenAddExpense = () => {
    setModalType('expense');
    setModalOpen(true);
  };

  const handleSaveTransaction = async (data: any) => {
    await addTransaction(data);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-primary-100 border-t-primary animate-spin" />
          <span className="text-xs text-slate-500 font-medium tracking-wide">Loading workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface text-slate-900">
      {/* Unified Top Navigation Header */}
      <Header
        onAddIncome={handleOpenAddIncome}
        onAddExpense={handleOpenAddExpense}
      />

      {/* Full-width Spacious Page Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
        {children}
      </main>

      {/* Global Quick Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialType={modalType}
        onSave={handleSaveTransaction}
      />
    </div>
  );
};
