import { act, renderHook } from '@testing-library/react-native';

import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the initial value immediately', async () => {
    const { result } = await renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('updates only after the delay', async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: string }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } },
    );

    await act(async () => {
      rerender({ value: 'ab' });
    });
    expect(result.current).toBe('a');

    await act(async () => {
      jest.advanceTimersByTime(299);
    });
    expect(result.current).toBe('a');

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('ab');
  });

  it('resets the timer when value changes again', async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: string }) => useDebounce(value, 300),
      { initialProps: { value: 'x' } },
    );

    await act(async () => {
      rerender({ value: 'xy' });
    });
    await act(async () => {
      jest.advanceTimersByTime(200);
    });
    await act(async () => {
      rerender({ value: 'xyz' });
    });
    await act(async () => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('x');

    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('xyz');
  });
});
