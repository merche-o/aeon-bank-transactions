import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLayoutEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { formatDate } from '@/utils/formatDate';

import { useTransactionDetailViewModel } from '../viewmodels/useTransactionDetailViewModel';
import { AmountText } from '../widgets/AmountText';
import { CategorySelectChips } from '../widgets/CategorySelectChips';
import { DetailRow } from '../widgets/DetailRow';
import { StateMessage } from '../widgets/StateMessage';

export type TransactionDetailViewProps = {
  refId: string;
};

export function TransactionDetailView({ refId }: TransactionDetailViewProps) {
  const navigation = useNavigation();
  const vm = useTransactionDetailViewModel(refId);
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: vm.labels.title,
      headerRight:
        vm.transaction == null
          ? undefined
          : () => (
              <Pressable
                accessibilityLabel={vm.labels.shareButton}
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => void vm.share()}
                style={({ pressed }) => ({
                  marginRight: 4,
                  opacity: pressed ? 0.7 : 1,
                  padding: 8,
                })}
                testID="share-button"
              >
                <Ionicons
                  color={colors.primary}
                  name="share-outline"
                  size={22}
                />
              </Pressable>
            ),
    });
  }, [
    colors.primary,
    navigation,
    vm.labels.shareButton,
    vm.labels.title,
    vm.share,
    vm.transaction,
  ]);

  if (vm.transaction == null) {
    return (
      <SafeAreaView
        edges={['bottom', 'left', 'right']}
        style={[styles.flex, { backgroundColor: colors.background }]}
        testID="transaction-detail-not-found"
      >
        <StateMessage
          message={vm.labels.notFoundMessage}
          testID="not-found-state"
          title={vm.labels.notFoundTitle}
        />
      </SafeAreaView>
    );
  }

  const { transaction } = vm;

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.flex, { backgroundColor: colors.background }]}
      testID="transaction-detail"
    >
      <ScrollView
        contentContainerStyle={{
          paddingBottom: spacing.xxxl,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
        }}
      >
        <View
          style={[
            styles.receipt,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderSubtle,
              padding: spacing.xl,
            },
          ]}
        >
          <Text
            style={{
              color: colors.navy,
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.bold,
              marginBottom: spacing.lg,
            }}
          >
            {vm.labels.title}
          </Text>

          <View style={[styles.amountBlock, { marginBottom: spacing.lg }]}>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: typography.fontSize.sm,
                marginBottom: spacing.xs,
              }}
            >
              {vm.labels.amount}
            </Text>
            <AmountText
              amount={transaction.amount}
              style={{ fontSize: typography.fontSize.xxl }}
              testID="detail-amount"
            />
          </View>

          <DetailRow
            label={vm.labels.reference}
            testID="detail-reference"
            value={transaction.refId}
          />
          <DetailRow
            label={vm.labels.date}
            testID="detail-date"
            value={formatDate(transaction.transferDate)}
          />
          <DetailRow
            label={vm.labels.recipient}
            testID="detail-recipient"
            value={transaction.recipientName}
          />
          <DetailRow
            label={vm.labels.transferName}
            testID="detail-transfer-name"
            value={transaction.transferName}
          />
          <DetailRow
            label={vm.labels.category}
            testID="detail-category"
            value={vm.categoryLabel}
          />
          {vm.statusLabel ? (
            <DetailRow
              label={vm.labels.status}
              testID="detail-status"
              value={vm.statusLabel}
            />
          ) : null}
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              marginBottom: spacing.sm,
            }}
          >
            {vm.labels.category}
          </Text>
          <CategorySelectChips
            locale={vm.locale}
            onChange={vm.updateCategory}
            testIDPrefix="detail-category"
            value={transaction.category}
          />
        </View>

        {vm.showSettleActions ? (
          <View style={{ gap: spacing.sm, marginTop: spacing.xl }}>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: typography.fontSize.sm,
                marginBottom: spacing.xs,
              }}
              testID="detail-pending-exercise-note"
            >
              {vm.labels.exerciseNote}
            </Text>
            {vm.settleError ? (
              <Text
                style={{
                  color: colors.error,
                  fontSize: typography.fontSize.sm,
                }}
                testID="detail-settle-error"
              >
                {vm.settleError}
              </Text>
            ) : null}
            <Pressable
              accessibilityLabel={vm.labels.markPaid}
              accessibilityRole="button"
              disabled={!vm.canSettlePending}
              onPress={() => void vm.markPaid()}
              style={({ pressed }) => [
                styles.primaryButton,
                {
                  backgroundColor: vm.canSettlePending
                    ? colors.primary
                    : colors.borderSubtle,
                  opacity: pressed && vm.canSettlePending ? 0.88 : 1,
                  paddingVertical: spacing.md,
                },
              ]}
              testID="detail-mark-paid"
            >
              <Text
                style={{
                  color: vm.canSettlePending
                    ? colors.textInverse
                    : colors.textMuted,
                  fontSize: typography.fontSize.md,
                  fontWeight: typography.fontWeight.semibold,
                  textAlign: 'center',
                }}
              >
                {vm.labels.markPaid}
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel={vm.labels.cancelRequest}
              accessibilityRole="button"
              disabled={!vm.canSettlePending}
              onPress={() => void vm.cancelPending()}
              style={({ pressed }) => [
                styles.secondaryButton,
                {
                  borderColor: colors.borderSubtle,
                  opacity: pressed && vm.canSettlePending ? 0.88 : vm.canSettlePending ? 1 : 0.5,
                  paddingVertical: spacing.md,
                },
              ]}
              testID="detail-cancel-request"
            >
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: typography.fontSize.md,
                  fontWeight: typography.fontWeight.semibold,
                  textAlign: 'center',
                }}
              >
                {vm.labels.cancelRequest}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  amountBlock: {
    alignItems: 'flex-start',
  },
  flex: {
    flex: 1,
  },
  primaryButton: {
    borderRadius: 12,
  },
  receipt: {
    borderRadius: 16,
    borderWidth: 1,
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
  },
});
