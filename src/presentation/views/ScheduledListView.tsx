import { useNavigation } from '@react-navigation/native';
import { useLayoutEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { formatDate } from '@/utils/formatDate';

import { useScheduledListViewModel } from '../viewmodels/useScheduledListViewModel';
import { AmountText } from '../widgets/AmountText';
import { EmptyState } from '../widgets/EmptyState';

export function ScheduledListView() {
  const navigation = useNavigation();
  const vm = useScheduledListViewModel();
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  useLayoutEffect(() => {
    navigation.setOptions({ title: vm.labels.title });
  }, [navigation, vm.labels.title]);

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.flex, { backgroundColor: colors.background }]}
      testID="scheduled-list-screen"
    >
      <FlatList
        contentContainerStyle={
          vm.scheduled.length === 0 ? styles.emptyContainer : { paddingVertical: spacing.md }
        }
        data={vm.scheduled}
        keyExtractor={(item) => item.refId}
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
            testID={`scheduled-row-${item.refId}`}
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
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: typography.fontSize.sm,
                  marginTop: spacing.xxs,
                }}
              >
                {formatDate(item.scheduledFor ?? item.transferDate)}
              </Text>
            </View>
            <AmountText amount={item.amount} />
            <Pressable
              accessibilityRole="button"
              onPress={() => vm.cancel(item.refId)}
              style={({ pressed }) => [
                styles.cancelButton,
                {
                  borderColor: colors.error,
                  marginLeft: spacing.sm,
                  opacity: pressed ? 0.85 : 1,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                },
              ]}
              testID={`scheduled-cancel-${item.refId}`}
            >
              <Text
                style={{
                  color: colors.error,
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.medium,
                }}
              >
                {vm.labels.cancel}
              </Text>
            </Pressable>
          </View>
        )}
        testID="scheduled-list"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cancelButton: {
    borderRadius: 8,
    borderWidth: 1,
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
