import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme';

import { StateMessage } from './StateMessage';

export type ErrorStateProps = {
  title: string;
  retryLabel: string;
  onRetry: () => void;
  testID?: string;
};

export function ErrorState({
  title,
  retryLabel,
  onRetry,
  testID = 'error-state',
}: ErrorStateProps) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <StateMessage
      testID={testID}
      title={title}
      action={
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.85 : 1,
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.md,
            },
          ]}
          testID="retry-button"
        >
          <Text
            style={{
              color: colors.textInverse,
              fontSize: typography.fontSize.md,
              fontWeight: typography.fontWeight.semibold,
            }}
          >
            {retryLabel}
          </Text>
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
  },
});
