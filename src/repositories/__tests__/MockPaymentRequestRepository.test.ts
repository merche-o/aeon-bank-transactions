import { MockPaymentRequestRepository } from '../MockPaymentRequestRepository';

describe('MockPaymentRequestRepository', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts empty and adds a pending request after delay', async () => {
    const repo = new MockPaymentRequestRepository(200);
    const listPromise = repo.list();
    await jest.advanceTimersByTimeAsync(200);
    expect(await listPromise).toEqual([]);

    const addPromise = repo.add({
      recipientId: 'R1',
      amount: 50,
      note: 'Lunch',
      transferName: 'Pay me',
      category: 'food',
    });
    await jest.advanceTimersByTimeAsync(200);
    const created = await addPromise;

    expect(created).toMatchObject({
      recipientId: 'R1',
      amount: 50,
      status: 'pending',
      category: 'food',
    });
    expect(created.id).toMatch(/^PR/);
  });

  it('cancel and fulfill only work for pending requests', async () => {
    const repo = new MockPaymentRequestRepository(0);
    const created = await repo.add({
      recipientId: 'R1',
      amount: 20,
    });

    const cancelled = await repo.cancel(created.id);
    expect(cancelled.status).toBe('cancelled');
    await expect(repo.cancel(created.id)).rejects.toThrow(
      'PAYMENT_REQUEST_NOT_CANCELLABLE',
    );

    const other = await repo.add({
      recipientId: 'R2',
      amount: 30,
    });
    const paid = await repo.fulfill(other.id);
    expect(paid.status).toBe('paid');
    await expect(repo.fulfill(other.id)).rejects.toThrow(
      'PAYMENT_REQUEST_NOT_FULFILLABLE',
    );
  });

  it('throws when id is missing', async () => {
    const repo = new MockPaymentRequestRepository(0);
    await expect(repo.cancel('missing')).rejects.toThrow(
      'PAYMENT_REQUEST_NOT_FOUND',
    );
    await expect(repo.fulfill('missing')).rejects.toThrow(
      'PAYMENT_REQUEST_NOT_FOUND',
    );
  });
});
