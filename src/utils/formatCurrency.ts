export function formatCurrency(amount: number): string {
  const absolute = Math.abs(amount);
  const formatted = absolute.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-RM ${formatted}` : `RM ${formatted}`;
}
