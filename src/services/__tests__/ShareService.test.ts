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
    const payload = shareMock.mock.calls[0]?.[0];
    expect(payload?.message).toContain('John Doe');
    expect(payload?.message).not.toMatch(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/);
  });

  it('strips control characters from title and message fields', async () => {
    const dirty: Transaction = {
      ...transaction,
      recipientName: `John\u0000Doe\u0007`,
      transferName: `Salary\u000BPayment`,
    };

    await shareTransaction(dirty, 'Share\u0000receipt\u001F', labels);

    const payload = shareMock.mock.calls[0]?.[0];
    expect(payload?.title).toBe('Sharereceipt');
    expect(payload?.message).not.toMatch(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/);
    expect(payload?.message).toContain('JohnDoe');
    expect(payload?.message).toContain('SalaryPayment');
  });

  it('truncates an oversized title to 120 characters', async () => {
    const longTitle = 'T'.repeat(200);
    await shareTransaction(transaction, longTitle, labels);

    const payload = shareMock.mock.calls[0]?.[0];
    expect(payload?.title?.length).toBe(120);
    expect(payload?.title?.endsWith('…')).toBe(true);
  });

  it('truncates an oversized message to 2000 characters', async () => {
    const hugeName = 'N'.repeat(3000);
    const huge: Transaction = {
      ...transaction,
      recipientName: hugeName,
      transferName: hugeName,
    };

    await shareTransaction(huge, 'Share', labels);

    const payload = shareMock.mock.calls[0]?.[0];
    expect(payload?.message?.length).toBe(2000);
    expect(payload?.message?.endsWith('…')).toBe(true);
  });
});
