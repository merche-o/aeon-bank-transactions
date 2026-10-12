import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export type StateMessageProps = {
  title: string;
  message?: string;
  action?: ReactNode;
  testID?: string;
};

export function StateMessage({
  title,
  message,
  action,
  testID,
}: StateMessageProps) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <View
      testID={testID}
      style={[styles.container, { paddingHorizontal: spacing.xl }]}
    >
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {message != null && message.length > 0 ? (
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSize.md,
            lineHeight: typography.lineHeight.md,
            marginTop: spacing.sm,
            textAlign: 'center',
          }}
        >
          {message}
        </Text>
      ) : null}
      {action != null ? (
        <View style={{ marginTop: spacing.lg }}>{action}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
});
