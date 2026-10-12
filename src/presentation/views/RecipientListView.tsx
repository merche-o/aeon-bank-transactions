import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { useRecipientListViewModel } from '../viewmodels/useRecipientListViewModel';
import { EmptyState } from '../widgets/EmptyState';
import { LoadingState } from '../widgets/LoadingState';
import { RecipientRow } from '../widgets/RecipientRow';
import { SearchBar } from '../widgets/SearchBar';

export function RecipientListView() {
  const vm = useRecipientListViewModel();
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  if (vm.loading && vm.recipients.length === 0) {
    return <LoadingState message={vm.labels.title} />;
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.flex, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.headerRow,
          {
            marginBottom: spacing.sm,
            marginHorizontal: spacing.lg,
            marginTop: spacing.sm,
          },
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
          onPress={vm.openAdd}
          style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.8 : 1 }]}
          testID="recipients-add-button"
        >
          <Ionicons color={colors.primary} name="person-add-outline" size={24} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={vm.openScheduled}
          style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.8 : 1 }]}
          testID="recipients-scheduled-button"
        >
          <Ionicons color={colors.primary} name="calendar-outline" size={24} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={vm.openRequests}
          style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.8 : 1 }]}
          testID="recipients-requests-button"
        >
          <Ionicons color={colors.primary} name="mail-outline" size={24} />
        </Pressable>
      </View>

      <SearchBar
        accessibilityLabel={vm.labels.search}
        onChangeText={vm.setQuery}
        placeholder={vm.labels.search}
        value={vm.query}
      />

      <FlatList
        contentContainerStyle={
          vm.recipients.length === 0 ? styles.emptyContainer : undefined
        }
        data={vm.recipients}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState title={vm.labels.empty} />}
        renderItem={({ item }) => (
          <RecipientRow
            accountHint={item.accountHint}
            avatarInitial={vm.avatarInitial(item.displayName)}
            displayName={item.displayName}
            onPress={() => vm.openRecipient(item.id)}
            testID={`recipient-row-${item.id}`}
          />
        )}
        testID="recipients-list"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
});
