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

  it('filters outgoing, opens detail, and shows share', async () => {
    await waitFor(element(by.id('transaction-list')))
      .toBeVisible()
      .withTimeout(20000);

    await element(by.id('filter-type-outgoing')).tap();
    await waitFor(element(by.id('transaction-card-789GHI')))
      .toBeVisible()
      .withTimeout(5000);
    await expect(element(by.id('transaction-card-123ABC'))).not.toBeVisible();

    await element(by.id('transaction-card-789GHI')).tap();

    await waitFor(element(by.id('transaction-detail')))
      .toBeVisible()
      .withTimeout(10000);
    await expect(element(by.id('share-button'))).toBeVisible();
  });
});
