import {
  getPaymentProcessingService,
  resetPaymentProcessingService,
  setPaymentProcessingService,
  TmpPaymentProcessingService,
  type PaymentProcessingService,
} from '../PaymentProcessingService';

describe('PaymentProcessingService', () => {
  afterEach(() => {
    resetPaymentProcessingService();
  });

  it('TMP adapter settles successfully without network', async () => {
    const tmp = new TmpPaymentProcessingService();
    await expect(tmp.settleIncomingRequest('pr-1')).resolves.toEqual({ ok: true });
  });

  it('allows injecting a custom processor', async () => {
    const custom: PaymentProcessingService = {
      settleIncomingRequest: jest.fn().mockResolvedValue({
        ok: false,
        reason: 'DECLINED',
      }),
    };
    setPaymentProcessingService(custom);
    const result = await getPaymentProcessingService().settleIncomingRequest('pr-2');
    expect(result).toEqual({ ok: false, reason: 'DECLINED' });
    expect(custom.settleIncomingRequest).toHaveBeenCalledWith('pr-2');
  });
});
