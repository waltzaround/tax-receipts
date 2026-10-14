import {
  calculateAmountPerTaxBand,
  formatCurrency,
  calculatePaid,
} from "./index";
import { calculatorBudget } from "../data/calculator";
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
  // Spending is the price paid including GST: IRD's tax fraction is 3/23.
  const taxFromGST = gst * 3 / 23;
  const selectedBudget = calculatorBudget;
  const totalTax = taxFromIncome + otherTax + taxFromGST;

  const totalsPerCategory = selectedBudget.category.map((category) => {
    const paid = calculatePaid({
      value: category.value,
      totalTax,
      totalSpend: selectedBudget.totalSpend,
      parentSpend: selectedBudget.totalSpend,
    });

    const children = category.children.map((child) => ({
      ...child,
      paid: calculatePaid({
        value: child.value,
        totalTax,
        totalSpend: selectedBudget.totalSpend,
        parentSpend: category.value,
      }),
    }));

    return { ...category, paid, children };
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
