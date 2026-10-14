import data from "../data/history.json";
import { calculatorBudget, calculatorSpendingSource } from "../data/calculator";
import { adjustSpending, type Adjustments } from "./spendingAdjustments";

export type Snapshot = {
  year: number;
  status: string;
  total: number;
  categories: Record<string, number>;
  publicationYear: number;
  url: string;
  sourceName?: string;
  yearEndMonth?: number;
  framework?: string;
  gstInclusive?: boolean;
  totalLabel?: string;
  reconciliationDifference?: number;
};

export const releases = data.releases;
export const snapshots: Snapshot[] = releases.flatMap(release =>
  release.years.map(year => ({ ...year, publicationYear: release.publicationYear, url: release.url }))
);

// Later publications supersede earlier actuals. Forecasts never replace actuals.
const actuals = new Map<number, Snapshot>();
snapshots.filter(year => year.status === "Actual").forEach(year => actuals.set(year.year, year));
const actual2026: Snapshot = {
  year: 2026, status: "Actual", total: calculatorBudget.totalSpend,
  categories: { ...Object.fromEntries(calculatorBudget.category.map(category => [category.name, category.value])), "Forecast new operating spending": 0, "Top-down operating expense adjustment": 0 },
  publicationYear: 2026, url: calculatorSpendingSource,
  sourceName: "Treasury Financial Statements 2026", yearEndMonth: 6,
  framework: "PBE", gstInclusive: false, totalLabel: "Core Crown expenses",
};
actuals.set(actual2026.year, actual2026);
export const detailedActuals = [...actuals.values()].sort((a, b) => a.year - b.year);

// Match the historical series' broader groups without mixing actuals and forecasts.
function historicalGroups(snapshot: Snapshot): Snapshot {
  const categories = { ...snapshot.categories };
  categories["Social security and welfare, GSF"] = categories["Social security and welfare"] + categories["GSF pension expenses"];
  delete categories["Social security and welfare"];
  delete categories["GSF pension expenses"];
  const combined = ["Heritage, culture and recreation", "Primary services", "Housing and community development", "Environmental protection", "Other"];
  categories["Heritage, primary services, housing, environment and other"] = combined.reduce((sum, name) => sum + categories[name], 0);
  combined.forEach(name => delete categories[name]);
  // Actual years have no forecast allowances; explicit zeroes allow comparisons.
  categories["Forecast new operating spending"] ??= 0;
  categories["Top-down operating expense adjustment"] ??= 0;
  return { ...snapshot, categories, yearEndMonth: 6, framework: "PBE", gstInclusive: false, totalLabel: "Core Crown expenses", reconciliationDifference: 0 };
}

export const historicalActuals: Snapshot[] = [...data.historical.years, historicalGroups(actual2026)];
const latestPublicationYear = Math.max(...releases.map(release => release.publicationYear));
export const fullHistory: Snapshot[] = [
  ...historicalActuals.map(snapshot => ({ ...snapshot, categories: { ...snapshot.categories, "Forecast new operating spending": 0, "Top-down operating expense adjustment": 0 } })),
  ...snapshots.filter(snapshot => snapshot.publicationYear === latestPublicationYear && snapshot.status === "Forecast" && snapshot.year > actual2026.year).map(historicalGroups),
];
export const historicalSource = data.historical.url;

export const percentChange = (before: number, after: number): number | null =>
  before === 0 ? null : (after - before) / Math.abs(before) * 100;

export function compareBudgets(before: Snapshot, after: Snapshot, options: Adjustments = { inflation: false, perPerson: false }) {
  return [...new Set([...Object.keys(before.categories), ...Object.keys(after.categories)])].map(name => {
    const rawStart = before.categories[name] ?? null;
    const rawEnd = after.categories[name] ?? null;
    const start = adjustSpending(rawStart, before, options);
    const end = adjustSpending(rawEnd, after, options);
    return {
      name, start, end,
      change: start === null || end === null ? null : end - start,
      percent: start === null || end === null ? null : percentChange(start, end),
      shareChange: rawStart === null || rawEnd === null ? null : (rawEnd / after.total - rawStart / before.total) * 100,
    };
  }).sort((a, b) => Math.abs(b.change ?? 0) - Math.abs(a.change ?? 0));
}
