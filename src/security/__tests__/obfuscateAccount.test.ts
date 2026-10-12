import { obfuscateAccountHint } from '../obfuscateAccount';

describe('obfuscateAccountHint', () => {
  it('returns undefined for empty input', () => {
    expect(obfuscateAccountHint(undefined)).toBeUndefined();
    expect(obfuscateAccountHint('')).toBeUndefined();
    expect(obfuscateAccountHint('   ')).toBeUndefined();
  });

  it('masks account numbers showing only last 4 digits', () => {
    expect(obfuscateAccountHint('1234567890')).toBe('••••7890');
    expect(obfuscateAccountHint('MY12 ACCT 0000 1234')).toBe('••••1234');
  });

  it('handles already partially masked values', () => {
    expect(obfuscateAccountHint('****1234')).toBe('••••1234');
  });

  it('masks short digit strings fully into bullets + digits', () => {
    expect(obfuscateAccountHint('12')).toBe('••••12');
  });
});
