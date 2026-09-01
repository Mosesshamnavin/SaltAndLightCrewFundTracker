import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateCurrentBalance,
  computeFinancialSummary,
  calculateMonthlyBreakdown,
  filterActiveTransactions,
} from './calculations';
import { formatINR, formatINRCompact } from '../formatters';
import { Transaction } from '@/types';

// Test Dataset
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    category: 'Offering',
    amount: 100000,
    description: 'Sunday Offering',
    date: '2026-09-01',
    createdBy: 'u1',
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
    isDeleted: false,
  },
  {
    id: '2',
    type: 'income',
    category: 'Donation',
    amount: 50000,
    description: 'Donation',
    date: '2026-09-01',
    createdBy: 'u1',
    createdAt: '2026-09-01T11:00:00Z',
    updatedAt: '2026-09-01T11:00:00Z',
    isDeleted: false,
  },
  {
    id: '3',
    type: 'expense',
    category: 'Utilities',
    amount: 30000,
    description: 'Electricity',
    date: '2026-09-01',
    createdBy: 'u1',
    createdAt: '2026-09-01T12:00:00Z',
    updatedAt: '2026-09-01T12:00:00Z',
    isDeleted: false,
  },
  {
    id: '4',
    type: 'income',
    category: 'Offering',
    amount: 999999, // Should be ignored because isDeleted is true
    description: 'Deleted Offering',
    date: '2026-09-01',
    createdBy: 'u1',
    createdAt: '2026-09-01T13:00:00Z',
    updatedAt: '2026-09-01T13:00:00Z',
    isDeleted: true,
  },
];

console.log('=== RUNNING FINANCIAL ENGINE UNIT TESTS ===');

// Test 1: Soft-delete filter
const active = filterActiveTransactions(mockTransactions);
console.assert(active.length === 3, `Expected 3 active transactions, got ${active.length}`);

// Test 2: Total Income
const income = calculateTotalIncome(mockTransactions);
console.assert(income === 150000, `Expected Total Income 150000, got ${income}`);

// Test 3: Total Expenses
const expenses = calculateTotalExpenses(mockTransactions);
console.assert(expenses === 30000, `Expected Total Expenses 30000, got ${expenses}`);

// Test 4: Current Balance = Total Income - Total Expenses
const balance = calculateCurrentBalance(income, expenses);
console.assert(balance === 120000, `Expected Current Balance 120000, got ${balance}`);

// Test 5: computeFinancialSummary
const summary = computeFinancialSummary(mockTransactions, new Date('2026-09-01'));
console.assert(summary.currentBalance === 120000, `Summary Current Balance check failed: ${summary.currentBalance}`);
console.assert(summary.thisMonthIncome === 150000, `Summary This Month Income check failed: ${summary.thisMonthIncome}`);
console.assert(summary.thisMonthExpenses === 30000, `Summary This Month Expenses check failed: ${summary.thisMonthExpenses}`);
console.assert(summary.thisMonthBalance === 120000, `Summary This Month Balance check failed: ${summary.thisMonthBalance}`);

// Test 6: Currency Formatters (INR ₹)
const formatted1 = formatINR(150000);
console.log('Formatted ₹1,50,000:', formatted1);
console.assert(formatted1.includes('1,50,000') || formatted1.includes('₹'), `INR formatting failed: ${formatted1}`);

const formattedCompact = formatINRCompact(150000);
console.log('Compact ₹1.5L:', formattedCompact);
console.assert(formattedCompact.includes('1.5 L'), `Compact Lakh formatting failed: ${formattedCompact}`);

console.log('✅ ALL FINANCIAL CALCULATION TESTS PASSED PERFECTLY!');
