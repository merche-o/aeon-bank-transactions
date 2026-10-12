import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

function themeLabelKey(
  mode: ThemeMode,
): 'theme.light' | 'theme.dark' | 'theme.system' {
  if (mode === 'dark') {
    return 'theme.dark';
  }
  if (mode === 'system') {
    return 'theme.system';
  }
  return 'theme.light';
}

export function DrawerContent(props: DrawerContentComponentProps) {
  const { navigation } = props;
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  const locale = usePreferencesStore((state) => state.locale);
  const themeMode = usePreferencesStore((state) => state.themeMode);
  const setLocale = usePreferencesStore((state) => state.setLocale);
  const setThemeMode = usePreferencesStore((state) => state.setThemeMode);

  const cycleTheme = () => {
    setThemeMode(nextThemeMode(themeMode));
  };

  const toggleLocale = () => {
    const next: Locale = locale === 'en' ? 'bm' : 'en';
    setLocale(next);
  };

  const openProfile = () => {
    navigation.closeDrawer();
    navigation.navigate('MainTabs', {
      screen: 'TransactionsTab',
      params: { screen: 'Profile' },
    });
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flex: 1,
        paddingBottom: insets.bottom + spacing.lg,
        paddingTop: insets.top + spacing.lg,
      }}
      testID="drawer-content"
    >
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.bold,
          marginBottom: spacing.xl,
          paddingHorizontal: spacing.lg,
        }}
      >
        {t('drawer.settings', locale)}
      </Text>

      <DrawerRow
        label={t('drawer.theme', locale)}
        onPress={cycleTheme}
        testID="drawer-theme"
        value={t(themeLabelKey(themeMode), locale)}
      />
      <DrawerRow
        label={t('drawer.language', locale)}
        onPress={toggleLocale}
        testID="drawer-language"
        value={t(locale === 'en' ? 'language.en' : 'language.bm', locale)}
      />
      <DrawerRow
        label={t('drawer.profile', locale)}
        onPress={openProfile}
        testID="drawer-profile"
      />
    </DrawerContentScrollView>
  );
}

function DrawerRow({
  label,
  value,
  onPress,
  testID,
}: {
  label: string;
  value?: string;
  onPress: () => void;
  testID: string;
}) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          borderBottomColor: colors.borderSubtle,
          opacity: pressed ? 0.88 : 1,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
        },
      ]}
      testID={testID}
    >
      <Text
        style={{
          color: colors.textPrimary,
          flex: 1,
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.medium,
        }}
      >
        {label}
      </Text>
      {value != null ? (
        <Text
          style={{
            color: colors.primary,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
          }}
        >
          {value}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
  },
});
