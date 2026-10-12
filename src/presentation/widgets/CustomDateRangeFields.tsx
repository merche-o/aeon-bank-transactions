import { View } from 'react-native';

import { t } from '@/i18n';
import type { Locale } from '@/i18n/types';
import { useTheme } from '@/theme';

import { DateField } from './DateField';

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

  const startDate = customStart ? new Date(customStart) : undefined;
  const endDate = customEnd ? new Date(customEnd) : undefined;
  const startValid = startDate !== undefined && !Number.isNaN(startDate.getTime());
  const endValid = endDate !== undefined && !Number.isNaN(endDate.getTime());

  return (
    <View style={{ gap: spacing.xs, paddingHorizontal: spacing.lg }}>
      <DateField
        label={t('filters.from', locale)}
        maximumDate={endValid ? endDate : undefined}
        onChange={onChangeStart}
        testID="filter-date-custom-from"
        valueIso={customStart}
      />
      <DateField
        label={t('filters.to', locale)}
        minimumDate={startValid ? startDate : undefined}
        onChange={onChangeEnd}
        testID="filter-date-custom-to"
        valueIso={customEnd}
      />
    </View>
  );
}
