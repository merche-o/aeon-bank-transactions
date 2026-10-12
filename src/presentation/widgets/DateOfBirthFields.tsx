import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { Locale } from '@/i18n/types';
import { useTheme } from '@/theme';
import {
  clampDobDay,
  daysInMonth,
  maxDobYear,
  minDobYear,
  type DobParts,
} from '@/utils/dateOfBirth';

export type DateOfBirthFieldsProps = {
  locale: Locale;
  labels: { day: string; month: string; year: string; hint: string };
  value: DobParts;
  onChange: (next: DobParts) => void;
  errorMessage?: string;
};

type PickerField = 'day' | 'month' | 'year';

type PickerOption = {
  value: string;
  label: string;
};

function intlLocaleForApp(locale: Locale): string {
  return locale === 'bm' ? 'ms-MY' : 'en-GB';
}

function monthShortLabel(month: number, locale: Locale): string {
  return new Date(Date.UTC(2000, month - 1, 1)).toLocaleDateString(
    intlLocaleForApp(locale),
    { month: 'short', timeZone: 'UTC' },
  );
}

function displayDay(value: DobParts): string {
  return value.day || '—';
}

function displayMonth(value: DobParts, locale: Locale): string {
  if (!value.month) {
    return '—';
  }
  const m = Number(value.month);
  if (!Number.isInteger(m) || m < 1 || m > 12) {
    return value.month;
  }
  return monthShortLabel(m, locale);
}

function displayYear(value: DobParts): string {
  return value.year || '—';
}

export function DateOfBirthFields({
  locale,
  labels,
  value,
  onChange,
  errorMessage,
}: DateOfBirthFieldsProps) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;
  const [activePicker, setActivePicker] = useState<PickerField | null>(null);

  const yearNum = value.year.length === 4 ? Number(value.year) : NaN;
  const monthNum = value.month ? Number(value.month) : NaN;

  const applyParts = useCallback(
    (next: DobParts) => {
      onChange(clampDobDay(next));
    },
    [onChange],
  );

  const dayOptions = useMemo((): PickerOption[] => {
    const y =
      Number.isInteger(yearNum) && yearNum >= minDobYear()
        ? yearNum
        : maxDobYear();
    const m =
      Number.isInteger(monthNum) && monthNum >= 1 && monthNum <= 12
        ? monthNum
        : 1;
    const maxDay = daysInMonth(m, y);
    return Array.from({ length: maxDay }, (_, index) => {
      const day = String(index + 1);
      return { value: day, label: day };
    });
  }, [monthNum, yearNum]);

  const monthOptions = useMemo((): PickerOption[] => {
    return Array.from({ length: 12 }, (_, index) => {
      const month = String(index + 1);
      return { value: month, label: monthShortLabel(index + 1, locale) };
    });
  }, [locale]);

  const yearOptions = useMemo((): PickerOption[] => {
    const min = minDobYear();
    const max = maxDobYear();
    const options: PickerOption[] = [];
    for (let y = max; y >= min; y -= 1) {
      options.push({ value: String(y), label: String(y) });
    }
    return options;
  }, []);

  const pickerTitle =
    activePicker === 'day'
      ? labels.day
      : activePicker === 'month'
        ? labels.month
        : activePicker === 'year'
          ? labels.year
          : '';

  const pickerOptions =
    activePicker === 'day'
      ? dayOptions
      : activePicker === 'month'
        ? monthOptions
        : activePicker === 'year'
          ? yearOptions
          : [];

  const selectedValue =
    activePicker === 'day'
      ? value.day
      : activePicker === 'month'
        ? value.month
        : activePicker === 'year'
          ? value.year
          : '';

  const closePicker = useCallback(() => {
    setActivePicker(null);
  }, []);

  const onSelectOption = useCallback(
    (optionValue: string) => {
      if (!activePicker) {
        return;
      }
      if (activePicker === 'day') {
        applyParts({ ...value, day: optionValue });
        setActivePicker('month');
        return;
      }
      if (activePicker === 'month') {
        applyParts({ ...value, month: optionValue });
        setActivePicker('year');
        return;
      }
      applyParts({ ...value, year: optionValue });
      setActivePicker(null);
    },
    [activePicker, applyParts, closePicker, value],
  );

  const chip = (
    field: PickerField,
    display: string,
    testID: string,
    flexStyle?: object,
  ) => (
    <View style={[styles.field, flexStyle]}>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: typography.fontSize.xs,
          marginBottom: spacing.xxs,
        }}
      >
        {field === 'day' ? labels.day : field === 'month' ? labels.month : labels.year}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setActivePicker(field)}
        style={({ pressed }) => [
          styles.chip,
          {
            borderColor: colors.borderSubtle,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
        testID={testID}
      >
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.medium,
            textAlign: 'center',
          }}
        >
          {display}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <View>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: typography.fontSize.xs,
          marginBottom: spacing.sm,
        }}
      >
        {labels.hint}
      </Text>
      <View style={[styles.row, { gap: spacing.sm }]}>
        {chip('day', displayDay(value), 'profile-dob-day')}
        {chip('month', displayMonth(value, locale), 'profile-dob-month')}
        {chip('year', displayYear(value), 'profile-dob-year', styles.year)}
      </View>
      {errorMessage ? (
        <Text
          style={{
            color: colors.error,
            fontSize: typography.fontSize.sm,
            marginTop: spacing.xs,
          }}
          testID="profile-dob-error"
        >
          {errorMessage}
        </Text>
      ) : null}

      <Modal
        animationType="fade"
        onRequestClose={closePicker}
        transparent
        visible={activePicker !== null}
      >
        <Pressable
          accessibilityRole="button"
          onPress={closePicker}
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.borderSubtle,
                marginHorizontal: spacing.lg,
                paddingBottom: spacing.md,
                paddingTop: spacing.sm,
              },
            ]}
          >
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: typography.fontSize.md,
                fontWeight: typography.fontWeight.semibold,
                marginBottom: spacing.sm,
                paddingHorizontal: spacing.md,
              }}
            >
              {pickerTitle}
            </Text>
            <FlatList
              data={pickerOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const selected = item.value === selectedValue;
                return (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => onSelectOption(item.value)}
                    style={({ pressed }) => [
                      styles.option,
                      {
                        backgroundColor: selected
                          ? colors.primarySubtle
                          : 'transparent',
                        opacity: pressed ? 0.85 : 1,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                      },
                    ]}
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
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }}
              style={styles.list}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
  },
  chip: {
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  field: {
    flex: 1,
  },
  list: {
    maxHeight: 320,
  },
  option: {
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
  },
  sheet: {
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: '70%',
  },
  year: {
    flex: 1.4,
  },
});
