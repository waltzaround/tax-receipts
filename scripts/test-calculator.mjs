import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'vite';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, optimizeDeps: { noDiscovery: true, include: [] }, appType: 'custom' });
const { calculateAmountPerTaxBand } = await server.ssrLoadModule('/src/utils/calculateAmountPerTaxBand.ts');
const { calculateTotals } = await server.ssrLoadModule('/src/utils/calculateTotals.ts');
const { calculatorBudget, calculatorPeriod } = await server.ssrLoadModule('/src/data/calculator.ts');
const { Header } = await server.ssrLoadModule('/src/components/Header.tsx');
const { Result } = await server.ssrLoadModule('/src/components/Result.tsx');
await server.close();

test('current annual tax bands calculate thresholds and marginal dollars correctly', () => {
  const tax = income => calculateAmountPerTaxBand(income).reduce((sum, band) => sum + band.amount, 0);
  for (const [income, expected, nextRate] of [
    [0, 0, .105], [15600, 1638, .175], [53500, 8270.5, .30],
    [78100, 15650.5, .33], [180000, 49277.5, .39],
    [200000, 57077.5, .39],
  ]) {
    assert.ok(Math.abs(tax(income) - expected) < 1e-8);
    assert.ok(Math.abs(tax(income + 1) - expected - nextRate) < 1e-8);
  }
  assert.equal(tax(100000), 22877.5);
});

test('2026 actual category totals reconcile to Treasury and contain no stale detail', () => {
  assert.equal(calculatorBudget.totalSpend, 146321);
  assert.equal(calculatorBudget.category.reduce((sum, row) => sum + row.value, 0), 146321);
  assert.equal(calculatorBudget.category.length, 15);
  assert.ok(calculatorBudget.category.every(row => row.children.length === 0));
  assert.equal(calculatorPeriod, 'year ended 30 June 2026');
});

test('GST-inclusive spending and other taxes are included once and allocations reconcile', () => {
  const result = calculateTotals({ income: 100000, gst: 11500, otherTax: 100 });
  assert.equal(result.taxFromIncome, '$22,877.50');
  assert.equal(result.taxFromGST, '$1,500.00');
  assert.equal(result.totalTax, '$24,477.50');
  const allocated = result.totalsPerCategory.reduce((sum, row) => sum + Number(row.paid.amount.replace(/[^0-9.]/g, '')), 0);
  assert.ok(Math.abs(allocated - 24477.5) <= result.totalsPerCategory.length * .005);
  assert.equal(calculateTotals({ income: 0, gst: 0, otherTax: 0 }).totalTax, '$0.00');
});

test('calculating another receipt cannot mutate previous results or source data', () => {
  const source = JSON.stringify(calculatorBudget);
  const first = calculateTotals({ income: 50000, gst: 0, otherTax: 0 });
  const saved = JSON.stringify(first);
  calculateTotals({ income: 200000, gst: 11500, otherTax: 200 });
  assert.equal(JSON.stringify(first), saved);
  assert.equal(JSON.stringify(calculatorBudget), source);
});

test('calculator renders the actual source period and current rates without stale detail links', () => {
  const header = renderToStaticMarkup(createElement(Header));
  assert.match(header, /year ended 30 June 2026/);
  assert.match(header, /financial-statements-2026/);
  assert.match(header, /effective 1 April 2025/);
  const totals = calculateTotals({ income: 100000, gst: 0, otherTax: 0 });
  const receipt = renderToStaticMarkup(createElement(Result, { totals }));
  assert.match(receipt, /year ended 30 June 2026/);
  assert.match(receipt, /Social security and welfare/);
  assert.doesNotMatch(receipt, /href="\/#/);
});
