import {
  calculateAmountPerTaxBand,
  formatCurrency,
  calculatePaid,
} from "./index";
import { budget2022, budget2024 } from "../data";
import type {
  BandAmount,
  CalculateTotalsProps,
  CalculateTotalsReturn,
} from "../types";

const sumAmount = (sum: BandAmount[]): number => {
  let total = 0;
  for (let i = 0; i < sum.length; i++) {
    total += sum[i].amount;
  }
  return total;
};

/**
 * Calculate the total tax from income, gst, and other tax
 *
 * @param {CalculateTotalsProps} {
  income = 0,
  gst = 0,
  otherTax = 0
}
 * @returns {CalculateTotalsReturn}
 */
const calculateTotals = ({
  income = 0,
  gst = 0,
  otherTax = 0,
}: CalculateTotalsProps): CalculateTotalsReturn => {
  const sum = calculateAmountPerTaxBand(income);
  const taxFromIncome = sumAmount(sum);
  const taxFromGST = gst * 0.15;
  const lastYear = new Date().getFullYear() - 2;
  
  // Use the appropriate budget based on the year, with fallback to the latest available
  let selectedBudget;
  if (lastYear === 2024) {
    selectedBudget = budget2024;
  } else if (lastYear === 2022) {
    selectedBudget = budget2022;
  } else {
    // Use the latest available budget data if the specific year is not available
    selectedBudget = budget2024;
  }
  
  const totalTax = taxFromIncome + otherTax + gst * 0.15;

  const totalsPerCategory = selectedBudget.category.map((category) => {
    category.paid = calculatePaid({
      value: category.value,
      totalTax,
      totalSpend: selectedBudget.totalSpend,
      parentSpend: selectedBudget.totalSpend,
    });

    category.children = category.children.map((child) => {
      child.paid = calculatePaid({
        value: child.value,
        totalTax,
        totalSpend: selectedBudget.totalSpend,
        parentSpend: category.value,
      });
      return child;
    });

    return category;
  });

  return {
    income: formatCurrency(income),
    taxFromIncome: formatCurrency(taxFromIncome),
    taxFromGST: formatCurrency(taxFromGST),
    taxFromOther: formatCurrency(otherTax),
    totalTax: formatCurrency(totalTax),
    totalsPerCategory,
  };
};

export { calculateTotals };
