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

import { useAddRecipientViewModel } from '../viewmodels/useAddRecipientViewModel';
import { FormField } from '../widgets/FormField';

export function AddRecipientView() {
  const navigation = useNavigation();
  const vm = useAddRecipientViewModel();
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  useLayoutEffect(() => {
    navigation.setOptions({ title: vm.labels.title });
  }, [navigation, vm.labels.title]);

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.flex, { backgroundColor: colors.background }]}
      testID="add-recipient-screen"
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
          <FormField label={vm.labels.name}>
            <TextInput
              onChangeText={vm.setDisplayName}
              placeholderTextColor={colors.textMuted}
              style={inputStyle(colors, typography)}
              testID="add-recipient-name"
              value={vm.displayName}
            />
          </FormField>
          <FormField label={vm.labels.accountHint}>
            <TextInput
              onChangeText={vm.setAccountHint}
              placeholderTextColor={colors.textMuted}
              style={inputStyle(colors, typography)}
              testID="add-recipient-hint"
              value={vm.accountHint}
            />
          </FormField>

          <Pressable
            accessibilityLabel={vm.labels.save}
            accessibilityRole="button"
            disabled={!vm.canSave}
            onPress={() => void vm.save()}
            style={({ pressed }) => [
              styles.saveButton,
              {
                backgroundColor: vm.canSave
                  ? colors.primary
                  : colors.borderSubtle,
                marginTop: spacing.xl,
                opacity: pressed && vm.canSave ? 0.9 : 1,
                paddingVertical: spacing.lg,
              },
            ]}
            testID="add-recipient-save"
          >
            <Text
              style={{
                color: vm.canSave ? colors.textInverse : colors.textMuted,
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

function inputStyle(
  colors: ReturnType<typeof useTheme>['colors'],
  typography: ReturnType<typeof useTheme>['typography'],
) {
  return {
    borderColor: colors.borderSubtle,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  };
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  saveButton: {
    borderRadius: 12,
  },
});
