import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';

import { t } from '@/i18n';
import type { TransactionCategory } from '@/models/Transaction';
import type { TransactionsStackNavigationProp } from '@/navigation/types';
import { usePreferencesStore } from '@/store/preferencesStore';
import {
  InsufficientFundsError,
  useTransactionStore,
} from '@/store/transactionStore';
import { canAfford, getInsufficientFundsMessage } from '@/utils/balance';
import { defaultCategoryForAmount } from '@/utils/categories';
import { formatCurrency } from '@/utils/formatCurrency';

export type FlowDirection = 'income' | 'expense';

export function useAddTransactionViewModel() {
  const navigation = useNavigation<TransactionsStackNavigationProp>();
  const locale = usePreferencesStore((state) => state.locale);
  const balance = useTransactionStore((state) => state.balance);
  const addTransaction = useTransactionStore((state) => state.addTransaction);

  const [transferName, setTransferName] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amountText, setAmountText] = useState('');
  const [flow, setFlow] = useState<FlowDirection>('expense');
  const [transferDate, setTransferDate] = useState(() => new Date().toISOString());
  const [category, setCategory] = useState<TransactionCategory>('other');
  const [saving, setSaving] = useState(false);

  const parsedAmount = useMemo(() => {
    const value = parseFloat(amountText.replace(/,/g, ''));
    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }
    return flow === 'expense' ? -value : value;
  }, [amountText, flow]);

  const signedAmount = parsedAmount ?? 0;

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

  const onFlowChange = useCallback((next: FlowDirection) => {
    setFlow(next);
    setCategory((current) => {
      const sign = next === 'expense' ? -1 : 1;
      return defaultCategoryForAmount(sign);
    });
  }, []);

  const canSave =
    transferName.trim().length > 0 &&
    recipient.trim().length > 0 &&
    parsedAmount != null &&
    canAffordTransfer &&
    !saving;

  const save = useCallback(async () => {
    if (!canSave || parsedAmount == null) {
      return;
    }
    setSaving(true);
    try {
      await addTransaction({
        transferName: transferName.trim(),
        recipientName: recipient.trim(),
        amount: parsedAmount,
        transferDate,
        category,
      });
      navigation.goBack();
    } catch (cause) {
      if (!(cause instanceof InsufficientFundsError)) {
        throw cause;
      }
    } finally {
      setSaving(false);
    }
  }, [
    addTransaction,
    canSave,
    category,
    navigation,
    parsedAmount,
    recipient,
    transferDate,
    transferName,
  ]);

  return {
    locale,
    transferName,
    setTransferName,
    recipient,
    setRecipient,
    amountText,
    setAmountText,
    flow,
    setFlow: onFlowChange,
    transferDate,
    setTransferDate,
    category,
    setCategory,
    balanceFormatted: formatCurrency(balance),
    showInsufficientFunds,
    insufficientFundsMessage,
    canSave,
    save,
    labels: {
      title: t('add.title', locale),
      transferName: t('add.transferName', locale),
      recipient: t('add.recipient', locale),
      amount: t('add.amount', locale),
      date: t('add.date', locale),
      category: t('add.categoryLabel', locale),
      expense: t('add.expense', locale),
      income: t('add.income', locale),
      save: t('add.save', locale),
    },
  };
}
