import { MockRecipientRepository } from '../MockRecipientRepository';

describe('MockRecipientRepository', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('lists seed recipients after delay', async () => {
    const repo = new MockRecipientRepository(400);
    const promise = repo.list();
    await jest.advanceTimersByTimeAsync(400);
    const items = await promise;

    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toMatchObject({
      id: 'R1',
      displayName: 'John Doe',
    });
  });

  it('adds and removes recipients with delayMs 0', async () => {
    const repo = new MockRecipientRepository(0);
    const before = await repo.list();

    const created = await repo.add({
      displayName: 'New Friend',
      accountHint: '****0001',
    });

    expect(created.displayName).toBe('New Friend');
    expect(created.id).toMatch(/^R/);

    const afterAdd = await repo.list();
    expect(afterAdd).toHaveLength(before.length + 1);
    expect(afterAdd[0]?.id).toBe(created.id);

    await repo.remove(created.id);
    const afterRemove = await repo.list();
    expect(afterRemove.find((item) => item.id === created.id)).toBeUndefined();
  });
});
