import { Pressable, StyleSheet, Text } from 'react-native';

import { t } from '@/i18n';
import type { Locale } from '@/i18n/types';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useTheme } from '@/theme';

function nextLocale(current: Locale): Locale {
  return current === 'en' ? 'bm' : 'en';
}

function localeLabelKey(locale: Locale): 'language.en' | 'language.bm' {
  return locale === 'bm' ? 'language.bm' : 'language.en';
}

export type LanguageToggleProps = {
  locale: Locale;
};

export function LanguageToggle({ locale }: LanguageToggleProps) {
  const setLocale = usePreferencesStore((state) => state.setLocale);
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  const displayLocale = nextLocale(locale);
  const label = t(localeLabelKey(displayLocale), locale);

  return (
    <Pressable
      accessibilityLabel={t('language.label', locale)}
      accessibilityRole="button"
      onPress={() => setLocale(displayLocale)}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderSubtle,
          opacity: pressed ? 0.88 : 1,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
        },
      ]}
      testID="language-toggle"
    >
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.semibold,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 8,
    borderWidth: 1,
  },
});
