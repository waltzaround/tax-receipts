import { ChangeEvent } from "react";

export type InputChangeEvent = ChangeEvent<HTMLInputElement>;

export type TaxBand = {
  id: string;
  end: number;
  rate: number;
};

export type BandAmount = {
  id: string;
  amount: number;
};

export type BudgetPaid = {
  amount: string;
  percentage: string;
  percentageOfParent: string;
};

export type BudgetChild = {
  name: string;
  value: number;
  link: string;
  paid?: BudgetPaid;
};

export type BudgetCategory = {
  id: string;
  name: string;
  value: number;
  paid?: BudgetPaid;
  children: BudgetChild[];
};

export type Budget = {
  totalSpend: number;
  category: BudgetCategory[];
};

export type CalculateTotalsProps = {
  income: number;
  gst: number;
  otherTax: number;
};

export type CalculateTotalsReturn = {
  income: string;
  taxFromIncome: string;
  taxFromGST: string;
  taxFromOther: string;
  totalTax: string;
  totalsPerCategory: BudgetCategory[];
};
