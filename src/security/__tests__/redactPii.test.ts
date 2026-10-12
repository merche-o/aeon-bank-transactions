import { redactPiiInString, redactPiiValue } from '@/security/redactPii';

describe('redactPiiInString', () => {
  it('redacts ref ids, emails, and amounts', () => {
    expect(redactPiiInString('ref 123ABC email a@b.com RM 1,500.00')).toBe(
      'ref [REDACTED_REF] email [REDACTED_EMAIL] [REDACTED_AMOUNT]',
    );
  });
});

describe('redactPiiValue', () => {
  it('redacts denylist keys on flat objects', () => {
    expect(
      redactPiiValue({
        refId: '123ABC',
        amount: 99.5,
        recipientName: 'Jane',
        firstName: 'Ada',
        lastName: 'Lovelace',
        dateOfBirth: '1815-12-10',
        accountHint: '****1234',
        transferName: 'Salary',
        displayName: 'Ada L',
        email: 'ada@example.com',
        phone: '+60123456789',
        status: 'completed',
      }),
    ).toEqual({
      refId: '[REDACTED_REF]',
      amount: '[REDACTED_AMOUNT]',
      recipientName: '[REDACTED_NAME]',
      firstName: '[REDACTED_NAME]',
      lastName: '[REDACTED_NAME]',
      dateOfBirth: '[REDACTED_DOB]',
      accountHint: '[REDACTED_ACCOUNT]',
      transferName: '[REDACTED_NAME]',
      displayName: '[REDACTED_NAME]',
      email: '[REDACTED_EMAIL]',
      phone: '[REDACTED_PHONE]',
      status: 'completed',
    });
  });

  it('redacts snake_case denylist keys', () => {
    expect(
      redactPiiValue({
        ref_id: '123ABC',
        recipient_name: 'Jane',
        first_name: 'Ada',
        last_name: 'Lovelace',
        date_of_birth: '1815-12-10',
        account_hint: '****1234',
        transfer_name: 'Salary',
        display_name: 'Ada L',
      }),
    ).toEqual({
      ref_id: '[REDACTED_REF]',
      recipient_name: '[REDACTED_NAME]',
      first_name: '[REDACTED_NAME]',
      last_name: '[REDACTED_NAME]',
      date_of_birth: '[REDACTED_DOB]',
      account_hint: '[REDACTED_ACCOUNT]',
      transfer_name: '[REDACTED_NAME]',
      display_name: '[REDACTED_NAME]',
    });
  });

  it('redacts nested objects and arrays without dropping structure', () => {
    expect(
      redactPiiValue({
        meta: { ok: true },
        profile: {
          firstName: 'Ada',
          nested: { accountHint: '****9999', note: 'safe' },
        },
        items: [{ transferName: 'Pay', amount: 10.5 }, { status: 'ok' }],
      }),
    ).toEqual({
      meta: { ok: true },
      profile: {
        firstName: '[REDACTED_NAME]',
        nested: { accountHint: '[REDACTED_ACCOUNT]', note: 'safe' },
      },
      items: [
        { transferName: '[REDACTED_NAME]', amount: '[REDACTED_AMOUNT]' },
        { status: 'ok' },
      ],
    });
  });
});
