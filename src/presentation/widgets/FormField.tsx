import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

export type FormFieldProps = {
  label: string;
  children: ReactNode;
  error?: string;
  testID?: string;
};

export function FormField({ label, children, error, testID }: FormFieldProps) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <View style={{ marginTop: spacing.md }} testID={testID}>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          marginBottom: spacing.xs,
        }}
      >
        {label}
      </Text>
      {children}
      {error ? (
        <Text
          style={{
            color: colors.error,
            fontSize: typography.fontSize.sm,
            marginTop: spacing.xs,
          }}
          testID={testID ? `${testID}-error` : undefined}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
