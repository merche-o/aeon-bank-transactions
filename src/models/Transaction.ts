export const TRANSACTION_CATEGORIES = [
  'salary',
  'transfer',
  'food',
  'entertainment',
  'bills',
  'personal',
  'other',
] as const;

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

export function isTransactionCategory(value: string): value is TransactionCategory {
  return (TRANSACTION_CATEGORIES as readonly string[]).includes(value);
}

export type TransactionStatus = 'completed' | 'scheduled' | 'cancelled';

export interface Transaction {
  refId: string;
  transferDate: string;
  recipientName: string;
  transferName: string;
  amount: number;
  category: TransactionCategory;
  status: TransactionStatus;
  scheduledFor?: string;
  recipientId?: string;
}

export type FlowType = 'incoming' | 'outgoing';

export type TypeFilter = 'all' | 'incoming' | 'outgoing';

export type DateRangeFilter = 'all' | '7d' | '30d' | 'custom';

export type CategoryFilter = 'all' | TransactionCategory;

export interface FilterCriteria {
  query: string;
  type: TypeFilter;
  dateRange: DateRangeFilter;
  customStart?: string;
  customEnd?: string;
  category: CategoryFilter;
}

export type Locale = 'en' | 'bm';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface NewTransactionInput {
  transferDate: string;
  recipientName: string;
  transferName: string;
  amount: number;
  category: TransactionCategory;
  status?: TransactionStatus;
  scheduledFor?: string;
  recipientId?: string;
}
