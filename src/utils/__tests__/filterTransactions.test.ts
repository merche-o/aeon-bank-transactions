import type { FilterCriteria, Transaction } from '../../models/Transaction';
import { filterTransactions } from '../filterTransactions';

const txs: Transaction[] = [
  {
    refId: '123ABC',
    transferDate: '2024-10-15T12:34:56Z',
    recipientName: 'John Doe',
    transferName: 'Salary Payment',
    amount: 1500,
    category: 'salary',
    status: 'completed',
  },
  {
    refId: '789GHI',
    transferDate: '2024-10-05T16:18:30Z',
    recipientName: 'Robert Brown',
    transferName: 'Refund',
    amount: -500,
    category: 'bills',
    status: 'completed',
  },
  {
    refId: '101JKL',
    transferDate: '2024-08-30T11:47:22Z',
    recipientName: 'Emily Davis',
    transferName: 'Bonus Payment',
    amount: 1200,
    category: 'salary',
    status: 'completed',
  },
];

const base: FilterCriteria = {
  query: '',
  type: 'all',
  dateRange: 'all',
  category: 'all',
};

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

  it('filters by category', () => {
    expect(filterTransactions(txs, { ...base, category: 'salary' })).toHaveLength(2);
    expect(filterTransactions(txs, { ...base, category: 'bills' })).toHaveLength(1);
    expect(filterTransactions(txs, { ...base, category: 'food' })).toHaveLength(0);
  });

  it('matches query against category', () => {
    expect(filterTransactions(txs, { ...base, query: 'bills' })).toHaveLength(1);
  });

  it('filters by custom date range', () => {
    const custom: FilterCriteria = {
      ...base,
      dateRange: 'custom',
      customStart: '2024-10-01T00:00:00Z',
      customEnd: '2024-10-31T23:59:59Z',
    };
    expect(filterTransactions(txs, custom)).toHaveLength(2);

    const startOnly: FilterCriteria = {
      ...base,
      dateRange: 'custom',
      customStart: '2024-10-10T00:00:00Z',
    };
    expect(filterTransactions(txs, startOnly)).toHaveLength(1);
  });
});
