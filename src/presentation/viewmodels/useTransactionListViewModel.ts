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
import { groupTransactionsByDay } from '@/utils/groupTransactionsByDay';
import { avatarInitialFromName } from '@/utils/profile';

import type { PaymentStartMode } from './usePaymentStartViewModel';

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
  const firstName = usePreferencesStore((state) => state.firstName);

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

  const sections = useMemo(
    () => groupTransactionsByDay(filteredTransactions, { locale }),
    [filteredTransactions, locale],
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

  const openPaymentStart = useCallback(
    (mode?: PaymentStartMode) => {
      if (mode) {
        navigation.navigate('PaymentStart', { mode });
      } else {
        navigation.navigate('PaymentStart');
      }
    },
    [navigation],
  );

  const openProfile = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  const openDrawer = useCallback(() => {
    navigation.openDrawer();
  }, [navigation]);

  const greetingName =
    firstName.trim().length > 0 ? firstName.trim() : t('customer.default', locale);

  const greetingText = interpolate(t('list.hello', locale), { name: greetingName });
  const avatarInitial = avatarInitialFromName(
    firstName,
    t('customer.default', locale).charAt(0).toUpperCase() || 'C',
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
    sections,
    loading,
    isRefreshing,
    balance,
    balanceFormatted: formatCurrency(balance),
    greetingText,
    avatarInitial,
    error,
    refresh,
    openDetail,
    openPaymentStart,
    openProfile,
    openDrawer,
    showNoMatchingResults,
    showFullScreenError,
    isEmpty: !loading && error == null && storeTransactions.length === 0,
    typeFilterOptions,
    labels: {
      title: t('list.title', locale),
      searchPlaceholder: t('list.searchPlaceholder', locale),
      noMatchingResults: t('list.noMatchingResults', locale),
      loading: t('loading.transactions', locale),
      empty: t('empty.transactions', locale),
      error: t('error.loadFailed', locale),
      retry: t('retry.button', locale),
      balance: t('list.balance', locale),
      settings: t('common.settings', locale),
      transfer: t('pay.transfer', locale),
      request: t('pay.request', locale),
      fabOpen: t('fab.openActions', locale),
      fabClose: t('fab.closeActions', locale),
      filterType: t('filters.type', locale),
      filterCategory: t('filters.category', locale),
      categoryAll: t('filters.categoryAll', locale),
      dateTitle: t('filters.datePickerTitle', locale),
      dateAll: t('filters.dateAll', locale),
      lastWeek: t('filters.lastWeek', locale),
      lastMonth: t('filters.lastMonth', locale),
      dateCustom: t('filters.dateCustom', locale),
      apply: t('filters.apply', locale),
      dateSummaryAll: t('filters.dateAll', locale),
      dateSummary7d: t('filters.lastWeek', locale),
      dateSummary30d: t('filters.lastMonth', locale),
      dateSummaryCustom: t('filters.dateCustom', locale),
    },
  };
}
