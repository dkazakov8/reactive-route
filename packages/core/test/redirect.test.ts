import { describe, expect, it, vi } from 'vitest';

import { getAdapters } from '../../shared/getAdapters';
import { getRoutes } from '../../shared/getRoutes';
import { allPossibleOptions } from '../../shared/types';
import { createRouter, createRoutes, RedirectError, replaceDynamicValues } from '../index';
import { TypeRoute } from '../types';
import { isClient } from '../utils/isClient';
import { queryString } from '../utils/queryString';

type TypeRouteWithParams = Omit<TypeRoute, 'params'> & {
  params: Record<string, string>;
  query: Record<string, string>;
};

function checkCurrent(router: any, route: TypeRouteWithParams, url?: string) {
  const currentRoute = router.currentRoute[route.name];

  expect(currentRoute.name).to.deep.eq(route.name);
  expect(currentRoute.path).to.deep.eq(route.path);
  expect(currentRoute.props).to.deep.eq(route.props);
  expect(currentRoute.params).to.deep.eq(route.params || {});
  expect(currentRoute.query).to.deep.eq(route.query);
  expect(currentRoute.pageId).to.deep.eq(
    route.path === '/test/static'
      ? 'static'
      : ['/error404', '/error500'].includes(route.path)
        ? 'error'
        : 'dynamic'
  );

  if (route.path === '/test/static') {
    expect(route.otherExports?.store).to.deep.eq('');
    expect(route.otherExports?.actions).to.deep.eq('');
  }

  if (url) {
    const currentPathname = replaceDynamicValues({
      route: route as any,
      params: currentRoute.params,
    });
    const currentSearch = queryString.stringify(currentRoute.query as any);
    const currentUrl = `${currentPathname}${currentSearch ? `?${currentSearch}` : ''}`;

    expect(url).to.eq(currentUrl);
  }
}

function cloneWithParams<TRoute extends TypeRoute>(config: {
  route: TRoute;
  params?: Record<keyof TRoute['params'], string>;
  query?: Partial<Record<keyof TRoute['query'], string>>;
}): TypeRouteWithParams {
  const obj = Object.assign({ ...config.route }, { query: config.query || {} });

  if ('params' in config) obj.params = { ...config.params };

  return obj as any;
}

function getDefaultRoutes(routes: any) {
  return {
    notFound: {
      path: '/error400',
      props: { errorNumber: 400 },
      loader: routes.notFound.loader,
      pageId: routes.notFound.pageId,
    },
    internalError: {
      path: '/error500',
      props: { errorNumber: 500 },
      loader: routes.internalError.loader,
      pageId: routes.internalError.pageId,
    },
  };
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

      const url = await router.restoreFromURL({ pathname: routesDefault.staticRoute.path });

      checkCurrent(router, cloneWithParams({ route: routesDefault.staticRoute }), url);
    });

    it('restoreFromURL: sets initial route not found', async () => {
      const router = createRouter({ routes: routesDefault, adapters: await getAdapters(options) });

      const url = await router.restoreFromURL({ pathname: '/testX/static' });

      checkCurrent(router, cloneWithParams({ route: routesDefault.notFound }), url);
    });

    it('beforeEnter: not called when redirecting to same static route', async () => {
      const { spyOne, counter, checkSpy } = createCounters();

      const router = createRouter({
        routes: createRoutes({
          spyOne: {
            path: '/test/static',
            loader: routesDefault.staticRoute.loader,
            pageId: routesDefault.staticRoute.pageId,
            async beforeEnter(config, param: string) {
              spyOne(param);
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });
      const { routes } = router.getConfig();

      let url = await router.redirect({ route: 'spyOne' });

      counter.spyOne += 1;

      checkSpy();

      expect(spyOne).toHaveBeenLastCalledWith('');

      checkCurrent(router, cloneWithParams({ route: routes.spyOne }), url);

      url = await router.redirect({ route: 'spyOne' });

      checkSpy();

      checkCurrent(router, cloneWithParams({ route: routes.spyOne }), url);
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
            pageId: routesDefault.dynamicRoute.pageId,
            async beforeEnter(config, param: string) {
              spyOne(param);
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });
      const { routes } = router.getConfig();

      let url = await router.redirect({ route: 'spyOneDynamic', params: { static: 'foo' } });

      counter.spyOne += 1;

      checkSpy();

      expect(spyOne).toHaveBeenLastCalledWith('');

      checkCurrent(
        router,
        cloneWithParams({ route: routes.spyOneDynamic, params: { static: 'foo' } }),
        url
      );

      url = await router.redirect({ route: 'spyOneDynamic', params: { static: 'foo' } });

      checkSpy();

      checkCurrent(
        router,
        cloneWithParams({ route: routes.spyOneDynamic, params: { static: 'foo' } }),
        url
      );
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
            pageId: routesDefault.staticRoute.pageId,
            async beforeEnter(config, param: string) {
              spyOne(param);
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });
      const { routes } = router.getConfig();

      let url = await router.redirect({ route: 'spyOne', query: { q: 'foo' } });

      counter.spyOne += 1;

      checkSpy();

      expect(spyOne).toHaveBeenLastCalledWith('');

      checkCurrent(router, cloneWithParams({ route: routes.spyOne, query: { q: 'foo' } }), url);

      url = await router.redirect({ route: 'spyOne', query: { q: 'foo' } });

      checkSpy();

      checkCurrent(router, cloneWithParams({ route: routes.spyOne, query: { q: 'foo' } }), url);
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
            pageId: routesDefault.staticRoute.pageId,
            async beforeEnter(config, param: string) {
              spyOne(param);
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });
      const { routes } = router.getConfig();

      let url = await router.redirect({ route: 'spyOne', query: { q: 'foo' } });

      counter.spyOne += 1;

      checkSpy();

      expect(spyOne).toHaveBeenLastCalledWith('');

      checkCurrent(router, cloneWithParams({ route: routes.spyOne, query: { q: 'foo' } }), url);

      url = await router.redirect({ route: 'spyOne', query: { q: 'bar' } });

      checkSpy();

      checkCurrent(router, cloneWithParams({ route: routes.spyOne, query: { q: 'bar' } }), url);
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
            pageId: routesDefault.dynamicRoute.pageId,
            async beforeEnter(config, param: string) {
              spyOne(param);
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });
      const { routes } = router.getConfig();

      let url = await router.redirect({ route: 'spyOneDynamic', params: { static: 'foo' } });

      counter.spyOne += 1;

      checkSpy();

      expect(spyOne).toHaveBeenLastCalledWith('');

      checkCurrent(
        router,
        cloneWithParams({ route: routes.spyOneDynamic, params: { static: 'foo' } }),
        url
      );

      url = await router.redirect({ route: 'spyOneDynamic', params: { static: 'bar' } });

      counter.spyOne += 1;

      checkSpy();

      checkCurrent(
        router,
        cloneWithParams({ route: routes.spyOneDynamic, params: { static: 'bar' } }),
        url
      );
    });

    it('beforeEnter: errors are rendered with internalError and not pushed to history', async () => {
      const router = createRouter({
        routes: createRoutes({
          buggyCode: {
            path: '/test/static4',
            loader: routesDefault.dynamicRoute.loader,
            pageId: routesDefault.dynamicRoute.pageId,
            async beforeEnter() {
              // @ts-ignore
              // biome-ignore lint/correctness/noUndeclaredVariables: false
              a;
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });
      const { routes } = router.getConfig();

      // TODO: check url
      await router.redirect({ route: 'buggyCode' });

      checkCurrent(router, cloneWithParams({ route: routes.internalError }));
    });

    it('beforeLeave: not called when redirecting to same static route', async () => {
      const { spyOne, checkSpy } = createCounters();

      const router = createRouter({
        routes: createRoutes({
          spyOne: {
            path: '/test/static',
            loader: routesDefault.staticRoute.loader,
            pageId: routesDefault.staticRoute.pageId,
            async beforeLeave(config, param: string) {
              spyOne(param);
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });
      const { routes } = router.getConfig();

      let url = await router.redirect({ route: 'spyOne' });

      checkSpy();

      checkCurrent(router, cloneWithParams({ route: routes.spyOne }), url);

      url = await router.redirect({ route: 'spyOne' });

      checkSpy();

      checkCurrent(router, cloneWithParams({ route: routes.spyOne }), url);
    });

    it('beforeLeave: called when redirecting to another route', async () => {
      const { spyOne, counter, checkSpy } = createCounters();

      const router = createRouter({
        routes: createRoutes({
          spyOne: {
            path: '/test/static',
            loader: routesDefault.staticRoute.loader,
            pageId: routesDefault.staticRoute.pageId,
            async beforeLeave(config, param: string) {
              spyOne(param);
            },
          },
          spyOneDynamic: {
            path: '/test/:static',
            params: {
              static: (value) => value.length > 2,
            },
            loader: routesDefault.dynamicRoute.loader,
            pageId: routesDefault.dynamicRoute.pageId,
          },
          ...getDefaultRoutes(routesDefault),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });
      const { routes } = router.getConfig();

      let url = await router.redirect({ route: 'spyOne' });

      checkSpy();

      checkCurrent(router, cloneWithParams({ route: routes.spyOne }), url);

      url = await router.redirect({ route: 'spyOneDynamic', params: { static: 'foo' } });

      counter.spyOne += 1;

      checkSpy();

      expect(spyOne).toHaveBeenLastCalledWith('');

      checkCurrent(
        router,
        cloneWithParams({ route: routes.spyOneDynamic, params: { static: 'foo' } }),
        url
      );
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
            pageId: routesDefault.dynamicRoute.pageId,
            async beforeLeave(config, param: string) {
              spyOne(param);
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });
      const { routes } = router.getConfig();

      let url = await router.redirect({ route: 'spyOneDynamic', params: { static: 'foo' } });

      checkSpy();

      checkCurrent(
        router,
        cloneWithParams({ route: routes.spyOneDynamic, params: { static: 'foo' } }),
        url
      );

      url = await router.redirect({ route: 'spyOneDynamic', params: { static: 'foo' } });

      checkSpy();

      checkCurrent(
        router,
        cloneWithParams({ route: routes.spyOneDynamic, params: { static: 'foo' } }),
        url
      );
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
            pageId: routesDefault.dynamicRoute.pageId,
            async beforeLeave(config, param: string) {
              spyOne(param);
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });
      const { routes } = router.getConfig();

      let url = await router.redirect({ route: 'spyOneDynamic', params: { static: 'foo' } });

      checkSpy();

      checkCurrent(
        router,
        cloneWithParams({ route: routes.spyOneDynamic, params: { static: 'foo' } }),
        url
      );

      url = await router.redirect({ route: 'spyOneDynamic', params: { static: 'bar' } });

      counter.spyOne += 1;

      checkSpy();

      expect(spyOne).toHaveBeenLastCalledWith('');

      checkCurrent(
        router,
        cloneWithParams({ route: routes.spyOneDynamic, params: { static: 'bar' } }),
        url
      );
    });

    it('beforeLeave: prevent and allow redirects', async () => {
      const { spyOne, counter, checkSpy } = createCounters();

      const router = createRouter({
        routes: createRoutes({
          spyOne: {
            path: '/test/static',
            loader: routesDefault.staticRoute.loader,
            pageId: routesDefault.staticRoute.pageId,
          },
          spyTwoDynamic: {
            path: '/test/:static',
            params: {
              static: (value) => value.length > 2,
            },
            loader: routesDefault.dynamicRoute.loader,
            pageId: routesDefault.dynamicRoute.pageId,
          },
          preventRedirect: {
            path: '/test/prevent-redirect',
            loader: routesDefault.dynamicRoute.loader,
            pageId: routesDefault.dynamicRoute.pageId,
            async beforeLeave(config, param: string) {
              spyOne(param);

              if (config.nextRoute.name === 'spyOne') {
                return config.preventRedirect();
              }
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });
      const { routes } = router.getConfig();

      let url = await router.redirect({ route: 'preventRedirect' });

      checkCurrent(router, cloneWithParams({ route: routes.preventRedirect }), url);

      url = await router.redirect({ route: 'spyOne' });

      // Redirect to spyOne prevented
      checkCurrent(router, cloneWithParams({ route: routes.preventRedirect }), url);

      counter.spyOne += 1;

      checkSpy();

      url = await router.redirect({ route: 'spyTwoDynamic', params: { static: 'asd' } });

      // Redirect to spyTwoDynamic not prevented
      checkCurrent(
        router,
        cloneWithParams({ route: routes.spyTwoDynamic, params: { static: 'asd' } }),
        url
      );

      counter.spyOne += 1;

      checkSpy();
    });

    it('beforeLeave: errors are rendered with internalError and not pushed to history', async () => {
      const router = createRouter({
        routes: createRoutes({
          spyOne: {
            path: '/test/static',
            loader: routesDefault.staticRoute.loader,
            pageId: routesDefault.staticRoute.pageId,
          },
          buggyCode: {
            path: '/test/buggy-code',
            loader: routesDefault.dynamicRoute.loader,
            pageId: routesDefault.dynamicRoute.pageId,
            async beforeLeave() {
              // @ts-ignore
              // biome-ignore lint/correctness/noUndeclaredVariables: false
              a;
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });
      const { routes } = router.getConfig();

      let url = await router.redirect({ route: 'buggyCode' });

      checkCurrent(router, cloneWithParams({ route: routes.buggyCode }), url);

      // TODO: check url
      url = await router.redirect({ route: 'spyOne' });

      checkCurrent(router, cloneWithParams({ route: routes.internalError }));
    });

    it('query: no push to history if query is the same', async () => {
      const router = createRouter({ routes: routesDefault, adapters: await getAdapters(options) });

      let url = await router.redirect({ route: 'staticRoute', query: { q: 'test' } });

      checkCurrent(
        router,
        cloneWithParams({ route: routesDefault.staticRoute, query: { q: 'test' } }),
        url
      );

      url = await router.redirect({ route: 'staticRoute', query: { q: 'test' } });

      checkCurrent(
        router,
        cloneWithParams({ route: routesDefault.staticRoute, query: { q: 'test' } }),
        url
      );

      // url is cleared of nonExistent
      url = await router.redirect({
        route: 'staticRoute',
        // @ts-ignore
        query: { q: 'test', nonExistent: 'test' },
      });

      checkCurrent(
        router,
        cloneWithParams({ route: routesDefault.staticRoute, query: { q: 'test' } }),
        url
      );
    });

    it('query: no push to history if query is the same (non existent param)', async () => {
      const router = createRouter({ routes: routesDefault, adapters: await getAdapters(options) });

      let url = await router.redirect({ route: 'staticRoute' });

      checkCurrent(router, cloneWithParams({ route: routesDefault.staticRoute }), url);

      // url is cleared of nonExistent
      // @ts-ignore
      url = await router.redirect({ route: 'staticRoute', query: { nonExistent: 'test' } });

      checkCurrent(router, cloneWithParams({ route: routesDefault.staticRoute }), url);
    });

    it('query: push to history if query changed', async () => {
      const router = createRouter({ routes: routesDefault, adapters: await getAdapters(options) });

      let url = await router.redirect({ route: 'staticRoute', query: { q: 'test' } });

      checkCurrent(
        router,
        cloneWithParams({ route: routesDefault.staticRoute, query: { q: 'test' } }),
        url
      );

      url = await router.redirect({ route: 'staticRoute', query: { q: 'test2' } });

      checkCurrent(
        router,
        cloneWithParams({ route: routesDefault.staticRoute, query: { q: 'test2' } }),
        url
      );

      url = await router.redirect({ route: 'staticRoute' });

      checkCurrent(router, cloneWithParams({ route: routesDefault.staticRoute }), url);

      url = await router.redirect({ route: 'staticRoute', query: { q: 'test' } });

      checkCurrent(
        router,
        cloneWithParams({ route: routesDefault.staticRoute, query: { q: 'test' } }),
        url
      );
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
            pageId: routesDefault.staticRoute.pageId,
            async beforeEnter(config, param: string) {
              spyOne(param);
            },
          },
          redirectSpyOne: {
            path: '/test/static3',
            loader: routesDefault.dynamicRoute.loader,
            pageId: routesDefault.dynamicRoute.pageId,
            async beforeEnter(config, param: string) {
              spyTwo(param);

              return config.redirect({ route: 'spyOne' });
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });
      const { routes } = router.getConfig();

      const url = await router.redirect({ route: 'redirectSpyOne' });

      counter.spyOne += 1;
      counter.spyTwo += 1;

      checkSpy();

      expect(spyOne).toHaveBeenLastCalledWith('');
      expect(spyTwo).toHaveBeenLastCalledWith('');

      checkCurrent(router, cloneWithParams({ route: routes.spyOne }), url);
    });

    it('beforeEnter: multiple redirects are not registered in history', async () => {
      const router = createRouter({
        routes: createRoutes({
          one: {
            path: '/1',
            loader: routesDefault.dynamicRoute.loader,
            pageId: routesDefault.dynamicRoute.pageId,
          },
          two: {
            path: '/2',
            loader: routesDefault.dynamicRoute.loader,
            pageId: routesDefault.dynamicRoute.pageId,
            async beforeEnter(config) {
              return config.redirect({ route: 'one' });
            },
          },
          three: {
            path: '/3',
            loader: routesDefault.dynamicRoute.loader,
            pageId: routesDefault.dynamicRoute.pageId,
            async beforeEnter(config) {
              return config.redirect({ route: 'two' });
            },
          },
          four: {
            path: '/4',
            loader: routesDefault.dynamicRoute.loader,
            pageId: routesDefault.dynamicRoute.pageId,
            async beforeEnter(config) {
              return config.redirect({ route: 'three' });
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });
      const { routes } = router.getConfig();

      const url = await router.redirect({ route: 'four' });

      checkCurrent(router, cloneWithParams({ route: routes.one }), url);
    });
  });

  describe.runIf(!isClient)(`redirect SSR [${options.renderer}+${options.reactivity}]`, () => {
    it('beforeEnter: redirects throw exception and not call next lifecycle', async () => {
      const { spyOne, spyTwo, counter, checkSpy } = createCounters();

      const router = createRouter({
        routes: createRoutes({
          spyOne: {
            path: '/test/static',
            query: { a: () => true },
            loader: routesDefault.staticRoute.loader,
            pageId: routesDefault.staticRoute.pageId,
            async beforeEnter(config, param: string) {
              spyOne(param);
            },
          },
          redirectSpyOne: {
            path: '/test/static3',
            loader: routesDefault.dynamicRoute.loader,
            pageId: routesDefault.dynamicRoute.pageId,
            async beforeEnter(config, param: string) {
              spyTwo(param);

              return config.redirect({ route: 'spyOne' });
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });
      const { routes } = router.getConfig();

      const url = await router.redirect({ route: 'spyOne' });

      counter.spyOne += 1;

      checkSpy();

      await expect(async () => {
        await router.redirect({ route: 'redirectSpyOne' });
      }).rejects.toThrowError(new RedirectError(routes.spyOne.path));

      counter.spyTwo += 1;

      checkCurrent(router, cloneWithParams({ route: routes.spyOne }), url);

      checkSpy();
    });

    it('beforeEnter: multiple redirects are not registered in history', async () => {
      const router = createRouter({
        routes: createRoutes({
          one: {
            path: '/1',
            loader: routesDefault.dynamicRoute.loader,
            pageId: routesDefault.dynamicRoute.pageId,
          },
          two: {
            path: '/2',
            loader: routesDefault.dynamicRoute.loader,
            pageId: routesDefault.dynamicRoute.pageId,
            async beforeEnter(config) {
              return config.redirect({ route: 'one' });
            },
          },
          three: {
            path: '/3',
            loader: routesDefault.dynamicRoute.loader,
            pageId: routesDefault.dynamicRoute.pageId,
            async beforeEnter(config) {
              return config.redirect({ route: 'two' });
            },
          },
          four: {
            path: '/4',
            loader: routesDefault.dynamicRoute.loader,
            pageId: routesDefault.dynamicRoute.pageId,
            async beforeEnter(config) {
              return config.redirect({ route: 'three' });
            },
          },
          ...getDefaultRoutes(routesDefault),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });
      const { routes } = router.getConfig();

      const redirectThree = new RedirectError(routes.three.path);

      await expect(async () => {
        await router.restoreFromURL({ pathname: routes.four.path });
      }).rejects.toThrowError(redirectThree);

      const redirectTwo = new RedirectError(routes.two.path);

      await expect(async () => {
        await router.restoreFromURL({ pathname: redirectThree.message });
      }).rejects.toThrowError(redirectTwo);

      const redirectOne = new RedirectError(routes.one.path);

      await expect(async () => {
        await router.restoreFromURL({ pathname: redirectTwo.message });
      }).rejects.toThrowError(redirectOne);

      const url = await router.restoreFromURL({ pathname: redirectOne.message });

      checkCurrent(router, cloneWithParams({ route: routes.one }), url);
    });
  });
});
