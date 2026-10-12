import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useDebounce } from '@/hooks/useDebounce';
import { t } from '@/i18n';
import type { DateRangeFilter, FilterCriteria, TypeFilter } from '@/models/Transaction';
import type { RootNavigationProp } from '@/navigation/types';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useTransactionStore } from '@/store/transactionStore';
import { filterTransactions } from '@/utils/filterTransactions';

const DEFAULT_CRITERIA: FilterCriteria = {
  query: '',
  type: 'all',
  dateRange: 'all',
};

export function useTransactionListViewModel() {
  const navigation = useNavigation<RootNavigationProp>();
  const locale = usePreferencesStore((state) => state.locale);

  const storeTransactions = useTransactionStore((state) => state.transactions);
  const loading = useTransactionStore((state) => state.loading);
  const error = useTransactionStore((state) => state.error);
  const fetch = useTransactionStore((state) => state.fetch);
  const refresh = useTransactionStore((state) => state.refresh);

  const [query, setQuery] = useState(DEFAULT_CRITERIA.query);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(DEFAULT_CRITERIA.type);
  const [dateRange, setDateRange] = useState<DateRangeFilter>(DEFAULT_CRITERIA.dateRange);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const criteria = useMemo(
    (): FilterCriteria => ({
      query: debouncedQuery,
      type: typeFilter,
      dateRange,
    }),
    [debouncedQuery, typeFilter, dateRange],
  );

  const filteredTransactions = useMemo(
    () => filterTransactions(storeTransactions, criteria),
    [storeTransactions, criteria],
  );

  const hasActiveFilters =
    debouncedQuery.trim().length > 0 ||
    typeFilter !== 'all' ||
    dateRange !== 'all';

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
    transactions: filteredTransactions,
    loading,
    error,
    refresh,
    openDetail,
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
    },
  };
}
