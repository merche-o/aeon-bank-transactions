import { Pressable, StyleSheet, Text, View } from 'react-native';

import { obfuscateAccountHint } from '@/security';
import { useTheme } from '@/theme';

export type RecipientRowProps = {
  displayName: string;
  accountHint?: string;
  avatarInitial: string;
  onPress: () => void;
  testID: string;
};

export function RecipientRow({
  displayName,
  accountHint,
  avatarInitial,
  onPress,
  testID,
}: RecipientRowProps) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;
  const maskedHint = obfuscateAccountHint(accountHint);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderSubtle,
          marginHorizontal: spacing.lg,
          marginBottom: spacing.sm,
          opacity: pressed ? 0.9 : 1,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
        },
      ]}
      testID={testID}
    >
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: colors.primarySubtle,
            marginRight: spacing.md,
          },
        ]}
      >
        <Text
          style={{
            color: colors.primary,
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.semibold,
          }}
        >
          {avatarInitial}
        </Text>
      </View>
      <View style={styles.flex}>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.semibold,
          }}
        >
          {displayName}
        </Text>
        {maskedHint ? (
          <Text
            style={{
              color: colors.textMuted,
              fontSize: typography.fontSize.sm,
              marginTop: spacing.xxs,
            }}
          >
            {maskedHint}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  flex: {
    flex: 1,
  },
  row: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
  },
});
