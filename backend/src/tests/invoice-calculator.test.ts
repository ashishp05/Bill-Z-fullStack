import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  calculateInvoiceTotals,
  formatInvoiceNumber,
  isInterStateSupply,
} from '../utils/invoice-calculator.util';

const line = (unitPrice: number, quantity: number, gstRate: number) => ({
  unitPrice,
  quantity,
  gstRate,
});

test('Figma example: two kettles and three flasks total ₹7,080', () => {
  const totals = calculateInvoiceTotals([line(1800, 2, 18), line(800, 3, 18)]);
  assert.equal(totals.subtotal, 6000);
  assert.equal(totals.cgst, 540);
  assert.equal(totals.sgst, 540);
  assert.equal(totals.igst, 0);
  assert.equal(totals.totalAmount, 7080);
});

test('inter-state supply uses IGST only', () => {
  const totals = calculateInvoiceTotals([line(100, 1, 5), line(100, 1, 18)], 0, true);
  assert.equal(totals.igst, 23);
  assert.equal(totals.cgst + totals.sgst, 0);
  assert.equal(totals.totalAmount, 223);
});

test('discount is spread by line value before GST (matches the PWA preview)', () => {
  const totals = calculateInvoiceTotals([line(1800, 5, 18), line(899, 4, 18)], 500);
  assert.deepEqual(
    totals.lines.map(l => l.discountShare),
    [357, 143],
  );
  assert.equal(totals.totalTax, 2178);
  assert.equal(totals.totalAmount, 14274);
});

test('all amounts are whole rupees and CGST + SGST = total tax', () => {
  const totals = calculateInvoiceTotals([line(899, 1, 18), line(360, 3, 12)], 7);
  assert.equal(totals.cgst + totals.sgst, totals.totalTax);
  for (const value of [totals.subtotal, totals.totalTax, totals.totalAmount]) {
    assert.ok(Number.isInteger(value));
  }
});

test('discount is capped at the subtotal and never negative', () => {
  assert.equal(calculateInvoiceTotals([line(10, 1, 18)], 999).totalAmount, 0);
  assert.equal(calculateInvoiceTotals([line(10, 1, 18)], -5).discount, 0);
  assert.equal(calculateInvoiceTotals([]).totalAmount, 0);
});

test('state comparison and invoice number format', () => {
  assert.equal(isInterStateSupply('Gujarat', ' gujarat '), false);
  assert.equal(isInterStateSupply('Gujarat', 'Kerala'), true);
  assert.equal(isInterStateSupply('Gujarat', null), false);
  assert.equal(formatInvoiceNumber('INV-2026-', 42), 'INV-2026-000042');
});
