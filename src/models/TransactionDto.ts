import type { TransactionCategory } from './Transaction';

export interface TransactionDto {
  refId: string;
  transferDate: string;
  recipientName: string;
  transferName: string;
  amount: number;
  category?: TransactionCategory;
  recipientId?: string;
}

export interface TransactionsResponse {
  data: TransactionDto[];
}
