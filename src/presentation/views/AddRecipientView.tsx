import { useNavigation } from '@react-navigation/native';
import { useLayoutEffect, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { useAddRecipientViewModel } from '../viewmodels/useAddRecipientViewModel';

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
      <ScrollView
        contentContainerStyle={{
          paddingBottom: spacing.xxxl,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Field label={vm.labels.name}>
          <TextInput
            onChangeText={vm.setDisplayName}
            placeholderTextColor={colors.textMuted}
            style={inputStyle(colors, typography)}
            testID="add-recipient-name"
            value={vm.displayName}
          />
        </Field>
        <Field label={vm.labels.accountHint}>
          <TextInput
            onChangeText={vm.setAccountHint}
            placeholderTextColor={colors.textMuted}
            style={inputStyle(colors, typography)}
            testID="add-recipient-hint"
            value={vm.accountHint}
          />
        </Field>

        <Pressable
          accessibilityRole="button"
          disabled={!vm.canSave}
          onPress={() => void vm.save()}
          style={({ pressed }) => [
            styles.saveButton,
            {
              backgroundColor: vm.canSave ? colors.primary : colors.borderSubtle,
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
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <View style={{ marginTop: spacing.md }}>
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
    </View>
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
