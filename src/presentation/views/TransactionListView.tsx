import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { useTransactionListViewModel } from '../viewmodels/useTransactionListViewModel';
import { CategoryFilterChips } from '../widgets/CategoryFilterChips';
import { CustomDateRangeFields } from '../widgets/CustomDateRangeFields';
import { DateFilterChips, TypeFilterChips } from '../widgets/FilterChips';
import { EmptyState } from '../widgets/EmptyState';
import { ErrorState } from '../widgets/ErrorState';
import { LoadingState } from '../widgets/LoadingState';
import { SearchBar } from '../widgets/SearchBar';
import { StateMessage } from '../widgets/StateMessage';
import { TransactionCard } from '../widgets/TransactionCard';

export function TransactionListView() {
  const vm = useTransactionListViewModel();
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

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
        <Pressable
          accessibilityRole="button"
          onPress={vm.openDrawer}
          style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.8 : 1 }]}
          testID="drawer-menu-button"
        >
          <Text style={{ color: colors.primary, fontSize: typography.fontSize.lg }}>☰</Text>
        </Pressable>
        <View style={styles.headerActions}>
          {Platform.OS === 'web' ? (
            <Pressable
              accessibilityRole="button"
              disabled={vm.isRefreshing}
              onPress={() => void vm.refresh()}
              style={({ pressed }) => [
                styles.textButton,
                {
                  borderColor: colors.borderSubtle,
                  opacity: pressed || vm.isRefreshing ? 0.7 : 1,
                },
              ]}
              testID="header-refresh-button"
            >
              <Text style={{ color: colors.primary, fontSize: typography.fontSize.sm }}>
                {vm.labels.refresh}
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={vm.openProfile}
            style={({ pressed }) => [
              styles.textButton,
              { borderColor: colors.borderSubtle, opacity: pressed ? 0.8 : 1 },
            ]}
            testID="profile-header-button"
          >
            <Text style={{ color: colors.textSecondary, fontSize: typography.fontSize.sm }}>👤</Text>
          </Pressable>
        </View>
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
          marginBottom: spacing.md,
          marginHorizontal: spacing.lg,
        }}
        testID="balance-amount"
      >
        {vm.balanceFormatted}
      </Text>

      <View
        style={[
          styles.addRow,
          { marginBottom: spacing.md, marginHorizontal: spacing.lg },
        ]}
      >
        <Text
          style={{
            color: colors.textPrimary,
            flex: 1,
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
          }}
        >
          {vm.labels.title}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={vm.openAddTransaction}
          style={({ pressed }) => [
            styles.addButton,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.9 : 1,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
            },
          ]}
          testID="add-transaction-button"
        >
          <Text
            style={{
              color: colors.textInverse,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
            }}
          >
            {vm.labels.add}
          </Text>
        </Pressable>
      </View>

      <SearchBar
        accessibilityLabel={vm.labels.searchPlaceholder}
        onChangeText={vm.setQuery}
        placeholder={vm.labels.searchPlaceholder}
        value={vm.query}
      />
      <TypeFilterChips
        onChange={vm.setTypeFilter}
        options={[...vm.typeFilterOptions]}
        value={vm.typeFilter}
      />
      <DateFilterChips
        onChange={vm.setDateRange}
        options={[...vm.dateFilterOptions]}
        value={vm.dateRange}
      />
      {vm.dateRange === 'custom' ? (
        <CustomDateRangeFields
          customEnd={vm.customEnd}
          customStart={vm.customStart}
          locale={vm.locale}
          onChangeEnd={vm.setCustomEnd}
          onChangeStart={vm.setCustomStart}
        />
      ) : null}
      <CategoryFilterChips
        locale={vm.locale}
        onChange={vm.setCategoryFilter}
        value={vm.categoryFilter}
      />
    </View>
  );

  const shellStyle = [styles.flex, { backgroundColor: colors.background }];

  if (vm.loading && vm.isEmpty && !vm.showNoMatchingResults) {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={shellStyle}
        testID="transaction-list"
      >
        {listHeader}
        <LoadingState message={vm.labels.loading} />
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={shellStyle}
      testID="transaction-list"
    >
      <FlatList
        contentContainerStyle={
          vm.showNoMatchingResults ? styles.flexGrow : { paddingBottom: spacing.xxl }
        }
        data={vm.showNoMatchingResults ? [] : vm.transactions}
        keyExtractor={(item) => item.refId}
        ListEmptyComponent={
          vm.showNoMatchingResults ? (
            <StateMessage testID="no-results-state" title={vm.labels.noMatchingResults} />
          ) : null
        }
        ListHeaderComponent={listHeader}
        refreshControl={
          Platform.OS !== 'web' ? (
            <RefreshControl
              colors={[colors.primary]}
              onRefresh={() => void vm.refresh()}
              refreshing={vm.isRefreshing}
              tintColor={colors.primary}
            />
          ) : undefined
        }
        renderItem={({ item }) => (
          <TransactionCard locale={vm.locale} onPress={vm.openDetail} transaction={item} />
        )}
        testID="transaction-list-flatlist"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addButton: {
    borderRadius: 10,
  },
  addRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  flex: {
    flex: 1,
  },
  flexGrow: {
    flexGrow: 1,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  headerTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconButton: {
    padding: 4,
  },
  textButton: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});
