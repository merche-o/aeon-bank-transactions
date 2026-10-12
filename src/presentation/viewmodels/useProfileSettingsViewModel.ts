import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { t } from '@/i18n';
import { usePreferencesStore } from '@/store/preferencesStore';
import {
  composeDobIso,
  normalizeDobParts,
  type DobParts,
} from '@/utils/dateOfBirth';

export function useProfileSettingsViewModel() {
  const navigation = useNavigation();
  const locale = usePreferencesStore((state) => state.locale);
  const storedFirstName = usePreferencesStore((state) => state.firstName);
  const storedLastName = usePreferencesStore((state) => state.lastName);
  const storedDob = usePreferencesStore((state) => state.dateOfBirth);
  const setProfile = usePreferencesStore((state) => state.setProfile);

  const [firstName, setFirstName] = useState(storedFirstName);
  const [lastName, setLastName] = useState(storedLastName);
  const [dobParts, setDobParts] = useState<DobParts>(() =>
    normalizeDobParts(storedDob),
  );
  const [dobError, setDobError] = useState<string | null>(null);

  const onDobPartsChange = useCallback((next: DobParts) => {
    setDobParts(next);
    setDobError(null);
  }, []);

  const save = useCallback(() => {
    const { iso, error } = composeDobIso(dobParts);
    if (error === 'incomplete') {
      setDobError(t('profile.dobIncomplete', locale));
      return;
    }
    if (error === 'invalid') {
      setDobError(t('profile.dobInvalid', locale));
      return;
    }
    if (error === 'underage') {
      setDobError(t('profile.dobUnderage', locale));
      return;
    }
    setDobError(null);
    setProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: iso,
    });
    navigation.goBack();
  }, [dobParts, firstName, lastName, locale, navigation, setProfile]);

  return {
    locale,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    dobParts,
    onDobPartsChange,
    dobError,
    save,
    labels: {
      title: t('profile.title', locale),
      firstName: t('profile.firstName', locale),
      lastName: t('profile.lastName', locale),
      dateOfBirth: t('profile.dateOfBirth', locale),
      save: t('profile.save', locale),
      dob: {
        day: t('profile.dobDay', locale),
        month: t('profile.dobMonth', locale),
        year: t('profile.dobYear', locale),
        hint: t('profile.dobHint', locale),
      },
    },
  };
}
