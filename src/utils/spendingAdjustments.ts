import data from "../data/adjustments.json";
import type { Snapshot } from "./budgetHistory";

export type Adjustments = { inflation: boolean; perPerson: boolean };
export const adjustmentSources = data;
const periods: Record<string, { cpi: number; population: number }> = data.periods;

export function adjustSpending(value: number | null, year: Pick<Snapshot, "year" | "yearEndMonth">, options: Adjustments): number | null {
  if (value === null) return null;
  if (!options.inflation && !options.perPerson) return value;
  const period = periods[`${year.year}-${year.yearEndMonth ?? 6}`];
  if (!period) return null;
  return value * (options.inflation ? data.baseCpi / period.cpi : 1) * (options.perPerson ? 1_000_000 / period.population : 1);
}

export function spendingUnit(options: Adjustments) {
  return `${options.inflation ? "2025 NZ$" : "NZ$"}${options.perPerson ? " per person" : " millions"}`;
}
