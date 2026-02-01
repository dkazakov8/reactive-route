import { expect, test } from '@playwright/test';

const h1 = 'h1';

test.describe('App routing E2E', () => {
  test('home redirects to /static', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/static');

    await expect(page.locator(h1)).toHaveText('Static Page');
  });

  test('redirect from /static to /page/example works', async ({ page }) => {
    await page.goto('/static');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/static');

    await expect(page.locator(h1)).toHaveText('Static Page');

    await page.getByText('Go to Dynamic Page').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/page/example');

    await expect(page.locator(h1)).toHaveText('Dynamic Page');
  });

  test('dynamic route with valid param renders and shows params', async ({ page }) => {
    await page.goto('/page/example');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/page/example');

    const preLocator = page.locator('.dynamicPage pre').nth(1);

    await expect(page.locator(h1)).toHaveText('Dynamic Page');
    await expect(preLocator).toContainText('"foo": "example"');
    await page.getByText('Go to random dynamic value').click();

    const randomFoo = ((await preLocator.textContent()) || '').match(/foo": "(\d+)"/)?.[1];

    await expect(preLocator).toContainText(`"foo": "${randomFoo}"`);
    await expect(page).toHaveURL(`/page/${randomFoo}`);
  });

  test('redirect from /static to /query works', async ({ page }) => {
    await page.goto('/static');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/static');

    await expect(page.locator(h1)).toHaveText('Static Page');

    await page.getByText('Go to Query Page').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/query?foo=example');

    await expect(page.locator(h1)).toHaveText('Query Page');
  });

  test('query route shows params', async ({ page }) => {
    await page.goto('/query?foo=1');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/query');

    const preLocator = page.locator('.queryPage pre').nth(1);

    await expect(page.locator(h1)).toHaveText('Query Page');
    await expect(preLocator).toContainText('{}');

    await page.getByText('Go to random query value').click();

    const randomFoo = ((await preLocator.textContent()) || '').match(/foo": "(\d+)"/)?.[1];

    await expect(preLocator).toContainText(`"foo": "${randomFoo}"`);
    await expect(page).toHaveURL(`/query?foo=${randomFoo}`);

    await page.goto('/query?foo=bar');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/query?foo=bar');
  });

  test('invalid routes redirect to 404', async ({ page }) => {
    await page.goto('/page/ab');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.errorCode')).toHaveText('404');
    await expect(page.locator(h1)).toHaveText('Page Not Found');
    await expect(page).toHaveURL('/error404');

    await page.goto('/ab');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.errorCode')).toHaveText('404');
    await expect(page.locator(h1)).toHaveText('Page Not Found');
    await expect(page).toHaveURL('/error404');
  });

  test('prevent: coming from Dynamic to Prevent redirects to Static (beforeEnter)', async ({
    page,
  }) => {
    await page.goto('/page/example');
    await page.waitForLoadState('networkidle');

    await expect(page.locator(h1)).toHaveText('Dynamic Page');

    await page.getByText('Go to Prevent Page (will redirect to Static)').click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator(h1)).toHaveText('Static Page');
    await expect(page).toHaveURL('/static');
  });

  test('prevent: from Prevent trying to go to Query is blocked (beforeLeave) and URL remains the same', async ({
    page,
  }) => {
    await page.goto('/prevent');
    await page.waitForLoadState('networkidle');

    await expect(page.locator(h1)).toHaveText('Prevent Redirect Page');

    await page.getByText('Try to go to Query Page (will be blocked)').click();

    await page.waitForTimeout(100);

    await expect(page.locator(h1)).toHaveText('Prevent Redirect Page');
    await expect(page).toHaveURL('/prevent');
  });

  test('browser back-forward works', async ({ page }) => {
    await page.goto('/static');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/static');

    await expect(page.locator(h1)).toHaveText('Static Page');

    await page.getByText('Go to Dynamic Page').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/page/example');

    const preLocator = page.locator('.dynamicPage pre').nth(1);

    await expect(page.locator(h1)).toHaveText('Dynamic Page');
    await expect(preLocator).toContainText('"foo": "example"');

    await page.getByText('Go to random dynamic value').click();

    const randomFoo = ((await preLocator.textContent()) || '').match(/foo": "(\d+)"/)?.[1];

    await expect(preLocator).toContainText(`"foo": "${randomFoo}"`);
    await expect(page).toHaveURL(`/page/${randomFoo}`);

    page.goBack();

    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/page/example');

    await expect(page.locator(h1)).toHaveText('Dynamic Page');
    await expect(preLocator).toContainText('"foo": "example"');

    page.goBack();

    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/static');

    await expect(page.locator(h1)).toHaveText('Static Page');

    page.goForward();

    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/page/example');

    await expect(page.locator(h1)).toHaveText('Dynamic Page');
    await expect(preLocator).toContainText('"foo": "example"');

    page.goForward();

    await page.waitForLoadState('networkidle');

    await expect(preLocator).toContainText(`"foo": "${randomFoo}"`);
    await expect(page).toHaveURL(`/page/${randomFoo}`);
  });
});
