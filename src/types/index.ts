export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'income' | 'expense';

export type IncomeCategory =
  | 'Alumni Contribution'
  | 'Donation'
  | 'Offering'
  | 'Fundraising'
  | 'Sales'
  | 'Other';

export type ExpenseCategory =
  | 'Youth Activity'
  | 'Investment'
  | 'Product Purchase'
  | 'Utilities'
  | 'Vessel Rent'
  | 'Printing'
  | 'Other';

export type TransactionCategory = IncomeCategory | ExpenseCategory | string;

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
  createdBy: string;
  createdByName?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  isDeleted: boolean;
}

export interface AuditLog {
  id: string;
  action: 'create' | 'update' | 'delete';
  transactionId: string;
  performedBy: string;
  performedByName: string;
  previousData?: Partial<Transaction> | null;
  newData?: Partial<Transaction> | null;
  createdAt: string; // ISO string
}

export interface ChurchSettings {
  id: string;
  churchName: string;
  currency: string;
  currencySymbol: string;
  updatedAt: string;
  updatedBy: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  thisMonthIncome: number;
  thisMonthExpenses: number;
  thisMonthBalance: number;
  transactionCount: number;
}

export interface MonthlyBreakdown {
  month: string; // 'Jan', 'Feb', etc.
  monthNumber: number; // 1-12
  year: number;
  income: number;
  expense: number;
  balance: number;
}

export type DateFilterOption =
  | 'all'
  | 'this-month'
  | 'last-month'
  | 'last-3-months'
  | 'this-year'
  | 'custom';
