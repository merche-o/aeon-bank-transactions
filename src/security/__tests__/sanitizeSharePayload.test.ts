import type { Transaction } from '@/models/Transaction';
import {
  buildReceiptText,
  sanitizeSharePayload,
  sanitizeSharePayloadForTransaction,
} from '@/security/sanitizeSharePayload';

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

describe('sanitizeSharePayload', () => {
  it('strips control characters from title and message', () => {
    const result = sanitizeSharePayload({
      title: 'Share\u0000 title',
      message: 'Line1\u0007\nLine2',
    });

    expect(result.title).toBe('Share title');
    expect(result.message).toBe('Line1\nLine2');
  });

  it('truncates overly long message', () => {
    const longMessage = 'a'.repeat(2500);
    const result = sanitizeSharePayload({ title: 'T', message: longMessage });

    expect(result.message.length).toBeLessThanOrEqual(2000);
    expect(result.message.endsWith('…')).toBe(true);
  });

  it('buildReceiptText includes receipt fields', () => {
    const text = buildReceiptText(transaction, labels);
    expect(text).toContain('Reference ID: 123ABC');
    expect(text).toContain('John Doe');
    expect(text).toContain('Salary Payment');
  });

  it('sanitizeSharePayloadForTransaction returns sanitized receipt', () => {
    const result = sanitizeSharePayloadForTransaction(
      transaction,
      'Receipt',
      labels,
    );
    expect(result.title).toBe('Receipt');
    expect(result.message).toContain('Reference ID: 123ABC');
  });
});
