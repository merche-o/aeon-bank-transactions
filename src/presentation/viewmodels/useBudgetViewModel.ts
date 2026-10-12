import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { useCallback, useMemo, useState } from 'react';

import { t } from '@/i18n';
import {
  TRANSACTION_CATEGORIES,
  type CategoryFilter,
  type TransactionCategory,
} from '@/models/Transaction';
import type { DrawerParamList } from '@/navigation/types';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useTransactionStore } from '@/store/transactionStore';
import {
  aggregateCategorySpend,
  aggregateMonthTotals,
  aggregateMonthlySpend,
  aggregateTopCounterparties,
  filterBudgetTransactions,
  periodOverPeriodChange,
  priorRangeOfEqualLength,
  projectMonthSpend,
  resolveBudgetRange,
  sumUpcomingScheduled,
  toMonthKey,
  type BudgetPeriodPreset,
  type BudgetRange,
} from '@/utils/budgetStats';
import { getCategoryLabel } from '@/utils/categories';
import { formatCurrency } from '@/utils/formatCurrency';

function categoriesForFilter(filter: CategoryFilter): TransactionCategory[] {
  if (filter === 'all') {
    return [...TRANSACTION_CATEGORIES];
  }
  return [filter];
}

function formatPercentLabel(percent: number, locale: Parameters<typeof t>[1]): string {
  const suffix = t('budget.percentSuffix', locale);
  return `${Math.round(percent)}${suffix}`;
}

function buildVsPriorLabel(
  direction: ReturnType<typeof periodOverPeriodChange>['direction'],
  percent: number | null,
  locale: Parameters<typeof t>[1],
): string {
  switch (direction) {
    case 'na':
      return t('budget.vsPriorNA', locale);
    case 'flat':
      return t('budget.vsPriorSame', locale);
    case 'up': {
      const pct = percent !== null ? Math.abs(Math.round(percent)) : 0;
      const suffix = t('budget.percentSuffix', locale);
      return `${pct}${suffix} ${t('budget.vsPriorHigher', locale)}`;
    }
    case 'down': {
      const pct = percent !== null ? Math.abs(Math.round(percent)) : 0;
      const suffix = t('budget.percentSuffix', locale);
      return `${pct}${suffix} ${t('budget.vsPriorLower', locale)}`;
    }
    default: {
      const _exhaustive: never = direction;
      return String(_exhaustive);
    }
  }
}

function tryResolveRange(
  period: BudgetPeriodPreset,
  customStart: string,
  customEnd: string,
): BudgetRange | null {
  if (period === 'custom' && (!customStart || !customEnd)) {
    return null;
  }
  try {
    return resolveBudgetRange(period, customStart || undefined, customEnd || undefined);
  } catch {
    return null;
  }
}

function periodSummaryLabel(
  period: BudgetPeriodPreset,
  locale: Parameters<typeof t>[1],
): string {
  switch (period) {
    case 'thisMonth':
      return t('budget.periodThisMonth', locale);
    case 'lastMonth':
      return t('budget.periodLastMonth', locale);
    case 'last3Months':
      return t('budget.periodLast3Months', locale);
    case 'last6Months':
      return t('budget.periodLast6Months', locale);
    case 'custom':
      return t('budget.periodCustom', locale);
    default: {
      const _exhaustive: never = period;
      return String(_exhaustive);
    }
  }
}

export function useBudgetViewModel() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const locale = usePreferencesStore((state) => state.locale);
  const transactions = useTransactionStore((state) => state.transactions);
  const loading = useTransactionStore((state) => state.loading);
  const balance = useTransactionStore((state) => state.balance);

  const [period, setPeriod] = useState<BudgetPeriodPreset>('thisMonth');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const selectedCategories = useMemo(
    () => categoriesForFilter(categoryFilter),
    [categoryFilter],
  );

  const range = useMemo(
    () => tryResolveRange(period, customStart, customEnd),
    [period, customStart, customEnd],
  );

  const filtered = useMemo(() => {
    if (!range) {
      return [];
    }
    return filterBudgetTransactions(transactions, {
      start: range.start,
      end: range.end,
      categories: selectedCategories,
    });
  }, [transactions, range, selectedCategories]);

  const priorFiltered = useMemo(() => {
    if (!range) {
      return [];
    }
    const priorRange = priorRangeOfEqualLength(range);
    return filterBudgetTransactions(transactions, {
      start: priorRange.start,
      end: priorRange.end,
      categories: selectedCategories,
    });
  }, [transactions, range, selectedCategories]);

  const totals = useMemo(() => aggregateMonthTotals(filtered), [filtered]);
  const priorTotals = useMemo(() => aggregateMonthTotals(priorFiltered), [priorFiltered]);

  const expenseChange = useMemo(
    () => periodOverPeriodChange(totals.expense, priorTotals.expense),
    [totals.expense, priorTotals.expense],
  );

  const vsPriorLabel = useMemo(
    () => buildVsPriorLabel(expenseChange.direction, expenseChange.percent, locale),
    [expenseChange, locale],
  );

  const monthlyBars = useMemo(() => {
    if (!range) {
      return [];
    }
    return aggregateMonthlySpend(filtered, range.monthKeys).map((month) => ({
      monthKey: month.monthKey,
      label: month.label,
      incomeTotal: month.incomeTotal,
      expenseTotal: month.expenseTotal,
      incomeFormatted: formatCurrency(month.incomeTotal),
      expenseFormatted: formatCurrency(-month.expenseTotal),
    }));
  }, [filtered, range]);

  const categoryRows = useMemo(() => {
    return aggregateCategorySpend(filtered).map((row) => {
      const percent = Math.round(row.percent);
      return {
        category: row.category,
        label: getCategoryLabel(row.category, locale),
        total: row.total,
        percent,
        formatted: formatCurrency(-row.total),
        percentLabel: formatPercentLabel(row.percent, locale),
      };
    });
  }, [filtered, locale]);

  const categorySpendTotalFormatted = useMemo(() => {
    const total = categoryRows.reduce((sum, row) => sum + row.total, 0);
    return formatCurrency(-total);
  }, [categoryRows]);

  const topSpendingRows = useMemo(() => {
    return aggregateTopCounterparties(filtered, 5, 'out').map((row) => ({
      recipientName: row.recipientName,
      formatted: formatCurrency(-row.total),
      percentLabel: formatPercentLabel(row.percent, locale),
    }));
  }, [filtered, locale]);

  const topEarningRows = useMemo(() => {
    return aggregateTopCounterparties(filtered, 5, 'in').map((row) => ({
      recipientName: row.recipientName,
      formatted: formatCurrency(row.total),
      percentLabel: formatPercentLabel(row.percent, locale),
    }));
  }, [filtered, locale]);

  const currentMonthKey = useMemo(() => toMonthKey(new Date().toISOString()), []);

  const outlookVisible = useMemo(() => {
    if (!range) {
      return false;
    }
    return range.monthKeys.includes(currentMonthKey);
  }, [range, currentMonthKey]);

  const outlook = useMemo(() => {
    if (!outlookVisible || !range) {
      return {
        dailyAverageFormatted: undefined as string | undefined,
        projectedFormatted: undefined as string | undefined,
        upcomingFormatted: undefined as string | undefined,
        upcomingCount: undefined as number | undefined,
      };
    }

    const currentMonthTxs = filtered.filter((tx) => toMonthKey(tx.transferDate) === currentMonthKey);
    const currentExpense = aggregateMonthTotals(currentMonthTxs).expense;
    const projection = projectMonthSpend(currentExpense);

    const categoryScoped = transactions.filter((tx) => selectedCategories.includes(tx.category));
    const upcoming = sumUpcomingScheduled(categoryScoped, range.start, range.end);

    return {
      dailyAverageFormatted: formatCurrency(-projection.dailyAverage),
      projectedFormatted: formatCurrency(-projection.projectedMonthEnd),
      upcomingFormatted: formatCurrency(-upcoming.total),
      upcomingCount: upcoming.count,
    };
  }, [
    outlookVisible,
    range,
    filtered,
    currentMonthKey,
    transactions,
    selectedCategories,
  ]);

  const openDrawer = useCallback(() => {
    navigation.openDrawer();
  }, [navigation]);

  const isEmpty = !loading && transactions.length === 0;
  const noMatching = !loading && !isEmpty && (filtered.length === 0 || range === null);

  const thisPeriodLabel = useMemo(
    () => periodSummaryLabel(period, locale),
    [period, locale],
  );

  const labels = useMemo(
    () => ({
      title: t('budget.title', locale),
      balance: t('list.balance', locale),
      settings: t('common.settings', locale),
      loading: t('budget.loading', locale),
      empty: t('budget.empty', locale),
      noMatching: t('budget.noMatching', locale),
      hero: {
        thisPeriod: thisPeriodLabel,
        income: t('budget.income', locale),
        expenses: t('budget.expenses', locale),
        net: t('budget.net', locale),
      },
      chart: {
        title: t('budget.byMonth', locale),
        income: t('budget.income', locale),
        expenses: t('budget.expenses', locale),
      },
      category: {
        title: t('budget.byCategory', locale),
        empty: t('budget.emptyPlaceholder', locale),
        totalCaption: t('budget.totalSpend', locale),
      },
      topFlows: {
        spendingTitle: t('budget.topSpending', locale),
        earningTitle: t('budget.topEarning', locale),
        empty: t('budget.emptyPlaceholder', locale),
      },
      outlook: {
        title: t('budget.outlook', locale),
        dailyAverage: t('budget.dailyAverage', locale),
        projected: t('budget.projected', locale),
        upcoming: t('budget.upcoming', locale),
      },
      controls: {
        category: t('filters.category', locale),
        categoryAll: t('filters.categoryAll', locale),
        dateTitle: t('filters.datePickerTitle', locale),
        thisMonth: t('budget.periodThisMonth', locale),
        lastMonth: t('budget.periodLastMonth', locale),
        last3Months: t('budget.periodLast3Months', locale),
        last6Months: t('budget.periodLast6Months', locale),
        custom: t('budget.periodCustom', locale),
        apply: t('filters.apply', locale),
        dateSummaryThisMonth: t('budget.periodThisMonth', locale),
        dateSummaryLastMonth: t('budget.periodLastMonth', locale),
        dateSummaryLast3Months: t('budget.periodLast3Months', locale),
        dateSummaryLast6Months: t('budget.periodLast6Months', locale),
        dateSummaryCustom: t('filters.dateCustom', locale),
      },
    }),
    [locale, thisPeriodLabel],
  );

  return {
    locale,
    loading,
    isEmpty,
    noMatching,
    period,
    setPeriod,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    categoryFilter,
    setCategoryFilter,
    balanceFormatted: formatCurrency(balance),
    openDrawer,
    incomeFormatted: formatCurrency(totals.income),
    expensesFormatted: formatCurrency(-totals.expense),
    netFormatted: formatCurrency(totals.net),
    netPositive: totals.net >= 0,
    vsPriorLabel,
    monthlyBars,
    categoryRows,
    categorySpendTotalFormatted,
    topSpendingRows,
    topEarningRows,
    outlookVisible,
    outlook,
    labels,
  };
}
