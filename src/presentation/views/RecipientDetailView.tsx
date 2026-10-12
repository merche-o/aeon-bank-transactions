import { useNavigation } from '@react-navigation/native';
import { useLayoutEffect, useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { obfuscateAccountHint } from '@/security';
import { useTheme } from '@/theme';

import { useRecipientDetailViewModel } from '../viewmodels/useRecipientDetailViewModel';
import type { DaySection } from '@/utils/groupTransactionsByDay';

import { ActionFab } from '../widgets/ActionFab';
import { DaySeparator } from '../widgets/DaySeparator';
import { StateMessage } from '../widgets/StateMessage';
import { TransactionCard } from '../widgets/TransactionCard';

export type RecipientDetailViewProps = {
  recipientId: string;
};

const TAB_BAR_FAB_OFFSET = 56;

export function RecipientDetailView({ recipientId }: RecipientDetailViewProps) {
  const navigation = useNavigation();
  const vm = useRecipientDetailViewModel(recipientId);
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  const fabActions = useMemo(
    () => [
      {
        key: 'send',
        label: vm.labels.send,
        onPress: vm.openSend,
        testID: 'action-fab-send',
      },
      {
        key: 'request',
        label: vm.labels.request,
        onPress: vm.openRequest,
        testID: 'action-fab-request',
      },
      {
        key: 'delete',
        label: vm.labels.delete,
        onPress: vm.confirmDelete,
        testID: 'action-fab-delete',
        destructive: true,
      },
    ],
    [
      vm.labels.send,
      vm.labels.request,
      vm.labels.delete,
      vm.openSend,
      vm.openRequest,
      vm.confirmDelete,
    ],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: vm.recipient?.displayName ?? '',
    });
  }, [navigation, vm.recipient?.displayName]);

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

  const maskedAccount = obfuscateAccountHint(vm.recipient.accountHint);

  const listHeader = (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: typography.fontSize.xxl,
          fontWeight: typography.fontWeight.bold,
        }}
      >
        {vm.recipient.displayName}
      </Text>
      {maskedAccount ? (
        <Text
          style={{
            color: colors.textMuted,
            fontSize: typography.fontSize.sm,
            marginTop: spacing.xs,
          }}
        >
          {maskedAccount}
        </Text>
      ) : null}

      <Text
        style={{
          color: colors.textPrimary,
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          marginBottom: spacing.sm,
          marginTop: spacing.xl,
        }}
        testID="recipient-history-title"
      >
        {vm.labels.history}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.flex, { backgroundColor: colors.background }]}
      testID="recipient-detail-screen"
    >
      <SectionList
        contentContainerStyle={{ paddingBottom: spacing.lg }}
        keyExtractor={(item) => item.refId}
        ListEmptyComponent={
          <View style={{ paddingHorizontal: spacing.lg }}>
            <StateMessage title={vm.labels.noHistory} />
          </View>
        }
        ListHeaderComponent={listHeader}
        renderItem={({ item }) => (
          <TransactionCard
            locale={vm.locale}
            onPress={vm.openHistoryDetail}
            transaction={item}
          />
        )}
        renderSectionHeader={({ section }: { section: DaySection }) => (
          <DaySeparator dayKey={section.key} title={section.title} />
        )}
        sections={vm.historySections}
        stickySectionHeadersEnabled
        testID="recipient-history-list"
      />
      <ActionFab
        accessibilityLabelClose={vm.labels.fabClose}
        accessibilityLabelOpen={vm.labels.fabOpen}
        actions={fabActions}
        bottomOffset={TAB_BAR_FAB_OFFSET}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
