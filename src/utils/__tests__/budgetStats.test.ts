import type { Transaction } from '../../models/Transaction';
import {
  aggregateCategorySpend,
  aggregateMonthlySpend,
} from '../budgetStats';

const txs: Transaction[] = [
  {
    refId: '1',
    transferDate: '2024-09-15T12:00:00Z',
    recipientName: 'Employer',
    transferName: 'Salary',
    amount: 2000,
    category: 'salary',
  },
  {
    refId: '2',
    transferDate: '2024-09-20T12:00:00Z',
    recipientName: 'Cafe',
    transferName: 'Lunch',
    amount: -40,
    category: 'food',
  },
  {
    refId: '3',
    transferDate: '2024-10-05T12:00:00Z',
    recipientName: 'Utility',
    transferName: 'Bill',
    amount: -120,
    category: 'bills',
  },
  {
    refId: '4',
    transferDate: '2024-10-10T12:00:00Z',
    recipientName: 'Shop',
    transferName: 'Misc',
    amount: -30,
    category: 'other',
  },
  {
    refId: '5',
    transferDate: '2024-10-12T12:00:00Z',
    recipientName: 'Friend',
    transferName: 'Transfer out',
    amount: -50,
    category: 'transfer',
  },
];

describe('aggregateMonthlySpend', () => {
  it('aggregates income and expenses per month', () => {
    const rows = aggregateMonthlySpend(txs, 6);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      monthKey: '2024-09',
      expenseTotal: 40,
      incomeTotal: 2000,
    });
    expect(rows[1]).toMatchObject({
      monthKey: '2024-10',
      expenseTotal: 200,
      incomeTotal: 0,
    });
  });

  it('limits to the most recent months', () => {
    const manyMonths: Transaction[] = [
      {
        refId: 'old',
        transferDate: '2024-01-01T00:00:00Z',
        recipientName: 'A',
        transferName: 'Old',
        amount: -10,
        category: 'food',
      },
      ...txs,
    ];
    expect(aggregateMonthlySpend(manyMonths, 2)).toHaveLength(2);
    expect(aggregateMonthlySpend(manyMonths, 2)[0]?.monthKey).toBe('2024-09');
  });
});

describe('aggregateCategorySpend', () => {
  it('totals outgoing spend by category, newest first', () => {
    const rows = aggregateCategorySpend(txs);
    expect(rows).toEqual([
      { category: 'bills', total: 120 },
      { category: 'transfer', total: 50 },
      { category: 'food', total: 40 },
      { category: 'other', total: 30 },
    ]);
  });

  it('ignores income and non-expense categories except other and transfer', () => {
    const withSalaryDebit: Transaction[] = [
      ...txs,
      {
        refId: '6',
        transferDate: '2024-10-11T12:00:00Z',
        recipientName: 'X',
        transferName: 'Weird',
        amount: -999,
        category: 'salary',
      },
    ];
    expect(aggregateCategorySpend(withSalaryDebit).some((r) => r.category === 'salary')).toBe(
      false,
    );
  });

  it('filters by month key when provided', () => {
    const rows = aggregateCategorySpend(txs, '2024-10');
    expect(rows).toEqual([
      { category: 'bills', total: 120 },
      { category: 'transfer', total: 50 },
      { category: 'other', total: 30 },
    ]);
  });
});
