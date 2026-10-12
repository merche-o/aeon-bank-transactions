import DateTimePicker from '@react-native-community/datetimepicker';
import { createElement, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '@/theme';

export type DateFieldProps = {
  label: string;
  valueIso: string;
  onChange: (iso: string) => void;
  testID: string;
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
};

/** Calendar YYYY-MM-DD from an ISO string (UTC date parts). */
export function toDisplay(iso: string): string {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso.slice(0, 10);
  }
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Stable noon-UTC ISO for a calendar day so timezone never flips the day. */
export function calendarDayToIso(year: number, monthIndex0: number, day: number): string {
  return new Date(Date.UTC(year, monthIndex0, day, 12, 0, 0, 0)).toISOString();
}

export function dateToCalendarIso(date: Date): string {
  return calendarDayToIso(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDate(iso: string, fallback: Date): Date {
  if (!iso) {
    return fallback;
  }
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }
  return new Date(
    parsed.getUTCFullYear(),
    parsed.getUTCMonth(),
    parsed.getUTCDate(),
    12,
    0,
    0,
    0,
  );
}

function parseWebDateValue(value: string): string {
  if (!value) {
    return '';
  }
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) {
    return '';
  }
  return calendarDayToIso(y, m - 1, d);
}

export function DateField({
  label,
  valueIso,
  onChange,
  testID,
  minimumDate,
  maximumDate,
  placeholder = 'YYYY-MM-DD',
}: DateFieldProps) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;
  const [open, setOpen] = useState(false);
  const selected = toDate(valueIso, new Date());

  if (Platform.OS === 'web') {
    return (
      <View style={{ marginBottom: spacing.sm }}>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: typography.fontSize.xs,
            marginBottom: spacing.xxs,
          }}
        >
          {label}
        </Text>
        {createElement('input', {
          'data-testid': testID,
          max: maximumDate ? toDisplay(maximumDate.toISOString()) : undefined,
          min: minimumDate ? toDisplay(minimumDate.toISOString()) : undefined,
          onChange: (event: { target: { value: string } }) => {
            onChange(parseWebDateValue(event.target.value));
          },
          style: {
            backgroundColor: colors.surface,
            border: `1px solid ${colors.borderSubtle}`,
            borderRadius: 10,
            color: colors.textPrimary,
            fontSize: typography.fontSize.md,
            padding: '10px 12px',
            width: '100%',
          },
          type: 'date',
          value: toDisplay(valueIso),
        })}
      </View>
    );
  }

  return (
    <View style={{ marginBottom: spacing.sm }}>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: typography.fontSize.xs,
          marginBottom: spacing.xxs,
        }}
      >
        {label}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.chip,
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderSubtle,
            opacity: pressed ? 0.85 : 1,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
        ]}
        testID={testID}
      >
        <Text
          style={{
            color: valueIso ? colors.textPrimary : colors.textMuted,
            fontSize: typography.fontSize.md,
          }}
        >
          {valueIso ? toDisplay(valueIso) : placeholder}
        </Text>
      </Pressable>
      {open ? (
        <DateTimePicker
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          mode="date"
          onChange={(_, date) => {
            setOpen(false);
            if (date) {
              onChange(dateToCalendarIso(date));
            }
          }}
          value={selected}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 10,
    borderWidth: 1,
  },
});
