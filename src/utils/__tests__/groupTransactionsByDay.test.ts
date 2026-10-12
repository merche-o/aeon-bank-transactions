import type { Transaction } from '@/models/Transaction';
import {
  formatDayKey,
  setDefaultTimeZoneForTests,
} from '@/utils/formatDate';
import { groupTransactionsByDay } from '@/utils/groupTransactionsByDay';

const KUALA_LUMPUR = 'Asia/Kuala_Lumpur';

function tx(
  refId: string,
  transferDate: string,
  overrides: Partial<Transaction> = {},
): Transaction {
  return {
    refId,
    transferDate,
    recipientName: 'Jane',
    transferName: 'Payment',
    amount: 100,
    category: 'transportation',
    status: 'completed',
    ...overrides,
  };
}

describe('groupTransactionsByDay', () => {
  afterEach(() => {
    setDefaultTimeZoneForTests(undefined);
  });

  it('returns empty array for no transactions', () => {
    expect(groupTransactionsByDay([])).toEqual([]);
  });

  it('groups transactions by calendar day in time zone', () => {
    const transactions = [
      tx('B', '2024-10-15T12:34:56Z'),
      tx('A', '2024-10-15T08:00:00Z'),
      tx('C', '2024-10-13T16:00:00Z'),
    ];

    const sections = groupTransactionsByDay(transactions, {
      timeZone: KUALA_LUMPUR,
      now: new Date('2024-10-20T12:00:00Z'),
    });

    expect(sections).toHaveLength(2);
    expect(sections[0].key).toBe('2024-10-15');
    expect(sections[0].data.map((item) => item.refId)).toEqual(['B', 'A']);
    expect(sections[1].key).toBe('2024-10-14');
    expect(sections[1].data.map((item) => item.refId)).toEqual(['C']);
  });

  it('places midnight UTC on the previous local day when appropriate', () => {
    const key = formatDayKey('2024-10-14T23:00:00Z', { timeZone: KUALA_LUMPUR });
    expect(key).toBe('2024-10-15');

    const sections = groupTransactionsByDay([tx('C', '2024-10-14T23:00:00Z')], {
      timeZone: KUALA_LUMPUR,
      now: new Date('2024-10-20T12:00:00Z'),
    });
    expect(sections[0].key).toBe('2024-10-15');
  });

  it('uses short label within the last 365 days', () => {
    const sections = groupTransactionsByDay([tx('A', '2024-10-15T12:00:00Z')], {
      timeZone: KUALA_LUMPUR,
      now: new Date('2025-06-01T12:00:00Z'),
    });
    expect(sections[0].title).toBe('15 Oct');
  });

  it('includes year in label when day is older than 365 days', () => {
    const sections = groupTransactionsByDay([tx('A', '2023-01-10T12:00:00Z')], {
      timeZone: KUALA_LUMPUR,
      now: new Date('2025-06-01T12:00:00Z'),
    });
    expect(sections[0].title).toBe('10 Jan 2023');
  });

  it('preserves latest-first order across sections', () => {
    const transactions = [
      tx('new', '2024-10-15T12:00:00Z'),
      tx('old', '2024-08-01T12:00:00Z'),
    ];
    const sections = groupTransactionsByDay(transactions, {
      timeZone: KUALA_LUMPUR,
      now: new Date('2024-10-20T12:00:00Z'),
    });
    expect(sections.map((s) => s.key)).toEqual(['2024-10-15', '2024-08-01']);
  });
});
