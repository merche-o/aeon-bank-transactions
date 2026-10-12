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
