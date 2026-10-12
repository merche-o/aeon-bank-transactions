# Code review — AEON Bank Transactions

Review artifact for the mobile engineer assessment submission. Canonical product rules live in [`AGENTS.md`](AGENTS.md); product overview and setup in [`README.md`](README.md).

## Summary

The app meets the assignment MVP: Clean Architecture + MVVM, list/filter/search/detail/share, i18n (`en`/`bm`), theme tokens, and repository ports with Mock + SQLite adapters. Submission polish adds banking money semantics (available vs pending vs scheduled reserve), `SecureLogger` wiring, AppState privacy overlay, Detox smoke scaffolding, and broader Jest coverage. Production hardening (biometrics, SQLCipher, cert pinning, integer ledger) is intentionally backlog.

## Architecture

### Pass / fixed

| Finding | Status |
|---------|--------|
| Dependency rule `views/widgets → viewmodels → store → repositories → data` | Pass |
| Models / repositories / utils free of React & Zustand | Pass |
| Views do not import repositories or raw `data/` | Pass |
| Widgets presentational; shared FormField / filter menus / budget widgets | Pass / fixed (dead chips & unused toggles removed) |
| Multiple Zustand stores: transactions, preferences, recipients, payment requests | Pass |
| Repository ports + Mock / SQLite (+ `.web` stubs); `wireRepositories` bootstrap | Pass |
| `PaymentProcessingService` port + TMP adapter; injectable swap | Pass |
| TypeScript strict; no `any` in app layers | Pass |
| Unreachable AddTransaction route / orphan ThemeToggle & LanguageToggle | Fixed (removed; prefs live in drawer menus) |

### Accepted risks

| Finding | Notes |
|---------|-------|
| Client-side “Mark as paid” | Assessment demo only; real product settles via webhook / bank notification |
| SQLite on native, mock on web | Documented; web export never loads `expo-sqlite` WASM path |
| Float money in SQLite `REAL` | MVP uses 2-decimal parse helpers; full integer-cent ledger is backlog |
| Residual TOCTOU on concurrent writes | Soft in-flight / serialize where cheap; not a DB transaction ledger |

## Security

### Fixed / implemented

| Control | Notes |
|---------|-------|
| `SecureLogger` + `redactPii` | Used on store fetch/persist failures; denylist includes amounts, refIds, names, profile keys, account hints, transfer names |
| `sanitizeSharePayload` | Share path goes through sanitizer before `Share.share()` |
| No secrets in `EXPO_PUBLIC_*` | Assessment uses mock/SQLite only |
| `secureStorage` wrapper | Ready for future tokens; not used for prefs |
| AppState `PrivacyOverlay` | Full-screen cover when inactive/background (`privacy-overlay`); no PII on the overlay itself |

### Accepted risks (MVP)

| Risk | Why accepted |
|------|----------------|
| Profile fields (name, DOB) in **AsyncStorage** | Assessment design per AGENTS; SecureStore reserved for future tokens — document clearly, migrate for production |
| Unencrypted SQLite (incl. account hints) | Local MVP DB; SQLCipher / field encryption is backlog |
| No biometric / PIN gate | Privacy overlay only; unlock flow is backlog |
| No `FLAG_SECURE` / screenshot block | OS-level hardening backlog |
| TMP payment processor succeeds immediately | Simulation only |

## Banking / money semantics

| Rule | Status |
|------|--------|
| Available / spendable = **completed** transactions only | Product rule (see `src/utils/balance.ts`) |
| Scheduled outgoing reserved against available for `canAfford` | Product rule |
| Pending incoming **not** spendable until settled | Product rule |
| Insufficient-funds surfaced in UI (not swallowed) | Polish |
| Amount input validated to finite, &gt; 0, max 2 decimal places | Polish (`parseAmountInput`) |
| Double-submit guards on settle / cancel where applicable | Polish |

## Assignment checklist vs AGENTS

| AGENTS product rule | Status |
|---------------------|--------|
| Sort transactions latest-first | DONE |
| Amount ≥ 0 green, &lt; 0 red | DONE |
| Loading, empty, error (+ retry), no-matching-results | DONE |
| Search (debounced ~300ms) + type filter + date range | DONE |
| Detail by `refId` only; Share via `ShareService` + `Share.share()` | DONE |
| Locales `en` + `bm` via `t(key)` | DONE |
| Theme `light` \| `dark` \| `system` via tokens | DONE |
| Lang/theme prefs: AsyncStorage; SecureStore for future tokens | DONE (profile also AsyncStorage — see caveat) |
| Never put secrets in `EXPO_PUBLIC_*` | DONE |
| Stable testIDs for E2E | DONE (drawer + filter-menu IDs; see AGENTS) |
| Jest unit / mock / RNTL; Detox smoke | DONE (Detox scaffolded, not CI-gated) |

## Test coverage summary

| Layer | What’s covered | Known gaps |
|-------|----------------|------------|
| Unit (`src/utils/`) | Sort, filter, format, balance, budget stats, categories, DOB, schedule | Expand as new helpers land |
| Security | SecureLogger, redactPii, sanitizeShare, secureStorage | — |
| Repositories / stores | Mock repos; transaction / recipient / payment / preferences stores | SQLite adapters lightly covered (platform) |
| ViewModels | List, detail, pay/request/confirm, recipients, budget, profile, scheduled, requests | Keep in sync when VM APIs change |
| RNTL widgets | Cards, search, filter menus, states, drawer, privacy overlay | Not every budget widget |
| Detox | Smoke: list → `filter-type-menu` → option → detail → share | **Not in CI**; needs `expo prebuild` + simulator |
| CI | `tsc`, Jest, lint (non-blocking) | No Detox job; no device farm |

## Production backlog

Document-only for this assessment; not blocking MVP submission:

1. **Biometric / PIN** app lock before revealing balances
2. **FLAG_SECURE** / screenshot blocking and clipboard policy for receipts
3. **SQLCipher** (or equivalent) + encrypt account hints at rest
4. Move **profile PII** from AsyncStorage → SecureStore / backend
5. **Integer minor-unit ledger** end-to-end (replace float `REAL` + epsilon)
6. **Certificate pinning** and authenticated HTTP repository / PSP adapters
7. Remove client **Mark as paid**; settle only via server webhooks
8. Atomic SQL fulfill (`UPDATE … WHERE status = 'pending'`) and stronger concurrency control
9. UUID / server-issued ids; list virtualization tuning at scale
10. **Detox in CI** with prebuild artifacts and simulator runners
11. PDF receipts; offline sync / cache invalidation; analytics without raw PII

## Key paths for reviewers

| Concern | Path |
|---------|------|
| App bootstrap / repos / privacy | `App.tsx`, `src/repositories/createRepositories.ts`, `src/presentation/widgets/PrivacyOverlay.tsx` |
| Navigation | `src/navigation/` (drawer, tabs, stacks) |
| Balance & money parse | `src/utils/balance.ts`, `src/utils/parseAmountInput.ts` |
| Stores | `src/store/transactionStore.ts`, `preferencesStore.ts`, `recipientStore.ts`, `paymentRequestStore.ts` |
| Payments port | `src/services/PaymentProcessingService.ts` |
| Security | `src/security/` |
| List / detail UI | `src/presentation/views/TransactionListView.tsx`, `TransactionDetailView.tsx` |
| Pay / recipients / budget | `QuickPayView`, `RequestPayView`, `Recipient*`, `BudgetView` under `src/presentation/views/` |
| SQLite | `src/data/sqlite/`, `src/repositories/Sqlite*.ts` |
| E2E | `e2e/transactions.e2e.ts`, `.detoxrc.js`, `e2e/README.md` |
| Agent / product rules | `AGENTS.md` |

---

*Generated for submission polish. Prefer fixing blockers called out under Architecture / Security / Banking; treat the production backlog as roadmap, not scope creep for this MVP.*
