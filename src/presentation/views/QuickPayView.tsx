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

import {
  useQuickPayViewModel,
  type PayTiming,
} from '../viewmodels/useQuickPayViewModel';
import { CategorySelectChips } from '../widgets/CategorySelectChips';
import { DateField } from '../widgets/DateField';
import { FormField } from '../widgets/FormField';
import { SegmentToggle } from '../widgets/SegmentToggle';
import { StateMessage } from '../widgets/StateMessage';

export type QuickPayViewProps = {
  recipientId: string;
};

export function QuickPayView({ recipientId }: QuickPayViewProps) {
  const navigation = useNavigation();
  const vm = useQuickPayViewModel(recipientId);
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  useLayoutEffect(() => {
    navigation.setOptions({ title: vm.transferTitle });
  }, [navigation, vm.transferTitle]);

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

  const bannerMessage =
    vm.submitError ??
    (vm.showInsufficientFunds ? vm.insufficientFundsMessage : null);

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.flex, { backgroundColor: colors.background }]}
      testID="quick-pay-screen"
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
          <SegmentToggle<PayTiming>
            onChange={vm.setTiming}
            options={[
              {
                value: 'now',
                label: vm.labels.sendNow,
                testID: 'quick-pay-timing-now',
              },
              {
                value: 'schedule',
                label: vm.labels.schedule,
                testID: 'quick-pay-timing-schedule',
              },
            ]}
            testID="quick-pay-timing"
            value={vm.timing}
            variant="chips"
          />

          <FormField label={vm.labels.amount}>
            <TextInput
              keyboardType="decimal-pad"
              onChangeText={vm.setAmountText}
              placeholder={vm.labels.amountPlaceholder}
              placeholderTextColor={colors.textMuted}
              style={inputStyle(colors, typography)}
              testID="quick-pay-amount"
              value={vm.amountText}
            />
          </FormField>

          <FormField label={vm.labels.transferName}>
            <TextInput
              onChangeText={vm.setTransferNameDraft}
              placeholder={vm.transferTitle}
              placeholderTextColor={colors.textMuted}
              style={inputStyle(colors, typography)}
              testID="quick-pay-transfer-name"
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
            testIDPrefix="quick-pay-category"
            value={vm.category}
          />

          {vm.timing === 'schedule' ? (
            <DateField
              label={vm.labels.scheduleDate}
              minimumDate={vm.minimumScheduleDate}
              onChange={vm.setScheduleDateIso}
              testID="quick-pay-schedule-date"
              valueIso={vm.scheduleDateIso}
            />
          ) : null}

          {bannerMessage ? (
            <Text
              style={{
                color: colors.error,
                fontSize: typography.fontSize.sm,
                marginTop: spacing.lg,
              }}
              testID="insufficient-funds-banner"
            >
              {bannerMessage}
            </Text>
          ) : null}

          <Pressable
            accessibilityLabel={vm.confirmLabel}
            accessibilityRole="button"
            disabled={!vm.canConfirm}
            onPress={() => void vm.confirm()}
            style={({ pressed }) => [
              styles.confirmButton,
              {
                backgroundColor: vm.canConfirm
                  ? colors.primary
                  : colors.borderSubtle,
                marginTop: spacing.xl,
                opacity: pressed && vm.canConfirm ? 0.9 : 1,
                paddingVertical: spacing.lg,
              },
            ]}
            testID="quick-pay-confirm"
          >
            <Text
              style={{
                color: vm.canConfirm ? colors.textInverse : colors.textMuted,
                fontSize: typography.fontSize.md,
                fontWeight: typography.fontWeight.semibold,
                textAlign: 'center',
              }}
            >
              {vm.confirmLabel}
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
  confirmButton: {
    borderRadius: 12,
  },
  flex: {
    flex: 1,
  },
});
