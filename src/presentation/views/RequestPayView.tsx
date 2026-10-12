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

import { useRequestPayViewModel } from '../viewmodels/useRequestPayViewModel';
import { CategorySelectChips } from '../widgets/CategorySelectChips';
import { FormField } from '../widgets/FormField';
import { StateMessage } from '../widgets/StateMessage';

export type RequestPayViewProps = {
  recipientId: string;
};

export function RequestPayView({ recipientId }: RequestPayViewProps) {
  const navigation = useNavigation();
  const vm = useRequestPayViewModel(recipientId);
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  useLayoutEffect(() => {
    navigation.setOptions({ title: vm.labels.title });
  }, [navigation, vm.labels.title]);

  if (!vm.recipient) {
    return (
      <SafeAreaView
        edges={['bottom', 'left', 'right']}
        style={[styles.flex, { backgroundColor: colors.background }]}
      >
        <StateMessage title={vm.labels.notFound} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.flex, { backgroundColor: colors.background }]}
      testID="request-pay-screen"
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
          <FormField label={vm.labels.amount}>
            <TextInput
              keyboardType="decimal-pad"
              onChangeText={vm.setAmountText}
              placeholder={vm.labels.amountPlaceholder}
              placeholderTextColor={colors.textMuted}
              style={inputStyle(colors, typography)}
              testID="request-pay-amount"
              value={vm.amountText}
            />
          </FormField>

          <FormField label={vm.labels.transferName}>
            <TextInput
              onChangeText={vm.setTransferNameDraft}
              placeholderTextColor={colors.textMuted}
              style={inputStyle(colors, typography)}
              testID="request-pay-transfer-name"
              value={vm.transferNameDraft}
            />
          </FormField>

          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              marginBottom: spacing.sm,
              marginTop: spacing.md,
            }}
          >
            {vm.labels.category}
          </Text>
          <CategorySelectChips
            locale={vm.locale}
            onChange={vm.setCategory}
            testIDPrefix="request-pay-category"
            value={vm.category}
          />

          <FormField label={vm.labels.note}>
            <TextInput
              multiline
              numberOfLines={3}
              onChangeText={vm.setNote}
              placeholderTextColor={colors.textMuted}
              style={[
                inputStyle(colors, typography),
                { minHeight: 80, textAlignVertical: 'top' },
              ]}
              testID="request-pay-note"
              value={vm.note}
            />
          </FormField>

          {vm.submitError ? (
            <Text
              style={{
                color: colors.error,
                fontSize: typography.fontSize.sm,
                marginTop: spacing.lg,
              }}
              testID="request-pay-error"
            >
              {vm.submitError}
            </Text>
          ) : null}

          <Pressable
            accessibilityLabel={vm.createLabel}
            accessibilityRole="button"
            disabled={!vm.canCreate}
            onPress={() => void vm.createRequest()}
            style={({ pressed }) => [
              styles.saveButton,
              {
                backgroundColor: vm.canCreate
                  ? colors.primary
                  : colors.borderSubtle,
                marginTop: spacing.xl,
                opacity: pressed && vm.canCreate ? 0.9 : 1,
                paddingVertical: spacing.lg,
              },
            ]}
            testID="request-pay-create"
          >
            <Text
              style={{
                color: vm.canCreate ? colors.textInverse : colors.textMuted,
                fontSize: typography.fontSize.md,
                fontWeight: typography.fontWeight.semibold,
                textAlign: 'center',
              }}
            >
              {vm.createLabel}
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
