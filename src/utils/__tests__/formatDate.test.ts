import {
  formatDate,
  formatDateTime,
  setDefaultTimeZoneForTests,
} from '@/utils/formatDate';

const KUALA_LUMPUR = 'Asia/Kuala_Lumpur';

describe('formatDate', () => {
  afterEach(() => {
    setDefaultTimeZoneForTests(undefined);
  });

  it('formats ISO date for display with explicit time zone', () => {
    expect(formatDate('2024-10-15', { timeZone: KUALA_LUMPUR })).toBe(
      '15 Oct 2024',
    );
  });

  it('formats ISO datetime date part in the given time zone', () => {
    expect(
      formatDate('2024-10-15T12:34:56Z', { timeZone: KUALA_LUMPUR }),
    ).toBe('15 Oct 2024');
  });

  it('respects locale option', () => {
    expect(
      formatDate('2024-10-15', { timeZone: KUALA_LUMPUR, locale: 'en-US' }),
    ).toBe('Oct 15, 2024');
  });

  it('uses injectable default time zone when options omit timeZone', () => {
    setDefaultTimeZoneForTests(KUALA_LUMPUR);
    expect(formatDate('2024-10-15T23:00:00Z')).toBe('16 Oct 2024');
  });
});

describe('formatDateTime', () => {
  afterEach(() => {
    setDefaultTimeZoneForTests(undefined);
  });

  it('formats ISO datetime with time in the given time zone', () => {
    expect(
      formatDateTime('2024-10-15T12:34:56Z', { timeZone: KUALA_LUMPUR }),
    ).toBe('15 Oct 2024, 20:34');
  });
});
