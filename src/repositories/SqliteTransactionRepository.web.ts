import { MockTransactionRepository } from './MockTransactionRepository';

/**
 * Web uses the mock repository — expo-sqlite is native-only for this app.
 * Export the same class name so App.tsx dynamic import resolves cleanly.
 */
export class SqliteTransactionRepository extends MockTransactionRepository {
  constructor() {
    super(0);
  }
}
