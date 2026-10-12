import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useDebounce } from '@/hooks/useDebounce';
import { t } from '@/i18n';
import type { Recipient } from '@/models/Recipient';
import type { RecipientsStackNavigationProp } from '@/navigation/types';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useRecipientStore } from '@/store/recipientStore';
import { avatarInitialFromName } from '@/utils/profile';

function matchesQuery(recipient: Recipient, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }
  const name = recipient.displayName.toLowerCase();
  const hint = recipient.accountHint?.toLowerCase() ?? '';
  return name.includes(normalized) || hint.includes(normalized);
}

export function useRecipientListViewModel() {
  const navigation = useNavigation<RecipientsStackNavigationProp>();
  const locale = usePreferencesStore((state) => state.locale);

  const recipients = useRecipientStore((state) => state.recipients);
  const loading = useRecipientStore((state) => state.loading);
  const error = useRecipientStore((state) => state.error);
  const fetch = useRecipientStore((state) => state.fetch);

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const filteredRecipients = useMemo(
    () => recipients.filter((item) => matchesQuery(item, debouncedQuery)),
    [recipients, debouncedQuery],
  );

  const openAdd = useCallback(() => {
    navigation.navigate('AddRecipient');
  }, [navigation]);

  const openScheduled = useCallback(() => {
    navigation.navigate('ScheduledList');
  }, [navigation]);

  const openRequests = useCallback(() => {
    navigation.navigate('PaymentRequestsList');
  }, [navigation]);

  const openRecipient = useCallback(
    (recipientId: string) => {
      navigation.navigate('RecipientDetail', { recipientId });
    },
    [navigation],
  );

  const avatarInitial = useCallback((displayName: string) => {
    return avatarInitialFromName(displayName);
  }, []);

  return {
    locale,
    query,
    setQuery,
    recipients: filteredRecipients,
    loading,
    error,
    openAdd,
    openScheduled,
    openRequests,
    openRecipient,
    avatarInitial,
    labels: {
      title: t('recipients.title', locale),
      search: t('recipients.search', locale),
      empty: t('recipients.empty', locale),
      add: t('recipients.add', locale),
      scheduled: t('pay.scheduledTitle', locale),
      requests: t('pay.requestsTitle', locale),
    },
  };
}
