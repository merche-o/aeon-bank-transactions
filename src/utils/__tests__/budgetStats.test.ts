import type { Transaction, TransactionCategory } from '../../models/Transaction';
import {
  aggregateCategorySpend,
  aggregateMonthTotals,
  aggregateMonthlySpend,
  aggregateTopRecipients,
  filterBudgetTransactions,
  periodOverPeriodChange,
  priorRangeOfEqualLength,
  projectMonthSpend,
  resolveBudgetRange,
  sumUpcomingScheduled,
  toMonthKey,
} from '../budgetStats';

const txs: Transaction[] = [
  {
    refId: '1',
    transferDate: '2024-09-15T12:00:00Z',
    recipientName: 'Employer',
    transferName: 'Salary',
    amount: 2000,
    category: 'salary',
    status: 'completed',
  },
  {
    refId: '2',
    transferDate: '2024-09-20T12:00:00Z',
    recipientName: 'Cafe',
    transferName: 'Lunch',
    amount: -40,
    category: 'food',
    status: 'completed',
  },
  {
    refId: '3',
    transferDate: '2024-10-05T12:00:00Z',
    recipientName: 'Utility',
    transferName: 'Bill',
    amount: -120,
    category: 'bills',
    status: 'completed',
  },
  {
    refId: '4',
    transferDate: '2024-10-10T12:00:00Z',
    recipientName: 'Shop',
    transferName: 'Misc',
    amount: -30,
    category: 'other',
    status: 'completed',
  },
  {
    refId: '5',
    transferDate: '2024-10-12T12:00:00Z',
    recipientName: 'Friend',
    transferName: 'Transfer out',
    amount: -50,
    category: 'transfer',
    status: 'completed',
  },
];

describe('toMonthKey', () => {
  it('returns YYYY-MM in UTC', () => {
    expect(toMonthKey('2024-10-05T12:00:00Z')).toBe('2024-10');
  });
});

describe('resolveBudgetRange', () => {
  const now = new Date('2024-10-15T12:00:00Z');

  it('resolves thisMonth', () => {
    const range = resolveBudgetRange('thisMonth', undefined, undefined, now);
    expect(range.start).toBe('2024-10-01T00:00:00.000Z');
    expect(range.end).toBe('2024-10-31T23:59:59.999Z');
    expect(range.monthKeys).toEqual(['2024-10']);
  });

  it('resolves lastMonth', () => {
    const range = resolveBudgetRange('lastMonth', undefined, undefined, now);
    expect(range.start).toBe('2024-09-01T00:00:00.000Z');
    expect(range.end).toBe('2024-09-30T23:59:59.999Z');
    expect(range.monthKeys).toEqual(['2024-09']);
  });

  it('resolves last3Months inclusive', () => {
    const range = resolveBudgetRange('last3Months', undefined, undefined, now);
    expect(range.monthKeys).toEqual(['2024-08', '2024-09', '2024-10']);
    expect(range.start).toBe('2024-08-01T00:00:00.000Z');
    expect(range.end).toBe('2024-10-31T23:59:59.999Z');
  });

  it('resolves last6Months inclusive', () => {
    const range = resolveBudgetRange('last6Months', undefined, undefined, now);
    expect(range.monthKeys).toHaveLength(6);
    expect(range.monthKeys[0]).toBe('2024-05');
    expect(range.monthKeys[5]).toBe('2024-10');
  });

  it('resolves custom range with padded month keys', () => {
    const range = resolveBudgetRange(
      'custom',
      '2024-09-15T00:00:00Z',
      '2024-11-02T00:00:00Z',
      now,
    );
    expect(range.monthKeys).toEqual(['2024-09', '2024-10', '2024-11']);
    expect(range.start).toBe('2024-09-01T00:00:00.000Z');
    expect(range.end).toBe('2024-11-30T23:59:59.999Z');
  });
});

describe('priorRangeOfEqualLength', () => {
  it('returns the prior period with the same number of months', () => {
    const current = resolveBudgetRange('last3Months', undefined, undefined, new Date('2024-10-15T12:00:00Z'));
    const prior = priorRangeOfEqualLength(current);
    expect(prior.monthKeys).toEqual(['2024-05', '2024-06', '2024-07']);
    expect(prior.start).toBe('2024-05-01T00:00:00.000Z');
    expect(prior.end).toBe('2024-07-31T23:59:59.999Z');
  });
});

describe('filterBudgetTransactions', () => {
  const range = resolveBudgetRange('last3Months', undefined, undefined, new Date('2024-10-15T12:00:00Z'));
  const allCategories = new Set<TransactionCategory>([
    'salary',
    'transfer',
    'food',
    'entertainment',
    'bills',
    'personal',
    'other',
  ]);

  it('includes completed and missing status, excludes scheduled', () => {
    const withScheduled: Transaction[] = [
      ...txs,
      {
        refId: 'sched',
        transferDate: '2024-10-20T12:00:00Z',
        recipientName: 'Future',
        transferName: 'Rent',
        amount: -500,
        category: 'bills',
        status: 'scheduled',
      },
      {
        refId: 'legacy',
        transferDate: '2024-10-08T12:00:00Z',
        recipientName: 'No status',
        transferName: 'Old',
        amount: -10,
        category: 'food',
      } as Transaction,
    ];
    const filtered = filterBudgetTransactions(withScheduled, {
      start: range.start,
      end: range.end,
      categories: allCategories,
    });
    expect(filtered.some((t) => t.refId === 'sched')).toBe(false);
    expect(filtered.some((t) => t.refId === 'legacy')).toBe(true);
  });

  it('filters by date range and category set', () => {
    const filtered = filterBudgetTransactions(txs, {
      start: '2024-10-01T00:00:00.000Z',
      end: '2024-10-31T23:59:59.999Z',
      categories: new Set<TransactionCategory>(['bills', 'food']),
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.refId).toBe('3');
  });
});

describe('aggregateMonthTotals', () => {
  it('sums income, expense, and net', () => {
    expect(aggregateMonthTotals(txs)).toEqual({
      income: 2000,
      expense: 240,
      net: 1760,
    });
  });
});

describe('periodOverPeriodChange', () => {
  it('returns na when prior expense is zero', () => {
    expect(periodOverPeriodChange(100, 0)).toEqual({ percent: null, direction: 'na' });
  });

  it('detects up, down, and flat', () => {
    expect(periodOverPeriodChange(150, 100)).toEqual({ percent: 50, direction: 'up' });
    expect(periodOverPeriodChange(80, 100)).toEqual({ percent: -20, direction: 'down' });
    expect(periodOverPeriodChange(100, 100)).toEqual({ percent: 0, direction: 'flat' });
  });
});

describe('aggregateMonthlySpend', () => {
  it('aggregates income and expenses per month (legacy monthCount)', () => {
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

  it('limits to the most recent months (legacy)', () => {
    const manyMonths: Transaction[] = [
      {
        refId: 'old',
        transferDate: '2024-01-01T00:00:00Z',
        recipientName: 'A',
        transferName: 'Old',
        amount: -10,
        category: 'food',
        status: 'completed',
      },
      ...txs,
    ];
    expect(aggregateMonthlySpend(manyMonths, 2)).toHaveLength(2);
    expect(aggregateMonthlySpend(manyMonths, 2)[0]?.monthKey).toBe('2024-09');
  });

  it('pads missing months when monthKeys array is provided', () => {
    const rows = aggregateMonthlySpend(txs, ['2024-08', '2024-09', '2024-10']);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({ monthKey: '2024-08', expenseTotal: 0, incomeTotal: 0 });
    expect(rows[1]).toMatchObject({ monthKey: '2024-09', expenseTotal: 40, incomeTotal: 2000 });
    expect(rows[2]?.label).toMatch(/Oct 2024/);
  });
});

describe('aggregateCategorySpend', () => {
  it('totals outgoing spend by category with percent of expense total', () => {
    const rows = aggregateCategorySpend(txs);
    expect(rows.map((r) => r.category)).toEqual(['bills', 'transfer', 'food', 'other']);
    expect(rows[0]?.total).toBe(120);
    const expenseTotal = 240;
    expect(rows[0]?.percent).toBeCloseTo((120 / expenseTotal) * 100);
    expect(rows[1]?.percent).toBeCloseTo((50 / expenseTotal) * 100);
    expect(rows[2]?.percent).toBeCloseTo((40 / expenseTotal) * 100);
    expect(rows[3]?.percent).toBeCloseTo((30 / expenseTotal) * 100);
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
        status: 'completed',
      },
    ];
    expect(aggregateCategorySpend(withSalaryDebit).some((r) => r.category === 'salary')).toBe(
      false,
    );
  });

  it('filters by month key when provided', () => {
    const rows = aggregateCategorySpend(txs, '2024-10');
    expect(rows.map((r) => r.category)).toEqual(['bills', 'transfer', 'other']);
    expect(rows[0]?.total).toBe(120);
  });

  it('returns zero percent when expense total is zero', () => {
    expect(aggregateCategorySpend([])).toEqual([]);
  });
});

describe('aggregateTopRecipients', () => {
  it('ranks outgoing spend by recipient', () => {
    const rows = aggregateTopRecipients(txs, 3);
    expect(rows.map((r) => r.recipientName)).toEqual(['Utility', 'Friend', 'Cafe']);
    expect(rows[0]?.total).toBe(120);
    const expenseTotal = 40 + 120 + 30 + 50;
    expect(rows[0]?.percent).toBeCloseTo((120 / expenseTotal) * 100);
  });
});

describe('projectMonthSpend', () => {
  it('projects month-end spend from pace', () => {
    const now = new Date('2024-10-15T12:00:00Z');
    const proj = projectMonthSpend(150, now);
    expect(proj).toEqual({
      dayOfMonth: 15,
      daysInMonth: 31,
      dailyAverage: 10,
      projectedMonthEnd: 310,
    });
  });
});

describe('sumUpcomingScheduled', () => {
  it('sums scheduled outgoing in range using scheduledFor or transferDate', () => {
    const scheduled: Transaction[] = [
      {
        refId: 's1',
        transferDate: '2024-10-01T12:00:00Z',
        scheduledFor: '2024-10-20T12:00:00Z',
        recipientName: 'Landlord',
        transferName: 'Rent',
        amount: -800,
        category: 'bills',
        status: 'scheduled',
      },
      {
        refId: 's2',
        transferDate: '2024-10-25T12:00:00Z',
        recipientName: 'Gym',
        transferName: 'Fee',
        amount: -50,
        category: 'personal',
        status: 'scheduled',
      },
      {
        refId: 'c1',
        transferDate: '2024-10-22T12:00:00Z',
        recipientName: 'Done',
        transferName: 'Paid',
        amount: -20,
        category: 'food',
        status: 'completed',
      },
    ];
    const summary = sumUpcomingScheduled(
      scheduled,
      '2024-10-01T00:00:00.000Z',
      '2024-10-31T23:59:59.999Z',
    );
    expect(summary).toEqual({ total: 850, count: 2 });
  });
});
