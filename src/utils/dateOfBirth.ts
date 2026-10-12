export type DobParts = {
  day: string;
  month: string;
  year: string;
};

export type DobComposeError = 'incomplete' | 'invalid' | 'underage' | null;

export function minDobYear(): number {
  return new Date().getFullYear() - 120;
}

/** Latest calendar date that satisfies 18+ (UTC). */
export function maxDobDate(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear() - 18, now.getUTCMonth(), now.getUTCDate()),
  );
}

export function maxDobYear(): number {
  return maxDobDate().getUTCFullYear();
}

export function daysInMonth(month: number, year: number): number {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return 31;
  }
  if (!Number.isInteger(year) || year < 1) {
    return 31;
  }
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function clampDobDay(parts: DobParts): DobParts {
  const day = parts.day.trim();
  const month = parts.month.trim();
  const year = parts.year.trim();
  if (!day || !month || !year || year.length !== 4) {
    return parts;
  }
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) {
    return parts;
  }
  const maxDay = daysInMonth(m, y);
  if (d <= maxDay) {
    return parts;
  }
  return { ...parts, day: String(maxDay) };
}

export function isAtLeast18(iso: string): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  return date.getTime() <= maxDobDate().getTime();
}

export function splitIsoToDobParts(iso: string | null | undefined): DobParts {
  if (!iso) {
    return { day: '', month: '', year: '' };
  }
  const date = iso.slice(0, 10);
  const [year = '', month = '', day = ''] = date.split('-');
  return {
    day: day.replace(/^0/, '') === day ? day : String(Number(day) || ''),
    month: month.replace(/^0/, '') === month ? month : String(Number(month) || ''),
    year,
  };
}

/** Prefer numeric day/month without leading-zero requirement for display. */
export function normalizeDobParts(iso: string | null | undefined): DobParts {
  if (!iso) {
    return { day: '', month: '', year: '' };
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) {
    return { day: '', month: '', year: '' };
  }
  return {
    year: match[1] ?? '',
    month: String(Number(match[2])),
    day: String(Number(match[3])),
  };
}

export function composeDobIso(parts: DobParts): {
  iso: string | null;
  error: DobComposeError;
} {
  const day = parts.day.trim();
  const month = parts.month.trim();
  const year = parts.year.trim();

  if (!day && !month && !year) {
    return { iso: null, error: null };
  }
  if (!day || !month || !year || year.length !== 4) {
    return { iso: null, error: 'incomplete' };
  }

  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  const maxDay = daysInMonth(m, y);
  if (
    !Number.isInteger(d) ||
    !Number.isInteger(m) ||
    !Number.isInteger(y) ||
    m < 1 ||
    m > 12 ||
    d < 1 ||
    d > maxDay ||
    y < minDobYear() ||
    y > new Date().getFullYear()
  ) {
    return { iso: null, error: 'invalid' };
  }

  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return { iso: null, error: 'invalid' };
  }
  if (date.getTime() > Date.now()) {
    return { iso: null, error: 'invalid' };
  }

  const mm = String(m).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  const iso = `${y}-${mm}-${dd}T00:00:00.000Z`;
  if (!isAtLeast18(iso)) {
    return { iso: null, error: 'underage' };
  }
  return { iso, error: null };
}
