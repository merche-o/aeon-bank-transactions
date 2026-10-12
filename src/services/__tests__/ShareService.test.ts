import { Share } from 'react-native';

import type { Transaction } from '@/models/Transaction';

import { shareTransaction } from '../ShareService';

const shareMock = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });

const transaction: Transaction = {
  refId: '123ABC',
  transferDate: '2024-10-15T12:34:56Z',
  recipientName: 'John Doe',
  transferName: 'Salary Payment',
  amount: 1500,
  category: 'salary',
    status: 'completed',
};

const labels = {
  reference: 'Reference ID',
  date: 'Date',
  recipient: 'Recipient',
  transferName: 'Transfer',
  amount: 'Amount',
};

describe('ShareService', () => {
  beforeEach(() => {
    shareMock.mockClear();
  });

  afterAll(() => {
    shareMock.mockRestore();
  });

  it('calls Share.share with a sanitized payload', async () => {
    await shareTransaction(transaction, 'Share receipt', labels);

    expect(shareMock).toHaveBeenCalledTimes(1);
    expect(shareMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Share receipt',
        message: expect.stringContaining('123ABC'),
      }),
    );
    const payload = shareMock.mock.calls[0][0];
    expect(payload.message).toContain('John Doe');
    expect(payload.message).not.toMatch(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/);
  });
});
