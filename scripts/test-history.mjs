import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, optimizeDeps: { noDiscovery: true, include: [] }, appType: 'custom' });
const { compareBudgets, fullHistory, historicalActuals, detailedActuals, percentChange, snapshots } = await server.ssrLoadModule('/src/utils/budgetHistory.ts');
const { governmentForYear } = await server.ssrLoadModule('/src/data/governments.ts');
const { adjustSpending, adjustmentSources } = await server.ssrLoadModule('/src/utils/spendingAdjustments.ts');
await server.close();

test('all imported categories reconcile to Treasury totals', () => {
  assert.equal(snapshots.length, 30);
  for (const year of snapshots) {
    assert.equal(Object.values(year.categories).reduce((sum, value) => sum + value, 0), year.total);
    assert.equal(Object.keys(year.categories).length, 17);
  }
});

test('historical series selects latest actuals and never substitutes forecasts', () => {
  assert.deepEqual(detailedActuals.map(y => y.year), [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]);
  assert.ok(detailedActuals.every(y => y.status === 'Actual'));
  const year = detailedActuals.find(y => y.year === 2024);
  assert.equal(year.total, 138998);
  assert.equal(year.publicationYear, 2026);
  assert.equal(snapshots.find(y => y.year === 2024 && y.publicationYear === 2024).total, 138325);
});

test('comparison changes reconcile, reverse correctly and handle identical years', () => {
  const before = detailedActuals[0];
  const after = detailedActuals.at(-1);
  const rows = compareBudgets(before, after);
  assert.equal(rows.reduce((sum, row) => sum + row.change, 0), after.total - before.total);
  assert.ok(Math.abs(rows.reduce((sum, row) => sum + row.shareChange, 0)) < 1e-10);
  const reversed = compareBudgets(after, before);
  for (const row of rows) assert.equal(reversed.find(r => r.name === row.name).change + row.change, 0);
  assert.ok(compareBudgets(before, before).every(row => row.change === 0 && row.shareChange === 0));
});

test('complete historical series preserves source accounting breaks and missing categories', () => {
  assert.deepEqual(historicalActuals.map(y => y.year), Array.from({length:55}, (_,i)=>1972+i));
  assert.equal(historicalActuals[0].total,1682.8);
  assert.equal(historicalActuals.at(-1).total,146321);
  for (const year of historicalActuals) {
    assert.ok(Math.abs(Object.values(year.categories).reduce((sum,value)=>sum+value,0)-year.total)<.00001);
    assert.equal(year.yearEndMonth,year.year<=1989?3:6);
    assert.equal(year.gstInclusive,year.year>=1987 && year.year<=1993);
    assert.equal(year.totalLabel,year.year<1994?'Financial net expenditure':'Core Crown expenses');
  }
  assert.equal(historicalActuals.find(y=>y.year===1994).framework,'Old GAAP');
  assert.equal(historicalActuals.find(y=>y.year===1997).framework,'IFRS');
  assert.equal(historicalActuals.find(y=>y.year===2005).framework,'PBE');
  assert.ok(!('Net foreign exchange gains (−)/losses' in historicalActuals[0].categories));
  assert.ok(historicalActuals.some(y=>Math.abs(y.reconciliationDifference)>1));
});

test('governments reflect fiscal-year overlaps, party changes and forecast provenance', () => {
  assert.equal(governmentForYear(1972,3).label,'National');
  assert.equal(governmentForYear(1973,3).label,'National → Labour');
  assert.equal(governmentForYear(1976,3).label,'Labour → National');
  assert.equal(governmentForYear(1985,3).label,'National → Labour');
  for (const year of [1991,2009,2024]) assert.equal(governmentForYear(year).label,'Labour → National');
  for (const year of [2000,2018]) assert.equal(governmentForYear(year).label,'National → Labour');
  assert.equal(governmentForYear(2021).label,'Labour');
  assert.match(governmentForYear(2021).detail,/NZ First.*Green Party.*Labour \/ Green Party/);
  assert.equal(governmentForYear(2030,6,2026).label,'Budget 2026: National-led');
});

test('zero bases, negative adjustments and unavailable categories are explicit', () => {
  assert.equal(percentChange(0, 100), null);
  assert.equal(percentChange(-100, -50), 50);
  const before = { total: 100, categories: { Health: 100 } };
  const after = { total: 100, categories: { Education: 100 } };
  assert.ok(compareBudgets(before, after).every(row => row.change === null && row.percent === null));
  assert.ok(snapshots.some(y => y.categories['Top-down operating expense adjustment'] < 0));
});

test('price and population adjustments use fiscal CPI averages and correct units', () => {
  const year = historicalActuals.find(y => y.year === 2025);
  assert.equal(adjustmentSources.baseCpi,1293);
  assert.equal(adjustSpending(year.total,year,{inflation:true,perPerson:false}),year.total);
  assert.equal(adjustSpending(year.total,year,{inflation:false,perPerson:true}),year.total*1_000_000/5324700);
  const old = historicalActuals[0];
  const expectedCpi = (71.6425032626427 + 73.0351215334421 + 74.6340546492659 + 76.0266737357259)/4;
  assert.ok(Math.abs(adjustSpending(old.total,old,{inflation:true,perPerson:false}) - old.total*1293/expectedCpi)<1e-8);
  assert.notEqual(adjustSpending(100,{year:1972,yearEndMonth:3},{inflation:true,perPerson:false}),adjustSpending(100,{year:1972,yearEndMonth:6},{inflation:true,perPerson:false}));
  assert.equal(adjustSpending(100,{year:2030},{inflation:true,perPerson:false}),null);
  assert.equal(adjustSpending(100,{year:2030},{inflation:false,perPerson:false}),100);
  assert.equal(adjustSpending(null,year,{inflation:true,perPerson:true}),null);
  assert.equal(adjustSpending(0,year,{inflation:true,perPerson:true}),0);
});

test('adjusted comparison changes reconcile and budget shares stay unchanged', () => {
  const before=detailedActuals[0], after=detailedActuals.find(y => y.year === 2025);
  const options={inflation:true,perPerson:true};
  const rows=compareBudgets(before,after,options);
  const raw=compareBudgets(before,after);
  assert.ok(Math.abs(rows.reduce((sum,row)=>sum+row.change,0)-(adjustSpending(after.total,after,options)-adjustSpending(before.total,before,options)))<1e-8);
  for(const row of rows) assert.equal(row.shareChange,raw.find(r=>r.name===row.name).shareChange);
});

test('full history offers starting year 2026 as a forecast and preserves 2026 actuals', () => {
  assert.equal(new Set(fullHistory.map(y => y.year)).size, fullHistory.length);
  const actual = fullHistory.find(y => y.year === 2026);
  assert.equal(actual.status, 'Actual');
  assert.equal(actual.total, 146321);
  assert.match(actual.url, /financial-statements-2026/);
  const forecast = fullHistory.find(y => y.year - 1 === 2026);
  assert.equal(forecast.status, 'Forecast');
  assert.equal(forecast.total, 154823);
  assert.equal(forecast.publicationYear, 2026);
  for (const year of fullHistory) {
    assert.ok(Math.abs(Object.values(year.categories).reduce((sum, value) => sum + value, 0) - year.total) < 1e-5);
  }
  const rows = compareBudgets(actual, forecast);
  assert.ok(rows.every(row => row.change !== null));
  assert.equal(rows.reduce((sum, row) => sum + row.change, 0), forecast.total - actual.total);
  assert.equal(adjustSpending(forecast.total, forecast, { inflation: true, perPerson: false }), null);
  assert.equal(adjustSpending(actual.total, actual, { inflation: false, perPerson: true }), null);
});

test('prime minister segments preserve short terms and exclude forecasts', async () => {
  const loader = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, optimizeDeps: { noDiscovery: true, include: [] }, appType: 'custom' });
  try {
    const { primeMinisterSegments } = await loader.ssrLoadModule('/src/data/primeMinisters.ts');
    const segments = primeMinisterSegments(historicalActuals);
    assert.equal(segments.length, 16);
    assert.equal(segments[0].from, 0);
    assert.equal(segments.at(-1).to, historicalActuals.length);
    const moore = segments.find(pm => pm.name === 'Mike Moore');
    assert.ok(moore.to > moore.from && moore.to - moore.from < 1);
    const key = segments.find(pm => pm.name === 'John Key');
    const english = segments.find(pm => pm.name === 'Bill English');
    assert.equal(key.to, english.from);
    assert.deepEqual(primeMinisterSegments(snapshots.filter(y => y.status === 'Forecast')), []);
  } finally {
    await loader.close();
  }
});
