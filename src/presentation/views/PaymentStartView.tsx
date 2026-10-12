import { useNavigation } from '@react-navigation/native';
import { useLayoutEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { usePaymentStartViewModel } from '../viewmodels/usePaymentStartViewModel';
import { EmptyState } from '../widgets/EmptyState';
import { LoadingState } from '../widgets/LoadingState';
import { RecipientRow } from '../widgets/RecipientRow';
import { SearchBar } from '../widgets/SearchBar';
import { SegmentToggle } from '../widgets/SegmentToggle';

export function PaymentStartView() {
  const navigation = useNavigation();
  const vm = usePaymentStartViewModel();
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  useLayoutEffect(() => {
    navigation.setOptions({ title: vm.labels.title });
  }, [navigation, vm.labels.title]);

  if (vm.loading && vm.recipients.length === 0) {
    return <LoadingState message={vm.labels.title} />;
  }

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.flex, { backgroundColor: colors.background }]}
      testID="payment-start-screen"
    >
      <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.md }}>
        <SegmentToggle<'transfer' | 'request'>
          onChange={vm.setMode}
          options={[
            {
              value: 'transfer',
              label: vm.labels.transfer,
              testID: 'payment-start-mode-transfer',
            },
            {
              value: 'request',
              label: vm.labels.request,
              testID: 'payment-start-mode-request',
            },
          ]}
          testID="payment-start-mode"
          value={vm.mode}
          variant="segmented"
        />
      </View>

      <SearchBar
        accessibilityLabel={vm.labels.search}
        onChangeText={vm.setQuery}
        placeholder={vm.labels.search}
        value={vm.query}
      />

      <Pressable
        accessibilityRole="button"
        onPress={vm.openAddRecipient}
        style={({ pressed }) => [
          styles.addButton,
          {
            borderColor: colors.primary,
            marginHorizontal: spacing.lg,
            marginBottom: spacing.sm,
            marginTop: spacing.md,
            opacity: pressed ? 0.9 : 1,
            paddingVertical: spacing.md,
          },
        ]}
        testID="payment-start-add-recipient"
      >
        <Text
          style={{
            color: colors.primary,
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.semibold,
            textAlign: 'center',
          }}
        >
          {vm.labels.addNew}
        </Text>
      </Pressable>

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
            testID={`payment-start-recipient-${item.id}`}
          />
        )}
        testID="payment-start-recipient-list"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addButton: {
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
});
