import type { Transaction } from '@/models/Transaction';
import { promoteDueScheduledTransactions } from '../schedule';

const base: Transaction = {
  refId: 'S1',
  transferDate: '2024-10-01T00:00:00Z',
  recipientName: 'Jane',
  transferName: 'Scheduled send',
  amount: -100,
  category: 'transportation',
  status: 'scheduled',
  scheduledFor: '2024-10-05',
};

describe('promoteDueScheduledTransactions', () => {
  it('promotes scheduled txs on or before today (UTC)', () => {
    const now = new Date('2024-10-05T12:00:00.000Z');
    const [result] = promoteDueScheduledTransactions([base], now);
    expect(result?.status).toBe('completed');
    expect(result?.transferDate).toBe('2024-10-05');
  });

  it('leaves future scheduled txs unchanged', () => {
    const now = new Date('2024-10-04T12:00:00.000Z');
    const [result] = promoteDueScheduledTransactions([base], now);
    expect(result?.status).toBe('scheduled');
  });

  it('ignores completed txs', () => {
    const completed = { ...base, status: 'completed' as const };
    const [result] = promoteDueScheduledTransactions([completed]);
    expect(result?.status).toBe('completed');
  });
});
