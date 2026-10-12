import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useDebounce } from '@/hooks/useDebounce';
import { t } from '@/i18n';
import type { Recipient } from '@/models/Recipient';
import type {
  TransactionsStackNavigationProp,
  TransactionsStackParamList,
} from '@/navigation/types';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useRecipientStore } from '@/store/recipientStore';
import { avatarInitialFromName } from '@/utils/profile';

export type PaymentStartMode = 'transfer' | 'request';

function matchesQuery(recipient: Recipient, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }
  const name = recipient.displayName.toLowerCase();
  const hint = recipient.accountHint?.toLowerCase() ?? '';
  return name.includes(normalized) || hint.includes(normalized);
}

type PaymentStartRouteProp = RouteProp<TransactionsStackParamList, 'PaymentStart'>;

export function usePaymentStartViewModel() {
  const navigation = useNavigation<TransactionsStackNavigationProp>();
  const route = useRoute<PaymentStartRouteProp>();
  const locale = usePreferencesStore((state) => state.locale);

  const recipients = useRecipientStore((state) => state.recipients);
  const loading = useRecipientStore((state) => state.loading);
  const fetch = useRecipientStore((state) => state.fetch);

  const initialMode = route.params?.mode ?? 'transfer';
  const [mode, setMode] = useState<PaymentStartMode>(initialMode);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (recipients.length === 0 && !loading) {
      void fetch();
    }
  }, [fetch, loading, recipients.length]);

  const filteredRecipients = useMemo(
    () => recipients.filter((item) => matchesQuery(item, debouncedQuery)),
    [recipients, debouncedQuery],
  );

  const openAddRecipient = useCallback(() => {
    navigation.navigate('AddRecipient');
  }, [navigation]);

  const openRecipient = useCallback(
    (recipientId: string) => {
      if (mode === 'transfer') {
        navigation.navigate('QuickPay', { recipientId });
      } else {
        navigation.navigate('RequestPay', { recipientId });
      }
    },
    [mode, navigation],
  );

  const avatarInitial = useCallback((displayName: string) => {
    return avatarInitialFromName(displayName);
  }, []);

  return {
    locale,
    mode,
    setMode,
    query,
    setQuery,
    recipients: filteredRecipients,
    loading,
    openAddRecipient,
    openRecipient,
    avatarInitial,
    labels: {
      title: t('pay.chooseRecipient', locale),
      transfer: t('pay.transfer', locale),
      request: t('pay.request', locale),
      search: t('pay.searchRecipients', locale),
      addNew: t('pay.addNewRecipient', locale),
      empty: t('recipients.empty', locale),
    },
  };
}
