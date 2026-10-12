import type {
  NewPaymentRequestInput,
  PaymentRequest,
} from '@/models/PaymentRequest';

import type { PaymentRequestRepository } from './PaymentRequestRepository';

export class MockPaymentRequestRepository implements PaymentRequestRepository {
  private items: PaymentRequest[] = [];

  constructor(private readonly delayMs: number = 400) {}

  private async wait(): Promise<void> {
    if (this.delayMs <= 0) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, this.delayMs));
  }

  async list(): Promise<PaymentRequest[]> {
    await this.wait();
    return [...this.items];
  }

  async add(input: NewPaymentRequestInput): Promise<PaymentRequest> {
    await this.wait();
    const created: PaymentRequest = {
      id: `PR${Date.now().toString(36).toUpperCase()}`,
      recipientId: input.recipientId,
      amount: input.amount,
      note: input.note,
      transferName: input.transferName,
      category: input.category ?? 'unknown',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.items = [created, ...this.items];
    return created;
  }

  async cancel(id: string): Promise<PaymentRequest> {
    await this.wait();
    const index = this.items.findIndex((item) => item.id === id);
    if (index < 0) {
      throw new Error('PAYMENT_REQUEST_NOT_FOUND');
    }
    const current = this.items[index];
    if (current.status !== 'pending') {
      throw new Error('PAYMENT_REQUEST_NOT_CANCELLABLE');
    }
    const updated: PaymentRequest = { ...current, status: 'cancelled' };
    this.items = this.items.map((item) => (item.id === id ? updated : item));
    return updated;
  }

  async fulfill(id: string): Promise<PaymentRequest> {
    await this.wait();
    const index = this.items.findIndex((item) => item.id === id);
    if (index < 0) {
      throw new Error('PAYMENT_REQUEST_NOT_FOUND');
    }
    const current = this.items[index];
    if (current.status !== 'pending') {
      throw new Error('PAYMENT_REQUEST_NOT_FULFILLABLE');
    }
    const updated: PaymentRequest = { ...current, status: 'paid' };
    this.items = this.items.map((item) => (item.id === id ? updated : item));
    return updated;
  }
}
