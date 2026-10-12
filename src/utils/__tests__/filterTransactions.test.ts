import type { FilterCriteria, Transaction } from '../../models/Transaction';
import { filterTransactions } from '../filterTransactions';

const txs: Transaction[] = [
  {
    refId: '123ABC',
    transferDate: '2024-10-15T12:34:56Z',
    recipientName: 'John Doe',
    transferName: 'Salary Payment',
    amount: 1500,
  },
  {
    refId: '789GHI',
    transferDate: '2024-10-05T16:18:30Z',
    recipientName: 'Robert Brown',
    transferName: 'Refund',
    amount: -500,
  },
  {
    refId: '101JKL',
    transferDate: '2024-08-30T11:47:22Z',
    recipientName: 'Emily Davis',
    transferName: 'Bonus Payment',
    amount: 1200,
  },
];

const base: FilterCriteria = { query: '', type: 'all', dateRange: 'all' };

describe('filterTransactions', () => {
  it('filters by query across name recipient refId amount', () => {
    expect(filterTransactions(txs, { ...base, query: 'john' })).toHaveLength(1);
    expect(filterTransactions(txs, { ...base, query: '789' })).toHaveLength(1);
    expect(filterTransactions(txs, { ...base, query: '-500' })).toHaveLength(1);
  });

  it('filters incoming and outgoing', () => {
    expect(filterTransactions(txs, { ...base, type: 'incoming' })).toHaveLength(2);
    expect(filterTransactions(txs, { ...base, type: 'outgoing' })).toHaveLength(1);
  });

  it('filters by date range relative to now', () => {
    const now = new Date('2024-10-16T00:00:00Z');
    expect(
      filterTransactions(txs, { ...base, dateRange: '7d' }, now),
    ).toHaveLength(1);
    expect(
      filterTransactions(txs, { ...base, dateRange: '30d' }, now),
    ).toHaveLength(2);
  });
});
