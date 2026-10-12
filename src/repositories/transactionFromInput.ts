import type { NewTransactionInput, Transaction } from '@/models/Transaction';

export function transactionFromInput(
  refId: string,
  input: NewTransactionInput,
): Transaction {
  return {
    refId,
    transferDate: input.transferDate,
    recipientName: input.recipientName,
    transferName: input.transferName,
    amount: input.amount,
    category: input.category,
    status: input.status ?? 'completed',
    scheduledFor: input.scheduledFor,
    recipientId: input.recipientId,
    paymentRequestId: input.paymentRequestId,
  };
}
