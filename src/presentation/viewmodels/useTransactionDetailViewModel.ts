import { useCallback, useEffect, useMemo, useState } from 'react';

import { t } from '@/i18n';
import type { TransactionCategory } from '@/models/Transaction';
import { shareTransaction } from '@/services/ShareService';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useTransactionStore } from '@/store/transactionStore';
import { getCategoryLabel } from '@/utils/categories';

export function useTransactionDetailViewModel(refId: string) {
  const locale = usePreferencesStore((state) => state.locale);
  const storeTransaction = useTransactionStore((state) =>
    state.transactions.find((item) => item.refId === refId),
  );
  const ensureByRefId = useTransactionStore((state) => state.ensureByRefId);
  const setCategory = useTransactionStore((state) => state.setCategory);
  const [fetched, setFetched] = useState<typeof storeTransaction>(undefined);

  useEffect(() => {
    if (storeTransaction) {
      return;
    }
    let cancelled = false;
    void ensureByRefId(refId).then((item) => {
      if (!cancelled) {
        setFetched(item ?? undefined);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [ensureByRefId, refId, storeTransaction]);

  const transaction = storeTransaction ?? fetched;

  const updateCategory = useCallback(
    (category: TransactionCategory) => {
      if (transaction == null) {
        return;
      }
      void setCategory(refId, category);
    },
    [refId, setCategory, transaction],
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

  const categoryLabel =
    transaction != null ? getCategoryLabel(transaction.category, locale) : '';

  const statusLabel =
    transaction?.status === 'pending' ? t('status.pending', locale) : null;

  return {
    locale,
    transaction,
    share,
    updateCategory,
    categoryLabel,
    statusLabel,
    labels: {
      title: t('detail.title', locale),
      reference: t('detail.reference', locale),
      date: t('detail.date', locale),
      recipient: t('detail.recipient', locale),
      transferName: t('detail.transferName', locale),
      amount: t('detail.amount', locale),
      category: t('detail.category', locale),
      status: t('detail.status', locale),
      shareButton: t('share.button', locale),
      notFoundTitle: t('notFound.title', locale),
      notFoundMessage: t('notFound.message', locale),
    },
  };
}
