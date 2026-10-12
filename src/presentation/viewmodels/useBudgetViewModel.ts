import { useMemo } from 'react';

import { t } from '@/i18n';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useTransactionStore } from '@/store/transactionStore';
import {
  aggregateCategorySpend,
  aggregateMonthlySpend,
} from '@/utils/budgetStats';
import { formatCurrency } from '@/utils/formatCurrency';
import { getCategoryLabel } from '@/utils/categories';

function currentMonthKey(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function useBudgetViewModel() {
  const locale = usePreferencesStore((state) => state.locale);
  const transactions = useTransactionStore((state) => state.transactions);

  const monthKey = currentMonthKey();

  const thisMonthTotals = useMemo(() => {
    let income = 0;
    let expenses = 0;
    for (const tx of transactions) {
      const key = tx.transferDate.slice(0, 7);
      if (key !== monthKey) {
        continue;
      }
      if (tx.amount < 0) {
        expenses += Math.abs(tx.amount);
      } else {
        income += tx.amount;
      }
    }
    return { income, expenses };
  }, [transactions, monthKey]);

  const monthlyBars = useMemo(
    () => aggregateMonthlySpend(transactions, 6),
    [transactions],
  );

  const maxMonthlyExpense = useMemo(
    () => Math.max(...monthlyBars.map((m) => m.expenseTotal), 1),
    [monthlyBars],
  );

  const categorySpend = useMemo(
    () =>
      aggregateCategorySpend(transactions, monthKey).map((row) => ({
        ...row,
        label: getCategoryLabel(row.category, locale),
        formatted: formatCurrency(-row.total),
      })),
    [transactions, monthKey, locale],
  );

  return {
    locale,
    incomeFormatted: formatCurrency(thisMonthTotals.income),
    expensesFormatted: formatCurrency(-thisMonthTotals.expenses),
    monthlyBars,
    maxMonthlyExpense,
    categorySpend,
    labels: {
      title: t('budget.title', locale),
      thisMonth: t('budget.thisMonth', locale),
      income: t('budget.income', locale),
      expenses: t('budget.expenses', locale),
      byCategory: t('budget.byCategory', locale),
      byMonth: t('budget.byMonth', locale),
    },
  };
}
