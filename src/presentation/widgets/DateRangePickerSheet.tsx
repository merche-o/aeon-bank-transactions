import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { Locale } from '@/i18n/types';
import { useTheme } from '@/theme';

import { CustomDateRangeFields } from './CustomDateRangeFields';
import { calendarDayToIso, dateToCalendarIso } from './DateField';

function defaultCustomRange(): { start: string; end: string } {
  const now = new Date();
  return {
    start: calendarDayToIso(now.getFullYear(), now.getMonth(), 1),
    end: dateToCalendarIso(now),
  };
}

export type DateRangePresetOption<T extends string> = {
  value: T;
  label: string;
  testID: string;
};

export type DateRangePickerSheetProps<T extends string> = {
  locale: Locale;
  visible: boolean;
  value: T;
  customValue: T;
  customStart: string;
  customEnd: string;
  presets: ReadonlyArray<DateRangePresetOption<T>>;
  labels: {
    title: string;
    apply: string;
  };
  onClose: () => void;
  onSelectPreset: (value: T) => void;
  onChangeStart: (iso: string) => void;
  onChangeEnd: (iso: string) => void;
  backdropTestID?: string;
  applyTestID?: string;
};

export function DateRangePickerSheet<T extends string>({
  locale,
  visible,
  value,
  customValue,
  customStart,
  customEnd,
  presets,
  labels,
  onClose,
  onSelectPreset,
  onChangeStart,
  onChangeEnd,
  backdropTestID = 'filter-date-sheet-backdrop',
  applyTestID = 'filter-date-apply',
}: DateRangePickerSheetProps<T>) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;
  const [draftRange, setDraftRange] = useState<T>(value);

  useEffect(() => {
    if (visible) {
      setDraftRange(value);
    }
  }, [visible, value]);

  const canApplyCustom = Boolean(customStart && customEnd);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onClose}
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
        testID={backdropTestID}
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.borderSubtle,
              paddingBottom: spacing.xl,
              paddingTop: spacing.lg,
            },
          ]}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              marginBottom: spacing.md,
              paddingHorizontal: spacing.lg,
            }}
          >
            {labels.title}
          </Text>

          {presets.map((preset) => {
            const selected = draftRange === preset.value;
            return (
              <Pressable
                key={preset.value}
                accessibilityRole="button"
                onPress={() => {
                  setDraftRange(preset.value);
                  if (preset.value !== customValue) {
                    onSelectPreset(preset.value);
                    onClose();
                    return;
                  }
                  if (!customStart || !customEnd) {
                    const defaults = defaultCustomRange();
                    if (!customStart) {
                      onChangeStart(defaults.start);
                    }
                    if (!customEnd) {
                      onChangeEnd(defaults.end);
                    }
                  }
                }}
                style={({ pressed }) => [
                  styles.preset,
                  {
                    backgroundColor: selected ? colors.primarySubtle : 'transparent',
                    marginHorizontal: spacing.md,
                    opacity: pressed ? 0.85 : 1,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.sm,
                  },
                ]}
                testID={preset.testID}
              >
                <Text
                  style={{
                    color: selected ? colors.primary : colors.textPrimary,
                    fontSize: typography.fontSize.md,
                    fontWeight: selected
                      ? typography.fontWeight.semibold
                      : typography.fontWeight.regular,
                  }}
                >
                  {preset.label}
                </Text>
              </Pressable>
            );
          })}

          {draftRange === customValue ? (
            <View style={{ marginTop: spacing.md }}>
              <CustomDateRangeFields
                customEnd={customEnd}
                customStart={customStart}
                locale={locale}
                onChangeEnd={onChangeEnd}
                onChangeStart={onChangeStart}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: !canApplyCustom }}
                disabled={!canApplyCustom}
                onPress={() => {
                  if (!canApplyCustom) {
                    return;
                  }
                  onSelectPreset(customValue);
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.apply,
                  {
                    backgroundColor: colors.primary,
                    marginHorizontal: spacing.lg,
                    marginTop: spacing.sm,
                    opacity: !canApplyCustom ? 0.45 : pressed ? 0.9 : 1,
                    paddingVertical: spacing.md,
                  },
                ]}
                testID={applyTestID}
              >
                <Text
                  style={{
                    color: colors.textInverse,
                    fontSize: typography.fontSize.md,
                    fontWeight: typography.fontWeight.semibold,
                    textAlign: 'center',
                  }}
                >
                  {labels.apply}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  apply: {
    borderRadius: 12,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  preset: {
    borderRadius: 10,
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
  },
});
