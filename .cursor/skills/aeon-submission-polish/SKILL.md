---
name: aeon-submission-polish
description: >-
  Orchestrates AEON Bank Transactions submission polish via parallel Task
  subagents (cleanup, banking RN, security, tests, Detox, docs) then parent
  verify. Use when preparing submission, full code review + tests + README,
  or when the user asks to run the polish process with subagents.
---

# AEON submission polish (orchestrator)

Parent stays thin. Spawn **parallel** Task custom agents when write paths do not conflict. Do **not** edit the plan file if one is attached.

## Streams (custom agents)

| Stream | Agent | Touches | Avoid |
|--------|-------|---------|-------|
| Cleanup + widgets | `aeon-cleanup` | Dead UI, FormField/segment extract | `balance.ts`, e2e, docs prose |
| Banking RN | `aeon-banking` | Money semantics, PrivacyOverlay, forms/a11y | Detox, CODE_REVIEW body |
| Security | `aeon-security` | SecureLogger, redactPii, security tests | Pay UI forms, Detox |
| Tests | `aeon-tests` | Unit / mock / RNTL / ViewModels | Production UI except testIDs |
| Detox | `aeon-detox` | `e2e/` only | `src/` |
| Docs | `aeon-docs` | README, AGENTS, CODE_REVIEW | Source logic |
| Verify | `aeon-verifier` | After streams: tsc / jest / lint + review skills | New features |

If Cleanup and Banking both edit pay views, **combine** into one Task or sequence Cleanup then Banking.

## Brief template (every Task)

```text
Repo: <absolute path>
Constraints: AGENTS.md + .cursor/rules (architecture, security, i18n-theme, testing)
Paths to touch: …
Paths NOT to edit: …
Return: files changed/deleted + API summaries + test results
```

## Parent verify

1. Run `aeon-architecture-review`, `aeon-security-pass`, `aeon-test-author` (gap check) in parallel (read-only).
2. `npx tsc --noEmit` · `npm test` · `npx expo lint`
3. Fix blockers; keep summaries only — do not re-read entire trees.
4. Commit only if the user asks.

## Defaults (assessment)

- Profile PII may stay in AsyncStorage; document + comment. SecureStore = future tokens.
- Detox smoke fixed locally; **not** gated in CI unless asked.
- Prefer clarifying comments over comment spam.
- Out of scope unless asked: biometric lock, SQLCipher, cert pinning, Detox CI.

## Related

- Skills: `aeon-banking-rn`, `aeon-architecture-review`, `aeon-security-pass`, `aeon-test-author`
- Agents: `.cursor/agents/aeon-*.md`
- Rules: `.cursor/rules/subagent-orchestration.mdc`
