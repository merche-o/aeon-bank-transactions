/**
 * Web stub — expo-sqlite WASM is not bundled for Expo web export.
 * Native implementation lives in db.native.ts.
 */
export async function getDatabase(): Promise<never> {
  throw new Error('SQLite is not available on web');
}

export async function resetDatabaseForTests(): Promise<void> {
  // no-op on web
}
