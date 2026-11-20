import type { InvoiceLineItem } from "../types/billing.types";

/** Work in paise and round each tax line, so mixed rates and split GST stay consistent. */
export function invoiceTotals(
  items: InvoiceLineItem[],
  requestedDiscount = 0,
  interState = false,
) {
  const paise = (value: number) => Math.round(value * 100);
  const linePaise = items.map((item) => paise(item.unitPrice * item.quantity));
  const subtotalPaise = linePaise.reduce((sum, value) => sum + value, 0);
  const discountPaise = Math.max(
    0,
    Math.min(subtotalPaise, paise(requestedDiscount)),
  );
  let allocated = 0;
  const taxPaise = items.reduce((sum, item, index) => {
    const discountShare =
      index === items.length - 1
        ? discountPaise - allocated
        : subtotalPaise
          ? Math.round((discountPaise * linePaise[index]) / subtotalPaise)
          : 0;
    allocated += discountShare;
    return (
      sum +
      Math.round(((linePaise[index] - discountShare) * item.gstRate) / 100)
    );
  }, 0);
  const cgstPaise = interState ? 0 : Math.round(taxPaise / 2);
  const sgstPaise = interState ? 0 : taxPaise - cgstPaise;
  return {
    subtotal: subtotalPaise / 100,
    discount: discountPaise / 100,
    totalTax: taxPaise / 100,
    cgst: cgstPaise / 100,
    sgst: sgstPaise / 100,
    igst: interState ? taxPaise / 100 : 0,
    totalAmount: (subtotalPaise - discountPaise + taxPaise) / 100,
  };
}
