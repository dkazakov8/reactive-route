import { describe, expect, it, vi } from 'vitest';

import { getAdapters } from '../../../testHelpers/getAdapters';
import { getRoutes } from '../../../testHelpers/getRoutes';
import { allPossibleOptions } from '../../../testHelpers/types';
import { isClient, RedirectError } from '../constants';
import { createRouter } from '../createRouter';
import { createRoutes } from '../createRoutes';
import { TypeRouter } from '../types';

function check(router: TypeRouter<any>, redirectParams: any, url?: string) {
  const currentRoute = router.getActiveRouteState()!;

  const expectedCurrentRoute = router.createRouteState({
    route: redirectParams.route.name,
    query: redirectParams.query,
    params: redirectParams.params,
  });

  expect(currentRoute.name).to.deep.eq(expectedCurrentRoute.name);
  expect(currentRoute.props).to.deep.eq(expectedCurrentRoute.props);
  expect(currentRoute.params).to.deep.eq(expectedCurrentRoute.params || {});
  expect(currentRoute.query).to.deep.eq(expectedCurrentRoute.query);
  expect(currentRoute.url).to.deep.eq(expectedCurrentRoute.url);

  if (url) {
    expect(url).to.eq(expectedCurrentRoute.url);
  }

  if (expectedCurrentRoute.pathname === '/test/static') {
    expect(redirectParams.route.otherExports?.store).to.deep.eq('');
    expect(redirectParams.route.otherExports?.actions).to.deep.eq('');
  }
}

function getDefaultRoutes(routes: any) {
  return {
    notFound: {
      path: '/error400',
      props: { errorNumber: 400 },
      loader: routes.notFound.loader,
    },
    internalError: {
      path: '/error500',
      props: { errorNumber: 500 },
      loader: routes.internalError.loader,
    },
  } as const;
}

function createCounters() {
  const spyOne = vi.fn();
  const spyTwo = vi.fn();

  const counter = { spyOne: 0, spyTwo: 0 };

  function checkSpy() {
    expect(spyOne).toHaveBeenCalledTimes(counter.spyOne);
    expect(spyTwo).toHaveBeenCalledTimes(counter.spyTwo);
  }

  return { spyOne, spyTwo, counter, checkSpy };
}

allPossibleOptions.forEach((options) => {
  const routesDefault = getRoutes(options);

  describe(`redirect [${options.renderer}+${options.reactivity}]`, () => {
    it('restoreFromURL: sets initial route', async () => {
      const router = createRouter({ routes: routesDefault, adapters: await getAdapters(options) });

      const url = await router.hydrateFromURL('/test/static');

      check(router, { route: routesDefault.staticRoute }, url);
    });

    it('restoreFromURL: sets initial route not found', async () => {
      const router = createRouter({ routes: routesDefault, adapters: await getAdapters(options) });

      const url = await router.hydrateFromURL('/testX/static');

      check(router, { route: routesDefault.notFound }, url);
    });

    it('beforeEnter: not called when redirecting to same static route', async () => {
      const { spyOne, counter, checkSpy } = createCounters();

      const router = createRouter({
        routes: createRoutes({
          spyOne: {
            path: '/test/static',
            loader: routesDefault.staticRoute.loader,
            async beforeEnter(config) {
              spyOne();
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { routes } = router.getGlobalArguments();

      let url = await router.redirect({ route: 'spyOne' });

      counter.spyOne += 1;

      checkSpy();

      check(router, { route: routes.spyOne }, url);

      url = await router.redirect({ route: 'spyOne' });

      checkSpy();

      check(router, { route: routes.spyOne }, url);
    });

    it('beforeEnter: not called when redirecting to same dynamic route (no params change)', async () => {
      const { spyOne, counter, checkSpy } = createCounters();

      const router = createRouter({
        routes: createRoutes({
          spyOneDynamic: {
            path: '/test/:static',
            params: {
              static: (value) => value.length > 2,
            },
            loader: routesDefault.dynamicRoute.loader,
            async beforeEnter(config) {
              spyOne();
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { routes } = router.getGlobalArguments();

      let url = await router.redirect({ route: 'spyOneDynamic', params: { static: 'foo' } });

      counter.spyOne += 1;

      checkSpy();

      check(router, { route: routes.spyOneDynamic, params: { static: 'foo' } }, url);

      url = await router.redirect({ route: 'spyOneDynamic', params: { static: 'foo' } });

      checkSpy();

      check(router, { route: routes.spyOneDynamic, params: { static: 'foo' } }, url);
    });

    it('beforeEnter: not called when redirecting to same route (no query change)', async () => {
      const { spyOne, counter, checkSpy } = createCounters();

      const router = createRouter({
        routes: createRoutes({
          spyOne: {
            path: '/test/static',
            query: {
              q: (value) => value.length > 2,
            },
            loader: routesDefault.staticRoute.loader,
            async beforeEnter(config) {
              spyOne();
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { routes } = router.getGlobalArguments();

      let url = await router.redirect({ route: 'spyOne', query: { q: 'foo' } });

      counter.spyOne += 1;

      checkSpy();

      check(router, { route: routes.spyOne, query: { q: 'foo' } }, url);

      url = await router.redirect({ route: 'spyOne', query: { q: 'foo' } });

      checkSpy();

      check(router, { route: routes.spyOne, query: { q: 'foo' } }, url);
    });

    it('beforeEnter: not called when redirecting to same route (query changed)', async () => {
      const { spyOne, counter, checkSpy } = createCounters();

      const router = createRouter({
        routes: createRoutes({
          spyOne: {
            path: '/test/static',
            query: {
              q: (value) => value.length > 2,
            },
            loader: routesDefault.staticRoute.loader,
            async beforeEnter(config) {
              spyOne();
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { routes } = router.getGlobalArguments();

      let url = await router.redirect({ route: 'spyOne', query: { q: 'foo' } });

      counter.spyOne += 1;

      checkSpy();

      check(router, { route: routes.spyOne, query: { q: 'foo' } }, url);

      url = await router.redirect({ route: 'spyOne', query: { q: 'bar' } });

      checkSpy();

      check(router, { route: routes.spyOne, query: { q: 'bar' } }, url);
    });

    it('beforeEnter: called when redirecting to same dynamic route (params changed)', async () => {
      const { spyOne, counter, checkSpy } = createCounters();

      const router = createRouter({
        routes: createRoutes({
          spyOneDynamic: {
            path: '/test/:static',
            params: {
              static: (value) => value.length > 2,
            },
            loader: routesDefault.dynamicRoute.loader,
            async beforeEnter(config) {
              spyOne();
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { routes } = router.getGlobalArguments();

      let url = await router.redirect({ route: 'spyOneDynamic', params: { static: 'foo' } });

      counter.spyOne += 1;

      checkSpy();

      check(router, { route: routes.spyOneDynamic, params: { static: 'foo' } }, url);

      url = await router.redirect({ route: 'spyOneDynamic', params: { static: 'bar' } });

      counter.spyOne += 1;

      checkSpy();

      check(router, { route: routes.spyOneDynamic, params: { static: 'bar' } }, url);
    });

    it('beforeEnter: errors are rendered with internalError and not pushed to history', async () => {
      const router = createRouter({
        routes: createRoutes({
          buggyCode: {
            path: '/test/static4',
            loader: routesDefault.dynamicRoute.loader,
            async beforeEnter() {
              // @ts-ignore
              // biome-ignore lint/correctness/noUndeclaredVariables: false
              a;
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { routes } = router.getGlobalArguments();

      // TODO: check url
      await router.redirect({ route: 'buggyCode' });

      check(router, { route: routes.internalError });
    });

    it('beforeLeave: not called when redirecting to same static route', async () => {
      const { spyOne, checkSpy } = createCounters();

      const router = createRouter({
        routes: createRoutes({
          spyOne: {
            path: '/test/static',
            loader: routesDefault.staticRoute.loader,
            async beforeLeave(config) {
              spyOne();
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { routes } = router.getGlobalArguments();

      let url = await router.redirect({ route: 'spyOne' });

      checkSpy();

      check(router, { route: routes.spyOne }, url);

      url = await router.redirect({ route: 'spyOne' });

      checkSpy();

      check(router, { route: routes.spyOne }, url);
    });

    it('beforeLeave: called when redirecting to another route', async () => {
      const { spyOne, counter, checkSpy } = createCounters();

      const router = createRouter({
        routes: createRoutes({
          spyOne: {
            path: '/test/static',
            loader: routesDefault.staticRoute.loader,
            async beforeLeave(config) {
              spyOne();
            },
          },
          spyOneDynamic: {
            path: '/test/:static',
            params: {
              static: (value) => value.length > 2,
            },
            loader: routesDefault.dynamicRoute.loader,
          },
          ...getDefaultRoutes(routesDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { routes } = router.getGlobalArguments();

      let url = await router.redirect({ route: 'spyOne' });

      checkSpy();

      check(router, { route: routes.spyOne }, url);

      url = await router.redirect({ route: 'spyOneDynamic', params: { static: 'foo' } });

      counter.spyOne += 1;

      checkSpy();

      check(router, { route: routes.spyOneDynamic, params: { static: 'foo' } }, url);
    });

    it('beforeLeave: not called when redirecting to same dynamic route (no params change)', async () => {
      const { spyOne, checkSpy } = createCounters();

      const router = createRouter({
        routes: createRoutes({
          spyOneDynamic: {
            path: '/test/:static',
            params: {
              static: (value) => value.length > 2,
            },
            loader: routesDefault.dynamicRoute.loader,
            async beforeLeave(config) {
              spyOne();
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { routes } = router.getGlobalArguments();

      let url = await router.redirect({ route: 'spyOneDynamic', params: { static: 'foo' } });

      checkSpy();

      check(router, { route: routes.spyOneDynamic, params: { static: 'foo' } }, url);

      url = await router.redirect({ route: 'spyOneDynamic', params: { static: 'foo' } });

      checkSpy();

      check(router, { route: routes.spyOneDynamic, params: { static: 'foo' } }, url);
    });

    it('beforeLeave: called when redirecting to same dynamic route (params changed)', async () => {
      const { spyOne, counter, checkSpy } = createCounters();

      const router = createRouter({
        routes: createRoutes({
          spyOneDynamic: {
            path: '/test/:static',
            params: {
              static: (value) => value.length > 2,
            },
            loader: routesDefault.dynamicRoute.loader,
            async beforeLeave(config) {
              spyOne();
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { routes } = router.getGlobalArguments();

      let url = await router.redirect({ route: 'spyOneDynamic', params: { static: 'foo' } });

      checkSpy();

      check(router, { route: routes.spyOneDynamic, params: { static: 'foo' } }, url);

      url = await router.redirect({ route: 'spyOneDynamic', params: { static: 'bar' } });

      counter.spyOne += 1;

      checkSpy();

      check(router, { route: routes.spyOneDynamic, params: { static: 'bar' } }, url);
    });

    it('beforeLeave: prevent and allow redirects', async () => {
      const { spyOne, counter, checkSpy } = createCounters();

      const router = createRouter({
        routes: createRoutes({
          spyOne: {
            path: '/test/static',
            loader: routesDefault.staticRoute.loader,
          },
          spyTwoDynamic: {
            path: '/test/:static',
            params: {
              static: (value) => value.length > 2,
            },
            loader: routesDefault.dynamicRoute.loader,
          },
          preventRedirect: {
            path: '/test/prevent-redirect',
            loader: routesDefault.dynamicRoute.loader,
            async beforeLeave(config) {
              spyOne();

              if (config.nextState.name === 'spyOne') {
                return config.preventRedirect();
              }
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { routes } = router.getGlobalArguments();

      let url = await router.redirect({ route: 'preventRedirect' });

      check(router, { route: routes.preventRedirect }, url);

      url = await router.redirect({ route: 'spyOne' });

      // Redirect to spyOne prevented
      check(router, { route: routes.preventRedirect }, url);

      counter.spyOne += 1;

      checkSpy();

      url = await router.redirect({ route: 'spyTwoDynamic', params: { static: 'asd' } });

      // Redirect to spyTwoDynamic not prevented
      check(router, { route: routes.spyTwoDynamic, params: { static: 'asd' } }, url);

      counter.spyOne += 1;

      checkSpy();
    });

    it('beforeLeave: errors are rendered with internalError and not pushed to history', async () => {
      const router = createRouter({
        routes: createRoutes({
          spyOne: {
            path: '/test/static',
            loader: routesDefault.staticRoute.loader,
          },
          buggyCode: {
            path: '/test/buggy-code',
            loader: routesDefault.dynamicRoute.loader,
            async beforeLeave() {
              // @ts-ignore
              // biome-ignore lint/correctness/noUndeclaredVariables: false
              a;
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { routes } = router.getGlobalArguments();

      let url = await router.redirect({ route: 'buggyCode' });

      check(router, { route: routes.buggyCode }, url);

      // TODO: check url
      url = await router.redirect({ route: 'spyOne' });

      check(router, { route: routes.internalError });
    });

    it('query: no push to history if query is the same', async () => {
      const router = createRouter({ routes: routesDefault, adapters: await getAdapters(options) });

      let url = await router.redirect({ route: 'staticRoute', query: { q: 'test' } });

      check(router, { route: routesDefault.staticRoute, query: { q: 'test' } }, url);

      url = await router.redirect({ route: 'staticRoute', query: { q: 'test' } });

      check(router, { route: routesDefault.staticRoute, query: { q: 'test' } }, url);

      // url is cleared of nonExistent
      url = await router.redirect({
        route: 'staticRoute',
        // @ts-ignore
        query: { q: 'test', nonExistent: 'test' },
      });

      check(router, { route: routesDefault.staticRoute, query: { q: 'test' } }, url);
    });

    it('query: no push to history if query is the same (non existent param)', async () => {
      const router = createRouter({ routes: routesDefault, adapters: await getAdapters(options) });

      let url = await router.redirect({ route: 'staticRoute' });

      check(router, { route: routesDefault.staticRoute }, url);

      // url is cleared of nonExistent
      // @ts-ignore
      url = await router.redirect({ route: 'staticRoute', query: { nonExistent: 'test' } });

      check(router, { route: routesDefault.staticRoute }, url);
    });

    it('query: push to history if query changed', async () => {
      const router = createRouter({ routes: routesDefault, adapters: await getAdapters(options) });

      let url = await router.redirect({ route: 'staticRoute', query: { q: 'test' } });

      check(router, { route: routesDefault.staticRoute, query: { q: 'test' } }, url);

      url = await router.redirect({ route: 'staticRoute', query: { q: 'test2' } });

      check(router, { route: routesDefault.staticRoute, query: { q: 'test2' } }, url);

      url = await router.redirect({ route: 'staticRoute' });

      check(router, { route: routesDefault.staticRoute }, url);

      url = await router.redirect({ route: 'staticRoute', query: { q: 'test' } });

      check(router, { route: routesDefault.staticRoute, query: { q: 'test' } }, url);
    });
  });

  describe.runIf(isClient)(`redirect Client [${options.renderer}+${options.reactivity}]`, () => {
    it('beforeEnter: redirects are made silently and call lifecycle', async () => {
      const { spyOne, spyTwo, counter, checkSpy } = createCounters();

      const router = createRouter({
        routes: createRoutes({
          spyOne: {
            path: '/test/static',
            loader: routesDefault.staticRoute.loader,
            async beforeEnter(config) {
              spyOne();
            },
          },
          redirectSpyOne: {
            path: '/test/static3',
            loader: routesDefault.dynamicRoute.loader,
            async beforeEnter(config) {
              spyTwo();

              return config.redirect({ route: 'spyOne' });
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { routes } = router.getGlobalArguments();

      const url = await router.redirect({ route: 'redirectSpyOne' });

      counter.spyOne += 1;
      counter.spyTwo += 1;

      checkSpy();

      check(router, { route: routes.spyOne }, url);
    });

    it('beforeEnter: multiple redirects are not registered in history', async () => {
      const router = createRouter({
        routes: createRoutes({
          one: {
            path: '/1',
            loader: routesDefault.dynamicRoute.loader,
          },
          two: {
            path: '/2',
            loader: routesDefault.dynamicRoute.loader,
            async beforeEnter(config) {
              return config.redirect({ route: 'one' });
            },
          },
          three: {
            path: '/3',
            loader: routesDefault.dynamicRoute.loader,
            async beforeEnter(config) {
              return config.redirect({ route: 'two' });
            },
          },
          four: {
            path: '/4',
            loader: routesDefault.dynamicRoute.loader,
            async beforeEnter(config) {
              return config.redirect({ route: 'three' });
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { routes } = router.getGlobalArguments();

      const url = await router.redirect({ route: 'four' });

      check(router, { route: routes.one }, url);
    });
  });

  describe.runIf(!isClient)(`redirect SSR [${options.renderer}+${options.reactivity}]`, () => {
    it('beforeEnter: redirects throw exception and not call next lifecycle', async () => {
      const { spyOne, spyTwo, counter, checkSpy } = createCounters();

      const router = createRouter({
        routes: createRoutes({
          spyOne: {
            path: '/test/:dynamic',
            params: { dynamic: (v) => true },
            query: { a: () => true },
            loader: routesDefault.staticRoute.loader,
            async beforeEnter(config) {
              spyOne();
            },
          },
          redirectSpyOne: {
            path: '/test/static3',
            loader: routesDefault.dynamicRoute.loader,
            async beforeEnter(config) {
              spyTwo();

              return config.redirect({
                route: 'spyOne',
                params: { dynamic: 'bar' },
                query: { a: 'test' },
              });
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { routes } = router.getGlobalArguments();

      const url = await router.redirect({ route: 'spyOne', params: { dynamic: 'foo' } });

      counter.spyOne += 1;

      check(router, { route: routes.spyOne, params: { dynamic: 'foo' } }, url);

      checkSpy();

      await expect(async () => {
        await router.redirect({ route: 'redirectSpyOne' });
      }).rejects.toThrowError(new RedirectError('/test/bar?a=test'));

      counter.spyTwo += 1;

      check(router, { route: routes.spyOne, params: { dynamic: 'foo' } }, url);

      checkSpy();
    });

    it('beforeEnter: multiple redirects are not registered in history', async () => {
      const router = createRouter({
        routes: createRoutes({
          one: {
            path: '/1',
            loader: routesDefault.dynamicRoute.loader,
          },
          two: {
            path: '/2',
            loader: routesDefault.dynamicRoute.loader,
            async beforeEnter(config) {
              return config.redirect({ route: 'one' });
            },
          },
          three: {
            path: '/3',
            loader: routesDefault.dynamicRoute.loader,
            async beforeEnter(config) {
              return config.redirect({ route: 'two' });
            },
          },
          four: {
            path: '/4',
            loader: routesDefault.dynamicRoute.loader,
            async beforeEnter(config) {
              return config.redirect({ route: 'three' });
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { routes } = router.getGlobalArguments();

      const redirectThree = new RedirectError(routes.three.path);

      await expect(async () => {
        await router.hydrateFromURL(routes.four.path);
      }).rejects.toThrowError(redirectThree);

      const redirectTwo = new RedirectError(routes.two.path);

      await expect(async () => {
        await router.hydrateFromURL(redirectThree.message);
      }).rejects.toThrowError(redirectTwo);

      const redirectOne = new RedirectError(routes.one.path);

      await expect(async () => {
        await router.hydrateFromURL(redirectTwo.message);
      }).rejects.toThrowError(redirectOne);

      const url = await router.hydrateFromURL(redirectOne.message);

      check(router, { route: routes.one }, url);
    });
  });
});
