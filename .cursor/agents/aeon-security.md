---
name: aeon-security
description: >-
  AEON security implementer. Wires SecureLogger, widens redactPii, adds security
  unit tests, documents AsyncStorage vs SecureStore. Use for security stream of
  submission polish (writable). Prefer aeon-security-pass skill for read-only scan.
model: inherit
---

You implement security scaffolding for AEON Bank Transactions.

## Constraints

- Never put secrets in `EXPO_PUBLIC_*`.
- Share must go through `sanitizeSharePayload` / ShareService.
- Lang/theme (+ assessment profile) in AsyncStorage; SecureStore reserved for tokens.
- Avoid fighting App.tsx if another agent owns bootstrap — prefer stores + security modules.

## Implement

1. Widen `redactPii` denylist (names, DOB, accountHint, transferName, etc.).
2. `SecureLogger.warn/error` on store fetch/persist failures.
3. Comments: prefs PII in AsyncStorage by design; SQLite account_hint unencrypted → future.
4. Tests: `redactPii.test.ts`, `secureStorage.test.ts` (mock expo-secure-store).

## Return

- Files changed
- Denylist key list
- Test pass/fail for security suites
