import { createConfigs } from 'reactive-route';
import { beforeEach, describe, expect, it } from 'vitest';

import { attachReactivity } from './helpers/attachReactivity';
import { checkHistory, v } from './helpers/checkers';
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

    it('Should preserve currentState on unmount', async () => {
      const { router, checkSpy, checkPageAutorun, calls, render, checkBeforeChange } =
        await prepareRouterTest({
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

      checkSpy();

      checkPageAutorun('autorun');

      checkBeforeChange({
        currentConfig: { name: 'autorun', otherExports: {}, path: '/autorun' },
        currentState: { name: 'autorun', params: {}, query: {} },
        prevConfig: undefined,
        prevState: undefined,
      });

      await router.redirect({ name: 'static' });

      calls.beforeComponentChange += 1;

      expect(container.innerHTML).to.eq(expectedContent.static);

      checkSpy();

      checkPageAutorun('autorun');

      checkBeforeChange({
        currentConfig: {
          name: 'static',
          otherExports: { store: '', actions: '' },
          path: '/static',
        },
        currentState: { name: 'static', params: {}, query: {} },
        prevConfig: { name: 'autorun', otherExports: {}, path: '/autorun' },
        prevState: { name: 'autorun', params: {}, query: {} },
      });

      screen.unmount();

      expect(container.innerHTML).to.eq('');
    });

    it('Config props are not modified or wrapped', async () => {
      class SomeClass {}

      const originalProps = {
        date: Date,
        dateInst: new Date(),
        someClass: SomeClass,
        someInst: new SomeClass(),
      };

      const { router, checkBeforeChange, calls, render, checkPageRender } = await prepareRouterTest(
        {
          options,
          configs: createConfigs({
            autorun: { path: '/autorun', loader: components.autorun, props: originalProps },
            ...errorConfigs,
          }),
        }
      );

      const screen = await render();

      const container = screen.container;

      await router.redirect({ name: 'autorun' });

      calls.beforeComponentChange += 1;

      expect(container.innerHTML).to.eq(expectedContent.autorun);

      checkBeforeChange(
        {
          currentConfig: { name: 'autorun', otherExports: {}, path: '/autorun' },
          currentState: { name: 'autorun', params: {}, query: {} },
          prevConfig: undefined,
          prevState: undefined,
        },
        (actual) => {
          // these props come to beforeComponentChange (they should be the same as in the original Config)
          expect(actual.currentConfig.props.date).toBe(originalProps.date);
          expect(actual.currentConfig.props.dateInst).toBe(originalProps.dateInst);
          expect(actual.currentConfig.props.someClass).toBe(originalProps.someClass);
          expect(actual.currentConfig.props.someInst).toBe(originalProps.someInst);
          expect(actual.currentConfig.props.someInst instanceof SomeClass).toBe(true);
        }
      );

      checkPageRender((actual) => {
        // these props come to the real page component
        expect(actual.date).toBe(originalProps.date);
        expect(actual.dateInst).toBe(originalProps.dateInst);
        expect(actual.someClass).toBe(originalProps.someClass);
        expect(actual.someInst).toBe(originalProps.someInst);
        expect(actual.someInst instanceof SomeClass).toBe(true);
      });
    });

    it('beforeComponentChange not called on params or query change', async () => {
      const { router, render, checkSpy, calls, checkBeforeChange } = await prepareRouterTest({
        options,
        configs: createConfigs({
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

      checkBeforeChange({
        currentConfig: { name: 'dynamic', otherExports: {}, path: '/:one' },
        currentState: { name: 'dynamic', params: { one: 'v-one2' }, query: { q: 'v-q2' } },
        prevConfig: undefined,
        prevState: undefined,
      });
    });

    it('beforeComponentChange not called for another Config but same loader', async () => {
      const { router, render, checkSpy, calls, checkBeforeChange } = await prepareRouterTest({
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

      // called only for the first redirect
      checkBeforeChange({
        currentConfig: { name: 'dynamic', otherExports: {}, path: '/:one' },
        currentState: { name: 'dynamic', params: { one: 'v-one' }, query: {} },
        prevConfig: undefined,
        prevState: undefined,
      });

      // Now check with props change
      await router.redirect({ name: 'notFound' });

      expect(container.innerHTML).to.eq(expectedContent.notFound);

      await router.redirect({ name: 'internalError' });

      expect(container.innerHTML).to.eq(expectedContent.internalError);

      calls.beforeComponentChange += 1;

      checkSpy();

      // called only for the first redirect
      checkBeforeChange({
        currentConfig: { name: 'notFound', props: { error: 404 }, path: '/error404' },
        currentState: { name: 'notFound', params: {}, query: {} },
        prevConfig: { name: 'dynamic2', otherExports: {}, path: '/2/:one' },
        prevState: { name: 'dynamic2', params: { one: 'v-one' }, query: {} },
      });
    });

    it('Native history.go works', async () => {
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

      // manual redirecting to 4 configs

      await router.redirect({ name: 'static' });

      calls.beforeComponentChange += 1;

      checkHistory({ container, checkSpy, url: '/static', content: expectedContent.static });

      await router.redirect({ name: 'static', query: { q: 'v-q' } });

      checkHistory({ container, checkSpy, url: '/static?q=v-q', content: expectedContent.static });

      await router.redirect({ name: 'dynamic', params: { one: 'v-one' } });

      calls.beforeComponentChange += 1;

      checkHistory({ container, checkSpy, url: '/v-one', content: expectedContent.dynamic });

      await router.redirect({ name: 'dynamic2', params: { one: 'v-one' } });

      checkHistory({ container, checkSpy, url: '/2/v-one', content: expectedContent.dynamic });

      // go back to start

      await waitForRedirect(() => history.back());

      checkHistory({ container, checkSpy, url: '/v-one', content: expectedContent.dynamic });

      await waitForRedirect(() => history.back());

      calls.beforeComponentChange += 1;

      checkHistory({ container, checkSpy, url: '/static?q=v-q', content: expectedContent.static });

      await waitForRedirect(() => history.back());

      checkHistory({ container, checkSpy, url: '/static', content: expectedContent.static });

      await waitForRedirect(() => history.back());

      calls.beforeComponentChange += 1;

      checkHistory({ container, checkSpy, url: '/error404', content: expectedContent.notFound });

      // go forward to end

      await waitForRedirect(() => history.forward());

      calls.beforeComponentChange += 1;

      checkHistory({ container, checkSpy, url: '/static', content: expectedContent.static });

      await waitForRedirect(() => history.forward());

      checkHistory({ container, checkSpy, url: '/static?q=v-q', content: expectedContent.static });

      await waitForRedirect(() => history.forward());

      calls.beforeComponentChange += 1;

      checkHistory({ container, checkSpy, url: '/v-one', content: expectedContent.dynamic });

      await waitForRedirect(() => history.forward());

      checkHistory({ container, checkSpy, url: '/2/v-one', content: expectedContent.dynamic });
    });

    it('Native history.go works (with replace)', async () => {
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

      // manual redirecting to 4 configs

      await router.redirect({ name: 'static' });

      calls.beforeComponentChange += 1;

      checkHistory({ container, checkSpy, url: '/static', content: expectedContent.static });

      await router.redirect({ name: 'static', query: { q: 'v-q' }, replace: true });

      checkHistory({ container, checkSpy, url: '/static?q=v-q', content: expectedContent.static });

      await router.redirect({ name: 'dynamic', params: { one: 'v-one' }, replace: true });

      calls.beforeComponentChange += 1;

      checkHistory({ container, checkSpy, url: '/v-one', content: expectedContent.dynamic });

      await router.redirect({ name: 'dynamic2', params: { one: 'v-one' }, replace: true });

      checkHistory({ container, checkSpy, url: '/2/v-one', content: expectedContent.dynamic });

      // go back to start

      await waitForRedirect(() => history.back());

      calls.beforeComponentChange += 1;

      checkHistory({ container, checkSpy, url: '/error404', content: expectedContent.notFound });

      await waitForRedirect(() => history.forward());

      calls.beforeComponentChange += 1;

      checkHistory({ container, checkSpy, url: '/2/v-one', content: expectedContent.dynamic });
    });
  }
);

describe.runIf(typeof window === 'undefined').each([options])(`Router component [node]: %s`, () => {
  const { components, expectedContent } = getPageComponents(options);

  const errorConfigs = {
    notFound: { path: '/error404', props: { error: 404 }, loader: components.notFound },
    internalError: { path: '/error500', props: { error: 500 }, loader: components.internalError },
  } as const;

  it('Renders a static config', async () => {
    const { router, renderToString, checkSpy, calls, checkBeforeChange } = await prepareRouterTest({
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

    checkBeforeChange({
      currentConfig: { name: 'static', otherExports: { store: '', actions: '' }, path: '/static' },
      currentState: { name: 'static', params: {}, query: {} },
      prevConfig: undefined,
      prevState: undefined,
    });
  });

  it('Renders autorun', async () => {
    const { router, renderToString, checkSpy, checkPageAutorun, calls, checkBeforeChange } =
      await prepareRouterTest({
        options,
        configs: createConfigs({
          autorun: { path: '/autorun', loader: components.autorun },
          ...errorConfigs,
        }),
      });

    await router.redirect({ name: 'autorun' });

    const html = await renderToString();

    expect(html).to.eq(expectedContent.autorun);

    calls.pageRender += 1;
    calls.pageAutorun += 1;
    calls.beforeComponentChange += 1;

    checkSpy();

    checkPageAutorun('autorun');

    checkBeforeChange({
      currentConfig: { name: 'autorun', otherExports: {}, path: '/autorun' },
      currentState: { name: 'autorun', params: {}, query: {} },
      prevConfig: undefined,
      prevState: undefined,
    });
  });
});
