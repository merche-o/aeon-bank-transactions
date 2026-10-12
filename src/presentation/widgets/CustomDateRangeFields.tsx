import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Locale } from '@/i18n/types';
import { t } from '@/i18n';
import { useTheme } from '@/theme';

export type CustomDateRangeFieldsProps = {
  locale: Locale;
  customStart: string;
  customEnd: string;
  onChangeStart: (iso: string) => void;
  onChangeEnd: (iso: string) => void;
};

function toDateInputValue(iso: string): string {
  if (!iso) {
    return '';
  }
  return iso.slice(0, 10);
}

function fromDateInputValue(value: string): string {
  if (!value.trim()) {
    return '';
  }
  return `${value}T00:00:00.000Z`;
}

export function CustomDateRangeFields({
  locale,
  customStart,
  customEnd,
  onChangeStart,
  onChangeEnd,
}: CustomDateRangeFieldsProps) {
  const theme = useTheme();
  const { colors, spacing, typography } = theme;

  if (Platform.OS === 'web') {
    return (
      <View
        style={[styles.row, { gap: spacing.md, marginBottom: spacing.md, paddingHorizontal: spacing.lg }]}
      >
        <View style={styles.field}>
          <Text style={{ color: colors.textMuted, fontSize: typography.fontSize.xs, marginBottom: spacing.xxs }}>
            {t('filters.from', locale)}
          </Text>
          <TextInput
            accessibilityLabel={t('filters.from', locale)}
            onChangeText={(text) => onChangeStart(fromDateInputValue(text))}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              {
                borderColor: colors.borderSubtle,
                color: colors.textPrimary,
                fontSize: typography.fontSize.sm,
              },
            ]}
            testID="filter-date-custom-from"
            value={toDateInputValue(customStart)}
          />
        </View>
        <View style={styles.field}>
          <Text style={{ color: colors.textMuted, fontSize: typography.fontSize.xs, marginBottom: spacing.xxs }}>
            {t('filters.to', locale)}
          </Text>
          <TextInput
            accessibilityLabel={t('filters.to', locale)}
            onChangeText={(text) => onChangeEnd(fromDateInputValue(text))}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              {
                borderColor: colors.borderSubtle,
                color: colors.textPrimary,
                fontSize: typography.fontSize.sm,
              },
            ]}
            testID="filter-date-custom-to"
            value={toDateInputValue(customEnd)}
          />
        </View>
      </View>
    );
  }

  const startDate = customStart ? new Date(customStart) : new Date();
  const endDate = customEnd ? new Date(customEnd) : new Date();

  return (
    <View style={{ marginBottom: spacing.md, paddingHorizontal: spacing.lg }}>
      <Text style={{ color: colors.textMuted, fontSize: typography.fontSize.xs, marginBottom: spacing.xs }}>
        {t('filters.from', locale)}
      </Text>
      <DateTimePicker
        mode="date"
        onChange={(_, date) => {
          if (date) {
            onChangeStart(date.toISOString());
          }
        }}
        testID="filter-date-custom-from"
        value={startDate}
      />
      <Text
        style={{
          color: colors.textMuted,
          fontSize: typography.fontSize.xs,
          marginBottom: spacing.xs,
          marginTop: spacing.sm,
        }}
      >
        {t('filters.to', locale)}
      </Text>
      <DateTimePicker
        mode="date"
        onChange={(_, date) => {
          if (date) {
            onChangeEnd(date.toISOString());
          }
        }}
        testID="filter-date-custom-to"
        value={endDate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flex: 1,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
  },
});
