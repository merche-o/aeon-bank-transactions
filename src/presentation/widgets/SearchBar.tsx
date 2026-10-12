import { StyleSheet, TextInput, View } from 'react-native';

import { useTheme } from '@/theme';

export type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  accessibilityLabel: string;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
}: SearchBarProps) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderSubtle,
          marginHorizontal: spacing.lg,
          marginBottom: spacing.md,
        },
      ]}
    >
      <TextInput
        accessibilityLabel={accessibilityLabel}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        style={{
          color: colors.textPrimary,
          flex: 1,
          fontSize: typography.fontSize.md,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
        }}
        testID="search-input"
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 12,
    borderWidth: 1,
  },
});
