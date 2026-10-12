---
name: aeon-banking-rn
description: >-
  Banking React Native practices for AEON Bank Transactions: spendable balance,
  amount parse, double-submit guards, silent-error fixes, KeyboardAvoidingView,
  a11y labels, AppState PrivacyOverlay, error boundary. Use when hardening money
  paths, privacy overlay, or reviewing banking RN best practices.
---

# AEON banking RN hardening

## Must-fix checklist (MVP)

1. **Available balance** — completed ledger only; pending incoming **not** spendable; show pending separately.
2. **Scheduled outflows** — reserve against available (`sumAvailableBalance` / `canAfford`).
3. **Amounts** — `parseAmountInput` (finite, `> 0`, half-up to cents); no raw `parseFloat` on money.
4. **Double-submit** — in-flight id / `saving` / `settling` disables Mark paid, Cancel, Confirm.
5. **Errors** — never swallow `InsufficientFundsError` or settle failures; surface banner + `SecureLogger`.
6. **Bootstrap** — no empty catch on SQLite→mock; log + optional visible fallback.
7. **PrivacyOverlay** — `AppState` inactive/background full-screen cover; `testID="privacy-overlay"`.
8. **Error boundary** — thin root boundary (`AppErrorBoundary`).
9. **Forms** — `KeyboardAvoidingView` on pay / request / recipient / profile.
10. **A11y** — `accessibilityLabel` on money CTAs and transaction cards.
11. **i18n** — no hardcoded `"0.00"`; use `t('pay.amountPlaceholder')` / sending labels.

## Document-only (prod backlog)

Biometric/PIN, `FLAG_SECURE`, SQLCipher, integer-cent SQLite schema, cert pinning, UUID ids.

## Key paths

- `src/utils/balance.ts`, `src/utils/parseAmountInput.ts`
- `src/store/transactionStore.ts` (serialize `addTransaction` if needed)
- `src/presentation/widgets/PrivacyOverlay.tsx`, `AppErrorBoundary.tsx`
- Pay / request / payment-requests / detail viewmodels + views
- `App.tsx`

## Output

Actionable list: path + issue + fix. If implementing, keep widgets presentational and follow architecture dependency rule.
