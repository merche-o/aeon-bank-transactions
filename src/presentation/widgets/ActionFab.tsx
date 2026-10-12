import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

export type ActionFabItem = {
  key: string;
  label: string;
  onPress: () => void;
  testID: string;
  destructive?: boolean;
};

export type ActionFabProps = {
  actions: ActionFabItem[];
  bottomOffset?: number;
  accessibilityLabelOpen?: string;
  accessibilityLabelClose?: string;
};

const FAB_SIZE = 56;
const FAB_MARGIN = 16;

export function ActionFab({
  actions,
  bottomOffset = 0,
  accessibilityLabelOpen,
  accessibilityLabelClose,
}: ActionFabProps) {
  const [expanded, setExpanded] = useState(false);
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  const collapse = useCallback(() => setExpanded(false), []);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const runAction = useCallback(
    (onPress: () => void) => {
      onPress();
      collapse();
    },
    [collapse],
  );

  const bottom = FAB_MARGIN + insets.bottom + bottomOffset;

  return (
    <>
      {expanded ? (
        <Pressable
          accessibilityLabel={accessibilityLabelClose}
          accessibilityRole="button"
          onPress={collapse}
          style={[StyleSheet.absoluteFill, styles.backdrop, { backgroundColor: colors.overlay }]}
          testID="action-fab-backdrop"
        />
      ) : null}
      <View
        pointerEvents="box-none"
        style={[styles.host, { bottom, right: FAB_MARGIN }]}
      >
        {expanded ? (
          <View style={[styles.chipStack, { marginBottom: spacing.sm }]}>
            {actions.map((action) => {
              const chipBackground = action.destructive ? colors.errorMuted : colors.surface;
              const chipText = action.destructive ? colors.error : colors.textPrimary;
              const chipBorder = action.destructive ? colors.error : colors.borderSubtle;

              return (
                <Pressable
                  key={action.key}
                  accessibilityRole="button"
                  onPress={() => runAction(action.onPress)}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: chipBackground,
                      borderColor: chipBorder,
                      opacity: pressed ? 0.92 : 1,
                      paddingHorizontal: spacing.lg,
                      paddingVertical: spacing.sm,
                    },
                  ]}
                  testID={action.testID}
                >
                  <Text
                    style={{
                      color: chipText,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                    }}
                  >
                    {action.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
        <Pressable
          accessibilityLabel={expanded ? accessibilityLabelClose : accessibilityLabelOpen}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          onPress={toggleExpanded}
          style={({ pressed }) => [
            styles.fab,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.92 : 1,
            },
          ]}
          testID="action-fab"
        >
          <Ionicons
            color={colors.textInverse}
            name={expanded ? 'close' : 'swap-horizontal'}
            size={28}
          />
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    zIndex: 10,
  },
  chip: {
    borderRadius: 24,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  chipStack: {
    alignItems: 'flex-end',
    gap: 8,
  },
  fab: {
    alignItems: 'center',
    borderRadius: FAB_SIZE / 2,
    elevation: 6,
    height: FAB_SIZE,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    width: FAB_SIZE,
    zIndex: 12,
  },
  host: {
    alignItems: 'flex-end',
    position: 'absolute',
    zIndex: 11,
  },
});
