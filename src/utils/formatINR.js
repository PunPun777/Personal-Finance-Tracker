
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
export function formatINR(value) {
  return INR_FULL.format(Number(value) || 0);
}
export function formatINRCompact(value) {
  return INR_COMPACT.format(Number(value) || 0);
}
