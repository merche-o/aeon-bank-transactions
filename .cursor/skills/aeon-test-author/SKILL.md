---
name: aeon-test-author
description: >-
  Author or gap-check unit, mock, RNTL, and Detox tests for AEON Bank
  Transactions. Use when adding features, reviewing coverage, or with agent
  aeon-tests / aeon-submission-polish stream 4.
---

# Test author

Ensure coverage for:

- Pure utils (sort, filter, search, format)
- Mock boundary tests (repository, store, ShareService)
- Widget component tests
- Detox smoke: list → filter → detail → share

Follow `testID` conventions in AGENTS.md. Prefer injectable fakes over real timers/network.
Return files added/changed and pass/fail summary.
