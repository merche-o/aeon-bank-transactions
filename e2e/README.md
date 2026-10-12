# Detox E2E (Expo)

Native `ios/` and `android/` folders are generated and gitignored. Before running Detox:

1. `npx expo prebuild`
2. `npx pod-install` (iOS)
3. Boot an iOS Simulator (or Android emulator for `android.emu.debug`)
4. `npm run test:e2e:build`
5. `npm run test:e2e`

The `expo-detox-config-plugin` in `app.json` applies Detox Gradle/Xcode settings during prebuild.
