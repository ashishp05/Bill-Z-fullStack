/**
 * Utilities for formatting Indian Currency (INR), Numbers, Dates and Tax Computations
 */

export const formatINR = (amount: number, showDecimals: boolean = false): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  try {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(amount);

    return formatted;
  } catch {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
};

export const formatNumberIndian = (val: number): string => {
  if (isNaN(val) || val === null || val === undefined) return '0';
  return new Intl.NumberFormat('en-IN').format(val);
};

export const formatDateIndian = (dateInput: string | Date | undefined): string => {
  if (!dateInput) return '-';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);

  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatTimeIndian = (dateInput: string | Date | undefined): string => {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';

  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export interface GSTBreakdown {
  taxableAmount: number;
  isInterState: boolean;
  rate: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTax: number;
  grandTotal: number;
}

export const computeGST = (
  taxableAmount: number,
  gstRatePercent: number,
  isInterState: boolean = false
): GSTBreakdown => {
  const totalTax = Math.round((taxableAmount * (gstRatePercent / 100)) * 100) / 100;
  
  if (isInterState) {
    return {
      taxableAmount,
      isInterState: true,
      rate: gstRatePercent,
      cgstRate: 0,
      cgstAmount: 0,
      sgstRate: 0,
      sgstAmount: 0,
      igstRate: gstRatePercent,
      igstAmount: totalTax,
      totalTax,
      grandTotal: Math.round((taxableAmount + totalTax) * 100) / 100,
    };
  }

  const halfRate = gstRatePercent / 2;
  const halfAmount = Math.round((totalTax / 2) * 100) / 100;

  return {
    taxableAmount,
    isInterState: false,
    rate: gstRatePercent,
    cgstRate: halfRate,
    cgstAmount: halfAmount,
    sgstRate: halfRate,
    sgstAmount: halfAmount,
    igstRate: 0,
    igstAmount: 0,
    totalTax,
    grandTotal: Math.round((taxableAmount + totalTax) * 100) / 100,
  };
};
