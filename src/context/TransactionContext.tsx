'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Transaction, AuditLog, ChurchSettings, FinancialSummary, MonthlyBreakdown } from '@/types';
import {
  fetchTransactions,
  createTransactionRecord,
  updateTransactionRecord,
  softDeleteTransactionRecord,
  fetchAuditLogs,
  fetchSettings,
  updateSettingsRecord,
  clearAllLocalFinancialData,
  INITIAL_TRANSACTIONS,
} from '@/lib/firebase/firestore';
import {
  computeFinancialSummary,
  calculateMonthlyBreakdown,
  filterActiveTransactions,
} from '@/lib/financial-calculations/calculations';
import { useAuth } from './AuthContext';

interface TransactionContextType {
  transactions: Transaction[];
  activeTransactions: Transaction[];
  auditLogs: AuditLog[];
  settings: ChurchSettings | null;
  summary: FinancialSummary;
  monthlyBreakdown: MonthlyBreakdown[];
  isLoading: boolean;
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>) => Promise<Transaction>;
  editTransaction: (id: string, data: Partial<Transaction>) => Promise<Transaction | null>;
  deleteTransaction: (id: string) => Promise<boolean>;
  updateSettings: (data: Partial<ChurchSettings>) => Promise<void>;
  clearAllData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<ChurchSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [txList, auditList, churchSettings] = await Promise.all([
        fetchTransactions(),
        fetchAuditLogs(),
        fetchSettings(),
      ]);

      setTransactions(txList);
      setAuditLogs(auditList);
      setSettings(churchSettings);
    } catch (err) {
      console.error('Error loading financial records:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Centralized calculations computed whenever transactions change
  const activeTransactions = filterActiveTransactions(transactions);
  const summary = computeFinancialSummary(transactions);
  const monthlyBreakdown = calculateMonthlyBreakdown(transactions);

  const addTransaction = async (
    data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>
  ) => {
    const currentUser = {
      id: user?.id || 'anonymous',
      name: user?.name || 'Member',
    };
    const newTx = await createTransactionRecord(data, currentUser);
    setTransactions((prev) => [newTx, ...prev.filter((t) => t.id !== newTx.id)]);
    return newTx;
  };

  const editTransaction = async (id: string, data: Partial<Transaction>) => {
    const currentUser = {
      id: user?.id || 'anonymous',
      name: user?.name || 'Member',
    };
    const updated = await updateTransactionRecord(id, data, currentUser);
    if (updated) {
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === id ? updated : tx))
      );
    }
    return updated;
  };

  const deleteTransaction = async (id: string) => {
    const currentUser = {
      id: user?.id || 'anonymous',
      name: user?.name || 'Member',
    };
    const success = await softDeleteTransactionRecord(id, currentUser);
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    return success;
  };

  const updateSettings = async (data: Partial<ChurchSettings>) => {
    const currentUser = {
      name: user?.name || 'Admin',
    };
    const updated = await updateSettingsRecord(data, currentUser);
    setSettings(updated);
  };

  const clearAllData = async () => {
    clearAllLocalFinancialData();
    setTransactions([]);
    setAuditLogs([]);
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        activeTransactions,
        auditLogs,
        settings,
        summary,
        monthlyBreakdown,
        isLoading,
        addTransaction,
        editTransaction,
        deleteTransaction,
        updateSettings,
        clearAllData,
        refreshData: loadAllData,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
