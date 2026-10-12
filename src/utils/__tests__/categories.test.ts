import { getCategoryLabel, normalizeTransactionCategory } from '../categories';

describe('normalizeTransactionCategory', () => {
  it('maps legacy transfer to transportation', () => {
    expect(normalizeTransactionCategory('transfer')).toBe('transportation');
  });

  it('keeps valid categories', () => {
    expect(normalizeTransactionCategory('food')).toBe('food');
    expect(normalizeTransactionCategory('unknown')).toBe('unknown');
    expect(normalizeTransactionCategory('transportation')).toBe(
      'transportation',
    );
  });

  it('falls back to unknown for invalid values', () => {
    expect(normalizeTransactionCategory('nope')).toBe('unknown');
    expect(normalizeTransactionCategory(null)).toBe('unknown');
    expect(normalizeTransactionCategory(undefined)).toBe('unknown');
  });
});

describe('getCategoryLabel', () => {
  it('labels transportation and unknown', () => {
    expect(getCategoryLabel('transportation', 'en')).toBe('Transportation');
    expect(getCategoryLabel('unknown', 'en')).toBe('Unknown');
    expect(getCategoryLabel('transportation', 'bm')).toBe('Pengangkutan');
    expect(getCategoryLabel('unknown', 'bm')).toBe('Tidak diketahui');
  });
});
