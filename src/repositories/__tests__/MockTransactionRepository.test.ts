import { MockTransactionRepository } from '../MockTransactionRepository';

describe('MockTransactionRepository', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns mapped transactions sorted-ready data', async () => {
    const repo = new MockTransactionRepository(400);
    const promise = repo.getTransactions();
    await jest.advanceTimersByTimeAsync(400);
    const items = await promise;
    expect(items).toHaveLength(4);
    expect(items[0]).toMatchObject({
      refId: '123ABC',
      transferName: 'Salary Payment',
      amount: 1500,
    });
  });

  it('finds by refId', async () => {
    const repo = new MockTransactionRepository(0);
    const item = await repo.getTransactionByRefId('789GHI');
    expect(item?.amount).toBe(-500);
    expect(await repo.getTransactionByRefId('missing')).toBeNull();
  });

  it('adds a transaction and updates category', async () => {
    const repo = new MockTransactionRepository(0);
    const created = await repo.addTransaction({
      transferDate: '2024-11-01T00:00:00Z',
      recipientName: 'Test',
      transferName: 'New',
      amount: -25,
      category: 'food',
    });

    expect(created.refId).toMatch(/^NEW/);
    expect(created.category).toBe('food');

    const items = await repo.getTransactions();
    expect(items.some((tx) => tx.refId === created.refId)).toBe(true);

    await repo.updateTransactionCategory(created.refId, 'personal');
    const updated = await repo.getTransactionByRefId(created.refId);
    expect(updated?.category).toBe('personal');
  });
});
