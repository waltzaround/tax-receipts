import { incomeTaxBands } from "../data/calculator";
import type { BandAmount } from "../types";

/**
 * Returns an array of objects containing
 * the tax band id and the amount of
 * tax paid for that band.
 *
 * @param {number} income
 * @returns {BandAmount[]}
 */
const calculateAmountPerTaxBand = (income: number): BandAmount[] => {
  const amounts: BandAmount[] = [];

  for (let i = 0; i < incomeTaxBands.length; i++) {
    const currentTaxBand = incomeTaxBands[i];
    const prevTaxBand = incomeTaxBands[i - 1];
    let taxAmount = 0;

    if (income < currentTaxBand.end) {
      taxAmount =
        (income - (prevTaxBand?.end ?? 0)) * (currentTaxBand.rate / 100);
      amounts.push({ id: currentTaxBand.id, amount: taxAmount });
      break;
    } else {
      taxAmount =
        (currentTaxBand.end - (prevTaxBand?.end ?? 0)) *
        (currentTaxBand.rate / 100);
      amounts.push({ id: currentTaxBand.id, amount: taxAmount });
    }
  }
  return amounts;
}

export { calculateAmountPerTaxBand };
