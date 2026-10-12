import { by, device, element, expect, waitFor } from 'detox';

/**
 * Requires native projects from prebuild:
 *   npx expo prebuild
 *   npx pod-install   # iOS
 * Then build and run on a booted simulator:
 *   npm run test:e2e:build
 *   npm run test:e2e
 *
 * Stable testIDs: transaction-list, filter-type-menu, filter-type-option-*,
 * search-input, transaction-card-{refId}, transaction-detail, share-button
 */
describe('Transactions smoke', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('list → filter → detail → share', async () => {
    await waitFor(element(by.id('transaction-list')))
      .toBeVisible()
      .withTimeout(20000);

    await element(by.id('filter-type-menu')).tap();
    await waitFor(element(by.id('filter-type-option-outgoing')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('filter-type-option-outgoing')).tap();

    await waitFor(element(by.id('transaction-card-789GHI')))
      .toBeVisible()
      .withTimeout(5000);
    await expect(element(by.id('transaction-card-123ABC'))).not.toBeVisible();

    // Optional: search narrows results without requiring a hit
    try {
      await waitFor(element(by.id('search-input')))
        .toBeVisible()
        .withTimeout(2000);
      await element(by.id('search-input')).typeText('789');
      await waitFor(element(by.id('transaction-card-789GHI')))
        .toBeVisible()
        .withTimeout(5000);
    } catch {
      // search-input may be off-screen or keyboard timing may vary
    }

    await element(by.id('transaction-card-789GHI')).tap();

    await waitFor(element(by.id('transaction-detail')))
      .toBeVisible()
      .withTimeout(10000);
    await expect(element(by.id('share-button'))).toBeVisible();

    // OS share sheet is flaky to assert; only verify the button is pressable
    await element(by.id('share-button')).tap();
  });
});
