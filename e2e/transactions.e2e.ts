import { by, device, element, expect, waitFor } from 'detox';

/**
 * Requires native projects from prebuild:
 *   npx expo prebuild
 *   npx pod-install   # iOS
 * Then build and run on a booted simulator:
 *   npm run test:e2e:build
 *   npm run test:e2e
 */
describe('Transactions smoke', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('shows the transaction list', async () => {
    await waitFor(element(by.id('transaction-list')))
      .toBeVisible()
      .withTimeout(20000);
  });

  it('opens detail from the first card and shows share', async () => {
    await waitFor(element(by.id('transaction-list')))
      .toBeVisible()
      .withTimeout(20000);

    await element(by.id('transaction-card-123ABC')).tap();

    await waitFor(element(by.id('transaction-detail')))
      .toBeVisible()
      .withTimeout(10000);
    await expect(element(by.id('share-button'))).toBeVisible();
  });
});
