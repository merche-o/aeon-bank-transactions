import type { Transaction } from '../../models/Transaction';
import { sortTransactions } from '../sortTransactions';

const sample: Transaction[] = [
  {
    refId: 'A',
    transferDate: '2024-08-30T11:47:22Z',
    recipientName: 'Emily Davis',
    transferName: 'Bonus Payment',
    amount: 1200,
    category: 'salary',
    status: 'completed',
  },
  {
    refId: 'B',
    transferDate: '2024-10-15T12:34:56Z',
    recipientName: 'John Doe',
    transferName: 'Salary Payment',
    amount: 1500,
    category: 'salary',
    status: 'completed',
  },
];

describe('sortTransactions', () => {
  it('sorts latest first', () => {
    const sorted = sortTransactions(sample);
    expect(sorted.map((t) => t.refId)).toEqual(['B', 'A']);
  });

  it('does not mutate input', () => {
    const copy = [...sample];
    sortTransactions(sample);
    expect(sample).toEqual(copy);
  });
});
