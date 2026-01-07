import { describe, expect, it } from 'vitest';

import { isClient } from '../core/constants';
import { prepareRouterTest } from './prepareRouterTest';
import { TypeOptions } from './types';

export async function routerTests(
  optionsArray: Array<TypeOptions>,
  before?: (options: TypeOptions) => void
) {
  describe.runIf(isClient).each(optionsArray)(
    `Client tests Router [$renderer + $reactivity]`,
    (options) => {
      before?.(options);

      it('Spy render and autorun', async () => {
        const { router, checkSpy, calls, render, spy_pageAutorun } =
          await prepareRouterTest(options);

        const container = (await render()).container;

        await router.redirect({ route: 'staticRouteAutorun' });

        calls.pageRender += 1;
        calls.pageAutorun += 1;
        calls.beforeComponentChange += 1;

        expect(container.innerHTML).to.eq('StaticAutorun');

        expect(spy_pageAutorun).toHaveBeenLastCalledWith('staticRouteAutorun');

        checkSpy();

        await router.redirect({ route: 'staticRoute' });

        calls.beforeComponentChange += 1;

        expect(container.innerHTML).to.eq('Static');

        expect(spy_pageAutorun).toHaveBeenLastCalledWith('staticRouteAutorun');

        checkSpy();

        router.destroyHistoryListener();
      });

      it('Only beforeSetPageComponent called on first render', async () => {
        const { router, checkSpy, calls, render } = await prepareRouterTest(options);

        const container = (await render()).container;

        await router.redirect({ route: 'staticRoute' });

        calls.beforeComponentChange += 1;

        expect(container.innerHTML).to.eq('Static');

        checkSpy();

        router.destroyHistoryListener();
      });

      it('Restored from server renders correctly', async () => {
        const { router, checkSpy, calls, render } = await prepareRouterTest(options);

        await router.hydrateFromState({
          // @ts-ignore
          state: {
            staticRoute: {
              name: 'staticRoute',
              props: {},
              query: {},
              params: {},
              pathname: '/test/static',
              url: '/test/static',
              search: '',
              isActive: true,
            },
          },
        });

        const container = (await render()).container;

        calls.beforeComponentChange += 1;

        expect(container.innerHTML).to.eq('Static');

        checkSpy();

        router.destroyHistoryListener();
      });

      it('No lifecycle if only params changed (with page name)', async () => {
        const { router, render, checkSpy, calls } = await prepareRouterTest(options);

        const container = (await render()).container;

        await router.redirect({ route: 'dynamicRoute', params: { static: 'asd' } });

        calls.beforeComponentChange += 1;

        expect(container.innerHTML).to.eq('<div>Dynamic</div>');

        checkSpy();

        await router.redirect({ route: 'dynamicRoute', params: { static: 'dsa' } });

        expect(container.innerHTML).to.eq('<div>Dynamic</div>');

        checkSpy();

        router.destroyHistoryListener();
      });

      it('No lifecycle if only params changed (without page name)', async () => {
        const { router, render, checkSpy, calls } = await prepareRouterTest(options);

        const container = (await render()).container;

        await router.redirect({ route: 'noPageName', params: { foo: 'foo' } });

        calls.beforeComponentChange += 1;

        expect(container.innerHTML).to.eq('<div>No page name</div>');

        checkSpy();

        await router.redirect({ route: 'noPageName', params: { foo: 'bar' } });

        expect(container.innerHTML).to.eq('<div>No page name</div>');

        checkSpy();

        router.destroyHistoryListener();
      });

      it('No router lifecycle (same component)', async () => {
        const { router, render, checkSpy, calls } = await prepareRouterTest(options);

        const container = (await render()).container;

        await router.redirect({ route: 'dynamicRoute', params: { static: 'asd' } });

        calls.beforeComponentChange += 1;

        expect(container.innerHTML).to.eq('<div>Dynamic</div>');

        checkSpy();

        await router.redirect({ route: 'dynamicRoute2', params: { static: 'dsa' } });

        expect(container.innerHTML).to.eq('<div>Dynamic</div>');

        checkSpy();

        router.destroyHistoryListener();
      });

      it('No router lifecycle (same component) 2', async () => {
        const { router, render, checkSpy, calls } = await prepareRouterTest(options);

        const container = (await render()).container;

        await router.redirect({ route: 'noPageName', params: { foo: 'bar' } });

        calls.beforeComponentChange += 1;

        expect(container.innerHTML).to.eq('<div>No page name</div>');

        checkSpy();

        await router.redirect({ route: 'noPageName2', params: { foo: 'foo', bar: 'bar' } });

        expect(container.innerHTML).to.eq('<div>No page name</div>');

        checkSpy();

        router.destroyHistoryListener();
      });

      it('No rerender and lifecycle on props change', async () => {
        const { router, render, checkSpy, calls } = await prepareRouterTest(options);

        const container = (await render()).container;

        await router.redirect({ route: 'notFound' });

        calls.beforeComponentChange += 1;

        expect(container.innerHTML).to.eq('Error 404');

        checkSpy();

        await router.redirect({ route: 'internalError' });

        expect(container.innerHTML).to.eq('Error 500');

        checkSpy();

        router.destroyHistoryListener();
      });

      it('History pop', async () => {
        const { router, render, checkSpy, calls } = await prepareRouterTest(options);

        function waitForRedirect() {
          return new Promise((resolve) => {
            const interval = setInterval(() => {
              if (!router.isRedirecting) {
                clearInterval(interval);
                resolve(null);
              }
            }, 10);
          });
        }

        const container = (await render()).container;

        await router.redirect({ route: 'staticRoute' });

        calls.beforeComponentChange += 1;

        expect(container.innerHTML).to.eq('Static');

        checkSpy();

        expect(location.pathname).to.eq('/test/static');

        await router.redirect({ route: 'dynamicRoute', params: { static: 'asd' } });

        calls.beforeComponentChange += 1;

        expect(container.innerHTML).to.eq('<div>Dynamic</div>');

        checkSpy();

        expect(location.pathname).to.eq('/test/asd');

        await router.redirect({ route: 'dynamicRoute2', params: { static: 'asd' } });

        expect(container.innerHTML).to.eq('<div>Dynamic</div>');

        checkSpy();

        expect(location.pathname).to.eq('/test3/asd');

        history.back();

        await waitForRedirect();

        expect(container.innerHTML).to.eq('<div>Dynamic</div>');

        checkSpy();

        expect(location.pathname).to.eq('/test/asd');

        history.back();

        await waitForRedirect();

        calls.beforeComponentChange += 1;

        expect(container.innerHTML).to.eq('Static');

        checkSpy();

        expect(location.pathname).to.eq('/test/static');

        history.forward();

        await waitForRedirect();

        calls.beforeComponentChange += 1;

        expect(container.innerHTML).to.eq('<div>Dynamic</div>');

        checkSpy();

        expect(location.pathname).to.eq('/test/asd');

        history.forward();

        await waitForRedirect();

        expect(container.innerHTML).to.eq('<div>Dynamic</div>');

        checkSpy();

        expect(location.pathname).to.eq('/test3/asd');

        router.destroyHistoryListener();
      });

      it('Unmount check', async () => {
        const { router, checkSpy, calls, render } = await prepareRouterTest(options);

        const screen = await render();
        const container = screen.container;

        await router.redirect({ route: 'staticRoute' });

        calls.beforeComponentChange += 1;

        expect(container.innerHTML).to.eq('Static');

        checkSpy();

        screen.unmount();

        expect(container.innerHTML).to.eq('');

        router.destroyHistoryListener();
      });
    }
  );

  describe.runIf(!isClient).each(optionsArray)(
    `SSR tests Router [$renderer + $reactivity]`,
    (options) => {
      it('SSR', async () => {
        const { router, renderToString, checkSpy, calls } = await prepareRouterTest(options);

        await router.redirect({ route: 'staticRoute' });

        const html1 = await renderToString();

        expect(html1).to.eq('Static');

        calls.beforeComponentChange += 1;

        checkSpy();
      });
    }
  );
}
