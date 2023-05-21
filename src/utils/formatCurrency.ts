
/**
 * Format a number to a currency string (NZD)
 *
 * @param {number} [value=0]
 * @returns {string}
 */
const formatCurrency = (value: number = 0): string => new Intl.NumberFormat("en-NZ", {
  style: "currency",
  currency: "NZD",
}).format(value);

export { formatCurrency };