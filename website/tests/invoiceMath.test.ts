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
test("discount is allocated before calculating GST", () => {
  const totals = invoiceTotals([item(100, 1, 5), item(100, 1, 18)], 100);
  assert.equal(totals.discount, 100);
  assert.equal(totals.totalTax, 11.5);
  assert.equal(totals.totalAmount, 111.5);
});
test("paise rounding preserves split tax and total", () => {
  const totals = invoiceTotals([item(99.99, 3, 18), item(5.25, 2, 5)], 7.31);
  assert.equal(
    Math.round((totals.cgst + totals.sgst) * 100),
    Math.round(totals.totalTax * 100),
  );
  assert.equal(
    Math.round(totals.totalAmount * 100),
    Math.round(totals.subtotal * 100) -
      Math.round(totals.discount * 100) +
      Math.round(totals.totalTax * 100),
  );
});
test("discounts are capped and an empty bill has zero totals", () => {
  assert.equal(invoiceTotals([item(10, 1, 18)], 999).totalAmount, 0);
  assert.equal(invoiceTotals([item(10, 1, 18)], -10).discount, 0);
  assert.equal(invoiceTotals([]).totalAmount, 0);
});
