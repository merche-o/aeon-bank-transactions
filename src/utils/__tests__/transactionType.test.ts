import type { Transaction } from '../../models/Transaction';
import { getFlowType, isIncoming } from '../transactionType';

const incoming: Transaction = {
  refId: '1',
  transferDate: '2024-10-15T12:34:56Z',
  recipientName: 'A',
  transferName: 'In',
  amount: 10,
  category: 'salary',
};

const outgoing: Transaction = { ...incoming, amount: -10 };

describe('transactionType', () => {
  it('derives flow from amount sign', () => {
    expect(getFlowType(incoming)).toBe('incoming');
    expect(getFlowType(outgoing)).toBe('outgoing');
  });

  it('isIncoming', () => {
    expect(isIncoming(0)).toBe(true);
    expect(isIncoming(-1)).toBe(false);
  });
});
