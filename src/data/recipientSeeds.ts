import type { Recipient } from '@/models/Recipient';

export const SEED_RECIPIENTS: Recipient[] = [
  {
    id: 'R1',
    displayName: 'John Doe',
    accountHint: '****1234',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'R2',
    displayName: 'Jane Smith',
    accountHint: '****5678',
    createdAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 'R3',
    displayName: 'Robert Brown',
    accountHint: '****9012',
    createdAt: '2024-01-03T00:00:00.000Z',
  },
];
