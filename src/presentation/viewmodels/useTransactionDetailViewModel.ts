import { useCallback, useMemo } from 'react';

import { t } from '@/i18n';
import type { Transaction } from '@/models/Transaction';
import { shareTransaction } from '@/services/ShareService';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useTransactionStore } from '@/store/transactionStore';

export function useTransactionDetailViewModel(refId: string) {
  const locale = usePreferencesStore((state) => state.locale);
  const getByRefId = useTransactionStore((state) => state.getByRefId);

  const transaction: Transaction | undefined = useMemo(
    () => getByRefId(refId),
    [getByRefId, refId],
  );

  const shareLabels = useMemo(
    () => ({
      reference: t('detail.reference', locale),
      date: t('detail.date', locale),
      recipient: t('detail.recipient', locale),
      transferName: t('detail.transferName', locale),
      amount: t('detail.amount', locale),
    }),
    [locale],
  );

  const share = useCallback(async () => {
    if (transaction == null) {
      return;
    }
    await shareTransaction(transaction, t('share.title', locale), shareLabels);
  }, [locale, shareLabels, transaction]);

  return {
    locale,
    transaction,
    share,
    labels: {
      title: t('detail.title', locale),
      reference: t('detail.reference', locale),
      date: t('detail.date', locale),
      recipient: t('detail.recipient', locale),
      transferName: t('detail.transferName', locale),
      amount: t('detail.amount', locale),
      shareButton: t('share.button', locale),
      notFoundTitle: t('notFound.title', locale),
      notFoundMessage: t('notFound.message', locale),
    },
  };
}
