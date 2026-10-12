import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';

import { t } from '@/i18n';
import type { TransactionCategory } from '@/models/Transaction';
import type { RecipientsStackNavigationProp } from '@/navigation/types';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useRecipientStore } from '@/store/recipientStore';
import {
  InsufficientFundsError,
  useTransactionStore,
} from '@/store/transactionStore';
import { canAfford, getInsufficientFundsMessage } from '@/utils/balance';
import { formatCurrency } from '@/utils/formatCurrency';

export type PayTiming = 'now' | 'schedule';

function interpolate(template: string, params: Record<string, string>): string {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`{${key}}`, value),
    template,
  );
}

export function minimumScheduleDate(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
}

export function useQuickPayViewModel(recipientId: string) {
  const navigation = useNavigation<RecipientsStackNavigationProp>();
  const locale = usePreferencesStore((state) => state.locale);

  const recipient = useRecipientStore((state) =>
    state.recipients.find((item) => item.id === recipientId),
  );
  const balance = useTransactionStore((state) => state.balance);
  const addTransaction = useTransactionStore((state) => state.addTransaction);

  const [amountText, setAmountText] = useState('');
  const [transferNameDraft, setTransferNameDraft] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('unknown');
  const [timing, setTiming] = useState<PayTiming>('now');
  const [scheduleDateIso, setScheduleDateIso] = useState(() =>
    minimumScheduleDate().toISOString(),
  );
  const [saving, setSaving] = useState(false);

  const parsedAmount = useMemo(() => {
    const value = parseFloat(amountText.replace(/,/g, ''));
    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }
    return -value;
  }, [amountText]);

  const canAffordTransfer = useMemo(
    () => parsedAmount != null && canAfford(balance, parsedAmount),
    [balance, parsedAmount],
  );

  const showInsufficientFunds =
    parsedAmount != null && parsedAmount < 0 && !canAffordTransfer;

  const insufficientFundsMessage = useMemo(
    () =>
      getInsufficientFundsMessage(balance, {
        insufficientFunds: t('add.insufficientFunds', locale),
        availableBalance: t('add.availableBalance', locale),
      }),
    [balance, locale],
  );

  const transferTitle = useMemo(() => {
    const name = recipient?.displayName ?? '';
    return interpolate(t('pay.transferTo', locale), { name });
  }, [locale, recipient?.displayName]);

  const canConfirm =
    parsedAmount != null &&
    canAffordTransfer &&
    !saving &&
    recipient != null &&
    (timing === 'now' || scheduleDateIso.length > 0);

  const confirm = useCallback(async () => {
    if (!canConfirm || parsedAmount == null || recipient == null) {
      return;
    }
    setSaving(true);
    try {
      const nowIso = new Date().toISOString();
      const transferName = transferNameDraft.trim() || transferTitle;
      let created;
      if (timing === 'now') {
        created = await addTransaction({
          transferName,
          recipientName: recipient.displayName,
          amount: parsedAmount,
          transferDate: nowIso,
          category,
          recipientId: recipient.id,
        });
      } else {
        const scheduledFor = scheduleDateIso.slice(0, 10);
        created = await addTransaction({
          transferName,
          recipientName: recipient.displayName,
          amount: parsedAmount,
          transferDate: nowIso,
          category,
          status: 'scheduled',
          scheduledFor,
          recipientId: recipient.id,
        });
      }
      navigation.replace('PaymentConfirm', {
        kind: timing === 'now' ? 'transfer' : 'schedule',
        refId: created.refId,
      });
    } catch (cause) {
      if (!(cause instanceof InsufficientFundsError)) {
        throw cause;
      }
    } finally {
      setSaving(false);
    }
  }, [
    addTransaction,
    canConfirm,
    navigation,
    parsedAmount,
    recipient,
    scheduleDateIso,
    timing,
    transferNameDraft,
    transferTitle,
    category,
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
    timing,
    setTiming,
    scheduleDateIso,
    setScheduleDateIso,
    minimumScheduleDate: minimumScheduleDate(),
    balanceFormatted: formatCurrency(balance),
    showInsufficientFunds,
    insufficientFundsMessage,
    canConfirm,
    confirm,
    transferTitle,
    labels: {
      amount: t('pay.amount', locale),
      transferName: t('add.transferName', locale),
      category: t('add.categoryLabel', locale),
      sendNow: t('pay.sendNow', locale),
      schedule: t('pay.schedule', locale),
      scheduleDate: t('pay.scheduleDate', locale),
      confirmSend: t('pay.confirmSend', locale),
      confirmSchedule: t('pay.confirmSchedule', locale),
      notFound: t('notFound.message', locale),
    },
  };
}
