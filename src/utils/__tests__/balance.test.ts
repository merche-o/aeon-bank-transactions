import type { Transaction } from '../../models/Transaction';
import { canAfford, sumBalance } from '../balance';

const txs: Transaction[] = [
  {
    refId: '1',
    transferDate: '2024-10-01T00:00:00Z',
    recipientName: 'A',
    transferName: 'In',
    amount: 1000,
    category: 'salary',
  },
  {
    refId: '2',
    transferDate: '2024-10-02T00:00:00Z',
    recipientName: 'B',
    transferName: 'Out',
    amount: -250,
    category: 'bills',
  },
];

describe('sumBalance', () => {
  it('sums transaction amounts', () => {
    expect(sumBalance(txs)).toBe(750);
    expect(sumBalance([])).toBe(0);
  });
});

describe('canAfford', () => {
  it('allows incoming amounts regardless of balance', () => {
    expect(canAfford(0, 100)).toBe(true);
    expect(canAfford(-50, 0)).toBe(true);
  });

  it('allows outgoing when balance covers the debit', () => {
    expect(canAfford(750, -750)).toBe(true);
    expect(canAfford(750, -749.99)).toBe(true);
  });

  it('rejects outgoing when balance is insufficient', () => {
    expect(canAfford(750, -750.01)).toBe(false);
    expect(canAfford(0, -1)).toBe(false);
  });
});
