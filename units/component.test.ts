import { describe, expect, it } from 'vitest';

import { prepareRouterTest } from './helpers/prepareRouterTest';
import type { TypeOptions } from './helpers/types';

describe.runIf(typeof window !== 'undefined')(
  `Client tests Router [$renderer + $reactivity]`,
  async () => {
    const options = OPTIONS as TypeOptions;

    if (options.renderer === 'solid') {
      if (options.reactivity === 'mobx') {
        const { enableExternalSource } = await import('solid-js');
        const { Reaction } = await import('mobx');

        let id = 0;

        enableExternalSource((fn, trigger) => {
          const reaction = new Reaction(`mobx@${++id}`, trigger);

          return {
            track: (x) => {
              let next: any;

              reaction.track(() => (next = fn(x)));

              return next;
            },
            dispose: () => reaction.dispose(),
          };
        });
      }

      if (options.reactivity === 'kr-observable') {
        const { enableObservable } = await import('kr-observable/solidjs');

        enableObservable();
      }
    }

    it('Spy render and autorun', async () => {
      const { router, checkSpy, calls, render, spy_pageAutorun } = await prepareRouterTest(options);

      const container = (await render()).container;

      await router.redirect({ name: 'staticRouteAutorun' });

      calls.pageRender += 1;
      calls.pageAutorun += 1;
      calls.beforeComponentChange += 1;

      expect(container.innerHTML).to.eq('StaticAutorun');

      expect(spy_pageAutorun).toHaveBeenLastCalledWith('staticRouteAutorun');

      checkSpy();

      await router.redirect({ name: 'staticRoute' });

      calls.beforeComponentChange += 1;

      expect(container.innerHTML).to.eq('Static');

      expect(spy_pageAutorun).toHaveBeenLastCalledWith('staticRouteAutorun');

      checkSpy();

      router.historySyncStop();
    });

    it('Only beforeSetPageComponent called on first render', async () => {
      const { router, checkSpy, calls, render } = await prepareRouterTest(options);

      const container = (await render()).container;

      await router.redirect({ name: 'staticRoute' });

      calls.beforeComponentChange += 1;

      expect(container.innerHTML).to.eq('Static');

      checkSpy();

      router.historySyncStop();
    });

    it('No lifecycle if only params changed (with page name)', async () => {
      const { router, render, checkSpy, calls } = await prepareRouterTest(options);

      const container = (await render()).container;

      await router.redirect({ name: 'dynamicOneParam', params: { static: 'asd' } });

      calls.beforeComponentChange += 1;

      expect(container.innerHTML).to.eq('<div>Dynamic</div>');

      checkSpy();

      await router.redirect({ name: 'dynamicOneParam', params: { static: 'dsa' } });

      expect(container.innerHTML).to.eq('<div>Dynamic</div>');

      checkSpy();

      router.historySyncStop();
    });

    it('No lifecycle if only params changed (without page name)', async () => {
      const { router, render, checkSpy, calls } = await prepareRouterTest(options);

      const container = (await render()).container;

      await router.redirect({ name: 'noPageName', params: { foo: 'foo' } });

      calls.beforeComponentChange += 1;

      expect(container.innerHTML).to.eq('<div>No page name</div>');

      checkSpy();

      await router.redirect({ name: 'noPageName', params: { foo: 'bar' } });

      expect(container.innerHTML).to.eq('<div>No page name</div>');

      checkSpy();

      router.historySyncStop();
    });

    it('No router lifecycle (same component)', async () => {
      const { router, render, checkSpy, calls } = await prepareRouterTest(options);

      const container = (await render()).container;

      await router.redirect({ name: 'dynamicOneParam', params: { static: 'asd' } });

      calls.beforeComponentChange += 1;

      expect(container.innerHTML).to.eq('<div>Dynamic</div>');

      checkSpy();

      await router.redirect({ name: 'dynamicRoute2', params: { static: 'dsa' } });

      expect(container.innerHTML).to.eq('<div>Dynamic</div>');

      checkSpy();

      router.historySyncStop();
    });

    it('No router lifecycle (same component) 2', async () => {
      const { router, render, checkSpy, calls } = await prepareRouterTest(options);

      const container = (await render()).container;

      await router.redirect({ name: 'noPageName', params: { foo: 'bar' } });

      calls.beforeComponentChange += 1;

      expect(container.innerHTML).to.eq('<div>No page name</div>');

      checkSpy();

      await router.redirect({ name: 'noPageName2', params: { foo: 'foo', bar: 'bar' } });

      expect(container.innerHTML).to.eq('<div>No page name</div>');

      checkSpy();

      router.historySyncStop();
    });

    it('No rerender and lifecycle on props change', async () => {
      const { router, render, checkSpy, calls } = await prepareRouterTest(options);

      const container = (await render()).container;

      await router.redirect({ name: 'notFound' });

      calls.beforeComponentChange += 1;

      expect(container.innerHTML).to.eq('Error 404');

      checkSpy();

      await router.redirect({ name: 'internalError' });

      expect(container.innerHTML).to.eq('Error 500');

      checkSpy();

      router.historySyncStop();
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

      await router.redirect({ name: 'staticRoute' });

      calls.beforeComponentChange += 1;

      expect(container.innerHTML).to.eq('Static');

      checkSpy();

      expect(location.pathname).to.eq('/test/static');

      await router.redirect({ name: 'dynamicOneParam', params: { static: 'asd' } });

      calls.beforeComponentChange += 1;

      expect(container.innerHTML).to.eq('<div>Dynamic</div>');

      checkSpy();

      expect(location.pathname).to.eq('/test/asd');

      await router.redirect({ name: 'dynamicRoute2', params: { static: 'asd' } });

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

      router.historySyncStop();
    });

    it('Unmount check', async () => {
      const { router, checkSpy, calls, render } = await prepareRouterTest(options);

      const screen = await render();
      const container = screen.container;

      await router.redirect({ name: 'staticRoute' });

      calls.beforeComponentChange += 1;

      expect(container.innerHTML).to.eq('Static');

      checkSpy();

      screen.unmount();

      expect(container.innerHTML).to.eq('');

      router.historySyncStop();
    });
  }
);

describe.runIf(typeof window === 'undefined')(`SSR tests Router [$renderer + $reactivity]`, () => {
  const options = OPTIONS as TypeOptions;

  it('SSR', async () => {
    const { router, renderToString, checkSpy, calls } = await prepareRouterTest(options);

    await router.redirect({ name: 'staticRoute' });

    const html1 = await renderToString();

    expect(html1).to.eq('Static');

    calls.beforeComponentChange += 1;

    checkSpy();
  });
});
