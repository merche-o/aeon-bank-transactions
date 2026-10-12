import { create } from 'zustand';

import type { NewRecipientInput, Recipient } from '@/models/Recipient';
import { MockRecipientRepository } from '@/repositories/MockRecipientRepository';
import type { RecipientRepository } from '@/repositories/RecipientRepository';

export interface RecipientStoreState {
  recipients: Recipient[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  add: (input: NewRecipientInput) => Promise<Recipient>;
  remove: (id: string) => Promise<void>;
  clearError: () => void;
}

let recipientRepository: RecipientRepository = new MockRecipientRepository(0);

export function setRecipientRepository(repository: RecipientRepository): void {
  recipientRepository = repository;
}

export function resetRecipientRepository(): void {
  recipientRepository = new MockRecipientRepository(0);
}

export const useRecipientStore = create<RecipientStoreState>((set) => ({
  recipients: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const recipients = await recipientRepository.list();
      set({ recipients, loading: false, error: null });
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : 'Failed to load recipients';
      set({ loading: false, error: message });
    }
  },

  add: async (input) => {
    const created = await recipientRepository.add(input);
    set((state) => ({
      recipients: [created, ...state.recipients],
    }));
    return created;
  },

  remove: async (id) => {
    await recipientRepository.remove(id);
    set((state) => ({
      recipients: state.recipients.filter((recipient) => recipient.id !== id),
    }));
  },

  clearError: () => set({ error: null }),
}));

export function resetRecipientStore(): void {
  useRecipientStore.setState({
    recipients: [],
    loading: false,
    error: null,
  });
}
