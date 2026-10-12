import { createSecureLogger } from '@/security/SecureLogger';

describe('SecureLogger', () => {
  const originalDebug = console.debug;

  beforeEach(() => {
    console.debug = jest.fn();
  });

  afterEach(() => {
    console.debug = originalDebug;
  });

  it('logs raw values in dev mode', () => {
    const logger = createSecureLogger({ devMode: true });
    logger.debug('txn', { refId: '123ABC', amount: 99.5, recipientName: 'Jane' });

    expect(console.debug).toHaveBeenCalledWith('txn', {
      refId: '123ABC',
      amount: 99.5,
      recipientName: 'Jane',
    });
  });

  it('redacts PII outside dev mode', () => {
    const logger = createSecureLogger({ devMode: false });
    logger.debug('txn', { refId: '123ABC', amount: 99.5, recipientName: 'Jane' });

    expect(console.debug).toHaveBeenCalledWith('txn', {
      refId: '[REDACTED_REF]',
      amount: '[REDACTED_AMOUNT]',
      recipientName: '[REDACTED_NAME]',
    });
  });

  it('redacts PII patterns in strings when not in dev mode', () => {
    const logger = createSecureLogger({ devMode: false });
    logger.debug('loaded 123ABC for RM 1,500.00');

    expect(console.debug).toHaveBeenCalledWith(
      'loaded [REDACTED_REF] for [REDACTED_AMOUNT]',
    );
  });
});
