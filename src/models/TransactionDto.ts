export interface TransactionDto {
  refId: string;
  transferDate: string;
  recipientName: string;
  transferName: string;
  amount: number;
}

export interface TransactionsResponse {
  data: TransactionDto[];
}
