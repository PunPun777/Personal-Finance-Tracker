/**
 * formatINR — canonical currency formatter for the application.
 *
 * Uses the browser's Intl.NumberFormat API with:
 *   - locale  : "en-IN"  → Indian grouping (1,00,000 not 100,000)
 *   - currency : "INR"    → ₹ symbol, correct decimal rules
 *
 * @param {number|string} value
 * @returns {string}  e.g. "₹1,00,000.00"
 */
export function formatINR(value) {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * formatINRCompact — short axis / badge variant without decimals.
 * Used for chart Y-axis ticks where space is tight.
 *
 * @param {number|string} value
 * @returns {string}  e.g. "₹1,00,000"
 */
export function formatINRCompact(value) {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}
