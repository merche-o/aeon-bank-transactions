import type { FlowType, Transaction } from '../models/Transaction';

export function getFlowType(transaction: Transaction): FlowType {
  return transaction.amount >= 0 ? 'incoming' : 'outgoing';
}

export function isIncoming(amount: number): boolean {
  return amount >= 0;
}
