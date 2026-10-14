import type { Budget, TaxBand } from "../types";

// IRD annual rates from 1 April 2025, current for 2026.
export const incomeTaxSource = "https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-rates-for-individuals";
export const incomeTaxBands: TaxBand[] = [
  { id: "band1", end: 15600, rate: 10.5 },
  { id: "band2", end: 53500, rate: 17.5 },
  { id: "band3", end: 78100, rate: 30 },
  { id: "band4", end: 180000, rate: 33 },
  { id: "band5", end: Number.MAX_VALUE, rate: 39 },
];

export const calculatorPeriod = "year ended 30 June 2026";
export const calculatorSpendingSource = "https://www.treasury.govt.nz/publications/year-end/financial-statements-2026";

// Treasury, Financial Statements 2026 (published 8 October 2026), p.156.
// Core Crown ACTUAL expenses, NZD millions; excludes losses.
// https://www.treasury.govt.nz/sites/default/files/2026-10/fsgnz-2026.pdf#page=162
// This source supplies category totals, not the old calculator's subcategories.
export const calculatorBudget: Budget = {
  totalSpend: 146321,
  category: [
    { id: "social", name: "Social security and welfare", value: 50388, children: [] },
    { id: "health", name: "Health", value: 32917, children: [] },
    { id: "education", name: "Education", value: 21206, children: [] },
    { id: "economic", name: "Economic and industrial services", value: 3012, children: [] },
    { id: "transport", name: "Transport and communications", value: 6035, children: [] },
    { id: "law", name: "Law and order", value: 7077, children: [] },
    { id: "government", name: "Core government services", value: 5918, children: [] },
    { id: "heritage", name: "Heritage, culture and recreation", value: 1439, children: [] },
    { id: "housing", name: "Housing and community development", value: 1958, children: [] },
    { id: "defence", name: "Defence", value: 3525, children: [] },
    { id: "environment", name: "Environmental protection", value: 2509, children: [] },
    { id: "primary", name: "Primary services", value: 1030, children: [] },
    { id: "gsf", name: "GSF pension expenses", value: 61, children: [] },
    { id: "other", name: "Other", value: 189, children: [] },
    { id: "finance", name: "Finance costs", value: 9057, children: [] },
  ],
};
