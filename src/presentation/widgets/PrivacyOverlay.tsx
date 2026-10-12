import { useEffect, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import type { AppStateStatus } from 'react-native';

import { useTheme } from '@/theme';

function isCovered(state: AppStateStatus): boolean {
  return state === 'inactive' || state === 'background';
}

/**
 * Full-screen opaque cover while the app is inactive/background so
 * banking UI is not visible in the app switcher. No PII.
 */
export function PrivacyOverlay() {
  const theme = useTheme();
  const { colors } = theme;
  const [covered, setCovered] = useState(() => isCovered(AppState.currentState));

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      setCovered(isCovered(next));
    });
    return () => {
      subscription.remove();
    };
  }, []);

  if (!covered) {
    return null;
  }

  return (
    <View
      accessible={false}
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        styles.overlay,
        { backgroundColor: colors.background },
      ]}
      testID="privacy-overlay"
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    elevation: 100,
    zIndex: 100,
  },
});

