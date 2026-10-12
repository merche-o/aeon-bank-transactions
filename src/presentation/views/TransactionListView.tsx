import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { useTransactionListViewModel } from '../viewmodels/useTransactionListViewModel';
import { DateFilterChips, TypeFilterChips } from '../widgets/FilterChips';
import { EmptyState } from '../widgets/EmptyState';
import { ErrorState } from '../widgets/ErrorState';
import { LanguageToggle } from '../widgets/LanguageToggle';
import { LoadingState } from '../widgets/LoadingState';
import { SearchBar } from '../widgets/SearchBar';
import { StateMessage } from '../widgets/StateMessage';
import { ThemeToggle } from '../widgets/ThemeToggle';
import { TransactionCard } from '../widgets/TransactionCard';

export function TransactionListView() {
  const vm = useTransactionListViewModel();
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  const listHeader = (
    <View>
      <View
        style={[
          styles.headerRow,
          {
            marginBottom: spacing.md,
            marginHorizontal: spacing.lg,
            marginTop: spacing.sm,
          },
        ]}
      >
        <Text
          style={{
            color: colors.textPrimary,
            flex: 1,
            fontSize: typography.fontSize.xxl,
            fontWeight: typography.fontWeight.bold,
          }}
        >
          {vm.labels.title}
        </Text>
        <View style={[styles.toggles, { gap: spacing.sm }]}>
          <LanguageToggle
            accessibilityLabel={vm.languageAccessibilityLabel}
            label={vm.languageToggleLabel}
            onPress={vm.toggleLocale}
          />
          <ThemeToggle label={vm.themeToggleLabel} onPress={vm.cycleTheme} />
        </View>
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
          <RefreshControl
            colors={[colors.primary]}
            onRefresh={() => void vm.refresh()}
            refreshing={vm.loading}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => (
          <TransactionCard onPress={vm.openDetail} transaction={item} />
        )}
        testID="transaction-list-flatlist"
      />
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
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  toggles: {
    flexDirection: 'row',
  },
});
