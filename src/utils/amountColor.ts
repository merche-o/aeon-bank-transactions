export type AmountSign = 'positive' | 'negative';

export function amountColor(amount: number): AmountSign {
  return amount >= 0 ? 'positive' : 'negative';
}
