import { formatCurrency, formatPercentage } from "./index";
import type { BudgetPaid } from "../types";

/**
 * Return the amount paid for a budget item
 *
 * @param {{
  value: number,
  totalTax: number,
  totalSpend: number
}} {
  value,
  totalTax,
  totalSpend
}
 * @returns {BudgetPaid}
 */
const calculatePaid = ({
  value,
  totalTax,
  totalSpend,
  parentSpend
}: {
  value: number,
  totalTax: number,
  totalSpend: number,
  parentSpend: number
}): BudgetPaid => {
  const amount = formatCurrency(value / totalSpend * totalTax);
  const percentage = formatPercentage(value / totalSpend * 100);
  const percentageOfParent = formatPercentage(value / parentSpend * 100);
  return {
    amount,
    percentage,
    percentageOfParent
  };
};

export { calculatePaid };