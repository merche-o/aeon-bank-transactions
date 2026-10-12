import { Share } from 'react-native';

import type { Transaction } from '@/models/Transaction';
import {
  sanitizeSharePayloadForTransaction,
  type ShareLabels,
} from '@/security/sanitizeSharePayload';

export async function shareTransaction(
  transaction: Transaction,
  title: string,
  labels: ShareLabels,
): Promise<void> {
  const payload = sanitizeSharePayloadForTransaction(transaction, title, labels);
  await Share.share(payload);
}
