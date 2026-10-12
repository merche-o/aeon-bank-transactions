export interface Transaction {
  refId: string;
  transferDate: string;
  recipientName: string;
  transferName: string;
  amount: number;
}

export type FlowType = 'incoming' | 'outgoing';

export type TypeFilter = 'all' | 'incoming' | 'outgoing';

export type DateRangeFilter = 'all' | '7d' | '30d';

export interface FilterCriteria {
  query: string;
  type: TypeFilter;
  dateRange: DateRangeFilter;
}

export type Locale = 'en' | 'bm';

export type ThemeMode = 'light' | 'dark' | 'system';
