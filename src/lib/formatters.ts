/**
 * Indian Rupee (INR) and date formatting utilities.
 */

export function formatINR(amount: number, showDecimals: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(absAmount);

  return isNegative ? `-${formatted}` : formatted;
}

export function formatINRCompact(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  if (absAmount >= 10000000) {
    // Crores
    const cr = (absAmount / 10000000).toFixed(2).replace(/\.?0+$/, '');
    return `${isNegative ? '-' : ''}₹${cr} Cr`;
  } else if (absAmount >= 100000) {
    // Lakhs
    const lk = (absAmount / 100000).toFixed(2).replace(/\.?0+$/, '');
    return `${isNegative ? '-' : ''}₹${lk} L`;
  } else if (absAmount >= 1000) {
    // Thousands
    const k = (absAmount / 1000).toFixed(1).replace(/\.?0+$/, '');
    return `${isNegative ? '-' : ''}₹${k} k`;
  }

  return formatINR(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return isoString;
  }
}
