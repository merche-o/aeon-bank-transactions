import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { formatDate } from '@/utils/formatDate';

import { useTransactionDetailViewModel } from '../viewmodels/useTransactionDetailViewModel';
import { AmountText } from '../widgets/AmountText';
import { StateMessage } from '../widgets/StateMessage';

export type TransactionDetailViewProps = {
  refId: string;
};

function DetailRow({
  label,
  value,
  testID,
}: {
  label: string;
  value: string;
  testID?: string;
}) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <View
      style={[
        styles.row,
        {
          borderBottomColor: colors.borderSubtle,
          paddingVertical: spacing.md,
        },
      ]}
      testID={testID}
    >
      <Text
        style={{
          color: colors.textMuted,
          fontSize: typography.fontSize.sm,
          marginBottom: spacing.xxs,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.medium,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export function TransactionDetailView({ refId }: TransactionDetailViewProps) {
  const vm = useTransactionDetailViewModel(refId);
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

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
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => void vm.share()}
          style={({ pressed }) => [
            styles.shareButton,
            {
              backgroundColor: colors.primary,
              marginTop: spacing.xl,
              opacity: pressed ? 0.9 : 1,
              paddingVertical: spacing.lg,
            },
          ]}
          testID="share-button"
        >
          <Text
            style={{
              color: colors.textInverse,
              fontSize: typography.fontSize.md,
              fontWeight: typography.fontWeight.semibold,
              textAlign: 'center',
            }}
          >
            {vm.labels.shareButton}
          </Text>
        </Pressable>
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
  receipt: {
    borderRadius: 16,
    borderWidth: 1,
  },
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  shareButton: {
    borderRadius: 12,
  },
});
