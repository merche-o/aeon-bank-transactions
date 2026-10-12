import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';

import { t } from '@/i18n';
import type { RecipientsStackNavigationProp } from '@/navigation/types';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useRecipientStore } from '@/store/recipientStore';
import { useTransactionStore } from '@/store/transactionStore';
import { filterTransactionsByRecipient } from '@/utils/filterByRecipient';
import { groupTransactionsByDay } from '@/utils/groupTransactionsByDay';

export function useRecipientDetailViewModel(recipientId: string) {
  const navigation = useNavigation<RecipientsStackNavigationProp>();
  const locale = usePreferencesStore((state) => state.locale);

  const recipient = useRecipientStore((state) =>
    state.recipients.find((item) => item.id === recipientId),
  );
  const remove = useRecipientStore((state) => state.remove);

  const storeTransactions = useTransactionStore((state) => state.transactions);
  const fetchTransactions = useTransactionStore((state) => state.fetch);

  useEffect(() => {
    if (storeTransactions.length === 0) {
      void fetchTransactions();
    }
  }, [fetchTransactions, storeTransactions.length]);

  const history = useMemo(() => {
    if (!recipient) {
      return [];
    }
    return filterTransactionsByRecipient(storeTransactions, {
      recipientId: recipient.id,
      displayName: recipient.displayName,
    });
  }, [recipient, storeTransactions]);

  const historySections = useMemo(
    () => groupTransactionsByDay(history, { locale }),
    [history, locale],
  );

  const labels = useMemo(
    () => ({
      send: t('recipients.send', locale),
      request: t('recipients.request', locale),
      delete: t('recipients.delete', locale),
      accountHint: t('recipients.accountHint', locale),
      notFound: t('notFound.message', locale),
      history: t('recipients.history', locale),
      noHistory: t('recipients.noHistory', locale),
      fabOpen: t('fab.openActions', locale),
      fabClose: t('fab.closeActions', locale),
    }),
    [locale],
  );

  const openSend = useCallback(() => {
    navigation.navigate('QuickPay', { recipientId });
  }, [navigation, recipientId]);

  const openRequest = useCallback(() => {
    navigation.navigate('RequestPay', { recipientId });
  }, [navigation, recipientId]);

  const openHistoryDetail = useCallback(
    (refId: string) => {
      navigation.navigate('TransactionDetail', { refId });
    },
    [navigation],
  );

  const confirmDelete = useCallback(() => {
    Alert.alert(labels.delete, recipient?.displayName ?? '', [
      { text: t('pay.cancelSchedule', locale), style: 'cancel' },
      {
        text: labels.delete,
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await remove(recipientId);
            navigation.goBack();
          })();
        },
      },
    ]);
  }, [labels.delete, locale, navigation, recipient?.displayName, recipientId, remove]);

  return {
    recipient,
    history,
    historySections,
    locale,
    labels,
    openSend,
    openRequest,
    openHistoryDetail,
    confirmDelete,
  };
}
