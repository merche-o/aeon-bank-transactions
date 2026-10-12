import type { Transaction } from '@/models/Transaction';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

const MAX_SHARE_LENGTH = 2000;
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export interface SharePayload {
  title: string;
  message: string;
}

export interface ShareLabels {
  reference: string;
  date: string;
  recipient: string;
  transferName: string;
  amount: string;
}

function sanitizeLine(value: string): string {
  return value.replace(CONTROL_CHARS, '').trim();
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 1)}…`;
}

export function buildReceiptText(
  transaction: Transaction,
  labels: ShareLabels,
): string {
  const lines = [
    `${labels.reference}: ${transaction.refId}`,
    `${labels.date}: ${formatDate(transaction.transferDate)}`,
    `${labels.recipient}: ${transaction.recipientName}`,
    `${labels.transferName}: ${transaction.transferName}`,
    `${labels.amount}: ${formatCurrency(transaction.amount)}`,
  ];
  return lines.join('\n');
}

export function sanitizeSharePayload(payload: SharePayload): SharePayload {
  const title = truncate(sanitizeLine(payload.title), 120);
  const message = truncate(sanitizeLine(payload.message), MAX_SHARE_LENGTH);
  return { title, message };
}

export function sanitizeSharePayloadForTransaction(
  transaction: Transaction,
  title: string,
  labels: ShareLabels,
): SharePayload {
  return sanitizeSharePayload({
    title,
    message: buildReceiptText(transaction, labels),
  });
}
