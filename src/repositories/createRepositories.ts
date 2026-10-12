import {
  setPaymentRequestRepository,
} from '@/store/paymentRequestStore';
import { setRecipientRepository } from '@/store/recipientStore';
import { setTransactionRepository } from '@/store/transactionStore';

import { MockPaymentRequestRepository } from './MockPaymentRequestRepository';
import { MockRecipientRepository } from './MockRecipientRepository';
import { MockTransactionRepository } from './MockTransactionRepository';
import type { PaymentRequestRepository } from './PaymentRequestRepository';
import type { RecipientRepository } from './RecipientRepository';
import type { TransactionRepository } from './TransactionRepository';

export interface AppRepositories {
  transactions: TransactionRepository;
  recipients: RecipientRepository;
  paymentRequests: PaymentRequestRepository;
}

export function createMockRepositories(delayMs: number = 400): AppRepositories {
  return {
    transactions: new MockTransactionRepository(delayMs),
    recipients: new MockRecipientRepository(delayMs),
    paymentRequests: new MockPaymentRequestRepository(delayMs),
  };
}

export async function createNativeRepositories(): Promise<AppRepositories> {
  const [
    { SqliteTransactionRepository },
    { SqliteRecipientRepository },
    { SqlitePaymentRequestRepository },
  ] = await Promise.all([
    import('./SqliteTransactionRepository'),
    import('./SqliteRecipientRepository'),
    import('./SqlitePaymentRequestRepository'),
  ]);

  return {
    transactions: new SqliteTransactionRepository(),
    recipients: new SqliteRecipientRepository(),
    paymentRequests: new SqlitePaymentRequestRepository(),
  };
}

export function wireRepositories(repositories: AppRepositories): void {
  setTransactionRepository(repositories.transactions);
  setRecipientRepository(repositories.recipients);
  setPaymentRequestRepository(repositories.paymentRequests);
}
