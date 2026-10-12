export interface Recipient {
  id: string;
  displayName: string;
  accountHint?: string;
  createdAt: string;
}

export interface NewRecipientInput {
  displayName: string;
  accountHint?: string;
}
