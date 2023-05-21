import { taxBands2022 } from "../data";
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

  for (let i = 0; i < taxBands2022.length; i++) {
    const currentTaxBand = taxBands2022[i];
    const prevTaxBand = taxBands2022[i - 1];
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