import { useNavigation } from '@react-navigation/native';
import { useLayoutEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { useProfileSettingsViewModel } from '../viewmodels/useProfileSettingsViewModel';
import { DateOfBirthFields } from '../widgets/DateOfBirthFields';
import { FormField } from '../widgets/FormField';

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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={{
            paddingBottom: spacing.xxxl,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <FormField label={vm.labels.firstName}>
            <TextInput
              onChangeText={vm.setFirstName}
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                {
                  borderColor: colors.borderSubtle,
                  color: colors.textPrimary,
                  fontSize: typography.fontSize.md,
                },
              ]}
              testID="profile-firstname-input"
              value={vm.firstName}
            />
          </FormField>

          <FormField label={vm.labels.lastName}>
            <TextInput
              onChangeText={vm.setLastName}
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                {
                  borderColor: colors.borderSubtle,
                  color: colors.textPrimary,
                  fontSize: typography.fontSize.md,
                },
              ]}
              testID="profile-lastname-input"
              value={vm.lastName}
            />
          </FormField>

          <FormField
            error={vm.dobError ?? undefined}
            label={vm.labels.dateOfBirth}
          >
            <DateOfBirthFields
              errorMessage={undefined}
              labels={vm.labels.dob}
              locale={vm.locale}
              onChange={vm.onDobPartsChange}
              value={vm.dobParts}
            />
          </FormField>

          <Pressable
            accessibilityLabel={vm.labels.save}
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
        </ScrollView>
      </KeyboardAvoidingView>
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
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  saveButton: {
    borderRadius: 12,
  },
});
