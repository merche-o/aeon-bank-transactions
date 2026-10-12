import { parseAmountInput } from '../parseAmountInput';

describe('parseAmountInput', () => {
  it('parses positive amounts', () => {
    expect(parseAmountInput('10')).toBe(10);
    expect(parseAmountInput('10.5')).toBe(10.5);
    expect(parseAmountInput('10.55')).toBe(10.55);
    expect(parseAmountInput('1,234.56')).toBe(1234.56);
  });

  it('rounds half-up to cents', () => {
    expect(parseAmountInput('1.005')).toBe(1.01);
    expect(parseAmountInput('1.004')).toBe(1);
    expect(parseAmountInput('2.999')).toBe(3);
  });

  it('rejects empty, zero, negative, and non-finite input', () => {
    expect(parseAmountInput('')).toBeNull();
    expect(parseAmountInput('   ')).toBeNull();
    expect(parseAmountInput('0')).toBeNull();
    expect(parseAmountInput('0.00')).toBeNull();
    expect(parseAmountInput('-5')).toBeNull();
    expect(parseAmountInput('abc')).toBeNull();
    expect(parseAmountInput('Infinity')).toBeNull();
  });
});
