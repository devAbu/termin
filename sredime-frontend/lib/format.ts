/**
 * Formatting helpers per design/README.md content rules: prices "35 KM"
 * (space before suffix, no symbol, no trailing .00), percentages with comma
 * decimal ("6,3%"), thousands with a period ("1.240 KM").
 */

export function formatPrice(amount: string | number, currency = "KM"): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  const hasFraction = Math.round(value * 100) % 100 !== 0;
  const formatted = value.toLocaleString("bs-BA", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}`;
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString("bs-BA", { maximumFractionDigits: 1 })}%`;
}
