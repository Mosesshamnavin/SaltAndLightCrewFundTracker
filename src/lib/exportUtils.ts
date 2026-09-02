import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '@/types';
import { formatDate } from './formatters';

/**
 * Downloads ledger as CSV with Excel-compatible UTF-8 BOM and totals row.
 */
export function exportToCSV(transactions: Transaction[], churchName: string = 'Salt And Light Crew'): void {
  const headers = ['Date', 'Type', 'Category', 'Description', 'Income (INR)', 'Expense (INR)', 'Recorded By'];

  let totalIncome = 0;
  let totalExpense = 0;

  const rows = transactions.map((t) => {
    const isIncome = t.type === 'income';
    const amount = Number(t.amount) || 0;
    if (isIncome) totalIncome += amount;
    else totalExpense += amount;

    return [
      t.date || '',
      t.type.toUpperCase(),
      `"${(t.category || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      isIncome ? amount.toFixed(2) : '',
      !isIncome ? amount.toFixed(2) : '',
      `"${(t.createdByName || 'Staff').replace(/"/g, '""')}"`,
    ];
  });

  const netBalance = totalIncome - totalExpense;

  // Add Summary Rows
  const summaryDivider = ['', '', '', '', '', '', ''];
  const summaryRow = [
    'TOTALS',
    '',
    '',
    `Net Balance: INR ${netBalance.toFixed(2)}`,
    totalIncome.toFixed(2),
    totalExpense.toFixed(2),
    '',
  ];

  const csvRows = [
    `"${churchName} - Financial Statement"`,
    `"Generated On: ${new Date().toLocaleString('en-IN')}"`,
    '',
    headers.join(','),
    ...rows.map((r) => r.join(',')),
    summaryDivider.join(','),
    summaryRow.join(','),
  ];

  // \uFEFF for Excel UTF-8 BOM
  const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `youth_financial_ledger_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a clean, official PDF Statement with youth letterhead, summary stats, and table.
 */
export function exportToPDF(
  transactions: Transaction[],
  churchName: string = 'Salt And Light Crew',
  summaryTotals?: { totalIncome: number; totalExpenses: number; currentBalance: number }
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((t) => {
    const amt = Number(t.amount) || 0;
    if (t.type === 'income') totalIncome += amt;
    else totalExpense += amt;
  });

  const netBalance = totalIncome - totalExpense;

  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(churchName, 14, 14);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // Slate-300
  doc.text('Youth Income & Expense Statement (INR)', 14, 22);

  const printDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  doc.setFontSize(9);
  doc.text(`Generated: ${printDate}`, 196, 22, { align: 'right' });

  // 2. Summary KPI Metric Boxes
  doc.setFontSize(9);

  // Box 1: Total Income
  doc.setFillColor(240, 253, 244); // Emerald-50
  doc.setDrawColor(187, 247, 208); // Emerald-200
  doc.roundedRect(14, 38, 56, 18, 2, 2, 'FD');
  doc.setTextColor(22, 101, 52); // Emerald-800
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL INCOME', 18, 44);
  doc.setFontSize(12);
  doc.text(`Rs. ${totalIncome.toLocaleString('en-IN')}`, 18, 52);

  // Box 2: Total Expenses
  doc.setFontSize(9);
  doc.setFillColor(255, 241, 242); // Rose-50
  doc.setDrawColor(254, 205, 211); // Rose-200
  doc.roundedRect(77, 38, 56, 18, 2, 2, 'FD');
  doc.setTextColor(159, 18, 57); // Rose-800
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL EXPENSES', 81, 44);
  doc.setFontSize(12);
  doc.text(`Rs. ${totalExpense.toLocaleString('en-IN')}`, 81, 52);

  // Box 3: Net Balance
  doc.setFontSize(9);
  doc.setFillColor(240, 249, 255); // Sky-50
  doc.setDrawColor(186, 230, 253); // Sky-200
  doc.roundedRect(140, 38, 56, 18, 2, 2, 'FD');
  doc.setTextColor(3, 105, 161); // Sky-800
  doc.setFont('helvetica', 'bold');
  doc.text('NET BALANCE', 144, 44);
  doc.setFontSize(12);
  doc.text(`Rs. ${netBalance.toLocaleString('en-IN')}`, 144, 52);

  // 3. Transactions Table
  const tableData = transactions.map((t) => {
    const isIncome = t.type === 'income';
    const amount = Number(t.amount) || 0;
    return [
      formatDate(t.date || ''),
      t.type.toUpperCase(),
      t.category || '',
      t.description || '',
      isIncome ? `+ Rs. ${amount.toLocaleString('en-IN')}` : '',
      !isIncome ? `- Rs. ${amount.toLocaleString('en-IN')}` : '',
      t.createdByName || 'Staff',
    ];
  });

  autoTable(doc, {
    startY: 62,
    head: [['Date', 'Type', 'Category', 'Description', 'Income', 'Expense', 'Recorded By']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59], // Slate-800
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 24 }, // Date
      1: { cellWidth: 18, fontStyle: 'bold' }, // Type
      2: { cellWidth: 28 }, // Category
      3: { cellWidth: 50 }, // Description
      4: { cellWidth: 26, halign: 'right', textColor: [5, 150, 105], fontStyle: 'bold' }, // Income
      5: { cellWidth: 26, halign: 'right', textColor: [225, 29, 72], fontStyle: 'bold' }, // Expense
      6: { cellWidth: 20 }, // Recorded By
    },
    margin: { left: 14, right: 14 },
    foot: [
      [
        'Total',
        '',
        '',
        `Records: ${transactions.length} | Balance: Rs. ${netBalance.toLocaleString('en-IN')}`,
        `Rs. ${totalIncome.toLocaleString('en-IN')}`,
        `Rs. ${totalExpense.toLocaleString('en-IN')}`,
        '',
      ],
    ],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    didDrawPage: (data) => {
      // Footer page numbers
      const str = `Page ${doc.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(str, 196, 290, { align: 'right' });
      doc.text('Salt And Light Fund Tracker - Financial Transparency', 14, 290);
    },
  });

  // Save the generated PDF file
  doc.save(`youth_statement_${new Date().toISOString().split('T')[0]}.pdf`);
}
