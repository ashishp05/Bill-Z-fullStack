import { test } from "node:test";
import assert from "node:assert/strict";
import { invoiceTotals } from "../src/utils/invoiceMath.ts";
function item(unitPrice: number, quantity: number, gstRate: number) {
  return {
    id: String(unitPrice),
    name: "Test product",
    unitPrice,
    quantity,
    gstRate,
    lineTotal: unitPrice * quantity,
  };
}
test("Figma example: two kettles and three flasks total INR 7,080", () => {
  const totals = invoiceTotals([item(1800, 2, 18), item(800, 3, 18)]);
  assert.deepEqual(totals, {
    subtotal: 6000,
    discount: 0,
    totalTax: 1080,
    cgst: 540,
    sgst: 540,
    igst: 0,
    totalAmount: 7080,
  });
});
test("mixed GST rates are calculated per line and interstate tax uses IGST", () => {
  const totals = invoiceTotals([item(100, 1, 5), item(100, 1, 18)], 0, true);
  assert.equal(totals.totalTax, 23);
  assert.equal(totals.igst, 23);
  assert.equal(totals.cgst, 0);
  assert.equal(totals.sgst, 0);
  assert.equal(totals.totalAmount, 223);
});
test("discount is allocated before calculating GST, rounded to whole rupees", () => {
  const totals = invoiceTotals([item(100, 1, 5), item(100, 1, 18)], 100);
  assert.equal(totals.discount, 100);
  // 50 x 5% = 2.5 -> 3, 50 x 18% = 9
  assert.equal(totals.totalTax, 12);
  assert.equal(totals.totalAmount, 112);
});
test("B2B demo invoice: discount spread by line value matches the server", () => {
  const totals = invoiceTotals([item(1800, 5, 18), item(899, 4, 18)], 500);
  assert.deepEqual(totals, {
    subtotal: 12596,
    discount: 500,
    totalTax: 2178,
    cgst: 1089,
    sgst: 1089,
    igst: 0,
    totalAmount: 14274,
  });
});
test("whole-rupee totals stay consistent and CGST + SGST equals total tax", () => {
  const totals = invoiceTotals([item(899, 1, 18), item(360, 3, 12)], 7);
  assert.equal(totals.cgst + totals.sgst, totals.totalTax);
  assert.equal(
    totals.totalAmount,
    totals.subtotal - totals.discount + totals.totalTax,
  );
  for (const value of Object.values(totals)) assert.ok(Number.isInteger(value));
});
test("discounts are capped and an empty bill has zero totals", () => {
  assert.equal(invoiceTotals([item(10, 1, 18)], 999).totalAmount, 0);
  assert.equal(invoiceTotals([item(10, 1, 18)], -10).discount, 0);
  assert.equal(invoiceTotals([]).totalAmount, 0);
});
