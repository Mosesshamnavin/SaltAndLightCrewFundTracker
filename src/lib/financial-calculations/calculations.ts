import { Transaction, FinancialSummary, MonthlyBreakdown } from '@/types';

/**
 * Filters out soft-deleted transactions to ensure calculations
 * strictly operate on active records.
 */
export function filterActiveTransactions(transactions: Transaction[]): Transaction[] {
  if (!Array.isArray(transactions)) return [];
  return transactions.filter((t) => !t.isDeleted);
}

/**
 * Calculates the sum of all income transactions.
 */
export function calculateTotalIncome(transactions: Transaction[]): number {
  const active = filterActiveTransactions(transactions);
  return active
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
}

/**
 * Calculates the sum of all expense transactions.
 */
export function calculateTotalExpenses(transactions: Transaction[]): number {
  const active = filterActiveTransactions(transactions);
  return active
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
}

/**
 * Calculates the current net balance: Total Income - Total Expenses.
 */
export function calculateCurrentBalance(totalIncome: number, totalExpenses: number): number {
  return (Number(totalIncome) || 0) - (Number(totalExpenses) || 0);
}

/**
 * Computes all core summary metrics for dashboard and reports in one unified call.
 */
export function computeFinancialSummary(
  transactions: Transaction[],
  targetDate: Date = new Date()
): FinancialSummary {
  const active = filterActiveTransactions(transactions);
  const totalIncome = calculateTotalIncome(active);
  const totalExpenses = calculateTotalExpenses(active);
  const currentBalance = calculateCurrentBalance(totalIncome, totalExpenses);

  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth(); // 0-indexed

  let thisMonthIncome = 0;
  let thisMonthExpenses = 0;

  for (const t of active) {
    if (!t.date) continue;
    const txDate = new Date(t.date);
    if (isNaN(txDate.getTime())) continue;

    if (txDate.getFullYear() === targetYear && txDate.getMonth() === targetMonth) {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
        thisMonthIncome += amt;
      } else if (t.type === 'expense') {
        thisMonthExpenses += amt;
      }
    }
  }

  const thisMonthBalance = thisMonthIncome - thisMonthExpenses;

  return {
    totalIncome,
    totalExpenses,
    currentBalance,
    thisMonthIncome,
    thisMonthExpenses,
    thisMonthBalance,
    transactionCount: active.length,
  };
}

/**
 * Generates monthly breakdown for Recharts for a specific year (default: current year).
 */
export function calculateMonthlyBreakdown(
  transactions: Transaction[],
  year: number = new Date().getFullYear()
): MonthlyBreakdown[] {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const breakdown: MonthlyBreakdown[] = monthNames.map((name, index) => ({
    month: name,
    monthNumber: index + 1,
    year,
    income: 0,
    expense: 0,
    balance: 0,
  }));

  const active = filterActiveTransactions(transactions);

  for (const t of active) {
    if (!t.date) continue;
    const txDate = new Date(t.date);
    if (isNaN(txDate.getTime())) continue;

    if (txDate.getFullYear() === year) {
      const monthIdx = txDate.getMonth();
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
        breakdown[monthIdx].income += amt;
      } else if (t.type === 'expense') {
        breakdown[monthIdx].expense += amt;
      }
    }
  }

  // Calculate balances per month
  for (const item of breakdown) {
    item.balance = item.income - item.expense;
  }

  return breakdown;
}

/**
 * Calculates category breakdown for income or expenses.
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[],
  type: 'income' | 'expense'
): { category: string; amount: number; percentage: number }[] {
  const active = filterActiveTransactions(transactions).filter((t) => t.type === type);
  const total = active.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const map = new Map<string, number>();
  for (const t of active) {
    const cat = t.category || 'Other';
    map.set(cat, (map.get(cat) || 0) + (Number(t.amount) || 0));
  }

  const result: { category: string; amount: number; percentage: number }[] = [];
  map.forEach((amount, category) => {
    result.push({
      category,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    });
  });

  return result.sort((a, b) => b.amount - a.amount);
}
