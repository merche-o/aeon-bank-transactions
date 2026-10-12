import { Pressable, StyleSheet, Text } from 'react-native';

import { t } from '@/i18n';
import type { Locale } from '@/i18n/types';
import { usePreferencesStore, type ThemeMode } from '@/store/preferencesStore';
import { useTheme } from '@/theme';

const THEME_CYCLE: ThemeMode[] = ['light', 'dark', 'system'];

function nextThemeMode(current: ThemeMode): ThemeMode {
  const index = THEME_CYCLE.indexOf(current);
  const nextIndex = index === -1 ? 0 : (index + 1) % THEME_CYCLE.length;
  return THEME_CYCLE[nextIndex] ?? 'system';
}

function themeLabelKey(mode: ThemeMode): 'theme.light' | 'theme.dark' | 'theme.system' {
  if (mode === 'dark') {
    return 'theme.dark';
  }
  if (mode === 'system') {
    return 'theme.system';
  }
  return 'theme.light';
}

export type ThemeToggleProps = {
  locale: Locale;
};

export function ThemeToggle({ locale }: ThemeToggleProps) {
  const themeMode = usePreferencesStore((state) => state.themeMode);
  const setThemeMode = usePreferencesStore((state) => state.setThemeMode);
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  const label = t(themeLabelKey(themeMode), locale);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={() => setThemeMode(nextThemeMode(themeMode))}
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
      testID="theme-toggle"
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
