import _ from 'lodash';
import { describe, expect, it, vi } from 'vitest';

import { getAdapters } from '../../shared/getAdapters';
import { getRoutes } from '../../shared/helpers';
import { allPossibleOptions } from '../../shared/types';
import { createRouter, createRoutes, RedirectError } from '../index';
import { TypeRoute } from '../types/TypeRoute';
import { constants } from '../utils/constants';
import { queryString } from '../utils/queryString';
import { replaceDynamicValues } from '../utils/replaceDynamicValues';

type TypeRouteWithParams = Omit<TypeRoute, 'params'> & {
  params: Record<string, string>;
  query: Record<string, string>;
};

function checkHistory(router: any, history: Array<TypeRouteWithParams>) {
  expect(router.routesHistory).to.deep.eq(
    history.map((c) => {
      let pathname = replaceDynamicValues({
        route: c as any,
        params: c.params,
      });

      if (c.query) {
        const searchString = queryString.stringify(c.query);

        if (searchString) pathname += `?${searchString}`;
      }

      return pathname;
    })
  );
}

function checkCurrent(router: any, route: TypeRouteWithParams) {
  expect(router.currentRoute).to.deep.eq({
    name: route.name,
    path: route.path,
    props: route.props,
    params: route.params || {},
    query: route.query,
    pageId:
      route.path === '/test/static'
        ? 'static'
        : ['/error404', '/error500'].includes(route.path)
          ? 'error'
          : 'dynamic',
  });

  if (route.path === '/test/static') {
    expect(route.otherExports?.store).to.deep.eq('');
    expect(route.otherExports?.actions).to.deep.eq('');
  }
}

function checkHistoryAndCurrent(router: any, history: Array<TypeRouteWithParams>) {
  checkHistory(router, history);
  checkCurrent(router, history[history.length - 1]);
}

function cloneWithParams<TRoute extends TypeRoute>(config: {
  route: TRoute;
  params?: Record<keyof TRoute['params'], string>;
  query?: Partial<Record<keyof TRoute['query'], string>>;
}): TypeRouteWithParams {
  if ('params' in config) {
    return Object.assign(_.cloneDeep(config.route) as any, {
      params: config.params,
      query: config.query || {},
    });
  }

  return Object.assign(_.cloneDeep(config.route) as any, { query: config.query || {} });
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
  const routes = getRoutes(options);

  describe(`redirect [${options.renderer}+${options.reactivity}]`, () => {
    it('restoreFromURL: sets initial route', async () => {
      const router = createRouter({ routes, adapters: await getAdapters(options) });

      await router.restoreFromURL({ pathname: routes.staticRoute.path });

      const history: Array<TypeRouteWithParams> = [];

      history.push(cloneWithParams({ route: routes.staticRoute }));

      checkHistoryAndCurrent(router, history);
    });

    it('restoreFromURL: sets initial route not found', async () => {
      const router = createRouter({ routes, adapters: await getAdapters(options) });

      await router.restoreFromURL({ pathname: '/testX/static' });

      const history: Array<TypeRouteWithParams> = [];

      history.push(cloneWithParams({ route: routes.notFound }));

      checkHistoryAndCurrent(router, history);
    });

    it('beforeEnter: not called when redirecting to same static route', async () => {
      const { spyOne, counter, checkSpy } = createCounters();

      const router = createRouter({
        routes: createRoutes({
          spyOne: {
            path: '/test/static',
            loader: routes.staticRoute.loader,
            pageId: routes.staticRoute.pageId,
            async beforeEnter(config, param: string) {
              spyOne(param);
            },
          },
          ...getDefaultRoutes(routes),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });

      const history: Array<TypeRouteWithParams> = [];

      await router.redirect({ route: 'spyOne' });

      history.push(cloneWithParams({ route: router.routes.spyOne }));

      counter.spyOne += 1;

      checkSpy();

      expect(spyOne).toHaveBeenLastCalledWith('');

      checkHistoryAndCurrent(router, history);

      await router.redirect({ route: 'spyOne' });

      checkSpy();

      checkHistoryAndCurrent(router, history);
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
            loader: routes.dynamicRoute.loader,
            pageId: routes.dynamicRoute.pageId,
            async beforeEnter(config, param: string) {
              spyOne(param);
            },
          },
          ...getDefaultRoutes(routes),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });

      const history: Array<TypeRouteWithParams> = [];

      await router.redirect({ route: 'spyOneDynamic', params: { static: 'foo' } });

      history.push(
        cloneWithParams({ route: router.routes.spyOneDynamic, params: { static: 'foo' } })
      );

      counter.spyOne += 1;

      checkSpy();

      expect(spyOne).toHaveBeenLastCalledWith('');

      await router.redirect({ route: 'spyOneDynamic', params: { static: 'foo' } });

      checkSpy();

      checkHistoryAndCurrent(router, history);
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
            loader: routes.staticRoute.loader,
            pageId: routes.staticRoute.pageId,
            async beforeEnter(config, param: string) {
              spyOne(param);
            },
          },
          ...getDefaultRoutes(routes),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });

      const history: Array<TypeRouteWithParams> = [];

      await router.redirect({ route: 'spyOne', query: { q: 'foo' } });

      history.push(cloneWithParams({ route: router.routes.spyOne, query: { q: 'foo' } }));

      counter.spyOne += 1;

      checkSpy();

      expect(spyOne).toHaveBeenLastCalledWith('');

      await router.redirect({ route: 'spyOne', query: { q: 'foo' } });

      checkSpy();

      checkHistoryAndCurrent(router, history);
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
            loader: routes.staticRoute.loader,
            pageId: routes.staticRoute.pageId,
            async beforeEnter(config, param: string) {
              spyOne(param);
            },
          },
          ...getDefaultRoutes(routes),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });

      const history: Array<TypeRouteWithParams> = [];

      await router.redirect({ route: 'spyOne', query: { q: 'foo' } });

      history.push(cloneWithParams({ route: router.routes.spyOne, query: { q: 'foo' } }));

      counter.spyOne += 1;

      checkSpy();

      expect(spyOne).toHaveBeenLastCalledWith('');

      await router.redirect({ route: 'spyOne', query: { q: 'bar' } });

      history.push(cloneWithParams({ route: router.routes.spyOne, query: { q: 'bar' } }));

      checkSpy();

      checkHistoryAndCurrent(router, history);
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
            loader: routes.dynamicRoute.loader,
            pageId: routes.dynamicRoute.pageId,
            async beforeEnter(config, param: string) {
              spyOne(param);
            },
          },
          ...getDefaultRoutes(routes),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });

      const history: Array<TypeRouteWithParams> = [];

      await router.redirect({ route: 'spyOneDynamic', params: { static: 'foo' } });

      history.push(
        cloneWithParams({ route: router.routes.spyOneDynamic, params: { static: 'foo' } })
      );

      counter.spyOne += 1;

      checkSpy();

      expect(spyOne).toHaveBeenLastCalledWith('');

      await router.redirect({ route: 'spyOneDynamic', params: { static: 'bar' } });

      history.push(
        cloneWithParams({ route: router.routes.spyOneDynamic, params: { static: 'bar' } })
      );

      counter.spyOne += 1;

      checkSpy();

      checkHistoryAndCurrent(router, history);
    });

    it('beforeEnter: errors are rendered with internalError and not pushed to history', async () => {
      const router = createRouter({
        routes: createRoutes({
          buggyCode: {
            path: '/test/static4',
            loader: routes.dynamicRoute.loader,
            pageId: routes.dynamicRoute.pageId,
            async beforeEnter() {
              // @ts-ignore
              // biome-ignore lint/correctness/noUndeclaredVariables: false
              a;
            },
          },
          ...getDefaultRoutes(routes),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });

      const history: Array<TypeRouteWithParams> = [];

      await router.redirect({ route: 'buggyCode' });

      // Front does not throw an exception on buggy code, replace currentRoute with error500
      checkHistory(router, history);
      checkCurrent(router, cloneWithParams({ route: router.routes.internalError }));
    });

    it('beforeLeave: not called when redirecting to same static route', async () => {
      const { spyOne, checkSpy } = createCounters();

      const router = createRouter({
        routes: createRoutes({
          spyOne: {
            path: '/test/static',
            loader: routes.staticRoute.loader,
            pageId: routes.staticRoute.pageId,
            async beforeLeave(config, param: string) {
              spyOne(param);
            },
          },
          ...getDefaultRoutes(routes),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });

      const history: Array<TypeRouteWithParams> = [];

      await router.redirect({ route: 'spyOne' });

      checkSpy();

      history.push(cloneWithParams({ route: router.routes.spyOne }));

      checkHistoryAndCurrent(router, history);

      await router.redirect({ route: 'spyOne' });

      checkSpy();

      checkHistoryAndCurrent(router, history);
    });

    it('beforeLeave: called when redirecting to another route', async () => {
      const { spyOne, counter, checkSpy } = createCounters();

      const router = createRouter({
        routes: createRoutes({
          spyOne: {
            path: '/test/static',
            loader: routes.staticRoute.loader,
            pageId: routes.staticRoute.pageId,
            async beforeLeave(config, param: string) {
              spyOne(param);
            },
          },
          spyOneDynamic: {
            path: '/test/:static',
            params: {
              static: (value) => value.length > 2,
            },
            loader: routes.dynamicRoute.loader,
            pageId: routes.dynamicRoute.pageId,
          },
          ...getDefaultRoutes(routes),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });

      const history: Array<TypeRouteWithParams> = [];

      await router.redirect({ route: 'spyOne' });

      checkSpy();

      history.push(cloneWithParams({ route: router.routes.spyOne }));

      checkHistoryAndCurrent(router, history);

      await router.redirect({ route: 'spyOneDynamic', params: { static: 'foo' } });

      history.push(
        cloneWithParams({ route: router.routes.spyOneDynamic, params: { static: 'foo' } })
      );

      counter.spyOne += 1;

      checkSpy();

      expect(spyOne).toHaveBeenLastCalledWith('');

      checkHistoryAndCurrent(router, history);
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
            loader: routes.dynamicRoute.loader,
            pageId: routes.dynamicRoute.pageId,
            async beforeLeave(config, param: string) {
              spyOne(param);
            },
          },
          ...getDefaultRoutes(routes),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });

      const history: Array<TypeRouteWithParams> = [];

      await router.redirect({ route: 'spyOneDynamic', params: { static: 'foo' } });

      checkSpy();

      history.push(
        cloneWithParams({ route: router.routes.spyOneDynamic, params: { static: 'foo' } })
      );

      checkHistoryAndCurrent(router, history);

      await router.redirect({ route: 'spyOneDynamic', params: { static: 'foo' } });

      checkSpy();

      checkHistoryAndCurrent(router, history);
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
            loader: routes.dynamicRoute.loader,
            pageId: routes.dynamicRoute.pageId,
            async beforeLeave(config, param: string) {
              spyOne(param);
            },
          },
          ...getDefaultRoutes(routes),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });

      const history: Array<TypeRouteWithParams> = [];

      await router.redirect({ route: 'spyOneDynamic', params: { static: 'foo' } });

      checkSpy();

      history.push(
        cloneWithParams({ route: router.routes.spyOneDynamic, params: { static: 'foo' } })
      );

      checkHistoryAndCurrent(router, history);

      await router.redirect({ route: 'spyOneDynamic', params: { static: 'bar' } });

      history.push(
        cloneWithParams({ route: router.routes.spyOneDynamic, params: { static: 'bar' } })
      );

      counter.spyOne += 1;

      checkSpy();

      expect(spyOne).toHaveBeenLastCalledWith('');

      checkHistoryAndCurrent(router, history);
    });

    it('beforeLeave: prevent and allow redirects', async () => {
      const { spyOne, counter, checkSpy } = createCounters();

      const router = createRouter({
        routes: createRoutes({
          spyOne: {
            path: '/test/static',
            loader: routes.staticRoute.loader,
            pageId: routes.staticRoute.pageId,
          },
          spyTwoDynamic: {
            path: '/test/:static',
            params: {
              static: (value) => value.length > 2,
            },
            loader: routes.dynamicRoute.loader,
            pageId: routes.dynamicRoute.pageId,
          },
          preventRedirect: {
            path: '/test/prevent-redirect',
            loader: routes.dynamicRoute.loader,
            pageId: routes.dynamicRoute.pageId,
            async beforeLeave(config, param: string) {
              spyOne(param);

              if (config.nextRoute.name === 'spyOne') {
                return config.preventRedirect();
              }
            },
          },
          ...getDefaultRoutes(routes),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });

      const history: Array<TypeRouteWithParams> = [];

      await router.redirect({ route: 'preventRedirect' });

      history.push(cloneWithParams({ route: router.routes.preventRedirect }));

      checkHistoryAndCurrent(router, history);

      await router.redirect({ route: 'spyOne' });

      // Redirect to spyOne prevented
      checkHistoryAndCurrent(router, history);

      counter.spyOne += 1;

      checkSpy();

      await router.redirect({ route: 'spyTwoDynamic', params: { static: 'asd' } });

      // Redirect to spyTwoDynamic not prevented
      history.push(
        cloneWithParams({ route: router.routes.spyTwoDynamic, params: { static: 'asd' } })
      );

      checkHistoryAndCurrent(router, history);

      counter.spyOne += 1;

      checkSpy();
    });

    it('beforeLeave: errors are rendered with internalError and not pushed to history', async () => {
      const router = createRouter({
        routes: createRoutes({
          spyOne: {
            path: '/test/static',
            loader: routes.staticRoute.loader,
            pageId: routes.staticRoute.pageId,
          },
          buggyCode: {
            path: '/test/buggy-code',
            loader: routes.dynamicRoute.loader,
            pageId: routes.dynamicRoute.pageId,
            async beforeLeave() {
              // @ts-ignore
              // biome-ignore lint/correctness/noUndeclaredVariables: false
              a;
            },
          },
          ...getDefaultRoutes(routes),
        }),
        lifecycleParams: [''],
        adapters: await getAdapters(options),
      });

      const history: Array<TypeRouteWithParams> = [];

      await router.redirect({ route: 'buggyCode' });

      history.push(cloneWithParams({ route: router.routes.buggyCode }));

      checkHistoryAndCurrent(router, history);

      await router.redirect({ route: 'spyOne' });

      checkHistory(router, history);

      checkCurrent(router, cloneWithParams({ route: router.routes.internalError }));
    });

    it('query: no push to history if query is the same', async () => {
      const router = createRouter({ routes, adapters: await getAdapters(options) });

      const history: Array<TypeRouteWithParams> = [];

      await router.redirect({ route: 'staticRoute', query: { q: 'test' } });

      history.push(cloneWithParams({ route: routes.staticRoute, query: { q: 'test' } }));

      checkHistoryAndCurrent(router, history);

      await router.redirect({ route: 'staticRoute', query: { q: 'test' } });

      checkHistoryAndCurrent(router, history);

      await router.redirect({
        route: 'staticRoute',
        // @ts-ignore
        query: { q: 'test', nonExistent: 'test' },
      });

      checkHistoryAndCurrent(router, history);
    });

    it('query: no push to history if query is the same (non existent param)', async () => {
      const router = createRouter({ routes, adapters: await getAdapters(options) });

      const history: Array<TypeRouteWithParams> = [];

      await router.redirect({ route: 'staticRoute' });

      history.push(cloneWithParams({ route: routes.staticRoute }));

      checkHistoryAndCurrent(router, history);

      // @ts-ignore
      await router.redirect({ route: 'staticRoute', query: { nonExistent: 'test' } });

      checkHistoryAndCurrent(router, history);
    });

    it('query: push to history if query changed', async () => {
      const router = createRouter({ routes, adapters: await getAdapters(options) });

      const history: Array<TypeRouteWithParams> = [];

      await router.redirect({ route: 'staticRoute', query: { q: 'test' } });

      history.push(cloneWithParams({ route: routes.staticRoute, query: { q: 'test' } }));

      checkHistoryAndCurrent(router, history);

      await router.redirect({ route: 'staticRoute', query: { q: 'test2' } });

      history.push(cloneWithParams({ route: routes.staticRoute, query: { q: 'test2' } }));

      checkHistoryAndCurrent(router, history);

      await router.redirect({ route: 'staticRoute' });

      history.push(cloneWithParams({ route: routes.staticRoute }));

      checkHistoryAndCurrent(router, history);

      await router.redirect({ route: 'staticRoute', query: { q: 'test' } });

      history.push(cloneWithParams({ route: routes.staticRoute, query: { q: 'test' } }));

      checkHistoryAndCurrent(router, history);
    });
  });

  describe.runIf(constants.isClient)(
    `redirect Client [${options.renderer}+${options.reactivity}]`,
    () => {
      it('beforeEnter: redirects are made silently and call lifecycle', async () => {
        const { spyOne, spyTwo, counter, checkSpy } = createCounters();

        const router = createRouter({
          routes: createRoutes({
            spyOne: {
              path: '/test/static',
              loader: routes.staticRoute.loader,
              pageId: routes.staticRoute.pageId,
              async beforeEnter(config, param: string) {
                spyOne(param);
              },
            },
            redirectSpyOne: {
              path: '/test/static3',
              loader: routes.dynamicRoute.loader,
              pageId: routes.dynamicRoute.pageId,
              async beforeEnter(config, param: string) {
                spyTwo(param);

                return config.redirect({ route: 'spyOne' });
              },
            },
            ...getDefaultRoutes(routes),
          }),
          lifecycleParams: [''],
          adapters: await getAdapters(options),
        });

        const history: Array<TypeRouteWithParams> = [];

        await router.redirect({ route: 'redirectSpyOne' });

        history.push(cloneWithParams({ route: router.routes.spyOne }));

        counter.spyOne += 1;
        counter.spyTwo += 1;

        checkSpy();

        expect(spyOne).toHaveBeenLastCalledWith('');
        expect(spyTwo).toHaveBeenLastCalledWith('');

        checkHistoryAndCurrent(router, history);
      });

      it('beforeEnter: multiple redirects are not registered in history', async () => {
        const router = createRouter({
          routes: createRoutes({
            one: {
              path: '/1',
              loader: routes.dynamicRoute.loader,
              pageId: routes.dynamicRoute.pageId,
            },
            two: {
              path: '/2',
              loader: routes.dynamicRoute.loader,
              pageId: routes.dynamicRoute.pageId,
              async beforeEnter(config) {
                return config.redirect({ route: 'one' });
              },
            },
            three: {
              path: '/3',
              loader: routes.dynamicRoute.loader,
              pageId: routes.dynamicRoute.pageId,
              async beforeEnter(config) {
                return config.redirect({ route: 'two' });
              },
            },
            four: {
              path: '/4',
              loader: routes.dynamicRoute.loader,
              pageId: routes.dynamicRoute.pageId,
              async beforeEnter(config) {
                return config.redirect({ route: 'three' });
              },
            },
            ...getDefaultRoutes(routes),
          }),
          lifecycleParams: [''],
          adapters: await getAdapters(options),
        });

        const history: Array<TypeRouteWithParams> = [];

        await router.redirect({ route: 'four' });

        history.push(cloneWithParams({ route: router.routes.one }));

        checkHistoryAndCurrent(router, history);
      });
    }
  );

  describe.runIf(!constants.isClient)(
    `redirect SSR [${options.renderer}+${options.reactivity}]`,
    () => {
      it('beforeEnter: redirects throw exception and not call next lifecycle', async () => {
        const { spyOne, spyTwo, counter, checkSpy } = createCounters();

        const router = createRouter({
          routes: createRoutes({
            spyOne: {
              path: '/test/static',
              query: { a: () => true },
              loader: routes.staticRoute.loader,
              pageId: routes.staticRoute.pageId,
              async beforeEnter(config, param: string) {
                spyOne(param);
              },
            },
            redirectSpyOne: {
              path: '/test/static3',
              loader: routes.dynamicRoute.loader,
              pageId: routes.dynamicRoute.pageId,
              async beforeEnter(config, param: string) {
                spyTwo(param);

                return config.redirect({ route: 'spyOne' });
              },
            },
            ...getDefaultRoutes(routes),
          }),
          lifecycleParams: [''],
          adapters: await getAdapters(options),
        });

        const history: Array<TypeRouteWithParams> = [];

        await router.redirect({ route: 'spyOne' });

        history.push(cloneWithParams({ route: router.routes.spyOne }));

        counter.spyOne += 1;

        checkSpy();

        await expect(async () => {
          await router.redirect({ route: 'redirectSpyOne' });
        }).rejects.toThrowError(new RedirectError(router.routes.spyOne.path));

        counter.spyTwo += 1;

        checkHistoryAndCurrent(router, history);

        checkSpy();
      });

      it('beforeEnter: multiple redirects are not registered in history', async () => {
        const router = createRouter({
          routes: createRoutes({
            one: {
              path: '/1',
              loader: routes.dynamicRoute.loader,
              pageId: routes.dynamicRoute.pageId,
            },
            two: {
              path: '/2',
              loader: routes.dynamicRoute.loader,
              pageId: routes.dynamicRoute.pageId,
              async beforeEnter(config) {
                return config.redirect({ route: 'one' });
              },
            },
            three: {
              path: '/3',
              loader: routes.dynamicRoute.loader,
              pageId: routes.dynamicRoute.pageId,
              async beforeEnter(config) {
                return config.redirect({ route: 'two' });
              },
            },
            four: {
              path: '/4',
              loader: routes.dynamicRoute.loader,
              pageId: routes.dynamicRoute.pageId,
              async beforeEnter(config) {
                return config.redirect({ route: 'three' });
              },
            },
            ...getDefaultRoutes(routes),
          }),
          lifecycleParams: [''],
          adapters: await getAdapters(options),
        });

        const history: Array<TypeRouteWithParams> = [];

        const redirectThree = new RedirectError(router.routes.three.path);

        await expect(async () => {
          await router.restoreFromURL({ pathname: router.routes.four.path });
        }).rejects.toThrowError(redirectThree);

        const redirectTwo = new RedirectError(router.routes.two.path);

        await expect(async () => {
          await router.restoreFromURL({ pathname: redirectThree.message });
        }).rejects.toThrowError(redirectTwo);

        const redirectOne = new RedirectError(router.routes.one.path);

        await expect(async () => {
          await router.restoreFromURL({ pathname: redirectTwo.message });
        }).rejects.toThrowError(redirectOne);

        await router.restoreFromURL({ pathname: redirectOne.message });

        history.push(cloneWithParams({ route: router.routes.one }));

        checkHistoryAndCurrent(router, history);
      });
    }
  );
});
