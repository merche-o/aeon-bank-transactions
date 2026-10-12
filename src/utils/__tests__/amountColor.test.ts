import { amountColor } from '../amountColor';

describe('amountColor', () => {
  it('returns positive or negative sign', () => {
    expect(amountColor(1)).toBe('positive');
    expect(amountColor(0)).toBe('positive');
    expect(amountColor(-1)).toBe('negative');
  });
});
