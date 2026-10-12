import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLayoutEffect, type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { useAddTransactionViewModel } from '../viewmodels/useAddTransactionViewModel';
import { CategorySelectChips } from '../widgets/CategorySelectChips';

export function AddTransactionView() {
  const navigation = useNavigation();
  const vm = useAddTransactionViewModel();
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  useLayoutEffect(() => {
    navigation.setOptions({ title: vm.labels.title });
  }, [navigation, vm.labels.title]);

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.flex, { backgroundColor: colors.background }]}
      testID="add-transaction-screen"
    >
      <ScrollView
        contentContainerStyle={{
          paddingBottom: spacing.xxxl,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <FlowToggle
          expenseLabel={vm.labels.expense}
          flow={vm.flow}
          incomeLabel={vm.labels.income}
          onChange={vm.setFlow}
        />

        <Field label={vm.labels.transferName}>
          <TextInput
            onChangeText={vm.setTransferName}
            placeholderTextColor={colors.textMuted}
            style={inputStyle(colors, typography)}
            testID="add-transfer-name"
            value={vm.transferName}
          />
        </Field>
        <Field label={vm.labels.recipient}>
          <TextInput
            onChangeText={vm.setRecipient}
            placeholderTextColor={colors.textMuted}
            style={inputStyle(colors, typography)}
            testID="add-recipient"
            value={vm.recipient}
          />
        </Field>
        <Field label={vm.labels.amount}>
          <TextInput
            keyboardType="decimal-pad"
            onChangeText={vm.setAmountText}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            style={inputStyle(colors, typography)}
            testID="add-amount"
            value={vm.amountText}
          />
        </Field>

        <Field label={vm.labels.date}>
          {Platform.OS === 'web' ? (
            <TextInput
              onChangeText={(text) => {
                if (text.trim()) {
                  vm.setTransferDate(`${text}T12:00:00.000Z`);
                }
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              style={inputStyle(colors, typography)}
              testID="add-date"
              value={vm.transferDate.slice(0, 10)}
            />
          ) : (
            <DateTimePicker
              mode="date"
              onChange={(_, date) => {
                if (date) {
                  vm.setTransferDate(date.toISOString());
                }
              }}
              testID="add-date"
              value={new Date(vm.transferDate)}
            />
          )}
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
          testIDPrefix="add-category"
          value={vm.category}
        />

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
          testID="save-transaction"
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

function FlowToggle({
  flow,
  onChange,
  expenseLabel,
  incomeLabel,
}: {
  flow: 'income' | 'expense';
  onChange: (flow: 'income' | 'expense') => void;
  expenseLabel: string;
  incomeLabel: string;
}) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <View style={[styles.flowRow, { gap: spacing.sm }]}>
      {(['expense', 'income'] as const).map((option) => {
        const selected = flow === option;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option)}
            style={[
              styles.flowChip,
              {
                backgroundColor: selected ? colors.primarySubtle : colors.surface,
                borderColor: selected ? colors.primary : colors.borderSubtle,
                flex: 1,
                paddingVertical: spacing.md,
              },
            ]}
            testID={`add-flow-${option}`}
          >
            <Text
              style={{
                color: selected ? colors.primaryMuted : colors.textSecondary,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                textAlign: 'center',
              }}
            >
              {option === 'expense' ? expenseLabel : incomeLabel}
            </Text>
          </Pressable>
        );
      })}
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
  flowChip: {
    borderRadius: 10,
    borderWidth: 1,
  },
  flowRow: {
    flexDirection: 'row',
  },
  saveButton: {
    borderRadius: 12,
  },
});
