import { useCallback, useEffect, useMemo, useState } from 'react';

import { t } from '@/i18n';
import { usePaymentRequestStore } from '@/store/paymentRequestStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useRecipientStore } from '@/store/recipientStore';

export interface PaymentRequestRow {
  id: string;
  recipientName: string;
  amount: number;
  note?: string;
}

export function usePaymentRequestsListViewModel() {
  const locale = usePreferencesStore((state) => state.locale);

  const paymentRequests = usePaymentRequestStore((state) => state.paymentRequests);
  const fetchRequests = usePaymentRequestStore((state) => state.fetch);
  const fulfill = usePaymentRequestStore((state) => state.fulfill);
  const cancel = usePaymentRequestStore((state) => state.cancel);
  const recipients = useRecipientStore((state) => state.recipients);

  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const pendingRows = useMemo((): PaymentRequestRow[] => {
    return paymentRequests
      .filter((request) => request.status === 'pending')
      .map((request) => {
        const recipient = recipients.find((item) => item.id === request.recipientId);
        return {
          id: request.id,
          recipientName: recipient?.displayName ?? '—',
          amount: request.amount,
          note: request.note,
        };
      });
  }, [paymentRequests, recipients]);

  const markPaid = useCallback(
    async (id: string) => {
      if (settlingId != null) {
        return;
      }
      setSettlingId(id);
      setActionError(null);
      try {
        await fulfill(id);
      } catch {
        setActionError(t('error.generic', locale));
      } finally {
        setSettlingId(null);
      }
    },
    [fulfill, locale, settlingId],
  );

  const cancelRequest = useCallback(
    async (id: string) => {
      if (settlingId != null) {
        return;
      }
      setSettlingId(id);
      setActionError(null);
      try {
        await cancel(id);
      } catch {
        setActionError(t('error.generic', locale));
      } finally {
        setSettlingId(null);
      }
    },
    [cancel, locale, settlingId],
  );

  return {
    pendingRows,
    markPaid,
    cancelRequest,
    settlingId,
    actionError,
    labels: {
      title: t('pay.requestsTitle', locale),
      empty: t('empty.transactions', locale),
      markPaid: t('pay.markPaid', locale),
      cancel: t('pay.cancelRequest', locale),
      exerciseNote: t('pay.markPaidExerciseNote', locale),
    },
  };
}
