import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import type { Locale } from '@/i18n/types';
import { FilterMenuButton } from '@/presentation/widgets/FilterMenuButton';
import { usePreferencesStore, type ThemeMode } from '@/store/preferencesStore';
import { useTheme } from '@/theme';

export function DrawerContent(props: DrawerContentComponentProps) {
  const { navigation } = props;
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  const locale = usePreferencesStore((state) => state.locale);
  const themeMode = usePreferencesStore((state) => state.themeMode);
  const setLocale = usePreferencesStore((state) => state.setLocale);
  const setThemeMode = usePreferencesStore((state) => state.setThemeMode);

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

      <View
        style={[
          styles.menuBlock,
          { gap: spacing.md, paddingHorizontal: spacing.lg },
        ]}
      >
        <View style={styles.menuRow}>
          <FilterMenuButton
            label={t('drawer.theme', locale)}
            onChange={(mode: ThemeMode) => setThemeMode(mode)}
            options={[
              {
                value: 'light',
                label: t('theme.light', locale),
                testID: 'drawer-theme-light',
              },
              {
                value: 'dark',
                label: t('theme.dark', locale),
                testID: 'drawer-theme-dark',
              },
              {
                value: 'system',
                label: t('theme.system', locale),
                testID: 'drawer-theme-system',
              },
            ]}
            testID="drawer-theme"
            value={themeMode}
          />
        </View>
        <View style={styles.menuRow}>
          <FilterMenuButton
            label={t('drawer.language', locale)}
            onChange={(next: Locale) => setLocale(next)}
            options={[
              {
                value: 'en',
                label: t('language.en', locale),
                testID: 'drawer-language-en',
              },
              {
                value: 'bm',
                label: t('language.bm', locale),
                testID: 'drawer-language-bm',
              },
            ]}
            testID="drawer-language"
            value={locale}
          />
        </View>
      </View>

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
  menuBlock: {
    marginBottom: 8,
    width: '100%',
  },
  menuRow: {
    flexDirection: 'row',
    width: '100%',
  },
  row: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
  },
});
