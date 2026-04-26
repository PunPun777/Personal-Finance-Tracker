/**
 * formatINR — canonical currency formatter for the application.
 *
 * Intl.NumberFormat instances are cached at module level — instantiation
 * is expensive and should not happen on every render/call.
 */

const INR_FULL = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const INR_COMPACT = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * formatINR — full amount with paise.
 * @param {number|string} value
 * @returns {string}  e.g. "₹1,00,000.00"
 */
export function formatINR(value) {
  return INR_FULL.format(Number(value) || 0);
}

/**
 * formatINRCompact — no decimals, for chart Y-axis ticks.
 * @param {number|string} value
 * @returns {string}  e.g. "₹1,00,000"
 */
export function formatINRCompact(value) {
  return INR_COMPACT.format(Number(value) || 0);
}
