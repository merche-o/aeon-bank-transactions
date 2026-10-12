import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { RootNavigator } from '@/navigation/RootNavigator';
import { AppErrorBoundary } from '@/presentation/widgets/AppErrorBoundary';
import { PrivacyOverlay } from '@/presentation/widgets/PrivacyOverlay';
import {
  createMockRepositories,
  createNativeRepositories,
  wireRepositories,
} from '@/repositories/createRepositories';
import { SecureLogger } from '@/security/SecureLogger';
import { usePreferencesStore } from '@/store/preferencesStore';
import { usePaymentRequestStore } from '@/store/paymentRequestStore';
import { useRecipientStore } from '@/store/recipientStore';
import { useTransactionStore } from '@/store/transactionStore';
import { ThemeProvider, useTheme } from '@/theme';

function NavigationRoot({
  usingMockFallback,
}: {
  usingMockFallback: boolean;
}) {
  const theme = useTheme();
  const locale = usePreferencesStore((state) => state.locale);

  const navigationTheme = useMemo(() => {
    const base = theme.colorScheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: theme.colors.background,
        card: theme.colors.surface,
        border: theme.colors.borderSubtle,
        primary: theme.colors.primary,
        text: theme.colors.textPrimary,
      },
    };
  }, [theme]);

  return (
    <NavigationContainer theme={navigationTheme}>
      {usingMockFallback ? (
        <View
          style={[
            styles.fallbackBanner,
            {
              backgroundColor: theme.colors.primarySubtle,
              borderBottomColor: theme.colors.borderSubtle,
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.sm,
            },
          ]}
          testID="sqlite-fallback-banner"
        >
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.sm,
            }}
          >
            {t('app.sqliteFallback', locale)}
          </Text>
        </View>
      ) : null}
      <RootNavigator />
      <StatusBar style={theme.colorScheme === 'dark' ? 'light' : 'dark'} />
      <PrivacyOverlay />
    </NavigationContainer>
  );
}

function ThemedApp({ usingMockFallback }: { usingMockFallback: boolean }) {
  const themeMode = usePreferencesStore((state) => state.themeMode);

  return (
    <ThemeProvider mode={themeMode}>
      <NavigationRoot usingMockFallback={usingMockFallback} />
    </ThemeProvider>
  );
}

async function bootstrapTransactions(): Promise<{ usingMockFallback: boolean }> {
  // Web: never import expo-sqlite (WASM breaks Metro export). Use mock data.
  if (Platform.OS === 'web') {
    wireRepositories(createMockRepositories(400));
    await Promise.all([
      useTransactionStore.getState().fetch(),
      useRecipientStore.getState().fetch(),
      usePaymentRequestStore.getState().fetch(),
    ]);
    return { usingMockFallback: false };
  }

  let usingMockFallback = false;
  try {
    wireRepositories(await createNativeRepositories());
  } catch (cause) {
    SecureLogger.warn('SQLite repositories unavailable; falling back to mock', {
      reason: cause instanceof Error ? cause.message : 'unknown',
    });
    wireRepositories(createMockRepositories(400));
    usingMockFallback = true;
  }

  await Promise.all([
    useTransactionStore.getState().fetch(),
    useRecipientStore.getState().fetch(),
    usePaymentRequestStore.getState().fetch(),
  ]);
  return { usingMockFallback };
}

export default function App() {
  const [hydrated, setHydrated] = useState(() =>
    usePreferencesStore.persist.hasHydrated(),
  );
  const [dataReady, setDataReady] = useState(false);
  const [usingMockFallback, setUsingMockFallback] = useState(false);

  useEffect(() => {
    const unsubscribe = usePreferencesStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    void usePreferencesStore.persist.rehydrate();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    let cancelled = false;
    void bootstrapTransactions()
      .then((result) => {
        if (!cancelled) {
          setUsingMockFallback(result.usingMockFallback);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setDataReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  if (!hydrated || !dataReady) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <AppErrorBoundary>
          <ThemedApp usingMockFallback={usingMockFallback} />
        </AppErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  boot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  fallbackBanner: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  flex: {
    flex: 1,
  },
});
