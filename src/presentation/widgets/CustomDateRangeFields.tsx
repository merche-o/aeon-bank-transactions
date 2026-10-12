import { View } from 'react-native';

import { t } from '@/i18n';
import type { Locale } from '@/i18n/types';
import { useTheme } from '@/theme';

import { DateField, toDate } from './DateField';

export type CustomDateRangeFieldsProps = {
  locale: Locale;
  customStart: string;
  customEnd: string;
  onChangeStart: (iso: string) => void;
  onChangeEnd: (iso: string) => void;
};

export function CustomDateRangeFields({
  locale,
  customStart,
  customEnd,
  onChangeStart,
  onChangeEnd,
}: CustomDateRangeFieldsProps) {
  const theme = useTheme();
  const { spacing } = theme;

  const startValid = Boolean(customStart) && !Number.isNaN(new Date(customStart).getTime());
  const endValid = Boolean(customEnd) && !Number.isNaN(new Date(customEnd).getTime());

  return (
    <View style={{ gap: spacing.xs, paddingHorizontal: spacing.lg }}>
      <DateField
        label={t('filters.from', locale)}
        maximumDate={endValid ? toDate(customEnd) : undefined}
        onChange={onChangeStart}
        testID="filter-date-custom-from"
        valueIso={customStart}
      />
      <DateField
        label={t('filters.to', locale)}
        minimumDate={startValid ? toDate(customStart) : undefined}
        onChange={onChangeEnd}
        testID="filter-date-custom-to"
        valueIso={customEnd}
      />
    </View>
  );
}
