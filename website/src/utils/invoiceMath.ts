import type { InvoiceLineItem } from "../types/billing.types";

/**
 * Preview of the server's invoice math (backend/src/utils/invoice-calculator.util.ts).
 * Amounts are whole rupees. The discount is spread across lines by value, then GST is
 * rounded per line. The server result is authoritative; this only previews it.
 */
export function invoiceTotals(
  items: InvoiceLineItem[],
  requestedDiscount = 0,
  interState = false,
) {
  const lineTotals = items.map((item) =>
    Math.round(item.unitPrice * item.quantity),
  );
  const subtotal = lineTotals.reduce((sum, value) => sum + value, 0);
  const discount = Math.max(
    0,
    Math.min(subtotal, Math.round(requestedDiscount)),
  );
  let allocated = 0;
  const totalTax = items.reduce((sum, item, index) => {
    const discountShare =
      index === items.length - 1
        ? discount - allocated
        : subtotal
          ? Math.round((discount * lineTotals[index]) / subtotal)
          : 0;
    allocated += discountShare;
    return (
      sum +
      Math.round(((lineTotals[index] - discountShare) * item.gstRate) / 100)
    );
  }, 0);
  const cgst = interState ? 0 : Math.round(totalTax / 2);
  const sgst = interState ? 0 : totalTax - cgst;
  return {
    subtotal,
    discount,
    totalTax,
    cgst,
    sgst,
    igst: interState ? totalTax : 0,
    totalAmount: subtotal - discount + totalTax,
  };
}
