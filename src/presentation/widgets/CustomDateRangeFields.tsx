import type { Locale } from '@/i18n/types';
import { t } from '@/i18n';
import { useTheme } from '@/theme';
import { View } from 'react-native';

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

  return (
    <View style={{ gap: spacing.xs, paddingHorizontal: spacing.lg }}>
      <DateField
        label={t('filters.from', locale)}
        onChange={onChangeStart}
        testID="filter-date-custom-from"
        valueIso={customStart}
      />
      <DateField
        label={t('filters.to', locale)}
        onChange={onChangeEnd}
        testID="filter-date-custom-to"
        valueIso={customEnd}
      />
    </View>
  );
}
