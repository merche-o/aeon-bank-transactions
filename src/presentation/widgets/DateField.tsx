import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { createElement, useCallback, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { t } from '@/i18n';
import { usePreferencesStore } from '@/store/preferencesStore';
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
export function calendarDayToIso(
  year: number,
  monthIndex0: number,
  day: number,
): string {
  return new Date(Date.UTC(year, monthIndex0, day, 12, 0, 0, 0)).toISOString();
}

export function dateToCalendarIso(date: Date): string {
  return calendarDayToIso(date.getFullYear(), date.getMonth(), date.getDate());
}

export function toDate(iso: string, fallback: Date = new Date()): Date {
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
  const { colors, spacing, typography, colorScheme } = theme;
  const locale = usePreferencesStore((state) => state.locale);
  const [iosOpen, setIosOpen] = useState(false);
  const [draft, setDraft] = useState(() => toDate(valueIso));

  const selected = toDate(valueIso);

  const openAndroidPicker = useCallback(() => {
    DateTimePickerAndroid.open({
      value: selected,
      mode: 'date',
      display: 'calendar',
      minimumDate,
      maximumDate,
      onChange: (event: DateTimePickerEvent, date?: Date) => {
        if (event.type !== 'set' || date == null) {
          return;
        }
        onChange(dateToCalendarIso(date));
      },
    });
  }, [maximumDate, minimumDate, onChange, selected]);

  const openPicker = useCallback(() => {
    if (Platform.OS === 'android') {
      openAndroidPicker();
      return;
    }
    setDraft(toDate(valueIso));
    setIosOpen(true);
  }, [openAndroidPicker, valueIso]);

  const confirmIos = useCallback(() => {
    onChange(dateToCalendarIso(draft));
    setIosOpen(false);
  }, [draft, onChange]);

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
          max: maximumDate ? toDisplay(dateToCalendarIso(maximumDate)) : undefined,
          min: minimumDate ? toDisplay(dateToCalendarIso(minimumDate)) : undefined,
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
        onPress={openPicker}
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

      {Platform.OS === 'ios' ? (
        <Modal
          animationType="slide"
          onRequestClose={() => setIosOpen(false)}
          transparent
          visible={iosOpen}
        >
          <Pressable
            accessibilityRole="button"
            onPress={() => setIosOpen(false)}
            style={[styles.iosBackdrop, { backgroundColor: colors.overlay }]}
            testID={`${testID}-picker-backdrop`}
          >
            <Pressable
              onPress={(event) => event.stopPropagation()}
              style={[
                styles.iosSheet,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.borderSubtle,
                  paddingBottom: spacing.xl,
                },
              ]}
            >
              <View
                style={[
                  styles.iosToolbar,
                  {
                    borderBottomColor: colors.borderSubtle,
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.sm,
                  },
                ]}
              >
                <Pressable
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => setIosOpen(false)}
                  testID={`${testID}-picker-cancel`}
                >
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: typography.fontSize.md,
                    }}
                  >
                    {t('common.cancel', locale)}
                  </Text>
                </Pressable>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: typography.fontSize.md,
                    fontWeight: typography.fontWeight.semibold,
                  }}
                >
                  {label}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={confirmIos}
                  testID={`${testID}-picker-done`}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontSize: typography.fontSize.md,
                      fontWeight: typography.fontWeight.semibold,
                    }}
                  >
                    {t('common.done', locale)}
                  </Text>
                </Pressable>
              </View>
              <DateTimePicker
                display="spinner"
                maximumDate={maximumDate}
                minimumDate={minimumDate}
                mode="date"
                onChange={(_, date) => {
                  if (date) {
                    setDraft(date);
                  }
                }}
                style={styles.iosPicker}
                testID={`${testID}-picker`}
                themeVariant={colorScheme === 'dark' ? 'dark' : 'light'}
                value={draft}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 10,
    borderWidth: 1,
  },
  iosBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  iosPicker: {
    alignSelf: 'center',
    height: 216,
    width: '100%',
  },
  iosSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
  },
  iosToolbar: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
