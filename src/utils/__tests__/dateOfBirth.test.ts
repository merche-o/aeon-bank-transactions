import {
  clampDobDay,
  composeDobIso,
  daysInMonth,
  isAtLeast18,
  maxDobDate,
  normalizeDobParts,
  splitIsoToDobParts,
} from '../dateOfBirth';

describe('normalizeDobParts', () => {
  it('returns empty parts for null or missing iso', () => {
    expect(normalizeDobParts(null)).toEqual({ day: '', month: '', year: '' });
    expect(normalizeDobParts(undefined)).toEqual({
      day: '',
      month: '',
      year: '',
    });
    expect(normalizeDobParts('')).toEqual({ day: '', month: '', year: '' });
  });

  it('strips leading zeros from day and month', () => {
    expect(normalizeDobParts('1990-01-05T00:00:00.000Z')).toEqual({
      year: '1990',
      month: '1',
      day: '5',
    });
  });

  it('returns empty parts for malformed iso', () => {
    expect(normalizeDobParts('not-a-date')).toEqual({
      day: '',
      month: '',
      year: '',
    });
  });
});

describe('splitIsoToDobParts', () => {
  it('splits iso date prefix into parts', () => {
    expect(splitIsoToDobParts('2000-12-31T12:00:00.000Z')).toEqual({
      year: '2000',
      month: '12',
      day: '31',
    });
  });
});

describe('daysInMonth', () => {
  it('returns correct days including leap-year February', () => {
    expect(daysInMonth(2, 2000)).toBe(29);
    expect(daysInMonth(2, 2001)).toBe(28);
    expect(daysInMonth(4, 1990)).toBe(30);
  });
});

describe('clampDobDay', () => {
  it('clamps day when month has fewer days', () => {
    expect(
      clampDobDay({ day: '31', month: '2', year: '2000' }),
    ).toEqual({ day: '29', month: '2', year: '2000' });
    expect(
      clampDobDay({ day: '31', month: '4', year: '1990' }),
    ).toEqual({ day: '30', month: '4', year: '1990' });
  });
});

describe('isAtLeast18', () => {
  it('accepts max allowed dob and rejects the day after', () => {
    const max = maxDobDate();
    const y = max.getUTCFullYear();
    const m = String(max.getUTCMonth() + 1);
    const d = String(max.getUTCDate());
    expect(isAtLeast18(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T00:00:00.000Z`)).toBe(
      true,
    );

    const tooYoung = new Date(max.getTime() + 86_400_000);
    const ty = tooYoung.getUTCFullYear();
    const tm = String(tooYoung.getUTCMonth() + 1).padStart(2, '0');
    const td = String(tooYoung.getUTCDate()).padStart(2, '0');
    expect(isAtLeast18(`${ty}-${tm}-${td}T00:00:00.000Z`)).toBe(false);
  });
});

describe('composeDobIso', () => {
  it('returns null iso and no error when all parts empty', () => {
    expect(composeDobIso({ day: '', month: '', year: '' })).toEqual({
      iso: null,
      error: null,
    });
  });

  it('returns incomplete when any part missing', () => {
    expect(composeDobIso({ day: '1', month: '', year: '1990' })).toEqual({
      iso: null,
      error: 'incomplete',
    });
    expect(composeDobIso({ day: '1', month: '1', year: '90' })).toEqual({
      iso: null,
      error: 'incomplete',
    });
  });

  it('returns invalid for out-of-range calendar values', () => {
    expect(composeDobIso({ day: '31', month: '2', year: '2000' })).toEqual({
      iso: null,
      error: 'invalid',
    });
    expect(composeDobIso({ day: '0', month: '1', year: '2000' })).toEqual({
      iso: null,
      error: 'invalid',
    });
    expect(composeDobIso({ day: '1', month: '13', year: '2000' })).toEqual({
      iso: null,
      error: 'invalid',
    });
  });

  it('returns invalid for future dates', () => {
    const nextYear = new Date().getFullYear() + 1;
    expect(
      composeDobIso({ day: '1', month: '1', year: String(nextYear) }),
    ).toEqual({
      iso: null,
      error: 'invalid',
    });
  });

  it('composes valid iso at UTC midnight', () => {
    expect(composeDobIso({ day: '5', month: '1', year: '1990' })).toEqual({
      iso: '1990-01-05T00:00:00.000Z',
      error: null,
    });
  });

  it('returns underage for dates after maxDobDate', () => {
    const max = maxDobDate();
    const tooYoung = new Date(max.getTime() + 86_400_000);
    const result = composeDobIso({
      day: String(tooYoung.getUTCDate()),
      month: String(tooYoung.getUTCMonth() + 1),
      year: String(tooYoung.getUTCFullYear()),
    });
    expect(result).toEqual({ iso: null, error: 'underage' });
  });

  it('accepts dob exactly on maxDobDate', () => {
    const max = maxDobDate();
    const result = composeDobIso({
      day: String(max.getUTCDate()),
      month: String(max.getUTCMonth() + 1),
      year: String(max.getUTCFullYear()),
    });
    expect(result.error).toBeNull();
    expect(result.iso).toMatch(/T00:00:00\.000Z$/);
  });

  it('trims whitespace in parts', () => {
    expect(composeDobIso({ day: ' 5 ', month: ' 1 ', year: ' 1990 ' })).toEqual({
      iso: '1990-01-05T00:00:00.000Z',
      error: null,
    });
  });
});
