/**
 * Port for payment settlement / transfer initiation.
 *
 * The default {@link TmpPaymentProcessingService} is assessment-only simulation —
 * it performs no network I/O and does not talk to a real PSP or bank rail.
 * Swap in an HTTP adapter at bootstrap when integrating real payment processing.
 */

export type SettlementResult =
  | { ok: true }
  | { ok: false; reason: string };

export interface PaymentProcessingService {
  /**
   * Settle an inbound payment request (payer paid).
   * Real implementations would call a PSP/bank API or confirm a webhook.
   */
  settleIncomingRequest(paymentRequestId: string): Promise<SettlementResult>;
}

/**
 * Temporary mock processor for this assessment exercise.
 * Immediately succeeds so local Mark paid / auto-demo flows can complete.
 */
export class TmpPaymentProcessingService implements PaymentProcessingService {
  async settleIncomingRequest(_paymentRequestId: string): Promise<SettlementResult> {
    return { ok: true };
  }
}

let paymentProcessingService: PaymentProcessingService =
  new TmpPaymentProcessingService();

export function setPaymentProcessingService(
  service: PaymentProcessingService,
): void {
  paymentProcessingService = service;
}

export function resetPaymentProcessingService(): void {
  paymentProcessingService = new TmpPaymentProcessingService();
}

export function getPaymentProcessingService(): PaymentProcessingService {
  return paymentProcessingService;
}
