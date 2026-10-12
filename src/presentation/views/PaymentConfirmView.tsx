import { useLayoutEffect } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/theme';

import { usePaymentConfirmViewModel } from '../viewmodels/usePaymentConfirmViewModel';

export function PaymentConfirmView() {
  const navigation = useNavigation();
  const vm = usePaymentConfirmViewModel();
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: vm.labels.title,
      headerBackVisible: false,
      gestureEnabled: false,
    });
  }, [navigation, vm.labels.title]);

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.root, { backgroundColor: colors.background }]}
      testID="payment-confirm"
    >
      <View style={[styles.content, { paddingHorizontal: spacing.lg }]}>
        <Animated.View
          style={[
            styles.checkWrap,
            {
              backgroundColor: colors.primarySubtle,
              opacity: vm.opacity,
              transform: [{ scale: vm.scale }],
              marginBottom: spacing.lg,
            },
          ]}
          testID="payment-confirm-success"
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: 36,
              fontWeight: typography.fontWeight.bold,
            }}
          >
            ✓
          </Text>
        </Animated.View>

        <Text
          style={{
            color: colors.textPrimary,
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            marginBottom: spacing.lg,
            textAlign: 'center',
          }}
        >
          {vm.labels.success}
        </Text>

        {vm.showDetails ? (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderSubtle,
                padding: spacing.lg,
                gap: spacing.md,
              },
            ]}
            testID="payment-confirm-details"
          >
            <DetailRow
              label={vm.labels.amount}
              value={vm.amountFormatted}
            />
            <DetailRow
              label={vm.labels.recipient}
              value={vm.recipientName}
            />
            {vm.transferName ? (
              <DetailRow
                label={vm.labels.transferName}
                value={vm.transferName}
              />
            ) : null}
            <DetailRow
              label={vm.labels.category}
              value={vm.categoryLabel}
            />
            <DetailRow label={vm.labels.date} value={vm.dateLabel} />
            <DetailRow label={vm.labels.status} value={vm.statusLabel} />
          </View>
        ) : null}
      </View>

      <View
        style={[
          styles.actions,
          {
            gap: spacing.sm,
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.lg,
          },
        ]}
      >
        {vm.canOpenDetail ? (
          <Pressable
            accessibilityRole="button"
            onPress={vm.openDetail}
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                borderColor: colors.borderSubtle,
                opacity: pressed ? 0.88 : 1,
                paddingVertical: spacing.md,
              },
            ]}
            testID="payment-confirm-view-detail"
          >
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSize.md,
                fontWeight: typography.fontWeight.semibold,
                textAlign: 'center',
              }}
            >
              {vm.labels.viewDetail}
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={vm.done}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.88 : 1,
              paddingVertical: spacing.md,
            },
          ]}
          testID="payment-confirm-done"
        >
          <Text
            style={{
              color: colors.textInverse,
              fontSize: typography.fontSize.md,
              fontWeight: typography.fontWeight.semibold,
              textAlign: 'center',
            }}
          >
            {vm.labels.done}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  const { colors, typography } = theme;
  return (
    <View style={styles.row}>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: typography.fontSize.sm,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: colors.textPrimary,
          flex: 1,
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.medium,
          textAlign: 'right',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    width: '100%',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    width: '100%',
  },
  checkWrap: {
    alignItems: 'center',
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  primaryButton: {
    borderRadius: 12,
  },
  root: {
    flex: 1,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
  },
});
