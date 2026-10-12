import type {
  NewPaymentRequestInput,
  PaymentRequest,
} from '@/models/PaymentRequest';

export interface PaymentRequestRepository {
  list(): Promise<PaymentRequest[]>;
  add(input: NewPaymentRequestInput): Promise<PaymentRequest>;
  cancel(id: string): Promise<PaymentRequest>;
  fulfill(id: string): Promise<PaymentRequest>;
}
