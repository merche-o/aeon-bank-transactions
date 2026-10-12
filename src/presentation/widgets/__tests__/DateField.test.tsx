import {
  calendarDayToIso,
  dateToCalendarIso,
  toDisplay,
} from '../DateField';

describe('DateField calendar helpers', () => {
  it('builds noon-UTC ISO so the calendar day is stable', () => {
    expect(calendarDayToIso(2024, 8, 1)).toBe('2024-09-01T12:00:00.000Z');
    expect(toDisplay(calendarDayToIso(2024, 8, 1))).toBe('2024-09-01');
  });

  it('converts a local Date to calendar ISO without day flip', () => {
    const local = new Date(2024, 8, 1, 0, 0, 0, 0);
    expect(dateToCalendarIso(local)).toBe('2024-09-01T12:00:00.000Z');
  });
});
