import { expect, test } from '@playwright/test';

async function expectPathname(page: any, pathname: string) {
  await expect(page).toHaveURL(new RegExp(`${pathname.replace(/\//g, '\\/')}(?:$|[?#])`));
  const current = await page.evaluate(() => window.location.pathname + window.location.search);
  expect(current).toMatch(new RegExp(`^${pathname.replace(/\//g, '\\/')}(?:$|[?#])`));
}

const base = '/';
const h1 = 'h1';

test.describe('React example app routing E2E', () => {
  test('home redirects to /static (beforeEnter) and window.location reflects it', async ({
    page,
  }) => {
    await page.goto(base);
    await page.waitForLoadState('networkidle');

    await expect(page.locator(h1)).toHaveText('Static Page');
    await expectPathname(page, '/static');
  });

  test('dynamic route with valid param renders and shows params', async ({ page }) => {
    await page.goto('/page/example');
    await page.waitForLoadState('networkidle');

    await expect(page.locator(h1)).toHaveText('Dynamic Page');
    await expect(page.locator('.dynamic-page pre').nth(1)).toContainText('"foo": "example"');
    await expectPathname(page, '/page/example');
  });
  //
  // test('dynamic route with invalid param redirects to 404', async ({ page }) => {
  //   await page.goto('/page/ab');
  //   await page.waitForLoadState('networkidle');
  //
  //   await expect(page.locator('.error-code')).toHaveText('404');
  //   await expect(page.locator(h1)).toHaveText('Page Not Found');
  //   await expectPathname(page, '/error404');
  // });
  //
  // test('query route with valid foo renders and shows query', async ({ page }) => {
  //   await page.goto('/query?foo=example');
  //   await page.waitForLoadState('networkidle');
  //
  //   await expect(page.locator(h1)).toHaveText('Query Page');
  //   await expect(page.locator('.query-page pre').nth(1)).toContainText('"foo": "example"');
  //   await expectPathname(page, '/query?foo=example');
  // });
  //
  // test('query route with invalid foo still matches (validation fails but route matches) and retains window.location', async ({ page }) => {
  //   await page.goto('/query?foo=ab');
  //   await page.waitForLoadState('networkidle');
  //
  //   await expect(page.locator(h1)).toHaveText('Query Page');
  //   // We only assert location remains; UI content may vary by validation outcome
  //   await expectPathname(page, '/query?foo=ab');
  // });
  //
  // test('prevent: coming from Dynamic to Prevent redirects to Static (beforeEnter)', async ({ page }) => {
  //   await page.goto('/page/example');
  //   await expect(page.locator(h1)).toHaveText('Dynamic Page');
  //
  //   // Click button that says it will redirect to Static when going to Prevent
  //   await page.getByRole('button', { name: 'Go to Prevent Page (will redirect to Static)' }).click();
  //
  //   await expect(page.locator(h1)).toHaveText('Static Page');
  //   await expectPathname(page, '/static');
  // });
  //
  // test('prevent: from Prevent trying to go to Query is blocked (beforeLeave) and URL remains the same', async ({ page }) => {
  //   await page.goto('/prevent');
  //   await expect(page.locator(h1)).toHaveText('Prevent Redirect Page');
  //
  //   const urlBefore = page.url();
  //   await page.getByRole('button', { name: 'Try to go to Query Page (will be blocked)' }).click();
  //
  //   // Give any async hooks time to run
  //   await page.waitForTimeout(200);
  //
  //   await expect(page.locator(h1)).toHaveText('Prevent Redirect Page');
  //   expect(page.url()).toBe(urlBefore);
  //   await expectPathname(page, '/prevent');
  // });
});
