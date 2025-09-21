import { describe, expect, it } from 'vitest';

import { constants } from '../core/utils/constants';
import { prepareComponentWithSpy } from './helpers';
import { TypeOptions } from './types';

export function routerTests(
  optionsArray: Array<TypeOptions>,
  before?: (options: TypeOptions) => void
) {
  optionsArray.forEach((options) => {
    before?.(options);

    describe.runIf(constants.isClient)(`Client tests Router + [${options.reactivity}]`, () => {
      it('Spy render and autorun', async () => {
        const { router, checkSpy, calls, render, spy_pageAutorun } =
          await prepareComponentWithSpy(options);

        const container = render();

        await router.redirectTo({ route: 'staticRouteAutorun' });

        calls.pageRender += 1;
        calls.pageAutorun += 1;
        calls.beforeSetPageComponent += 1;

        expect(container.innerHTML).to.eq('StaticAutorun');

        expect(spy_pageAutorun).toHaveBeenLastCalledWith('staticRouteAutorun');

        checkSpy();

        await router.redirectTo({ route: 'staticRoute' });

        calls.pageAutorun += 1;
        calls.beforeSetPageComponent += 1;
        calls.beforeUpdatePageComponent += 1;

        expect(container.innerHTML).to.eq('Static');

        expect(spy_pageAutorun).toHaveBeenLastCalledWith('staticRoute');

        checkSpy();
      });

      it('Only beforeSetPageComponent called on first render', async () => {
        const { router, checkSpy, calls, render } = await prepareComponentWithSpy(options);

        const container = render();

        await router.redirectTo({ route: 'staticRoute' });

        calls.beforeSetPageComponent += 1;

        expect(container.innerHTML).to.eq('Static');

        checkSpy();
      });

      it('Restored from server renders correctly', async () => {
        const { router, checkSpy, calls, render } = await prepareComponentWithSpy(options);

        await router.restoreFromServer({
          routesHistory: ['/test/static'],
          currentRoute: {
            name: 'staticRoute',
            path: '/test/static',
            query: {},
            params: {},
            pageName: 'static',
          },
          isRedirecting: false,
        } as any);

        const container = render();

        calls.beforeSetPageComponent += 1;

        expect(container.innerHTML).to.eq('Static');

        checkSpy();
      });

      it('No lifecycle if only params changed (with page name)', async () => {
        const { router, render, checkSpy, calls } = await prepareComponentWithSpy(options);

        const container = render();

        await router.redirectTo({ route: 'dynamicRoute', params: { static: 'asd' } });

        calls.beforeSetPageComponent += 1;

        expect(container.innerHTML).to.eq('<div>Dynamic</div>');

        checkSpy();

        await router.redirectTo({ route: 'dynamicRoute', params: { static: 'dsa' } });

        expect(container.innerHTML).to.eq('<div>Dynamic</div>');

        checkSpy();
      });

      it('No lifecycle if only params changed (without page name)', async () => {
        const { router, render, checkSpy, calls } = await prepareComponentWithSpy(options);

        const container = render();

        await router.redirectTo({ route: 'noPageName', params: { foo: 'foo' } });

        calls.beforeSetPageComponent += 1;

        expect(container.innerHTML).to.eq('<div>No page name</div>');

        checkSpy();

        await router.redirectTo({ route: 'noPageName', params: { foo: 'bar' } });

        expect(container.innerHTML).to.eq('<div>No page name</div>');

        checkSpy();
      });

      it('No lifecycle (same page name)', async () => {
        const { router, render, checkSpy, calls } = await prepareComponentWithSpy(options);

        const container = render();

        await router.redirectTo({ route: 'dynamicRoute', params: { static: 'asd' } });

        calls.beforeSetPageComponent += 1;

        expect(container.innerHTML).to.eq('<div>Dynamic</div>');

        checkSpy();

        await router.redirectTo({ route: 'dynamicRoute2', params: { static: 'dsa' } });

        expect(container.innerHTML).to.eq('<div>Dynamic</div>');

        checkSpy();
      });

      it('Has lifecycle (no page name)', async () => {
        const { router, render, checkSpy, calls } = await prepareComponentWithSpy(options);

        const container = render();

        await router.redirectTo({ route: 'noPageName', params: { foo: 'bar' } });

        calls.beforeSetPageComponent += 1;

        expect(container.innerHTML).to.eq('<div>No page name</div>');

        checkSpy();

        await router.redirectTo({ route: 'noPageName2', params: { foo: 'foo', bar: 'bar' } });

        calls.beforeSetPageComponent += 1;
        calls.beforeUpdatePageComponent += 1;

        expect(container.innerHTML).to.eq('<div>No page name</div>');

        checkSpy();
      });

      it('No rerender and lifecycle on props change', async () => {
        const { router, render, checkSpy, calls } = await prepareComponentWithSpy(options);

        const container = render();

        await router.redirectTo({ route: 'notFound' });

        calls.beforeSetPageComponent += 1;

        expect(container.innerHTML).to.eq('Error 404');

        checkSpy();

        await router.redirectTo({ route: 'internalError' });

        expect(container.innerHTML).to.eq('Error 500');

        checkSpy();
      });
    });

    describe.runIf(!constants.isClient)(`SSR tests Router + [${options.reactivity}]`, () => {
      it('SSR', async () => {
        const { router, renderToString, checkSpy, calls } = await prepareComponentWithSpy(options);

        await router.redirectTo({ route: 'staticRoute' });

        const html1 = renderToString();

        expect(html1).to.eq('Static');

        calls.beforeSetPageComponent += 1;

        checkSpy();
      });
    });
  });
}
