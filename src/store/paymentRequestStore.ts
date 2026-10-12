import { create } from 'zustand';

import { t } from '@/i18n';
import type {
  NewPaymentRequestInput,
  PaymentRequest,
} from '@/models/PaymentRequest';
import { MockPaymentRequestRepository } from '@/repositories/MockPaymentRequestRepository';
import type { PaymentRequestRepository } from '@/repositories/PaymentRequestRepository';
import { getPaymentProcessingService } from '@/services/PaymentProcessingService';

import { usePreferencesStore } from './preferencesStore';
import { useRecipientStore } from './recipientStore';
import { useTransactionStore } from './transactionStore';

export interface PaymentRequestStoreState {
  paymentRequests: PaymentRequest[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  add: (input: NewPaymentRequestInput) => Promise<PaymentRequest>;
  cancel: (id: string) => Promise<PaymentRequest>;
  fulfill: (id: string) => Promise<PaymentRequest>;
  clearError: () => void;
}

let paymentRequestRepository: PaymentRequestRepository =
  new MockPaymentRequestRepository(0);

export function setPaymentRequestRepository(
  repository: PaymentRequestRepository,
): void {
  paymentRequestRepository = repository;
}

export function resetPaymentRequestRepository(): void {
  paymentRequestRepository = new MockPaymentRequestRepository(0);
}

export const usePaymentRequestStore = create<PaymentRequestStoreState>((set) => ({
  paymentRequests: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const paymentRequests = await paymentRequestRepository.list();
      set({ paymentRequests, loading: false, error: null });
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : 'Failed to load payment requests';
      set({ loading: false, error: message });
    }
  },

  add: async (input) => {
    const created = await paymentRequestRepository.add(input);
    const recipient = useRecipientStore
      .getState()
      .recipients.find((item) => item.id === created.recipientId);
    const locale = usePreferencesStore.getState().locale;
    const transferName =
      created.transferName?.trim() ||
      t('pay.paymentReceived', locale);

    await useTransactionStore.getState().addTransaction({
      transferDate: created.createdAt,
      recipientName: recipient?.displayName ?? 'Unknown',
      transferName,
      amount: created.amount,
      category: created.category ?? 'transfer',
      status: 'pending',
      recipientId: created.recipientId,
      paymentRequestId: created.id,
    });

    set((state) => ({
      paymentRequests: [created, ...state.paymentRequests],
    }));
    return created;
  },

  cancel: async (id) => {
    const updated = await paymentRequestRepository.cancel(id);
    const linked = useTransactionStore.getState().findByPaymentRequestId(id);
    if (linked && linked.status === 'pending') {
      await useTransactionStore.getState().updateStatus(linked.refId, 'cancelled');
    }
    set((state) => ({
      paymentRequests: state.paymentRequests.map((request) =>
        request.id === id ? updated : request,
      ),
    }));
    return updated;
  },

  fulfill: async (id) => {
    const settlement = await getPaymentProcessingService().settleIncomingRequest(id);
    if (!settlement.ok) {
      throw new Error(settlement.reason);
    }

    const updated = await paymentRequestRepository.fulfill(id);
    const linked = useTransactionStore.getState().findByPaymentRequestId(id);
    if (linked && linked.status === 'pending') {
      await useTransactionStore.getState().updateStatus(linked.refId, 'completed');
    } else if (!linked) {
      // Legacy requests created before pending-tx linking: insert completed tx once.
      const recipient = useRecipientStore
        .getState()
        .recipients.find((item) => item.id === updated.recipientId);
      const locale = usePreferencesStore.getState().locale;
      const transferName =
        updated.transferName?.trim() ||
        t('pay.paymentReceived', locale);

      await useTransactionStore.getState().addTransaction({
        transferDate: new Date().toISOString(),
        recipientName: recipient?.displayName ?? 'Unknown',
        transferName,
        amount: updated.amount,
        category: updated.category ?? 'transfer',
        recipientId: updated.recipientId,
        paymentRequestId: updated.id,
      });
    }

    set((state) => ({
      paymentRequests: state.paymentRequests.map((request) =>
        request.id === id ? updated : request,
      ),
    }));
    return updated;
  },

  clearError: () => set({ error: null }),
}));

export function resetPaymentRequestStore(): void {
  usePaymentRequestStore.setState({
    paymentRequests: [],
    loading: false,
    error: null,
  });
}
