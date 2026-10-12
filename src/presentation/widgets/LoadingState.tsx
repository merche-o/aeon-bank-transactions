import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

import { StateMessage } from './StateMessage';

export type LoadingStateProps = {
  message: string;
  testID?: string;
};

export function LoadingState({ message, testID = 'loading-state' }: LoadingStateProps) {
  const theme = useTheme();
  const { colors, spacing } = theme;

  return (
    <View testID={testID} style={styles.wrapper}>
      <ActivityIndicator
        color={colors.primary}
        size="large"
        style={{ marginBottom: spacing.lg }}
      />
      <StateMessage title={message} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
