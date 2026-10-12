import { formatDate } from '@/utils/formatDate';

describe('formatDate', () => {
  it('formats ISO date for display', () => {
    expect(formatDate('2024-10-15')).toBe('15 Oct 2024');
  });
});
