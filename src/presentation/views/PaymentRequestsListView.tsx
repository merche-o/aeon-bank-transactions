import { useNavigation } from '@react-navigation/native';
import { useLayoutEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { usePaymentRequestsListViewModel } from '../viewmodels/usePaymentRequestsListViewModel';
import { AmountText } from '../widgets/AmountText';
import { EmptyState } from '../widgets/EmptyState';

export function PaymentRequestsListView() {
  const navigation = useNavigation();
  const vm = usePaymentRequestsListViewModel();
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  useLayoutEffect(() => {
    navigation.setOptions({ title: vm.labels.title });
  }, [navigation, vm.labels.title]);

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.flex, { backgroundColor: colors.background }]}
      testID="payment-requests-list-screen"
    >
      <FlatList
        contentContainerStyle={
          vm.pendingRows.length === 0
            ? styles.emptyContainer
            : { paddingVertical: spacing.md }
        }
        data={vm.pendingRows}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState title={vm.labels.empty} />}
        renderItem={({ item }) => (
          <View
            style={[
              styles.row,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderSubtle,
                marginHorizontal: spacing.lg,
                marginBottom: spacing.sm,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.md,
              },
            ]}
            testID={`payment-request-row-${item.id}`}
          >
            <View style={styles.flex}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: typography.fontSize.md,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                {item.recipientName}
              </Text>
              {item.note ? (
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: typography.fontSize.sm,
                    marginTop: spacing.xxs,
                  }}
                >
                  {item.note}
                </Text>
              ) : null}
            </View>
            <AmountText amount={item.amount} />
            <View style={[styles.actions, { marginLeft: spacing.sm }]}>
              <Pressable
                accessibilityRole="button"
                onPress={() => vm.markPaid(item.id)}
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.9 : 1,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                  },
                ]}
                testID={`payment-request-paid-${item.id}`}
              >
                <Text
                  style={{
                    color: colors.textInverse,
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.medium,
                  }}
                >
                  {vm.labels.markPaid}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => vm.cancelRequest(item.id)}
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    borderColor: colors.borderSubtle,
                    borderWidth: 1,
                    marginTop: spacing.xxs,
                    opacity: pressed ? 0.85 : 1,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xxs,
                  },
                ]}
                testID={`payment-request-cancel-${item.id}`}
              >
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: typography.fontSize.xs,
                  }}
                >
                  {vm.labels.cancel}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
        testID="payment-requests-list"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    borderRadius: 8,
  },
  actions: {
    alignItems: 'stretch',
  },
  emptyContainer: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
  row: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
  },
});
