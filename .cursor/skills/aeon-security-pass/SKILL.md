---
name: aeon-security-pass
description: >-
  Read-only scan of AEON Bank Transactions for PII logging, unsafe share
  payloads, secret exposure, and SecureStore misuse. Use before submission or
  inside aeon-verifier. For implementing fixes, use agent aeon-security instead.
---

# Security pass

Scan for:

1. Raw PII/amounts/`refId` in console logs
2. Share text bypassing `sanitizeSharePayload`
3. Secrets or tokens in source / `EXPO_PUBLIC_*`
4. Sensitive data in AsyncStorage that should use SecureStore later
5. Repository coupling that blocks authenticated API swap

Return actionable findings only.
