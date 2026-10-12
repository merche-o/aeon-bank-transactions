import type { Transaction } from '../models/Transaction';
import type { TransactionDto } from '../models/TransactionDto';
import {
  defaultCategoryForAmount,
  normalizeTransactionCategory,
} from '../utils/categories';

export function mapTransactionDto(dto: TransactionDto): Transaction {
  return {
    refId: dto.refId,
    transferDate: dto.transferDate,
    recipientName: dto.recipientName,
    transferName: dto.transferName,
    amount: dto.amount,
    category: dto.category
      ? normalizeTransactionCategory(dto.category)
      : defaultCategoryForAmount(dto.amount),
    status: 'completed',
    recipientId: dto.recipientId,
  };
}
