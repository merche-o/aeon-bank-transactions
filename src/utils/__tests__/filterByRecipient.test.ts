import type { Transaction } from '@/models/Transaction';

import { filterTransactionsByRecipient } from '../filterByRecipient';

const txs: Transaction[] = [
  {
    refId: 'OLD',
    transferDate: '2024-08-30T11:47:22Z',
    recipientName: 'John Doe',
    transferName: 'Older',
    amount: 100,
    category: 'transfer',
    status: 'completed',
    recipientId: 'R1',
  },
  {
    refId: 'NEW',
    transferDate: '2024-10-15T12:34:56Z',
    recipientName: 'john doe',
    transferName: 'Newer',
    amount: 200,
    category: 'transfer',
    status: 'completed',
  },
  {
    refId: 'OTHER',
    transferDate: '2024-09-21T09:12:45Z',
    recipientName: 'Jane Smith',
    transferName: 'Unrelated',
    amount: 50,
    category: 'bills',
    status: 'completed',
    recipientId: 'R2',
  },
];

describe('filterTransactionsByRecipient', () => {
  it('matches by recipientId or case-insensitive display name', () => {
    const result = filterTransactionsByRecipient(txs, {
      recipientId: 'R1',
      displayName: 'John Doe',
    });
    expect(result.map((tx) => tx.refId)).toEqual(['NEW', 'OLD']);
  });

  it('excludes non-matching transactions', () => {
    const result = filterTransactionsByRecipient(txs, {
      recipientId: 'R99',
      displayName: 'Nobody',
    });
    expect(result).toEqual([]);
  });
});
