# Detox E2E (Expo)

Smoke coverage: **list → type filter → (optional search) → detail → share**.

Detox is **not** part of the default CI pipeline. Run it locally after native prebuild.

## Run locally

1. `npx expo prebuild`
2. `npx pod-install` (iOS)
3. Boot an iOS Simulator (or Android emulator for `android.emu.debug`)
4. `npm run test:e2e:build`
5. `npm run test:e2e`

The `expo-detox-config-plugin` in `app.json` applies Detox Gradle/Xcode settings during prebuild.

## Stable testIDs used by smoke

| testID | Role |
|--------|------|
| `transaction-list` | List screen / loaded list container |
| `filter-type-menu` | Opens type filter menu |
| `filter-type-option-all` | Type option: all |
| `filter-type-option-incoming` | Type option: incoming |
| `filter-type-option-outgoing` | Type option: outgoing |
| `search-input` | Debounced search field (optional in smoke) |
| `transaction-card-{refId}` | List row (e.g. `transaction-card-789GHI`) |
| `transaction-detail` | Detail screen root |
| `share-button` | Share action on detail |

Type filter is a **menu**, not chips: open `filter-type-menu`, then tap `filter-type-option-*` (not `filter-type-outgoing`).

Share opens an OS modal; smoke asserts `share-button` is visible and taps it — it does not assert the system share sheet.
