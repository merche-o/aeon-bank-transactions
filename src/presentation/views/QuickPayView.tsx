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

import {
  useQuickPayViewModel,
  type PayTiming,
} from '../viewmodels/useQuickPayViewModel';
import { CategorySelectChips } from '../widgets/CategorySelectChips';
import { DateField } from '../widgets/DateField';
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

  const confirmLabel =
    vm.timing === 'now' ? vm.labels.confirmSend : vm.labels.confirmSchedule;

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.flex, { backgroundColor: colors.background }]}
      testID="quick-pay-screen"
    >
      <ScrollView
        contentContainerStyle={{
          paddingBottom: spacing.xxxl,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <TimingToggle
          onChange={vm.setTiming}
          scheduleLabel={vm.labels.schedule}
          sendNowLabel={vm.labels.sendNow}
          timing={vm.timing}
        />

        <Field label={vm.labels.amount}>
          <TextInput
            keyboardType="decimal-pad"
            onChangeText={vm.setAmountText}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            style={inputStyle(colors, typography)}
            testID="quick-pay-amount"
            value={vm.amountText}
          />
        </Field>

        <Field label={vm.labels.transferName}>
          <TextInput
            onChangeText={vm.setTransferNameDraft}
            placeholder={vm.transferTitle}
            placeholderTextColor={colors.textMuted}
            style={inputStyle(colors, typography)}
            testID="quick-pay-transfer-name"
            value={vm.transferNameDraft}
          />
        </Field>

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

        {vm.showInsufficientFunds ? (
          <Text
            style={{
              color: colors.error,
              fontSize: typography.fontSize.sm,
              marginTop: spacing.lg,
            }}
            testID="insufficient-funds-banner"
          >
            {vm.insufficientFundsMessage}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={!vm.canConfirm}
          onPress={() => void vm.confirm()}
          style={({ pressed }) => [
            styles.confirmButton,
            {
              backgroundColor: vm.canConfirm ? colors.primary : colors.borderSubtle,
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
            {confirmLabel}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function TimingToggle({
  timing,
  onChange,
  sendNowLabel,
  scheduleLabel,
}: {
  timing: PayTiming;
  onChange: (value: PayTiming) => void;
  sendNowLabel: string;
  scheduleLabel: string;
}) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <View style={[styles.timingRow, { gap: spacing.sm, marginBottom: spacing.md }]}>
      {(['now', 'schedule'] as const).map((option) => {
        const selected = timing === option;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option)}
            style={[
              styles.timingChip,
              {
                backgroundColor: selected ? colors.primarySubtle : colors.surface,
                borderColor: selected ? colors.primary : colors.borderSubtle,
                flex: 1,
                paddingVertical: spacing.md,
              },
            ]}
            testID={`quick-pay-timing-${option}`}
          >
            <Text
              style={{
                color: selected ? colors.primaryMuted : colors.textSecondary,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                textAlign: 'center',
              }}
            >
              {option === 'now' ? sendNowLabel : scheduleLabel}
            </Text>
          </Pressable>
        );
      })}
    </View>
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
  confirmButton: {
    borderRadius: 12,
  },
  flex: {
    flex: 1,
  },
  timingChip: {
    borderRadius: 10,
    borderWidth: 1,
  },
  timingRow: {
    flexDirection: 'row',
  },
});
