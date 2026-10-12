import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from '@/navigation/RootNavigator';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useTransactionStore } from '@/store/transactionStore';
import { ThemeProvider, useTheme } from '@/theme';

function NavigationRoot() {
  const theme = useTheme();
  const fetchTransactions = useTransactionStore((state) => state.fetch);

  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions]);

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

export default function App() {
  const [hydrated, setHydrated] = useState(() =>
    usePreferencesStore.persist.hasHydrated(),
  );

  useEffect(() => {
    const unsubscribe = usePreferencesStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    void usePreferencesStore.persist.rehydrate();
    return unsubscribe;
  }, []);

  if (!hydrated) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemedApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
