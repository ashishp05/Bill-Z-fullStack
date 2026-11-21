import { INVOICE_NUMBER_PAD } from '../constants/config.constants';

// Authoritative invoice math. All amounts are whole rupees (Int).
// Discount is spread across lines in proportion to their value, then GST is applied per line.

export interface CalculatorLine {
  unitPrice: number;
  quantity: number;
  gstRate: number;
}

export interface CalculatedLine {
  lineTotal: number;
  discountShare: number;
  taxableAmount: number;
  taxAmount: number;
}

export interface InvoiceTotals {
  lines: CalculatedLine[];
  subtotal: number;
  discount: number;
  totalTax: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
}

export const calculateInvoiceTotals = (
  items: CalculatorLine[],
  requestedDiscount = 0,
  interState = false,
): InvoiceTotals => {
  const lineTotals = items.map(item => item.unitPrice * item.quantity);
  const subtotal = lineTotals.reduce((sum, value) => sum + value, 0);
  const discount = Math.max(0, Math.min(subtotal, Math.round(requestedDiscount)));

  let allocated = 0;
  const lines = items.map((item, index) => {
    const isLast = index === items.length - 1;
    const proportional = subtotal ? Math.round((discount * lineTotals[index]) / subtotal) : 0;
    const discountShare = isLast ? discount - allocated : proportional;
    allocated += discountShare;
    const taxableAmount = lineTotals[index] - discountShare;
    const taxAmount = Math.round((taxableAmount * item.gstRate) / 100);
    return { lineTotal: lineTotals[index], discountShare, taxableAmount, taxAmount };
  });

  const totalTax = lines.reduce((sum, line) => sum + line.taxAmount, 0);
  const cgst = interState ? 0 : Math.round(totalTax / 2);
  const sgst = interState ? 0 : totalTax - cgst;

  return {
    lines,
    subtotal,
    discount,
    totalTax,
    cgst,
    sgst,
    igst: interState ? totalTax : 0,
    totalAmount: subtotal - discount + totalTax,
  };
};

// Intra-state supply splits GST into CGST + SGST; a different state means IGST.
export const isInterStateSupply = (
  vendorState?: string | null,
  customerState?: string | null,
): boolean => {
  if (!vendorState || !customerState) return false;
  return vendorState.trim().toLowerCase() !== customerState.trim().toLowerCase();
};

// e.g. formatInvoiceNumber('INV-2026-', 42) -> INV-2026-000042
export const formatInvoiceNumber = (prefix: string, sequence: number): string =>
  `${prefix}${String(sequence).padStart(INVOICE_NUMBER_PAD, '0')}`;
