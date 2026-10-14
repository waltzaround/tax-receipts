import { useState } from "react";
import { compareBudgets, detailedActuals, fullHistory, historicalActuals, historicalSource, percentChange, releases, snapshots } from "../utils/budgetHistory";
import { governmentForYear, governmentSource } from "../data/governments";
import { adjustSpending, adjustmentSources, spendingUnit } from "../utils/spendingAdjustments";
import { InfoTip } from "./InfoTip";
import { HistoryChart } from "./HistoryChart";
import "./History.css";

const formatMoney = (value: number | null, perPerson: boolean) => value === null ? "N/A" : `${value < 0 ? "−" : ""}$${Math.abs(value).toLocaleString("en-NZ", { maximumFractionDigits: 1 })}${perPerson ? "" : "m"}`;
const signed = (value: number, suffix = "") => `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toFixed(1)}${suffix}`;
const fiscalYear = (year: number) => String(year - 1);
const defaultToYear = 2027; // Financial year starting in 2026.

export function History() {
  const [basis, setBasis] = useState("actuals");
  const [fromYear, setFromYear] = useState(historicalActuals[0].year);
  const [toYear, setToYear] = useState(defaultToYear);
  const [category, setCategory] = useState("Total expenses");
  const [measure, setMeasure] = useState("amount");
  const [inflation, setInflation] = useState(false);
  const [perPerson, setPerPerson] = useState(false);
  const options = { inflation, perPerson };
  const unit = spendingUnit(options);
  const money = (value: number | null) => formatMoney(value, perPerson);
  const years = basis === "actuals" ? fullHistory : basis === "detailed" ? detailedActuals : snapshots.filter(y => y.publicationYear === Number(basis));
  const before = years.find(y => y.year === fromYear) ?? years[0];
  const after = years.find(y => y.year === toYear) ?? years[years.length - 1];
  const rows = compareBudgets(before, after, options);
  const beforeTotal = adjustSpending(before.total, before, options);
  const afterTotal = adjustSpending(after.total, after, options);
  const difference = beforeTotal === null || afterTotal === null ? null : afterTotal - beforeTotal;
  const totalChange = beforeTotal === null || afterTotal === null ? null : percentChange(beforeTotal, afterTotal);
  const categories = [...new Set(years.flatMap(y => Object.keys(y.categories)))];
  const mixedBasis = before.framework !== after.framework || before.yearEndMonth !== after.yearEndMonth || before.gstInclusive !== after.gstInclusive;
  const governmentBefore = governmentForYear(before.year, before.yearEndMonth, before.status === "Forecast" ? before.publicationYear : undefined);
  const governmentAfter = governmentForYear(after.year, after.yearEndMonth, after.status === "Forecast" ? after.publicationYear : undefined);
  const series = years.filter(year => year.year >= Math.min(before.year, after.year) && year.year <= Math.max(before.year, after.year)).map(year => {
    const amount = category === "Total expenses" ? year.total : year.categories[category] ?? null;
    return { ...year, value: amount === null ? null : measure === "share" ? amount / year.total * 100 : adjustSpending(amount, year, options) };
  });

  function changeBasis(value: string) {
    const available = value === "actuals" ? fullHistory : value === "detailed" ? detailedActuals : snapshots.filter(y => y.publicationYear === Number(value));
    setBasis(value);
    if (category !== "Total expenses" && !available.some(y => category in y.categories)) setCategory("Total expenses");
    setFromYear(available.some(y => y.year === fromYear) ? fromYear : available[0].year);
    setToYear(available.some(y => y.year === toYear) ? toYear : available[available.length - 1].year);
  }

  function reset() {
    setBasis("actuals"); setFromYear(historicalActuals[0].year); setToYear(defaultToYear);
    setInflation(false); setPerPerson(false); setCategory("Total expenses"); setMeasure("amount");
  }

  function download() {
    const content = [
      ["Category", `${fiscalYear(before.year)} ${before.status} ${unit}`, `${fiscalYear(after.year)} ${after.status} ${unit}`, `Change ${unit}`, "Change percent", "Share change percentage points", "From source", "To source", "From government", "To government", "From basis", "To basis", "CPI source", "Population source"],
      [`Total spending (${unit})`, beforeTotal, afterTotal, difference, totalChange, 0, before.url, after.url, governmentBefore.label, governmentAfter.label, `${before.totalLabel ?? "Core Crown expenses"}; ${before.framework ?? "Budget"}; year end month ${before.yearEndMonth ?? 6}; GST ${before.gstInclusive ? "inclusive" : "exclusive"}`, `${after.totalLabel ?? "Core Crown expenses"}; ${after.framework ?? "Budget"}; year end month ${after.yearEndMonth ?? 6}; GST ${after.gstInclusive ? "inclusive" : "exclusive"}`, inflation ? adjustmentSources.cpiSource : "", perPerson ? adjustmentSources.populationSource : ""],
      ...rows.map(row => [row.name, row.start, row.end, row.change, row.percent, row.shareChange, before.url, after.url, governmentBefore.label, governmentAfter.label]),
    ].map(row => row.map(cell => `"${String(cell ?? "N/A").replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `treasury-${basis}-${before.year}-${after.year}${inflation ? "-2025-prices" : ""}${perPerson ? "-per-person" : ""}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <main className="history" id="history">
    <div className="history-intro">
      <p className="history-eyebrow">THE BUDGET OVER TIME</p>
      <h1>How has spending changed?</h1>
      <p>Explore New Zealand government spending from the year starting {fiscalYear(fullHistory[0].year)}, with actuals through {fiscalYear(historicalActuals.at(-1).year)} and forecasts through {fiscalYear(fullHistory.at(-1).year)}, alongside the governments in office.</p>
    </div>

    <section className="history-controls" aria-label="Choose comparison">
      <label>Data source<select aria-label="Data source" value={basis} onChange={e => changeBasis(e.target.value)}>
        <option value="actuals">Full history & forecasts · {fiscalYear(fullHistory[0].year)}–{fiscalYear(fullHistory.at(-1).year)}</option>
        <option value="detailed">Detailed actuals · {fiscalYear(detailedActuals[0].year)}–{fiscalYear(detailedActuals.at(-1).year)}</option>
        {releases.map(r => <option key={r.publicationYear} value={r.publicationYear}>Budget {r.publicationYear} · actuals & forecasts</option>)}
      </select></label>
      <label>From year starting<select aria-label="From year starting" value={before.year} onChange={e => { const year = Number(e.target.value); setFromYear(year); if (year > after.year) setToYear(year); }}>
        {years.map(y => <option key={y.year} value={y.year}>{fiscalYear(y.year)}{y.status === "Forecast" ? " · Forecast" : ""}</option>)}
      </select></label>
      <label>To year starting<select aria-label="To year starting" value={after.year} onChange={e => { const year = Number(e.target.value); setToYear(year); if (year < before.year) setFromYear(year); }}>
        {years.map(y => <option key={y.year} value={y.year}>{fiscalYear(y.year)}{y.status === "Forecast" ? " · Forecast" : ""}</option>)}
      </select></label>
      <button className="history-reset" onClick={reset}>Reset</button>
      <div className="history-adjustments">
        <span className="history-adjustment-label">Compare in</span>
        <label className="history-toggle"><input type="checkbox" checked={inflation} onChange={e => setInflation(e.target.checked)} /><span>2025 prices</span></label>
        <InfoTip label="About inflation">Imagine giving every year the same price tags. We use Stats NZ’s Consumer Price Index (CPI) to express spending in 2025 dollars. This adjusts for household price inflation, not changes in the cost of delivering public services.</InfoTip>
        <label className="history-toggle"><input type="checkbox" checked={perPerson} onChange={e => setPerPerson(e.target.checked)} /><span>Per person</span></label>
        <InfoTip label="About population">A bigger country usually needs more spending. This divides spending by the World Bank’s population estimate for that calendar year. It is an approximation for the financial year, not a payment each person receives. You can combine it with 2025 prices.</InfoTip>
      </div>
    </section>
    <div className="history-context"><span>{unit} · years starting {fiscalYear(before.year)}–{fiscalYear(after.year)}</span>
      <InfoTip label="About these years">Labels show the year the financial year starts: 2026 means July 2026–June 2027. The government’s year ends in March through 1989 and June from 1990. Inflation and population adjustments use the selected financial year. Nominal amounts are the dollars recorded at the time.</InfoTip>
      {basis === "actuals" && <InfoTip label={mixedBasis ? "Counting rules changed" : "How spending is counted"}>Over this timeline, the government changed its year-end, tax treatment and accounting rules. That can change the numbers even without buying more services. The dotted lines explain each change. Price and population adjustments do not remove these differences.</InfoTip>}
    </div>
    {(inflation || perPerson) && <p className="history-note">{inflation ? "Prices use the average CPI for the year ended June 2025. " : ""}{perPerson ? "Per person uses the ending calendar year’s population as an approximation. " : ""}Adjustments cover financial years ending 1972–2025 (starting 1971–2024); later years show N/A. Budget forecasts within that range use observed CPI/population, not the assumptions in the original forecast.</p>}

    <section className="history-summary" aria-label="Comparison summary" aria-live="polite">
      <div><span>{fiscalYear(before.year)} · {before.status}</span><strong>{money(beforeTotal)}</strong><small>{before.totalLabel ?? "Core Crown expenses"} · {unit}</small><span className={`government-tag ${governmentBefore.tone}`}>{governmentBefore.label}</span></div>
      <div><span>{fiscalYear(after.year)} · {after.status}</span><strong>{money(afterTotal)}</strong><small>{after.totalLabel ?? "Core Crown expenses"} · {unit}</small><span className={`government-tag ${governmentAfter.tone}`}>{governmentAfter.label}</span></div>
      <div><span>Change over the selected period</span><strong>{difference !== null && difference > 0 ? "+" : ""}{money(difference)}</strong><small>{totalChange === null ? "Percentage change unavailable" : `${signed(totalChange, "%")} from ${fiscalYear(before.year)}`}</small></div>
    </section>

    <section className="history-section" aria-labelledby="trend-title">
      <div className="history-section-heading"><h2 id="trend-title">Spending through the years</h2>
        <div className="history-chart-controls">
          <label>Category<select aria-label="Category" value={category} onChange={e => setCategory(e.target.value)}><option>Total expenses</option>{categories.map(name => <option key={name}>{name}</option>)}</select></label>
          <label>Measure<select aria-label="Measure" value={measure} onChange={e => setMeasure(e.target.value)}><option value="amount">{unit}</option><option value="share">Share of total (%)</option></select></label>
        </div>
      </div>
      <p className="history-note">{category} · {measure === "amount" ? unit : "% of published total spending"}</p>
      {measure === "share" && <p className="history-note">Shares stay the same when prices or population change. The toggles still apply to the dollar comparisons below.</p>}
      <HistoryChart series={series} category={category} measure={measure} unit={unit} perPerson={perPerson} />
      <p className="history-note">Party colours identify the prime minister’s party. Split colours mark a change during the financial year. Spending reflects decisions across governments; these labels do not attribute all spending to one party. Forecast colours identify the government that published the Budget.</p>
    </section>

    <section className="history-section" aria-labelledby="category-title">
      <div className="history-section-heading"><div><h2 id="category-title">What changed?</h2><p className="history-note">Largest dollar changes first. Share change is in percentage points (pp).</p></div><button onClick={download}>Download comparison CSV</button></div>
      <div className="history-table-scroll" tabIndex={0} role="region" aria-label="Category comparison table, scroll horizontally on small screens">
        <table><caption>Spending categories, {fiscalYear(before.year)} ({before.status}) to {fiscalYear(after.year)} ({after.status}). {unit}.</caption>
          <thead><tr><th scope="col">Category</th><th scope="col">{fiscalYear(before.year)}</th><th scope="col">{fiscalYear(after.year)}</th><th scope="col">$ change</th><th scope="col">% change</th><th scope="col">Share change</th></tr></thead>
          <tbody>{rows.map(row => <tr key={row.name}><th scope="row">{row.name}</th><td>{row.start === null ? "N/A" : money(row.start)}</td><td>{row.end === null ? "N/A" : money(row.end)}</td><td>{row.change === null ? "N/A" : `${row.change > 0 ? "+" : ""}${money(row.change)}`}</td><td>{row.percent === null ? "N/A" : signed(row.percent, "%")}</td><td>{row.shareChange === null ? "N/A" : signed(row.shareChange, " pp")}</td></tr>)}</tbody>
        </table>
      </div>
      <p className="history-note">N/A means a percentage has a zero base, a category is unavailable, or the selected adjustment has no data for that year. Increases and decreases do not by themselves indicate better or worse outcomes.</p>
      {basis === "actuals" && <p className="history-note">Treasury groups welfare with GSF, and combines heritage, primary services, housing, environment and other expenses. Where published categories do not sum to the published total, the difference is shown explicitly; it is not an additional spending category. No missing category is treated as zero.</p>}
    </section>

    <section className="history-method" aria-labelledby="source-title"><h2 id="source-title">Sources & how to read this</h2>
      <p>The full history uses Treasury’s January 2026 fiscal time series, covering financial years ending 1972–2025. We extend it with 2026 actuals from Treasury’s Financial Statements and later forecasts from Budget 2026, grouped into the same historical categories. Treasury’s online Budget archive begins in 1997; earlier Budget documents are available through libraries. Forecasts are marked explicitly and never replace available actuals. All year labels show the starting year.</p>
      <p>Before 1994 the total is financial net expenditure on a cash basis. From 1994 it is Core Crown expenses on an accrual basis. Treasury has not reconciled all accounting changes or category definitions across these series. The detailed actuals view uses the latest actuals in the imported 2024–2026 Budgets, plus the Financial Statements for the year ended June 2026. A Budget view preserves that publication’s forecasts.</p>
      <p>Inflation adjustment multiplies spending by the average CPI for the year ended June 2025 (1293.0) divided by the average of the four CPI quarters in the selected financial year. Source: <a href={adjustmentSources.cpiSource}>Stats NZ, all-groups CPI (CPIQ.SE9A), June 2025 release</a>. CPI measures household prices, not a government-services cost index.</p>
      <p>Per-person amounts divide dollars (millions × 1,000,000) by <a href="https://data.worldbank.org/indicator/SP.POP.TOTL?locations=NZ">World Bank annual population estimates (SP.POP.TOTL)</a> for the financial year’s ending calendar year. This is a mid-year population proxy, not a fiscal-year average. The archived series was updated {adjustmentSources.populationUpdated}. Both adjustments are available for financial years ending 1972–2025 (starting 1971–2024). Missing denominators are never extrapolated.</p>
      <p>Government dates and party groupings follow Parliament’s government list. Detail labels include coalition and supporting parties as listed by Parliament, not just formal coalition partners. Years with changes show every government that overlaps the fiscal year. Future forecasts do not predict which party will govern.</p>
      <p>Selected sources: <a href={before.url}>{fiscalYear(before.year)} — {before.sourceName ?? `Budget ${before.publicationYear}`}</a>; <a href={after.url}>{fiscalYear(after.year)} — {after.sourceName ?? `Budget ${after.publicationYear}`}</a>.</p>
      <ul><li><a href={historicalSource}>Treasury historical fiscal indicators 1972–2025 (XLSX), Spending sheet</a></li><li><a href="https://www.treasury.govt.nz/publications/information-release/data-fiscal-time-series-historical-fiscal-indicators">Treasury series definitions and reporting breaks</a></li><li><a href="https://www.treasury.govt.nz/publications/budgets/current-and-past-budgets">Treasury current and past Budgets archive</a></li><li><a href={governmentSource}>New Zealand Parliament — governments since 1856</a></li></ul>
      <ul>{releases.map(release => <li key={release.publicationYear}><a href={release.url}>Budget {release.publicationYear} — Treasury Core Crown Expense Tables (XLSX)</a></li>)}</ul>
      <p>Source: The Treasury, “Core Crown Expense Tables”, summary table. Crown copyright, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Data imported 14 October 2026.</p>
    </section>
  </main>;
}
