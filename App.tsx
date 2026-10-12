import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from '@/navigation/RootNavigator';
import { MockTransactionRepository } from '@/repositories/MockTransactionRepository';
import { usePreferencesStore } from '@/store/preferencesStore';
import {
  setTransactionRepository,
  useTransactionStore,
} from '@/store/transactionStore';
import { ThemeProvider, useTheme } from '@/theme';

function NavigationRoot() {
  const theme = useTheme();

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
      <RootNavigator />
      <StatusBar style={theme.colorScheme === 'dark' ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}

function ThemedApp() {
  const themeMode = usePreferencesStore((state) => state.themeMode);

  return (
    <ThemeProvider mode={themeMode}>
      <NavigationRoot />
    </ThemeProvider>
  );
}

async function bootstrapTransactions(): Promise<void> {
  try {
    const { SqliteTransactionRepository } = await import(
      '@/repositories/SqliteTransactionRepository'
    );
    setTransactionRepository(new SqliteTransactionRepository());
    await useTransactionStore.getState().fetch();
  } catch {
    if (Platform.OS === 'web') {
      setTransactionRepository(new MockTransactionRepository(400));
      await useTransactionStore.getState().fetch();
      return;
    }
    setTransactionRepository(new MockTransactionRepository(400));
    await useTransactionStore.getState().fetch();
  }
}

export default function App() {
  const [hydrated, setHydrated] = useState(() =>
    usePreferencesStore.persist.hasHydrated(),
  );
  const [dataReady, setDataReady] = useState(false);

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
    void bootstrapTransactions().finally(() => {
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
        <ThemedApp />
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
  flex: {
    flex: 1,
  },
});
