import { createConfigs } from 'reactive-route';
import { beforeEach, describe, expect, it } from 'vitest';

import { attachReactivity } from './helpers/attachReactivity';
import { v } from './helpers/checkers';
import { getPageComponents } from './helpers/getPageComponents';
import { prepareRouterTest } from './helpers/prepareRouterTest';
import type { TypeOptions } from './helpers/types';

const options = OPTIONS as TypeOptions;

await attachReactivity(options);

beforeEach(() => {
  if (typeof window !== 'undefined') {
    window.history.replaceState(null, '', '/');
  }
});

describe.runIf(typeof window !== 'undefined').each([options])(
  `Router component [browser]: %s`,
  () => {
    const { components, expectedContent } = getPageComponents(options);

    const errorConfigs = {
      notFound: { path: '/error404', props: { error: 404 }, loader: components.notFound },
      internalError: { path: '/error500', props: { error: 500 }, loader: components.internalError },
    } as const;

    it('Should not modify currentState and call reactions on unmount', async () => {
      const { router, checkSpy, calls, render } = await prepareRouterTest({
        options,
        configs: createConfigs({
          static: { path: '/static', loader: components.static },
          autorun: { path: '/autorun', loader: components.autorun },
          ...errorConfigs,
        }),
      });

      const screen = await render();

      const container = screen.container;

      await router.redirect({ name: 'autorun' });

      calls.pageRender += 1;
      calls.pageAutorun += 1;
      calls.beforeComponentChange += 1;

      expect(container.innerHTML).to.eq(expectedContent.autorun);

      checkSpy('autorun');

      await router.redirect({ name: 'static' });

      calls.beforeComponentChange += 1;

      expect(container.innerHTML).to.eq(expectedContent.static);

      checkSpy('autorun');

      screen.unmount();

      expect(container.innerHTML).to.eq('');
    });

    it('beforeComponentChange not called on params or query change', async () => {
      const { router, render, checkSpy, calls } = await prepareRouterTest({
        options,
        configs: createConfigs({
          autorun: { path: '/autorun', loader: components.autorun },
          dynamic: {
            path: '/:one',
            params: { one: v.length },
            query: { q: v.length },
            loader: components.dynamic,
          },
          ...errorConfigs,
        }),
      });

      const screen = await render();

      const container = screen.container;

      await router.redirect({ name: 'dynamic', params: { one: 'v-one' } });
      await router.redirect({ name: 'dynamic', params: { one: 'v-one2' } });
      await router.redirect({ name: 'dynamic', params: { one: 'v-one2' }, query: { q: 'v-q' } });
      await router.redirect({ name: 'dynamic', params: { one: 'v-one2' }, query: { q: 'v-q2' } });

      calls.beforeComponentChange += 1;

      expect(container.innerHTML).to.eq(expectedContent.dynamic);

      checkSpy();
    });

    it('beforeComponentChange not called for another Config but same loader', async () => {
      const { router, render, checkSpy, calls } = await prepareRouterTest({
        options,
        configs: createConfigs({
          autorun: { path: '/autorun', loader: components.autorun },
          dynamic: { path: '/:one', params: { one: v.length }, loader: components.dynamic },
          dynamic2: { path: '/2/:one', params: { one: v.length }, loader: components.dynamic },
          ...errorConfigs,
        }),
      });

      const screen = await render();

      const container = screen.container;

      await router.redirect({ name: 'dynamic', params: { one: 'v-one' } });
      await router.redirect({ name: 'dynamic2', params: { one: 'v-one' } });

      calls.beforeComponentChange += 1;

      expect(container.innerHTML).to.eq(expectedContent.dynamic);

      checkSpy();

      // Now check with props change
      await router.redirect({ name: 'notFound' });

      expect(container.innerHTML).to.eq(expectedContent.notFound);

      await router.redirect({ name: 'internalError' });

      expect(container.innerHTML).to.eq(expectedContent.internalError);

      calls.beforeComponentChange += 1;

      checkSpy();
    });

    it('History pop', async () => {
      const { router, render, checkSpy, calls, waitForRedirect } = await prepareRouterTest({
        options,
        configs: createConfigs({
          static: { path: '/static', query: { q: v.length }, loader: components.static },
          autorun: { path: '/autorun', loader: components.autorun },
          dynamic: { path: '/:one', params: { one: v.length }, loader: components.dynamic },
          dynamic2: { path: '/2/:one', params: { one: v.length }, loader: components.dynamic },
          ...errorConfigs,
        }),
      });

      const screen = await render();

      const container = screen.container;

      function checkHistory(url: string, content: string, pathsHistory: Array<string> = []) {
        expect(container.innerHTML).to.eq(content);

        checkSpy();

        pathsHistory.push(url);

        expect(`${location.pathname}${location.search}`).to.eq(
          pathsHistory[pathsHistory.length - 1]
        );
      }

      // manual redirecting to 4 configs

      await router.redirect({ name: 'static' });

      calls.beforeComponentChange += 1;

      checkHistory('/static', expectedContent.static);

      await router.redirect({ name: 'static', query: { q: 'v-q' } });

      checkHistory('/static?q=v-q', expectedContent.static);

      await router.redirect({ name: 'dynamic', params: { one: 'v-one' } });

      calls.beforeComponentChange += 1;

      checkHistory('/v-one', expectedContent.dynamic);

      await router.redirect({ name: 'dynamic2', params: { one: 'v-one' } });

      checkHistory('/2/v-one', expectedContent.dynamic);

      // go back to start

      await waitForRedirect(() => history.back());

      checkHistory('/v-one', expectedContent.dynamic);

      await waitForRedirect(() => history.back());

      calls.beforeComponentChange += 1;

      checkHistory('/static?q=v-q', expectedContent.static);

      await waitForRedirect(() => history.back());

      checkHistory('/static', expectedContent.static);

      // go forward to end

      await waitForRedirect(() => history.forward());

      checkHistory('/static?q=v-q', expectedContent.static);

      await waitForRedirect(() => history.forward());

      calls.beforeComponentChange += 1;

      checkHistory('/v-one', expectedContent.dynamic);

      await waitForRedirect(() => history.forward());

      checkHistory('/2/v-one', expectedContent.dynamic);
    });
  }
);

describe.runIf(typeof window === 'undefined').each([options])(`Router component [node]: %s`, () => {
  const { components, expectedContent } = getPageComponents(options);

  const errorConfigs = {
    notFound: { path: '/error404', props: { error: 404 }, loader: components.notFound },
    internalError: { path: '/error500', props: { error: 500 }, loader: components.internalError },
  } as const;

  it('SSR', async () => {
    const { router, renderToString, checkSpy, calls } = await prepareRouterTest({
      options,
      configs: createConfigs({
        static: { path: '/static', loader: components.static },
        ...errorConfigs,
      }),
    });

    await router.redirect({ name: 'static' });

    const html = await renderToString();

    expect(html).to.eq(expectedContent.static);

    calls.beforeComponentChange += 1;

    checkSpy();
  });
});
