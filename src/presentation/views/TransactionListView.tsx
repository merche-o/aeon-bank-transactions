import { useMemo } from 'react';
import {
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { useTransactionListViewModel } from '../viewmodels/useTransactionListViewModel';
import { ActionFab } from '../widgets/ActionFab';
import { EmptyState } from '../widgets/EmptyState';
import { ErrorState } from '../widgets/ErrorState';
import { FilterToolbar } from '../widgets/FilterToolbar';
import { LoadingState } from '../widgets/LoadingState';
import { ProfileAvatar } from '../widgets/ProfileAvatar';
import { SearchBar } from '../widgets/SearchBar';
import { StateMessage } from '../widgets/StateMessage';
import type { DaySection } from '@/utils/groupTransactionsByDay';

import { DaySeparator } from '../widgets/DaySeparator';
import { TransactionCard } from '../widgets/TransactionCard';

const TAB_BAR_FAB_OFFSET = 56;

export function TransactionListView() {
  const vm = useTransactionListViewModel();
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  const fabActions = useMemo(
    () => [
      {
        key: 'transfer',
        label: vm.labels.transfer,
        onPress: () => vm.openPaymentStart('transfer'),
        testID: 'action-fab-transfer',
      },
      {
        key: 'request',
        label: vm.labels.request,
        onPress: () => vm.openPaymentStart('request'),
        testID: 'action-fab-request',
      },
    ],
    [
      vm.labels.transfer,
      vm.labels.request,
      vm.openPaymentStart,
    ],
  );

  const listHeader = (
    <View>
      <View
        style={[
          styles.headerTop,
          {
            marginBottom: spacing.sm,
            marginHorizontal: spacing.lg,
            marginTop: spacing.sm,
          },
        ]}
      >
        <ProfileAvatar
          accessibilityLabel={vm.greetingText}
          initial={vm.avatarInitial}
          onPress={vm.openProfile}
        />
        <Pressable
          accessibilityLabel={vm.labels.settings}
          accessibilityRole="button"
          onPress={vm.openDrawer}
          style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.8 : 1 }]}
          testID="settings-button"
        >
          <Ionicons color={colors.primary} name="settings-outline" size={24} />
        </Pressable>
      </View>

      <Text
        style={{
          color: colors.textPrimary,
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          marginBottom: spacing.xxs,
          marginHorizontal: spacing.lg,
        }}
        testID="greeting-text"
      >
        {vm.greetingText}
      </Text>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: typography.fontSize.sm,
          marginBottom: spacing.xxs,
          marginHorizontal: spacing.lg,
        }}
      >
        {vm.labels.balance}
      </Text>
      <Text
        style={{
          color: colors.navy,
          fontSize: typography.fontSize.xxl,
          fontWeight: typography.fontWeight.bold,
          marginBottom: vm.pendingIncoming > 0 ? spacing.xs : spacing.md,
          marginHorizontal: spacing.lg,
        }}
        testID="balance-amount"
      >
        {vm.balanceFormatted}
      </Text>
      {vm.pendingIncoming > 0 ? (
        <Text
          style={{
            color: colors.textMuted,
            fontSize: typography.fontSize.sm,
            marginBottom: spacing.md,
            marginHorizontal: spacing.lg,
          }}
          testID="pending-incoming-amount"
        >
          {vm.labels.pendingIncoming}: {vm.pendingIncomingFormatted}
        </Text>
      ) : null}

      <Text
        style={{
          color: colors.textPrimary,
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.bold,
          marginBottom: spacing.md,
          marginHorizontal: spacing.lg,
        }}
      >
        {vm.labels.title}
      </Text>

      <SearchBar
        accessibilityLabel={vm.labels.searchPlaceholder}
        onChangeText={vm.setQuery}
        placeholder={vm.labels.searchPlaceholder}
        value={vm.query}
      />
      <FilterToolbar
        categoryFilter={vm.categoryFilter}
        customEnd={vm.customEnd}
        customStart={vm.customStart}
        dateRange={vm.dateRange}
        labels={{
          type: vm.labels.filterType,
          category: vm.labels.filterCategory,
          categoryAll: vm.labels.categoryAll,
          dateTitle: vm.labels.dateTitle,
          dateAll: vm.labels.dateAll,
          lastWeek: vm.labels.lastWeek,
          lastMonth: vm.labels.lastMonth,
          dateCustom: vm.labels.dateCustom,
          apply: vm.labels.apply,
          dateSummaryAll: vm.labels.dateSummaryAll,
          dateSummary7d: vm.labels.dateSummary7d,
          dateSummary30d: vm.labels.dateSummary30d,
          dateSummaryCustom: vm.labels.dateSummaryCustom,
        }}
        locale={vm.locale}
        onChangeCategory={vm.setCategoryFilter}
        onChangeDateRange={vm.setDateRange}
        onChangeEnd={vm.setCustomEnd}
        onChangeStart={vm.setCustomStart}
        onChangeType={vm.setTypeFilter}
        typeFilter={vm.typeFilter}
        typeOptions={[...vm.typeFilterOptions]}
      />
    </View>
  );

  const shellStyle = [styles.flex, { backgroundColor: colors.background }];

  const refreshControl = (
    <RefreshControl
      colors={[colors.primary]}
      onRefresh={() => void vm.refresh()}
      refreshing={vm.isRefreshing}
      tintColor={colors.primary}
    />
  );

  const fab = (
    <ActionFab
      accessibilityLabelClose={vm.labels.fabClose}
      accessibilityLabelOpen={vm.labels.fabOpen}
      actions={fabActions}
      bottomOffset={TAB_BAR_FAB_OFFSET}
    />
  );

  if (vm.loading && vm.isEmpty && !vm.showNoMatchingResults) {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={shellStyle}
        testID="transaction-list"
      >
        {listHeader}
        <LoadingState message={vm.labels.loading} />
        {fab}
      </SafeAreaView>
    );
  }

  if (vm.showFullScreenError) {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={shellStyle}
        testID="transaction-list"
      >
        {listHeader}
        <ErrorState
          onRetry={() => void vm.refresh()}
          retryLabel={vm.labels.retry}
          title={vm.labels.error}
        />
        {fab}
      </SafeAreaView>
    );
  }

  if (vm.isEmpty) {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={shellStyle}
        testID="transaction-list"
      >
        {listHeader}
        <EmptyState title={vm.labels.empty} />
        {fab}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={shellStyle}
      testID="transaction-list"
    >
      <SectionList
        contentContainerStyle={
          vm.showNoMatchingResults ? styles.flexGrow : { paddingBottom: spacing.xxl }
        }
        keyExtractor={(item) => item.refId}
        ListEmptyComponent={
          vm.showNoMatchingResults ? (
            <StateMessage testID="no-results-state" title={vm.labels.noMatchingResults} />
          ) : null
        }
        ListHeaderComponent={listHeader}
        refreshControl={refreshControl}
        renderItem={({ item }) => (
          <TransactionCard locale={vm.locale} onPress={vm.openDetail} transaction={item} />
        )}
        renderSectionHeader={({ section }: { section: DaySection }) => (
          <DaySeparator dayKey={section.key} title={section.title} />
        )}
        sections={vm.showNoMatchingResults ? [] : vm.sections}
        stickySectionHeadersEnabled
        testID="transaction-list-flatlist"
      />
      {fab}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  flexGrow: {
    flexGrow: 1,
  },
  headerTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconButton: {
    padding: 4,
  },
});
