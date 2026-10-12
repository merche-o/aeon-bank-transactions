import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';

import { t } from '@/i18n';
import type { TransactionCategory } from '@/models/Transaction';
import type { RecipientsStackNavigationProp } from '@/navigation/types';
import { usePaymentRequestStore } from '@/store/paymentRequestStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useRecipientStore } from '@/store/recipientStore';
import { useTransactionStore } from '@/store/transactionStore';

export function useRequestPayViewModel(recipientId: string) {
  const navigation = useNavigation<RecipientsStackNavigationProp>();
  const locale = usePreferencesStore((state) => state.locale);

  const recipient = useRecipientStore((state) =>
    state.recipients.find((item) => item.id === recipientId),
  );
  const add = usePaymentRequestStore((state) => state.add);

  const [amountText, setAmountText] = useState('');
  const [transferNameDraft, setTransferNameDraft] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('unknown');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const parsedAmount = useMemo(() => {
    const value = parseFloat(amountText.replace(/,/g, ''));
    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }
    return value;
  }, [amountText]);

  const canCreate =
    parsedAmount != null && recipient != null && !saving;

  const createRequest = useCallback(async () => {
    if (!canCreate || parsedAmount == null || recipient == null) {
      return;
    }
    setSaving(true);
    try {
      const created = await add({
        recipientId: recipient.id,
        amount: parsedAmount,
        note: note.trim() || undefined,
        transferName: transferNameDraft.trim() || undefined,
        category,
      });
      const linked = useTransactionStore
        .getState()
        .findByPaymentRequestId(created.id);
      navigation.replace('PaymentConfirm', {
        kind: 'request',
        paymentRequestId: created.id,
        refId: linked?.refId,
      });
    } finally {
      setSaving(false);
    }
  }, [
    add,
    canCreate,
    category,
    navigation,
    note,
    parsedAmount,
    recipient,
    transferNameDraft,
  ]);

  return {
    recipient,
    locale,
    amountText,
    setAmountText,
    transferNameDraft,
    setTransferNameDraft,
    category,
    setCategory,
    note,
    setNote,
    canCreate,
    createRequest,
    labels: {
      title: t('pay.requestTitle', locale),
      amount: t('pay.amount', locale),
      transferName: t('add.transferName', locale),
      category: t('add.categoryLabel', locale),
      note: t('pay.requestNote', locale),
      create: t('pay.createRequest', locale),
      notFound: t('notFound.message', locale),
    },
  };
}
