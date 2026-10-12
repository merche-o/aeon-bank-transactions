import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useDebounce } from '@/hooks/useDebounce';
import { t } from '@/i18n';
import type {
  CategoryFilter,
  DateRangeFilter,
  FilterCriteria,
  TypeFilter,
} from '@/models/Transaction';
import type { TransactionListNavigationProp } from '@/navigation/types';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useTransactionStore } from '@/store/transactionStore';
import { formatCurrency } from '@/utils/formatCurrency';
import { filterTransactions } from '@/utils/filterTransactions';
const DEFAULT_CRITERIA: FilterCriteria = {
  query: '',
  type: 'all',
  dateRange: 'all',
  category: 'all',
};

function interpolate(template: string, params: Record<string, string>): string {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`{${key}}`, value),
    template,
  );
}

export function useTransactionListViewModel() {
  const navigation = useNavigation<TransactionListNavigationProp>();
  const locale = usePreferencesStore((state) => state.locale);
  const displayName = usePreferencesStore((state) => state.displayName);

  const storeTransactions = useTransactionStore((state) => state.transactions);
  const loading = useTransactionStore((state) => state.loading);
  const isRefreshing = useTransactionStore((state) => state.isRefreshing);
  const balance = useTransactionStore((state) => state.balance);
  const error = useTransactionStore((state) => state.error);
  const fetch = useTransactionStore((state) => state.fetch);
  const refresh = useTransactionStore((state) => state.refresh);

  const [query, setQuery] = useState(DEFAULT_CRITERIA.query);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(DEFAULT_CRITERIA.type);
  const [dateRange, setDateRange] = useState<DateRangeFilter>(DEFAULT_CRITERIA.dateRange);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(DEFAULT_CRITERIA.category);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const criteria = useMemo(
    (): FilterCriteria => ({
      query: debouncedQuery,
      type: typeFilter,
      dateRange,
      category: categoryFilter,
      customStart: dateRange === 'custom' ? customStart || undefined : undefined,
      customEnd: dateRange === 'custom' ? customEnd || undefined : undefined,
    }),
    [debouncedQuery, typeFilter, dateRange, categoryFilter, customStart, customEnd],
  );

  const filteredTransactions = useMemo(
    () => filterTransactions(storeTransactions, criteria),
    [storeTransactions, criteria],
  );

  const hasActiveFilters =
    debouncedQuery.trim().length > 0 ||
    typeFilter !== 'all' ||
    dateRange !== 'all' ||
    categoryFilter !== 'all';

  const showNoMatchingResults =
    !loading &&
    error == null &&
    storeTransactions.length > 0 &&
    filteredTransactions.length === 0 &&
    hasActiveFilters;

  const showFullScreenError =
    error != null && storeTransactions.length === 0 && !loading;

  const openDetail = useCallback(
    (refId: string) => {
      navigation.navigate('TransactionDetail', { refId });
    },
    [navigation],
  );

  const openAddTransaction = useCallback(() => {
    navigation.navigate('AddTransaction');
  }, [navigation]);

  const openProfile = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  const openDrawer = useCallback(() => {
    navigation.openDrawer();
  }, [navigation]);

  const greetingName =
    displayName.trim().length > 0 ? displayName.trim() : t('customer.default', locale);

  const greetingText = interpolate(t('list.hello', locale), { name: greetingName });

  const typeFilterOptions = useMemo(
    () =>
      [
        { value: 'all' as const, label: t('filters.typeAll', locale), testID: 'filter-type-all' },
        {
          value: 'incoming' as const,
          label: t('filters.incoming', locale),
          testID: 'filter-type-incoming',
        },
        {
          value: 'outgoing' as const,
          label: t('filters.outgoing', locale),
          testID: 'filter-type-outgoing',
        },
      ] as const,
    [locale],
  );

  const dateFilterOptions = useMemo(
    () =>
      [
        { value: 'all' as const, label: t('filters.dateAll', locale), testID: 'filter-date-all' },
        { value: '7d' as const, label: t('filters.date7d', locale), testID: 'filter-date-7d' },
        {
          value: '30d' as const,
          label: t('filters.date30d', locale),
          testID: 'filter-date-30d',
        },
        {
          value: 'custom' as const,
          label: t('filters.dateCustom', locale),
          testID: 'filter-date-custom',
        },
      ] as const,
    [locale],
  );

  return {
    locale,
    query,
    setQuery,
    typeFilter,
    setTypeFilter,
    dateRange,
    setDateRange,
    categoryFilter,
    setCategoryFilter,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    transactions: filteredTransactions,
    loading,
    isRefreshing,
    balance,
    balanceFormatted: formatCurrency(balance),
    greetingText,
    error,
    refresh,
    openDetail,
    openAddTransaction,
    openProfile,
    openDrawer,
    showNoMatchingResults,
    showFullScreenError,
    isEmpty: !loading && error == null && storeTransactions.length === 0,
    typeFilterOptions,
    dateFilterOptions,
    labels: {
      title: t('list.title', locale),
      searchPlaceholder: t('list.searchPlaceholder', locale),
      noMatchingResults: t('list.noMatchingResults', locale),
      loading: t('loading.transactions', locale),
      empty: t('empty.transactions', locale),
      error: t('error.loadFailed', locale),
      retry: t('retry.button', locale),
      balance: t('list.balance', locale),
      refresh: t('list.refresh', locale),
      add: t('list.add', locale),
    },
  };
}
