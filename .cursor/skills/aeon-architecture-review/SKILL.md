---
name: aeon-architecture-review
description: >-
  Review AEON Bank Transactions for Clean Architecture + MVVM layering, reusable
  widgets, and TypeScript strictness. Use before merge or submission, and as the
  architecture pass inside aeon-submission-polish / aeon-verifier.
---

# Architecture review

Check:

1. Dependency rule: views/widgets → viewmodels → store → repositories → data
2. No React in models/repositories/utils
3. Views do not import repositories or raw mock data
4. Widgets are reusable and presentational
5. No `any`; proper interfaces
6. Stable `testID`s on interactive elements

Return a short actionable fix list only (path + issue + suggested fix).
