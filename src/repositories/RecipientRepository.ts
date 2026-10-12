import type { NewRecipientInput, Recipient } from '@/models/Recipient';

export interface RecipientRepository {
  list(): Promise<Recipient[]>;
  add(input: NewRecipientInput): Promise<Recipient>;
  remove(id: string): Promise<void>;
}
