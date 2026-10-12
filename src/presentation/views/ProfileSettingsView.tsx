import { useNavigation } from '@react-navigation/native';
import { useLayoutEffect } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { useProfileSettingsViewModel } from '../viewmodels/useProfileSettingsViewModel';

export function ProfileSettingsView() {
  const navigation = useNavigation();
  const vm = useProfileSettingsViewModel();
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  useLayoutEffect(() => {
    navigation.setOptions({ title: vm.labels.title });
  }, [navigation, vm.labels.title]);

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.flex, { backgroundColor: colors.background }]}
      testID="profile-settings-screen"
    >
      <View style={{ padding: spacing.lg }}>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSize.sm,
            marginBottom: spacing.xs,
          }}
        >
          {vm.labels.name}
        </Text>
        <TextInput
          onChangeText={vm.setName}
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              borderColor: colors.borderSubtle,
              color: colors.textPrimary,
              fontSize: typography.fontSize.md,
            },
          ]}
          testID="profile-name-input"
          value={vm.name}
        />

        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.fontSize.sm,
            marginBottom: spacing.xs,
            marginTop: spacing.lg,
          }}
        >
          {vm.labels.age}
        </Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={vm.setAgeText}
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              borderColor: colors.borderSubtle,
              color: colors.textPrimary,
              fontSize: typography.fontSize.md,
            },
          ]}
          testID="profile-age-input"
          value={vm.ageText}
        />

        <Pressable
          accessibilityRole="button"
          onPress={vm.save}
          style={({ pressed }) => [
            styles.saveButton,
            {
              backgroundColor: colors.primary,
              marginTop: spacing.xl,
              opacity: pressed ? 0.9 : 1,
              paddingVertical: spacing.lg,
            },
          ]}
          testID="profile-save-button"
        >
          <Text
            style={{
              color: colors.textInverse,
              fontSize: typography.fontSize.md,
              fontWeight: typography.fontWeight.semibold,
              textAlign: 'center',
            }}
          >
            {vm.labels.save}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  saveButton: {
    borderRadius: 12,
  },
});
