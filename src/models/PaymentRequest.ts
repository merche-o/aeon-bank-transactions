import type { TransactionCategory } from './Transaction';

export type PaymentRequestStatus = 'pending' | 'paid' | 'cancelled';

export interface PaymentRequest {
  id: string;
  recipientId: string;
  amount: number;
  note?: string;
  transferName?: string;
  category?: TransactionCategory;
  status: PaymentRequestStatus;
  createdAt: string;
}

export interface NewPaymentRequestInput {
  recipientId: string;
  amount: number;
  note?: string;
  transferName?: string;
  category?: TransactionCategory;
}
