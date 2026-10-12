import type { PaymentRequest } from '@/models/PaymentRequest';
import type { Recipient } from '@/models/Recipient';
import type { Transaction } from '@/models/Transaction';
import type { PaymentRequestRepository } from '@/repositories/PaymentRequestRepository';
import type { TransactionRepository } from '@/repositories/TransactionRepository';
import {
  resetPaymentProcessingService,
  setPaymentProcessingService,
  type PaymentProcessingService,
} from '@/services/PaymentProcessingService';
import {
  resetPaymentRequestRepository,
  resetPaymentRequestStore,
  setPaymentRequestRepository,
  usePaymentRequestStore,
} from '@/store/paymentRequestStore';
import {
  resetRecipientRepository,
  resetRecipientStore,
  useRecipientStore,
} from '@/store/recipientStore';
import {
  resetTransactionRepository,
  resetTransactionStore,
  setTransactionRepository,
  useTransactionStore,
} from '@/store/transactionStore';

const recipient: Recipient = {
  id: 'r1',
  displayName: 'Alex Payee',
  createdAt: '2024-01-01T00:00:00Z',
};

function createPaymentRepo(
  overrides?: Partial<PaymentRequestRepository>,
): PaymentRequestRepository {
  return {
    list: jest.fn().mockResolvedValue([]),
    add: jest.fn(),
    cancel: jest.fn(),
    fulfill: jest.fn(),
    ...overrides,
  };
}

function createTxRepo(
  seed: Transaction[] = [],
): TransactionRepository & { items: Transaction[] } {
  const items = [...seed];
  return {
    items,
    getTransactions: jest.fn(async () => [...items]),
    getTransactionByRefId: jest.fn(async (refId: string) =>
      items.find((tx) => tx.refId === refId) ?? null,
    ),
    addTransaction: jest.fn(async (input) => {
      const created: Transaction = {
        refId: `NEW${items.length + 1}`,
        transferDate: input.transferDate,
        recipientName: input.recipientName,
        transferName: input.transferName,
        amount: input.amount,
        category: input.category,
        status: input.status ?? 'completed',
        scheduledFor: input.scheduledFor,
        recipientId: input.recipientId,
        paymentRequestId: input.paymentRequestId,
      };
      items.unshift(created);
      return created;
    }),
    updateTransactionCategory: jest.fn().mockResolvedValue(undefined),
    updateTransactionStatus: jest.fn(async (refId, status) => {
      const index = items.findIndex((tx) => tx.refId === refId);
      if (index < 0) {
        throw new Error('TRANSACTION_NOT_FOUND');
      }
      items[index] = { ...items[index]!, status };
    }),
    cancelScheduledTransaction: jest.fn().mockResolvedValue(undefined),
  };
}

describe('paymentRequestStore', () => {
  beforeEach(() => {
    resetPaymentRequestStore();
    resetPaymentRequestRepository();
    resetTransactionStore();
    resetTransactionRepository();
    resetRecipientStore();
    resetRecipientRepository();
    resetPaymentProcessingService();
    useRecipientStore.setState({ recipients: [recipient] });
  });

  it('add creates a pending income transaction that does not increase spendable balance', async () => {
    const createdRequest: PaymentRequest = {
      id: 'pr-1',
      recipientId: 'r1',
      amount: 150,
      status: 'pending',
      createdAt: '2024-10-12T10:00:00Z',
      category: 'transportation',
      transferName: 'Lunch',
    };
    const paymentRepo = createPaymentRepo({
      add: jest.fn().mockResolvedValue(createdRequest),
    });
    const txRepo = createTxRepo();
    setPaymentRequestRepository(paymentRepo);
    setTransactionRepository(txRepo);

    await usePaymentRequestStore.getState().add({
      recipientId: 'r1',
      amount: 150,
      transferName: 'Lunch',
      category: 'transportation',
    });

    const { transactions, balance } = useTransactionStore.getState();
    expect(transactions).toHaveLength(1);
    expect(transactions[0]).toMatchObject({
      amount: 150,
      status: 'pending',
      paymentRequestId: 'pr-1',
    });
    expect(balance).toBe(0);
  });

  it('fulfill promotes linked pending tx without inserting a second one', async () => {
    const request: PaymentRequest = {
      id: 'pr-2',
      recipientId: 'r1',
      amount: 80,
      status: 'pending',
      createdAt: '2024-10-12T10:00:00Z',
    };
    const paid: PaymentRequest = { ...request, status: 'paid' };
    const paymentRepo = createPaymentRepo({
      add: jest.fn().mockResolvedValue(request),
      fulfill: jest.fn().mockResolvedValue(paid),
    });
    const txRepo = createTxRepo();
    setPaymentRequestRepository(paymentRepo);
    setTransactionRepository(txRepo);

    await usePaymentRequestStore.getState().add({
      recipientId: 'r1',
      amount: 80,
    });
    await usePaymentRequestStore.getState().fulfill('pr-2');

    const { transactions, balance } = useTransactionStore.getState();
    expect(transactions).toHaveLength(1);
    expect(transactions[0]?.status).toBe('completed');
    expect(balance).toBe(80);
    expect(txRepo.addTransaction).toHaveBeenCalledTimes(1);
  });

  it('fulfill aborts when payment processor declines', async () => {
    const request: PaymentRequest = {
      id: 'pr-fail',
      recipientId: 'r1',
      amount: 25,
      status: 'pending',
      createdAt: '2024-10-12T10:00:00Z',
    };
    const paymentRepo = createPaymentRepo({
      add: jest.fn().mockResolvedValue(request),
      fulfill: jest.fn(),
    });
    const declining: PaymentProcessingService = {
      settleIncomingRequest: jest.fn().mockResolvedValue({
        ok: false,
        reason: 'DECLINED',
      }),
    };
    setPaymentRequestRepository(paymentRepo);
    setTransactionRepository(createTxRepo());
    setPaymentProcessingService(declining);

    await usePaymentRequestStore.getState().add({
      recipientId: 'r1',
      amount: 25,
    });

    await expect(usePaymentRequestStore.getState().fulfill('pr-fail')).rejects.toThrow(
      'DECLINED',
    );
    expect(paymentRepo.fulfill).not.toHaveBeenCalled();
    expect(useTransactionStore.getState().transactions[0]?.status).toBe('pending');
  });

  it('cancel marks linked pending tx cancelled without changing spendable balance', async () => {
    const request: PaymentRequest = {
      id: 'pr-3',
      recipientId: 'r1',
      amount: 40,
      status: 'pending',
      createdAt: '2024-10-12T10:00:00Z',
    };
    const cancelled: PaymentRequest = { ...request, status: 'cancelled' };
    const paymentRepo = createPaymentRepo({
      add: jest.fn().mockResolvedValue(request),
      cancel: jest.fn().mockResolvedValue(cancelled),
    });
    const txRepo = createTxRepo();
    setPaymentRequestRepository(paymentRepo);
    setTransactionRepository(txRepo);

    await usePaymentRequestStore.getState().add({
      recipientId: 'r1',
      amount: 40,
    });
    expect(useTransactionStore.getState().balance).toBe(0);

    await usePaymentRequestStore.getState().cancel('pr-3');

    const { transactions, balance } = useTransactionStore.getState();
    expect(transactions[0]?.status).toBe('cancelled');
    expect(balance).toBe(0);
  });
});
