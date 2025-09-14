import _ from 'lodash';
import queryString from 'query-string';
import { describe, expect, it, vi } from 'vitest';

import { createRouterWithCustomRoutes, getRoutes } from '../../shared/helpers';
import { createRouterConfig } from '../createRouterConfig';
import { InterfaceRouterStore } from '../types/InterfaceRouterStore';
import { TypeRoute } from '../types/TypeRoute';
import { TypeRouteWithParams } from '../types/TypeRouteWithParams';
import { constants } from '../utils/constants';
import { getInitialRoute } from '../utils/getInitialRoute';
import { replaceDynamicValues } from '../utils/replaceDynamicValues';

const routes = getRoutes({ renderer: 'react', reactivity: 'mobx' });

function checkHistory(routerStore: InterfaceRouterStore<any>, history: Array<TypeRouteWithParams>) {
  expect(routerStore.routesHistory).to.deep.eq(
    history.map((c) => {
      let pathname = replaceDynamicValues({
        route: c,
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

function checkCurrent(routerStore: InterfaceRouterStore<any>, route: TypeRouteWithParams) {
  expect(routerStore.currentRoute).to.deep.eq({
    name: route.name,
    path: route.path,
    props: route.props,
    params: route.params || {},
    query: route.query,
    pageName:
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

function checkHistoryAndCurrent(
  routerStore: InterfaceRouterStore<any>,
  history: Array<TypeRouteWithParams>
) {
  checkHistory(routerStore, history);
  checkCurrent(routerStore, history[history.length - 1]);
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

  return Object.assign(_.cloneDeep(config.route) as any, {
    query: config.query || {},
  });
}

describe('redirectToGenerator', () => {
  it('Creates', async () => {
    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      routes
    );

    expect(typeof routerStore.redirectTo).to.deep.eq('function');
    expect(routerStore.routesHistory).to.deep.eq([]);
    expect(routerStore.currentRoute).to.deep.eq({});
  });

  it('Sets initial route', async () => {
    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      routes
    );

    const initialRoute = getInitialRoute({
      routes: routes,
      pathname: routes.staticRoute.path,
    });

    const history: Array<TypeRouteWithParams> = [];

    await routerStore.redirectTo(initialRoute);

    history.push(cloneWithParams({ route: routes.staticRoute }));

    checkHistoryAndCurrent(routerStore, history);
  });

  it('Sets initial route not found', async () => {
    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      routes
    );

    const initialRoute = getInitialRoute({
      routes: routes,
      pathname: '/testX/static',
    });

    const history: Array<TypeRouteWithParams> = [];

    await routerStore.redirectTo(initialRoute);

    history.push(cloneWithParams({ route: routes.notFound }));

    checkHistoryAndCurrent(routerStore, history);
  });

  it('Several redirect to same route', async () => {
    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      routes
    );

    const history: Array<TypeRouteWithParams> = [];

    await routerStore.redirectTo({ route: 'staticRoute' });

    history.push(cloneWithParams({ route: routes.staticRoute }));

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'staticRoute' });
    // Does not add to routesHistory, it's good

    checkHistoryAndCurrent(routerStore, history);
  });

  it('Several redirects', async () => {
    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      routes
    );

    const history: Array<TypeRouteWithParams> = [];

    await routerStore.redirectTo({ route: 'staticRoute' });

    history.push(cloneWithParams({ route: routes.staticRoute }));

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'dynamicRoute', params: { static: 'asd' } });

    history.push(cloneWithParams({ route: routes.dynamicRoute, params: { static: 'asd' } }));

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'dynamicRoute', params: { static: 'asd' } });

    checkHistoryAndCurrent(routerStore, history);

    try {
      // @ts-ignore
      await routerStore.redirectTo({ route: 'dynamicRoute' });
    } catch (error: any) {
      expect(error.message).to.deep.eq(
        'replaceDynamicValues: no param ":static" passed for route dynamicRoute'
      );
      checkHistoryAndCurrent(routerStore, history);
    }

    await routerStore.redirectTo({ route: 'dynamicRoute', params: { static: 'foo' } });

    history.push(cloneWithParams({ route: routes.dynamicRoute, params: { static: 'foo' } }));

    checkHistoryAndCurrent(routerStore, history);
  });

  it('Before enter', async () => {
    const beforeEnter_spy = vi.fn();
    const beforeEnter_spy2 = vi.fn();

    let countSpy1 = 0;
    let countSpy2 = 0;

    function checkSpy() {
      expect(beforeEnter_spy).toHaveBeenCalledTimes(countSpy1);
      expect(beforeEnter_spy2).toHaveBeenCalledTimes(countSpy2);
    }

    const customRoutes = createRouterConfig({
      spyOne: {
        path: '/test/static',
        loader: (() => import('../../react/test/pages/static/StaticMobx.js')) as any,
        beforeEnter(config, param: string) {
          beforeEnter_spy(param);

          return Promise.resolve();
        },
      },
      spyTwoDynamic: {
        path: '/test/:static',
        params: {
          static: (value) => value.length > 2,
        },
        loader: (() => import('../../react/test/pages/dynamic/./DynamicMobx')) as any,
        beforeEnter(config, param: string) {
          beforeEnter_spy2(param);

          return Promise.resolve();
        },
      },
      redirectToSpyOne: {
        path: '/test/static3',
        loader: (() => import('../../react/test/pages/dynamic/./DynamicMobx')) as any,
        beforeEnter: (() => {
          return Promise.resolve({ route: 'spyOne' });
        }) as any,
      },
      buggyCode: {
        path: '/test/static4',
        loader: (() => import('../../react/test/pages/dynamic/./DynamicMobx')) as any,
        beforeEnter: (() => {
          // @ts-ignore
          // biome-ignore lint/correctness/noUndeclaredVariables: false
          a;

          return Promise.resolve();
        }) as any,
      },
      notFound: {
        path: '/error400',
        props: { errorNumber: 400 },
        loader: (() => import('../../react/test/pages/error/./ErrorMobx')) as any,
      },
      internalError: {
        path: '/error500',
        props: { errorNumber: 500 },
        loader: (() => import('../../react/test/pages/error/./ErrorMobx')) as any,
      },
    });

    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      customRoutes,
      ['']
    );

    const history: Array<TypeRouteWithParams> = [];

    await routerStore.redirectTo({ route: 'spyOne' });

    countSpy1 += 1;

    checkSpy();
    expect(beforeEnter_spy).toHaveBeenLastCalledWith('');

    history.push(cloneWithParams({ route: customRoutes.spyOne }));

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'spyOne' });

    expect(beforeEnter_spy).toHaveBeenCalledTimes(countSpy1);

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'spyTwoDynamic', params: { static: 'asd' } });

    countSpy2 += 1;

    checkSpy();
    expect(beforeEnter_spy2).toHaveBeenLastCalledWith('');

    history.push(cloneWithParams({ route: customRoutes.spyTwoDynamic, params: { static: 'asd' } }));

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'spyTwoDynamic', params: { static: 'xyz' } });

    countSpy2 += 1;

    checkSpy();

    history.push(cloneWithParams({ route: customRoutes.spyTwoDynamic, params: { static: 'xyz' } }));

    checkHistoryAndCurrent(routerStore, history);

    try {
      await routerStore.redirectTo({ route: 'redirectToSpyOne' });
    } catch (error: any) {
      // SSR should handle redirects manually and not push to history or change current
      expect(error.name).to.deep.eq(constants.errorRedirect);
      expect(error.message).to.deep.eq(customRoutes.spyOne.path);

      checkHistoryAndCurrent(routerStore, history);
    }

    try {
      await routerStore.redirectTo({ route: 'buggyCode' });
    } catch (error: any) {
      // SSR on syntax error should not push to history, replace currentRoute with error500
      expect(error.message).to.deep.eq('a is not defined');

      checkHistory(routerStore, history);
      checkCurrent(routerStore, cloneWithParams({ route: customRoutes.internalError }));
    }

    checkSpy();

    await routerStore.redirectTo({ route: 'redirectToSpyOne', asClient: true });

    countSpy1 += 1;

    // Front handles redirects automatically and calls lifecycle
    checkSpy();

    history.push(cloneWithParams({ route: customRoutes.spyOne }));

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'buggyCode', asClient: true });

    // Front does not throw an exception on buggy code, replace currentRoute with error500
    checkHistory(routerStore, history);
    checkCurrent(routerStore, cloneWithParams({ route: customRoutes.internalError }));
  });

  it('Before leave', async () => {
    const beforeLeave_spy = vi.fn();
    const beforeLeave_spy2 = vi.fn();
    let countSpy1 = 0;
    let countSpy2 = 0;

    function checkSpy() {
      expect(beforeLeave_spy).toHaveBeenCalledTimes(countSpy1);
      expect(beforeLeave_spy2).toHaveBeenCalledTimes(countSpy2);
    }

    const customRoutes = createRouterConfig({
      spyOne: {
        path: '/test/static',
        loader: (() => import('../../react/test/pages/static/StaticMobx.js')) as any,
        beforeLeave(config, param: string) {
          beforeLeave_spy(param);

          return Promise.resolve();
        },
      },
      spyTwoDynamic: {
        path: '/test/:static',
        params: {
          static: (value) => value.length > 2,
        },
        loader: (() => import('../../react/test/pages/dynamic/./DynamicMobx')) as any,
        beforeLeave(config, param: string) {
          beforeLeave_spy2(param);

          return Promise.resolve();
        },
      },
      preventRedirect: {
        path: '/test/prevent-redirect',
        loader: (() => import('../../react/test/pages/dynamic/./DynamicMobx')) as any,
        beforeLeave: (config) => {
          if (config.nextRoute.name === 'spyOne') {
            const err = Object.assign(new Error(''), { name: constants.errorPrevent });

            return Promise.reject(err);
          }

          return Promise.resolve();
        },
      },
      buggyCode: {
        path: '/test/buggy-code',
        loader: (() => import('../../react/test/pages/dynamic/./DynamicMobx')) as any,
        beforeLeave: () => {
          // @ts-ignore
          // biome-ignore lint/correctness/noUndeclaredVariables: false
          a;

          return Promise.resolve();
        },
      },
      notFound: {
        path: '/error400',
        props: { errorNumber: 400 },
        loader: (() => import('../../react/test/pages/error/./ErrorMobx')) as any,
      },
      internalError: {
        path: '/error500',
        props: { errorNumber: 500 },
        loader: (() => import('../../react/test/pages/error/./ErrorMobx')) as any,
      },
    });

    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      customRoutes,
      ['']
    );

    const history: Array<TypeRouteWithParams> = [];

    await routerStore.redirectTo({ route: 'spyOne' });

    checkSpy();

    history.push(cloneWithParams({ route: customRoutes.spyOne }));

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'spyOne' });

    expect(beforeLeave_spy).toHaveBeenCalledTimes(countSpy1);

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'spyTwoDynamic', params: { static: 'asd' } });

    countSpy1 += 1;

    checkSpy();
    expect(beforeLeave_spy).toHaveBeenLastCalledWith('');

    history.push(cloneWithParams({ route: customRoutes.spyTwoDynamic, params: { static: 'asd' } }));

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'spyOne' });

    countSpy2 += 1;

    checkSpy();
    expect(beforeLeave_spy2).toHaveBeenLastCalledWith('');

    history.push(cloneWithParams({ route: customRoutes.spyOne }));

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'preventRedirect' });

    history.push(cloneWithParams({ route: customRoutes.preventRedirect }));

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'spyOne' });

    // Redirect to spyOne prevented
    checkHistoryAndCurrent(routerStore, history);
    checkCurrent(routerStore, cloneWithParams({ route: customRoutes.preventRedirect }));

    await routerStore.redirectTo({ route: 'spyTwoDynamic', params: { static: 'asd' } });

    // Redirect to spyTwoDynamic not prevented
    history.push(cloneWithParams({ route: customRoutes.spyTwoDynamic, params: { static: 'asd' } }));

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'buggyCode' });

    history.push(cloneWithParams({ route: customRoutes.buggyCode }));

    checkHistoryAndCurrent(routerStore, history);

    try {
      await routerStore.redirectTo({ route: 'spyOne' });
    } catch (error: any) {
      // SSR on syntax error should not push to history, replace currentRoute with error500
      expect(error.message).to.deep.eq('a is not defined');

      checkHistory(routerStore, history);
      checkCurrent(routerStore, cloneWithParams({ route: customRoutes.internalError }));
    }

    await routerStore.redirectTo({ route: 'buggyCode', asClient: true });

    checkHistoryAndCurrent(routerStore, history);

    try {
      await routerStore.redirectTo({ route: 'spyOne', asClient: true });
    } catch (error: any) {
      // Front on syntax error should not push to history, replace currentRoute with error500
      expect(error.message).to.deep.eq('a is not defined');

      checkHistory(routerStore, history);
      checkCurrent(routerStore, cloneWithParams({ route: customRoutes.internalError }));
    }
  });

  it('Query', async () => {
    const customRoutes = routes;

    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      customRoutes
    );

    const history: Array<TypeRouteWithParams> = [];

    await routerStore.redirectTo({ route: 'staticRoute', query: { q: 'test' } });

    history.push(cloneWithParams({ route: customRoutes.staticRoute, query: { q: 'test' } }));

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'staticRoute', query: { q: 'test' } });

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'staticRoute', query: { q: 'test2' } });

    history.push(cloneWithParams({ route: customRoutes.staticRoute, query: { q: 'test2' } }));

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'dynamicRoute', params: { static: 'asd' } });

    history.push(cloneWithParams({ route: customRoutes.dynamicRoute, params: { static: 'asd' } }));

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({
      route: 'dynamicRoute',
      params: { static: 'asd' },
      query: { q: 'test' },
    });

    history.push(
      cloneWithParams({
        route: customRoutes.dynamicRoute,
        params: { static: 'asd' },
        query: { q: 'test' },
      })
    );

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({
      route: 'dynamicRoute',
      params: { static: 'bcd' },
      query: { s: 'test' },
    });

    history.push(
      cloneWithParams({
        route: customRoutes.dynamicRoute,
        params: { static: 'bcd' },
        query: { s: 'test' },
      })
    );

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({
      route: 'dynamicRoute',
      params: { static: 'bcd' },
      // @ts-ignore
      query: { nonExistent: 'test' },
    });

    history.push(
      cloneWithParams({
        route: customRoutes.dynamicRoute,
        params: { static: 'bcd' },
      })
    );

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({
      route: 'dynamicRoute',
      params: { static: 'bcd' },
    });

    checkHistoryAndCurrent(routerStore, history);
  });

  it('Query Before enter', async () => {
    const beforeEnter_spy = vi.fn();
    const beforeEnter_spy2 = vi.fn();
    let countSpy1 = 0;
    let countSpy2 = 0;

    function checkSpy() {
      expect(beforeEnter_spy).toHaveBeenCalledTimes(countSpy1);
      expect(beforeEnter_spy2).toHaveBeenCalledTimes(countSpy2);
    }

    const customRoutes = createRouterConfig({
      spyOne: {
        path: '/test/static',
        query: {
          q: (value) => value.length > 2,
        },
        loader: (() => import('../../react/test/pages/static/StaticMobx.js')) as any,
        beforeEnter(config, param: string) {
          beforeEnter_spy(param);

          return Promise.resolve();
        },
      },
      spyTwoDynamic: {
        path: '/test/:static',
        params: {
          static: (value) => value.length > 2,
        },
        query: {
          q: (value) => value.length > 2,
          s: (value) => value.length > 2,
        },
        loader: (() => import('../../react/test/pages/dynamic/./DynamicMobx')) as any,
        beforeEnter(config, param: string) {
          beforeEnter_spy2(param);

          return Promise.resolve();
        },
      },
      redirectToSpyOne: {
        path: '/test/static3',
        loader: (() => import('../../react/test/pages/dynamic/./DynamicMobx')) as any,
        query: {
          q: (value) => value.length > 2,
        },
        beforeEnter: (config) => {
          return Promise.resolve({ route: 'spyOne', query: config.nextQuery });
        },
      },
      buggyCode: {
        path: '/test/static4',
        loader: (() => import('../../react/test/pages/dynamic/./DynamicMobx')) as any,
        beforeEnter: (() => {
          // @ts-ignore
          // biome-ignore lint/correctness/noUndeclaredVariables: false
          a;

          return Promise.resolve();
        }) as any,
      },
      notFound: {
        path: '/error400',
        props: { errorNumber: 400 },
        loader: (() => import('../../react/test/pages/error/./ErrorMobx')) as any,
      },
      internalError: {
        path: '/error500',
        props: { errorNumber: 500 },
        loader: (() => import('../../react/test/pages/error/./ErrorMobx')) as any,
      },
    });

    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      customRoutes,
      ['']
    );

    const history: Array<TypeRouteWithParams> = [];

    // @ts-ignore
    await routerStore.redirectTo({ route: 'spyOne', query: { q: 'foo' } });

    countSpy1 += 1;

    checkSpy();

    history.push(cloneWithParams({ route: customRoutes.spyOne, query: { q: 'foo' } }));

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'spyOne' });

    checkSpy();

    history.push(cloneWithParams({ route: customRoutes.spyOne }));

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({
      route: 'spyTwoDynamic',
      params: { static: 'asd' },
      query: { q: 'foo' },
    });

    countSpy2 += 1;

    checkSpy();

    history.push(
      cloneWithParams({
        route: customRoutes.spyTwoDynamic,
        params: { static: 'asd' },
        query: { q: 'foo' },
      })
    );

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({
      route: 'spyTwoDynamic',
      params: { static: 'xyz' },
      query: { q: 'foo' },
    });

    countSpy2 += 1;

    checkSpy();

    history.push(
      cloneWithParams({
        route: customRoutes.spyTwoDynamic,
        params: { static: 'xyz' },
        query: { q: 'foo' },
      })
    );

    checkHistoryAndCurrent(routerStore, history);

    try {
      await routerStore.redirectTo({
        route: 'redirectToSpyOne',
        // @ts-ignore
        query: { q: 'foo', non: 'bar' },
      });
    } catch (error: any) {
      // SSR should handle redirects manually and not push to history or change current
      expect(error.name).to.deep.eq(constants.errorRedirect);
      expect(error.message).to.deep.eq(`${customRoutes.spyOne.path}?q=foo`);

      checkHistoryAndCurrent(routerStore, history);
    }

    await routerStore.redirectTo({
      route: 'redirectToSpyOne',
      // @ts-ignore
      query: { q: 'foo', non: 'bar' },
      asClient: true,
    });

    countSpy1 += 1;

    // Front handles redirects automatically and calls lifecycle

    checkSpy();

    history.push(cloneWithParams({ route: customRoutes.spyOne, query: { q: 'foo' } }));

    checkHistoryAndCurrent(routerStore, history);
  });
});
