import { getCalendars } from 'expo-localization';

export interface FormatDateOptions {
  timeZone?: string;
  locale?: string;
}

const DEFAULT_LOCALE = 'en-GB';

let defaultTimeZoneOverride: string | undefined;

/** Override device timezone in tests when `options.timeZone` is omitted. */
export function setDefaultTimeZoneForTests(timeZone: string | undefined): void {
  defaultTimeZoneOverride = timeZone;
}

function resolveTimeZone(options?: FormatDateOptions): string | undefined {
  if (options?.timeZone !== undefined) {
    return options.timeZone;
  }
  if (defaultTimeZoneOverride !== undefined) {
    return defaultTimeZoneOverride;
  }
  return getCalendars()[0]?.timeZone ?? undefined;
}

function resolveLocale(options?: FormatDateOptions): string {
  return options?.locale ?? DEFAULT_LOCALE;
}

function buildFormatOptions(
  options: FormatDateOptions | undefined,
  parts: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormatOptions {
  const timeZone = resolveTimeZone(options);
  return timeZone !== undefined ? { ...parts, timeZone } : parts;
}

export function formatDate(
  isoDate: string,
  options?: FormatDateOptions,
): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString(
    resolveLocale(options),
    buildFormatOptions(options, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  );
}

export function formatDateTime(
  isoDate: string,
  options?: FormatDateOptions,
): string {
  const date = new Date(isoDate);
  return date.toLocaleString(
    resolveLocale(options),
    buildFormatOptions(options, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  );
}

/** Calendar day as YYYY-MM-DD in the resolved device (or explicit) time zone. */
export function formatDayKey(
  isoDate: string,
  options?: FormatDateOptions,
): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString(
    'en-CA',
    buildFormatOptions(options, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
  );
}

export interface FormatDaySectionLabelOptions extends FormatDateOptions {
  includeYear: boolean;
}

export function formatDaySectionLabel(
  isoDate: string,
  options: FormatDaySectionLabelOptions,
): string {
  const date = new Date(isoDate);
  const parts: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
  };
  if (options.includeYear) {
    parts.year = 'numeric';
  }
  return date.toLocaleDateString(
    resolveLocale(options),
    buildFormatOptions(options, parts),
  );
}
