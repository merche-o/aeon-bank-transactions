import { SEED_RECIPIENTS } from '@/data/recipientSeeds';
import type { NewRecipientInput, Recipient } from '@/models/Recipient';

import type { RecipientRepository } from './RecipientRepository';

export class MockRecipientRepository implements RecipientRepository {
  private items: Recipient[];

  constructor(private readonly delayMs: number = 400) {
    this.items = SEED_RECIPIENTS.map((r) => ({ ...r }));
  }

  private async wait(): Promise<void> {
    if (this.delayMs <= 0) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, this.delayMs));
  }

  async list(): Promise<Recipient[]> {
    await this.wait();
    return [...this.items];
  }

  async add(input: NewRecipientInput): Promise<Recipient> {
    await this.wait();
    const created: Recipient = {
      id: `R${Date.now().toString(36).toUpperCase()}`,
      displayName: input.displayName,
      accountHint: input.accountHint,
      createdAt: new Date().toISOString(),
    };
    this.items = [created, ...this.items];
    return created;
  }

  async remove(id: string): Promise<void> {
    await this.wait();
    this.items = this.items.filter((item) => item.id !== id);
  }
}
