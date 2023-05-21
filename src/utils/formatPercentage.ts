/**
 * Format a number to a percentage
 * string maximum 2 decimal places
 *
 * @param {number} [value=0]
 * @returns {string}
 */
const formatPercentage = (value: number = 0): string => `${value.toFixed(2)}%`;

export { formatPercentage };