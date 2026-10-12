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

function toDisplay(iso: string): string {
  if (!iso) {
    return '';
  }
  return iso.slice(0, 10);
}

function toDate(iso: string, fallback: Date): Date {
  if (!iso) {
    return fallback;
  }
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
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
          max: maximumDate ? maximumDate.toISOString().slice(0, 10) : undefined,
          min: minimumDate ? minimumDate.toISOString().slice(0, 10) : undefined,
          onChange: (event: { target: { value: string } }) => {
            const value = event.target.value;
            onChange(value ? `${value}T00:00:00.000Z` : '');
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
            setOpen(Platform.OS === 'ios');
            if (date) {
              onChange(date.toISOString());
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
