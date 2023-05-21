import type { CalculateTotalsReturn } from "../types";

const baseTotalReturn: CalculateTotalsReturn = {
  income: "$0.00",
  taxFromIncome: "$0.00",
  taxFromGST: "$0.00",
  taxFromOther: "$0.00",
  totalTax: "$0.00",
  totalsPerCategory: []
};

export { baseTotalReturn };