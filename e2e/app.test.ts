import { expect, type Page, test } from '@playwright/test';

const pageTitle = (page: Page) => page.locator('[class*="pageTitle"]').first();
const errorCode = (page: Page) => page.getByText('404', { exact: true });

async function expectRoute(page: Page, url: string, title: string) {
  await expect(page).toHaveURL(url);
  await expect(pageTitle(page)).toHaveText(title);
}

async function gotoRoute(page: Page, url: string, title?: string) {
  await page.goto(url);

  if (title) {
    await expectRoute(page, url, title);
  } else {
    await expect(page).toHaveURL(url);
  }
}

test.describe('App routing E2E', () => {
  test('home redirects to /static', async ({ page }) => {
    await page.goto('/');
    await expectRoute(page, '/static', 'Static Page');
  });

  test('redirect from /static to /page/example works', async ({ page }) => {
    await gotoRoute(page, '/static', 'Static Page');

    await page.getByRole('link', { name: 'Dynamic' }).click();
    await expectRoute(page, '/page/example', 'Dynamic Page');
  });

  test('dynamic route with valid param renders and shows params', async ({ page }) => {
    await gotoRoute(page, '/page/example', 'Dynamic Page');

    const preLocator = page.locator('pre');

    await expect(preLocator).toContainText('"foo": "example"');
    await page.getByText('Random value', { exact: true }).click();

    const randomFoo = ((await preLocator.textContent()) || '').match(/foo": "(\d+)"/)?.[1];

    await expect(preLocator).toContainText(`"foo": "${randomFoo}"`);
    await expect(page).toHaveURL(`/page/${randomFoo}`);
  });

  test('redirect from /static to /query works', async ({ page }) => {
    await gotoRoute(page, '/static', 'Static Page');

    await page.getByRole('link', { name: 'Query' }).click();
    await expectRoute(page, '/query?foo=example', 'Query Page');
  });

  test('query route shows params', async ({ page }) => {
    await page.goto('/query?foo=1');
    await expect(page).toHaveURL('/query');

    const preLocator = page.locator('pre');

    await expect(pageTitle(page)).toHaveText('Query Page');
    await expect(preLocator).toContainText('{}');

    await page.getByText('Random query', { exact: true }).click();

    const randomFoo = ((await preLocator.textContent()) || '').match(/foo": "(\d+)"/)?.[1];

    await expect(preLocator).toContainText(`"foo": "${randomFoo}"`);
    await expect(page).toHaveURL(`/query?foo=${randomFoo}`);

    await gotoRoute(page, '/query?foo=bar', 'Query Page');
  });

  test('invalid configs redirect to 404', async ({ page }) => {
    await page.goto('/page/ab');
    await expect(errorCode(page)).toHaveText('404');
    await expectRoute(page, '/error404', 'Page Not Found');

    await page.goto('/ab');
    await expect(errorCode(page)).toHaveText('404');
    await expectRoute(page, '/error404', 'Page Not Found');
  });

  test('coming from Dynamic to Guards redirects to Static (beforeEnter)', async ({ page }) => {
    await gotoRoute(page, '/page/example', 'Dynamic Page');

    await page.getByRole('link', { name: 'Guards' }).click();
    await expectRoute(page, '/static', 'Static Page');
  });

  test('popstate redirect from Guards replaces the traversed history entry', async ({ page }) => {
    // Prepare the history stack: ['/static', '/prevent', '/page/example'],
    // pointer at '/page/example'.
    await gotoRoute(page, '/static', 'Static Page');

    await page.getByRole('link', { name: 'Guards' }).click();
    await expectRoute(page, '/prevent', 'Navigation guards');

    await page.getByRole('link', { name: 'Dynamic' }).click();
    await expectRoute(page, '/page/example', 'Dynamic Page');

    // history.back() moves from '/page/example' to '/prevent',
    // then beforeEnter redirects to '/static' and replaces '/prevent' with it.
    // Now the history stack is ['/static', '/static', '/page/example'], pointer at element 1.
    await page.goBack();
    await expectRoute(page, '/static', 'Static Page');

    // Moves the pointer to element 0 of ['/static', '/static', '/page/example'].
    await page.goBack();
    await expectRoute(page, '/static', 'Static Page');

    // Moves the pointer to element 1 of ['/static', '/static', '/page/example'].
    await page.goForward();
    await expectRoute(page, '/static', 'Static Page');

    // Moves the pointer to element 2 of ['/static', '/static', '/page/example'].
    await page.goForward();
    await expectRoute(page, '/page/example', 'Dynamic Page');
  });

  test('browser back-forward works', async ({ page }) => {
    await gotoRoute(page, '/static', 'Static Page');

    await page.getByRole('link', { name: 'Dynamic' }).click();
    await expectRoute(page, '/page/example', 'Dynamic Page');

    const preLocator = page.locator('pre');

    await expect(preLocator).toContainText('"foo": "example"');

    await page.getByText('Random value', { exact: true }).click();

    const randomFoo = ((await preLocator.textContent()) || '').match(/foo": "(\d+)"/)?.[1];

    await expect(preLocator).toContainText(`"foo": "${randomFoo}"`);
    await expect(page).toHaveURL(`/page/${randomFoo}`);

    await page.goBack();
    await expectRoute(page, '/page/example', 'Dynamic Page');
    await expect(preLocator).toContainText('"foo": "example"');

    await page.goBack();
    await expectRoute(page, '/static', 'Static Page');

    await page.goForward();
    await expectRoute(page, '/page/example', 'Dynamic Page');
    await expect(preLocator).toContainText('"foo": "example"');

    await page.goForward();
    await expect(preLocator).toContainText(`"foo": "${randomFoo}"`);
    await expect(page).toHaveURL(`/page/${randomFoo}`);
  });
});
