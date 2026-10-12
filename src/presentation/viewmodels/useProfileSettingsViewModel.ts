import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { t } from '@/i18n';
import { usePreferencesStore } from '@/store/preferencesStore';

export function useProfileSettingsViewModel() {
  const navigation = useNavigation();
  const locale = usePreferencesStore((state) => state.locale);
  const storedName = usePreferencesStore((state) => state.displayName);
  const storedAge = usePreferencesStore((state) => state.age);
  const setDisplayName = usePreferencesStore((state) => state.setDisplayName);
  const setAge = usePreferencesStore((state) => state.setAge);

  const [name, setName] = useState(storedName);
  const [ageText, setAgeText] = useState(storedAge != null ? String(storedAge) : '');

  const save = useCallback(() => {
    setDisplayName(name.trim());
    const parsed = parseInt(ageText, 10);
    setAge(Number.isFinite(parsed) && parsed > 0 ? parsed : null);
    navigation.goBack();
  }, [ageText, name, navigation, setAge, setDisplayName]);

  return {
    locale,
    name,
    setName,
    ageText,
    setAgeText,
    save,
    labels: {
      title: t('profile.title', locale),
      name: t('profile.name', locale),
      age: t('profile.age', locale),
      save: t('profile.save', locale),
    },
  };
}
