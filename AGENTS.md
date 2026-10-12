# AEON Bank Transactions — Agent Guide

Expo + React Native + TypeScript banking MVP. Follow Clean Architecture + MVVM. Prefer Task subagents for bounded workstreams; keep the parent agent thin.

## Stack

- Expo (see `package.json` for SDK major; check https://docs.expo.dev/versions/v\<major\>.0.0/ before Expo APIs)
- React Navigation: drawer + bottom tabs + native stack (not Expo Router)
- Zustand for app state
- TypeScript `strict`, never `any`
- Jest + RNTL + Detox

## Architecture (Clean Architecture + MVVM)

Dependency rule:

```text
views / widgets → viewmodels → store → repositories → data
```

| Layer | Path | Rules |
|-------|------|--------|
| Models | `src/models/` | No React, no Zustand |
| Data | `src/data/` | Raw mock BE payloads only |
| Repositories | `src/repositories/` | Port + adapters; return domain models; no React |
| Store | `src/store/` | Zustand; talks to repository / storage; no JSX |
| ViewModels | `src/presentation/viewmodels/` | Hooks: state, intents, navigation, share; no heavy JSX |
| Views | `src/presentation/views/` | Compose widgets; no direct repository imports |
| Widgets | `src/presentation/widgets/` | Presentational; typed props; stable `testID`s |
| i18n / theme | `src/i18n/`, `src/theme/` | No hardcoded user strings or raw colors in views/widgets |
| Security | `src/security/` | Redact PII in logs; sanitize share payloads |
| Services | `src/services/` | Wrap native APIs (Share, etc.) |

Why both: Clean Architecture keeps ports/adapters and testable domain; MVVM maps to RN (hooks as ViewModels, screens as Views).

## Product rules

- Sort transactions latest-first
- Amount ≥ 0 green, &lt; 0 red
- Loading, empty, error (+ retry), no-matching-results states
- Search (debounced ~300ms) + type filter + date range filter
- Detail by `refId` only; Share via `ShareService` + `Share.share()`
- Locales: `en` + `bm` via `t(key)`
- Theme: `light` | `dark` | `system` via tokens
- Lang/theme prefs: AsyncStorage; SecureStore reserved for future tokens
- Never put secrets in `EXPO_PUBLIC_*`

## Testing

- Unit: pure utils (`src/utils/`)
- Mock: inject fake repository / ShareService at boundaries
- Component: RNTL on widgets
- E2E: Detox smoke (list → filter → detail → share)
- Stable `testID`s: `transaction-list`, `transaction-card-{refId}`, `search-input`, `filter-type-menu`, `filter-type-option-*`, `filter-category-menu`, `filter-date-calendar`, `filter-date-preset-*`, `share-button`, `drawer-theme`, `drawer-theme-*`, `drawer-language`, `drawer-language-*`, `privacy-overlay`, `tab-transactions`, `tab-recipients`, `tab-budget`

## Git-flow

- `main` — stable / submission
- `develop` — integration
- `feature/*` — one concern per branch
- Conventional commits; atomic history that shows thought process

## Subagent orchestration

Parent coordinates, integrates, commits. Spawn parallel Task subagents when write paths do not conflict.

**Custom agents** (`.cursor/agents/`): `aeon-cleanup`, `aeon-banking`, `aeon-security`, `aeon-tests`, `aeon-detox`, `aeon-docs`, `aeon-verifier`.

**Submission polish streams** (see skill `aeon-submission-polish`):

1. Cleanup + FormField extract → `aeon-cleanup`
2. Banking RN harden → `aeon-banking`
3. Security wire + tests → `aeon-security`
4. Unit / mock / RNTL / VMs → `aeon-tests`
5. Detox smoke → `aeon-detox`
6. README / AGENTS / CODE_REVIEW → `aeon-docs`
7. Parent verify → `aeon-verifier` (+ architecture / security / test-gap skills)

Each Task brief must list: paths to touch, AGENTS.md constraints, and paths not to edit. Parent keeps API summaries only — do not re-read entire trees.

## Commands

```bash
npx expo install <pkg>   # SDK-compatible installs
npm start
npm test
npx tsc --noEmit
npx expo lint
```

## Skills

Project skills under `.cursor/skills/`:

| Skill | When |
|-------|------|
| `aeon-submission-polish` | Full polish / parallel subagent orchestration |
| `aeon-banking-rn` | Money path / privacy overlay / banking RN practices |
| `aeon-architecture-review` | Layering review before merge/submission |
| `aeon-security-pass` | Read-only PII / share / secrets scan |
| `aeon-test-author` | Author or gap-check unit / mock / RNTL / Detox |
