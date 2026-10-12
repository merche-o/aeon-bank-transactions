import { useCallback, useMemo } from 'react';

import { t } from '@/i18n';
import type { Transaction } from '@/models/Transaction';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useTransactionStore } from '@/store/transactionStore';

export function useScheduledListViewModel() {
  const locale = usePreferencesStore((state) => state.locale);

  const transactions = useTransactionStore((state) => state.transactions);
  const cancelScheduled = useTransactionStore((state) => state.cancelScheduled);

  const scheduled = useMemo(
    () =>
      transactions.filter(
        (tx): tx is Transaction & { scheduledFor: string } =>
          tx.status === 'scheduled' && tx.scheduledFor != null,
      ),
    [transactions],
  );

  const cancel = useCallback(
    (refId: string) => {
      void cancelScheduled(refId);
    },
    [cancelScheduled],
  );

  return {
    scheduled,
    cancel,
    labels: {
      title: t('pay.scheduledTitle', locale),
      empty: t('empty.transactions', locale),
      cancel: t('pay.cancelSchedule', locale),
    },
  };
}
