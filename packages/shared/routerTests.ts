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

    async function wrap(cb: () => Promise<void>) {
      await cb();
    }

    describe.runIf(constants.isClient)(`Client tests Router + [${options.reactivity}]`, () => {
      it('Only beforeSetPageComponent called on first render', async () => {
        const { router, checkSpy, calls, render } = await prepareComponentWithSpy(options);

        const container = render();

        await wrap(async () => {
          await router.redirectTo({ route: 'staticRoute' });
        });

        calls.renderTimes += 1;
        calls.beforeSetPageComponent += 1;

        expect(container.innerHTML).to.eq('Static');

        checkSpy();
      });

      it('No rerender and lifecycle if only params changed (with page name)', async () => {
        const { router, render, checkSpy, calls } = await prepareComponentWithSpy(options);

        const container = render();

        await wrap(async () => {
          await router.redirectTo({ route: 'dynamicRoute', params: { static: 'asd' } });
        });

        calls.renderTimes += 1;
        calls.beforeSetPageComponent += 1;

        expect(container.innerHTML).to.eq('<div>Dynamic</div>');

        checkSpy();

        await wrap(async () => {
          await router.redirectTo({ route: 'dynamicRoute', params: { static: 'dsa' } });
        });

        expect(container.innerHTML).to.eq('<div>Dynamic</div>');

        checkSpy();
      });

      it('No rerender and lifecycle if only params changed (without page name)', async () => {
        const { router, render, checkSpy, calls } = await prepareComponentWithSpy(options);

        const container = render();

        await wrap(async () => {
          await router.redirectTo({ route: 'noPageName', params: { foo: 'foo' } });
        });

        calls.renderTimes += 1;
        calls.beforeSetPageComponent += 1;

        expect(container.innerHTML).to.eq('<div>No page name</div>');

        checkSpy();

        await wrap(async () => {
          await router.redirectTo({ route: 'noPageName', params: { foo: 'bar' } });
        });

        expect(container.innerHTML).to.eq('<div>No page name</div>');

        checkSpy();
      });

      it('No rerender and lifecycle (same page name)', async () => {
        const { router, render, checkSpy, calls } = await prepareComponentWithSpy(options);

        const container = render();

        await wrap(async () => {
          await router.redirectTo({ route: 'dynamicRoute', params: { static: 'asd' } });
        });

        calls.renderTimes += 1;
        calls.beforeSetPageComponent += 1;

        expect(container.innerHTML).to.eq('<div>Dynamic</div>');

        checkSpy();

        await wrap(async () => {
          await router.redirectTo({ route: 'dynamicRoute2', params: { static: 'dsa' } });
        });

        expect(container.innerHTML).to.eq('<div>Dynamic</div>');

        checkSpy();
      });

      it('Rerender and lifecycle (no page name)', async () => {
        const { router, render, checkSpy, calls } = await prepareComponentWithSpy(options);

        const container = render();

        await wrap(async () => {
          await router.redirectTo({ route: 'noPageName', params: { foo: 'bar' } });
        });

        calls.renderTimes += 1;
        calls.beforeSetPageComponent += 1;

        expect(container.innerHTML).to.eq('<div>No page name</div>');

        checkSpy();

        await wrap(async () => {
          await router.redirectTo({
            route: 'noPageName2',
            params: { foo: 'foo', bar: 'bar' },
          });
        });

        calls.beforeSetPageComponent += 1;
        calls.beforeUpdatePageComponent += 1;

        expect(container.innerHTML).to.eq('<div>No page name</div>');

        checkSpy();
      });

      it('No rerender and lifecycle on props change', async () => {
        const { router, render, checkSpy, calls } = await prepareComponentWithSpy(options);

        const container = render();

        await wrap(async () => {
          await router.redirectTo({ route: 'notFound' });
        });

        calls.renderTimes += 1;
        calls.beforeSetPageComponent += 1;

        expect(container.innerHTML).to.eq('Error 404');

        checkSpy();

        await wrap(async () => {
          await router.redirectTo({ route: 'internalError' });
        });

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

        calls.renderTimes += 1;
        calls.beforeSetPageComponent += 1;

        checkSpy();
        // await router.redirectTo({ route: 'dynamicRoute', params: { static: 'asd' } });
        //
        // const html2 = renderToString();
        // expect(html2).to.eq('<div>Dynamic</div>');
        //
        // calls.renderTimes += 1;
        // calls.beforeSetPageComponent += 2;
        // calls.beforeUpdatePageComponent += 1;
        //
        // checkSpy();
      });
    });
  });
}
