import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { t } from '@/i18n';
import type { RecipientsStackNavigationProp } from '@/navigation/types';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useRecipientStore } from '@/store/recipientStore';

export function useAddRecipientViewModel() {
  const navigation = useNavigation<RecipientsStackNavigationProp>();
  const locale = usePreferencesStore((state) => state.locale);
  const add = useRecipientStore((state) => state.add);

  const [displayName, setDisplayName] = useState('');
  const [accountHint, setAccountHint] = useState('');
  const [saving, setSaving] = useState(false);

  const canSave = displayName.trim().length > 0 && !saving;

  const save = useCallback(async () => {
    if (!canSave) {
      return;
    }
    setSaving(true);
    try {
      await add({
        displayName: displayName.trim(),
        accountHint: accountHint.trim() || undefined,
      });
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  }, [accountHint, add, canSave, displayName, navigation]);

  return {
    displayName,
    setDisplayName,
    accountHint,
    setAccountHint,
    canSave,
    save,
    labels: {
      title: t('recipients.add', locale),
      name: t('add.recipient', locale),
      accountHint: t('recipients.accountHint', locale),
      save: t('recipients.add', locale),
    },
  };
}
