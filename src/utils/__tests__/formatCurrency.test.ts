import { formatCurrency } from '../formatCurrency';

describe('formatCurrency', () => {
  it('formats positive MYR', () => {
    expect(formatCurrency(1500)).toBe('RM 1,500.00');
  });

  it('formats negative MYR', () => {
    expect(formatCurrency(-500)).toBe('-RM 500.00');
  });
});
