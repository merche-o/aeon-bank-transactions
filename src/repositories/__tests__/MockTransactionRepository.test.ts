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
});
