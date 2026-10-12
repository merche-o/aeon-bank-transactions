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
    status: 'completed',
  },
  {
    refId: '2',
    transferDate: '2024-10-02T00:00:00Z',
    recipientName: 'B',
    transferName: 'Out',
    amount: -250,
    category: 'bills',
    status: 'completed',
  },
];

describe('sumBalance', () => {
  it('sums transaction amounts', () => {
    expect(sumBalance(txs)).toBe(750);
    expect(sumBalance([])).toBe(0);
  });

  it('excludes scheduled and cancelled from balance', () => {
    const withScheduled: Transaction[] = [
      ...txs,
      {
        refId: '3',
        transferDate: '2024-10-03T00:00:00Z',
        recipientName: 'C',
        transferName: 'Future',
        amount: -500,
        category: 'transfer',
        status: 'scheduled',
        scheduledFor: '2099-01-01',
      },
      {
        refId: '4',
        transferDate: '2024-10-03T00:00:00Z',
        recipientName: 'D',
        transferName: 'Cancelled',
        amount: -100,
        category: 'bills',
        status: 'cancelled',
      },
    ];
    expect(sumBalance(withScheduled)).toBe(750);
  });

  it('includes pending incoming toward balance', () => {
    const withPending: Transaction[] = [
      ...txs,
      {
        refId: '5',
        transferDate: '2024-10-04T00:00:00Z',
        recipientName: 'E',
        transferName: 'Request',
        amount: 200,
        category: 'transfer',
        status: 'pending',
        paymentRequestId: 'pr-1',
      },
      {
        refId: '6',
        transferDate: '2024-10-04T00:00:00Z',
        recipientName: 'F',
        transferName: 'Pending out',
        amount: -50,
        category: 'transfer',
        status: 'pending',
      },
    ];
    expect(sumBalance(withPending)).toBe(950);
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
