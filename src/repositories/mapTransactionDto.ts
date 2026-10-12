import type { Transaction } from '../models/Transaction';
import type { TransactionDto } from '../models/TransactionDto';
import { defaultCategoryForAmount } from '../utils/categories';

export function mapTransactionDto(dto: TransactionDto): Transaction {
  return {
    refId: dto.refId,
    transferDate: dto.transferDate,
    recipientName: dto.recipientName,
    transferName: dto.transferName,
    amount: dto.amount,
    category: dto.category ?? defaultCategoryForAmount(dto.amount),
  };
}
