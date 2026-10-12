import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme';

export type ProfileAvatarProps = {
  initial: string;
  onPress: () => void;
  testID?: string;
  accessibilityLabel?: string;
};

export function ProfileAvatar({
  initial,
  onPress,
  testID = 'profile-header-button',
  accessibilityLabel,
}: ProfileAvatarProps) {
  const theme = useTheme();
  const { colors, typography } = theme;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.avatar,
        {
          backgroundColor: colors.primarySubtle,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      testID={testID}
    >
      <Text
        style={{
          color: colors.primary,
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
        }}
      >
        {initial}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});
