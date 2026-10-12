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
        <View
          style={[
            styles.segmentRow,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderSubtle,
              marginBottom: spacing.md,
            },
          ]}
        >
          <SegmentButton
            active={vm.mode === 'transfer'}
            label={vm.labels.transfer}
            onPress={() => vm.setMode('transfer')}
            testID="payment-start-mode-transfer"
          />
          <SegmentButton
            active={vm.mode === 'request'}
            label={vm.labels.request}
            onPress={() => vm.setMode('request')}
            testID="payment-start-mode-request"
          />
        </View>
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

function SegmentButton({
  label,
  active,
  onPress,
  testID,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  testID: string;
}) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.segmentButton,
        {
          backgroundColor: active ? colors.primary : 'transparent',
          opacity: pressed ? 0.92 : 1,
          paddingVertical: spacing.sm,
        },
      ]}
      testID={testID}
    >
      <Text
        style={{
          color: active ? colors.textInverse : colors.textPrimary,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.semibold,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </Pressable>
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
  segmentButton: {
    borderRadius: 10,
    flex: 1,
  },
  segmentRow: {
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 4,
  },
});
