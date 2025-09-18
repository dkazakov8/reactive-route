import _ from 'lodash';
import queryString from 'query-string';
import { describe, expect, it, vi } from 'vitest';

import { createRouterWithCustomRoutes, getRoutes } from '../../shared/helpers';
import { createRouterConfig } from '../createRouterConfig';
import { InterfaceRouterStore } from '../types/InterfaceRouterStore';
import { TypeRoute } from '../types/TypeRoute';
import { TypeRouteWithParams } from '../types/TypeRouteWithParams';
import { constants } from '../utils/constants';
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

function getDefaultRoutes() {
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
  };
}

function createCounters() {
  const spyOne = vi.fn();
  const spyTwo = vi.fn();

  const counter = {
    spyOne: 0,
    spyTwo: 0,
  };

  function checkSpy() {
    expect(spyOne).toHaveBeenCalledTimes(counter.spyOne);
    expect(spyTwo).toHaveBeenCalledTimes(counter.spyTwo);
  }

  return {
    spyOne,
    spyTwo,
    counter,
    checkSpy,
  };
}

describe('redirectTo', () => {
  it('restoreFromURL: sets initial route', async () => {
    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      routes
    );

    await routerStore.restoreFromURL({ pathname: routes.staticRoute.path });

    const history: Array<TypeRouteWithParams> = [];

    history.push(cloneWithParams({ route: routes.staticRoute }));

    checkHistoryAndCurrent(routerStore, history);
  });

  it('restoreFromURL: sets initial route not found', async () => {
    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      routes
    );

    await routerStore.restoreFromURL({ pathname: '/testX/static' });

    const history: Array<TypeRouteWithParams> = [];

    history.push(cloneWithParams({ route: routes.notFound }));

    checkHistoryAndCurrent(routerStore, history);
  });

  it('beforeEnter: not called when redirecting to same static route', async () => {
    const { spyOne, counter, checkSpy } = createCounters();

    const customRoutes = createRouterConfig({
      spyOne: {
        path: '/test/static',
        loader: routes.staticRoute.loader,
        async beforeEnter(config, param: string) {
          spyOne(param);
        },
      },
      ...getDefaultRoutes(),
    });

    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      customRoutes,
      ['']
    );

    const history: Array<TypeRouteWithParams> = [];

    await routerStore.redirectTo({ route: 'spyOne' });

    history.push(cloneWithParams({ route: customRoutes.spyOne }));

    counter.spyOne += 1;

    checkSpy();

    expect(spyOne).toHaveBeenLastCalledWith('');

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'spyOne' });

    checkSpy();

    checkHistoryAndCurrent(routerStore, history);
  });

  it('beforeEnter: not called when redirecting to same dynamic route (no params change)', async () => {
    const { spyOne, counter, checkSpy } = createCounters();

    const customRoutes = createRouterConfig({
      spyOneDynamic: {
        path: '/test/:static',
        params: {
          static: (value) => value.length > 2,
        },
        loader: routes.dynamicRoute.loader,
        async beforeEnter(config, param: string) {
          spyOne(param);
        },
      },
      ...getDefaultRoutes(),
    });

    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      customRoutes,
      ['']
    );

    const history: Array<TypeRouteWithParams> = [];

    await routerStore.redirectTo({ route: 'spyOneDynamic', params: { static: 'foo' } });

    history.push(cloneWithParams({ route: customRoutes.spyOneDynamic, params: { static: 'foo' } }));

    counter.spyOne += 1;

    checkSpy();

    expect(spyOne).toHaveBeenLastCalledWith('');

    await routerStore.redirectTo({ route: 'spyOneDynamic', params: { static: 'foo' } });

    checkSpy();

    checkHistoryAndCurrent(routerStore, history);
  });

  it('beforeEnter: not called when redirecting to same route (no query change)', async () => {
    const { spyOne, counter, checkSpy } = createCounters();

    const customRoutes = createRouterConfig({
      spyOne: {
        path: '/test/static',
        query: {
          q: (value) => value.length > 2,
        },
        loader: routes.staticRoute.loader,
        async beforeEnter(config, param: string) {
          spyOne(param);
        },
      },
      ...getDefaultRoutes(),
    });

    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      customRoutes,
      ['']
    );

    const history: Array<TypeRouteWithParams> = [];

    await routerStore.redirectTo({ route: 'spyOne', query: { q: 'foo' } });

    history.push(cloneWithParams({ route: customRoutes.spyOne, query: { q: 'foo' } }));

    counter.spyOne += 1;

    checkSpy();

    expect(spyOne).toHaveBeenLastCalledWith('');

    await routerStore.redirectTo({ route: 'spyOne', query: { q: 'foo' } });

    checkSpy();

    checkHistoryAndCurrent(routerStore, history);
  });

  it('beforeEnter: not called when redirecting to same route (query changed)', async () => {
    const { spyOne, counter, checkSpy } = createCounters();

    const customRoutes = createRouterConfig({
      spyOne: {
        path: '/test/static',
        query: {
          q: (value) => value.length > 2,
        },
        loader: routes.staticRoute.loader,
        async beforeEnter(config, param: string) {
          spyOne(param);
        },
      },
      ...getDefaultRoutes(),
    });

    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      customRoutes,
      ['']
    );

    const history: Array<TypeRouteWithParams> = [];

    await routerStore.redirectTo({ route: 'spyOne', query: { q: 'foo' } });

    history.push(cloneWithParams({ route: customRoutes.spyOne, query: { q: 'foo' } }));

    counter.spyOne += 1;

    checkSpy();

    expect(spyOne).toHaveBeenLastCalledWith('');

    await routerStore.redirectTo({ route: 'spyOne', query: { q: 'bar' } });

    history.push(cloneWithParams({ route: customRoutes.spyOne, query: { q: 'bar' } }));

    checkSpy();

    checkHistoryAndCurrent(routerStore, history);
  });

  it('beforeEnter: called when redirecting to same dynamic route (params changed)', async () => {
    const { spyOne, counter, checkSpy } = createCounters();

    const customRoutes = createRouterConfig({
      spyOneDynamic: {
        path: '/test/:static',
        params: {
          static: (value) => value.length > 2,
        },
        loader: routes.dynamicRoute.loader,
        async beforeEnter(config, param: string) {
          spyOne(param);
        },
      },
      ...getDefaultRoutes(),
    });

    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      customRoutes,
      ['']
    );

    const history: Array<TypeRouteWithParams> = [];

    await routerStore.redirectTo({ route: 'spyOneDynamic', params: { static: 'foo' } });

    history.push(cloneWithParams({ route: customRoutes.spyOneDynamic, params: { static: 'foo' } }));

    counter.spyOne += 1;

    checkSpy();

    expect(spyOne).toHaveBeenLastCalledWith('');

    await routerStore.redirectTo({ route: 'spyOneDynamic', params: { static: 'bar' } });

    history.push(cloneWithParams({ route: customRoutes.spyOneDynamic, params: { static: 'bar' } }));

    counter.spyOne += 1;

    checkSpy();

    checkHistoryAndCurrent(routerStore, history);
  });

  it('beforeEnter: errors are rendered with internalError and not pushed to history', async () => {
    const customRoutes = createRouterConfig({
      buggyCode: {
        path: '/test/static4',
        loader: routes.dynamicRoute.loader,
        async beforeEnter() {
          // @ts-ignore
          // biome-ignore lint/correctness/noUndeclaredVariables: false
          a;
        },
      },
      ...getDefaultRoutes(),
    });

    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      customRoutes,
      ['']
    );

    const history: Array<TypeRouteWithParams> = [];

    await routerStore.redirectTo({ route: 'buggyCode' });

    // Front does not throw an exception on buggy code, replace currentRoute with error500
    checkHistory(routerStore, history);
    checkCurrent(routerStore, cloneWithParams({ route: customRoutes.internalError }));
  });

  it('beforeLeave: not called when redirecting to same static route', async () => {
    const { spyOne, checkSpy } = createCounters();

    const customRoutes = createRouterConfig({
      spyOne: {
        path: '/test/static',
        loader: routes.staticRoute.loader,
        async beforeLeave(config, param: string) {
          spyOne(param);
        },
      },
      ...getDefaultRoutes(),
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

    checkSpy();

    checkHistoryAndCurrent(routerStore, history);
  });

  it('beforeLeave: called when redirecting to another route', async () => {
    const { spyOne, counter, checkSpy } = createCounters();

    const customRoutes = createRouterConfig({
      spyOne: {
        path: '/test/static',
        loader: routes.staticRoute.loader,
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
      },
      ...getDefaultRoutes(),
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

    await routerStore.redirectTo({ route: 'spyOneDynamic', params: { static: 'foo' } });

    history.push(cloneWithParams({ route: customRoutes.spyOneDynamic, params: { static: 'foo' } }));

    counter.spyOne += 1;

    checkSpy();

    expect(spyOne).toHaveBeenLastCalledWith('');

    checkHistoryAndCurrent(routerStore, history);
  });

  it('beforeLeave: not called when redirecting to same dynamic route (no params change)', async () => {
    const { spyOne, checkSpy } = createCounters();

    const customRoutes = createRouterConfig({
      spyOneDynamic: {
        path: '/test/:static',
        params: {
          static: (value) => value.length > 2,
        },
        loader: routes.dynamicRoute.loader,
        async beforeLeave(config, param: string) {
          spyOne(param);
        },
      },
      ...getDefaultRoutes(),
    });

    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      customRoutes,
      ['']
    );

    const history: Array<TypeRouteWithParams> = [];

    await routerStore.redirectTo({ route: 'spyOneDynamic', params: { static: 'foo' } });

    checkSpy();

    history.push(cloneWithParams({ route: customRoutes.spyOneDynamic, params: { static: 'foo' } }));

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'spyOneDynamic', params: { static: 'foo' } });

    checkSpy();

    checkHistoryAndCurrent(routerStore, history);
  });

  it('beforeLeave: called when redirecting to same dynamic route (params changed)', async () => {
    const { spyOne, counter, checkSpy } = createCounters();

    const customRoutes = createRouterConfig({
      spyOneDynamic: {
        path: '/test/:static',
        params: {
          static: (value) => value.length > 2,
        },
        loader: routes.dynamicRoute.loader,
        async beforeLeave(config, param: string) {
          spyOne(param);
        },
      },
      ...getDefaultRoutes(),
    });

    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      customRoutes,
      ['']
    );

    const history: Array<TypeRouteWithParams> = [];

    await routerStore.redirectTo({ route: 'spyOneDynamic', params: { static: 'foo' } });

    checkSpy();

    history.push(cloneWithParams({ route: customRoutes.spyOneDynamic, params: { static: 'foo' } }));

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'spyOneDynamic', params: { static: 'bar' } });

    history.push(cloneWithParams({ route: customRoutes.spyOneDynamic, params: { static: 'bar' } }));

    counter.spyOne += 1;

    checkSpy();

    expect(spyOne).toHaveBeenLastCalledWith('');

    checkHistoryAndCurrent(routerStore, history);
  });

  it('beforeLeave: prevent and allow redirects', async () => {
    const { spyOne, counter, checkSpy } = createCounters();

    const customRoutes = createRouterConfig({
      spyOne: {
        path: '/test/static',
        loader: routes.staticRoute.loader,
      },
      spyTwoDynamic: {
        path: '/test/:static',
        params: {
          static: (value) => value.length > 2,
        },
        loader: routes.dynamicRoute.loader,
      },
      preventRedirect: {
        path: '/test/prevent-redirect',
        loader: routes.dynamicRoute.loader,
        async beforeLeave(config, param: string) {
          spyOne(param);

          if (config.nextRoute.name === 'spyOne') {
            const err = Object.assign(new Error(''), { name: constants.errorPrevent });

            return Promise.reject(err);
          }
        },
      },
      ...getDefaultRoutes(),
    });

    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      customRoutes,
      ['']
    );

    const history: Array<TypeRouteWithParams> = [];

    await routerStore.redirectTo({ route: 'preventRedirect' });

    history.push(cloneWithParams({ route: customRoutes.preventRedirect }));

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'spyOne' });

    // Redirect to spyOne prevented
    checkHistoryAndCurrent(routerStore, history);

    counter.spyOne += 1;

    checkSpy();

    await routerStore.redirectTo({ route: 'spyTwoDynamic', params: { static: 'asd' } });

    // Redirect to spyTwoDynamic not prevented
    history.push(cloneWithParams({ route: customRoutes.spyTwoDynamic, params: { static: 'asd' } }));

    checkHistoryAndCurrent(routerStore, history);

    counter.spyOne += 1;

    checkSpy();
  });

  it('beforeLeave: errors are rendered with internalError and not pushed to history', async () => {
    const customRoutes = createRouterConfig({
      spyOne: {
        path: '/test/static',
        loader: routes.staticRoute.loader,
      },
      buggyCode: {
        path: '/test/buggy-code',
        loader: routes.dynamicRoute.loader,
        async beforeLeave() {
          // @ts-ignore
          // biome-ignore lint/correctness/noUndeclaredVariables: false
          a;
        },
      },
      ...getDefaultRoutes(),
    });

    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      customRoutes,
      ['']
    );

    const history: Array<TypeRouteWithParams> = [];

    await routerStore.redirectTo({ route: 'buggyCode' });

    history.push(cloneWithParams({ route: customRoutes.buggyCode }));

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'spyOne' });

    checkHistory(routerStore, history);

    checkCurrent(routerStore, cloneWithParams({ route: customRoutes.internalError }));
  });

  it('query: no push to history if query is the same', async () => {
    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      routes
    );

    const history: Array<TypeRouteWithParams> = [];

    await routerStore.redirectTo({ route: 'staticRoute', query: { q: 'test' } });

    history.push(cloneWithParams({ route: routes.staticRoute, query: { q: 'test' } }));

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'staticRoute', query: { q: 'test' } });

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({
      route: 'staticRoute',
      // @ts-ignore
      query: { q: 'test', nonExistent: 'test' },
    });

    checkHistoryAndCurrent(routerStore, history);
  });

  it('query: no push to history if query is the same (non existent param)', async () => {
    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      routes
    );

    const history: Array<TypeRouteWithParams> = [];

    await routerStore.redirectTo({ route: 'staticRoute' });

    history.push(cloneWithParams({ route: routes.staticRoute }));

    checkHistoryAndCurrent(routerStore, history);

    // @ts-ignore
    await routerStore.redirectTo({ route: 'staticRoute', query: { nonExistent: 'test' } });

    checkHistoryAndCurrent(routerStore, history);
  });

  it('query: push to history if query changed', async () => {
    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      routes
    );

    const history: Array<TypeRouteWithParams> = [];

    await routerStore.redirectTo({ route: 'staticRoute', query: { q: 'test' } });

    history.push(cloneWithParams({ route: routes.staticRoute, query: { q: 'test' } }));

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'staticRoute', query: { q: 'test2' } });

    history.push(cloneWithParams({ route: routes.staticRoute, query: { q: 'test2' } }));

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'staticRoute' });

    history.push(cloneWithParams({ route: routes.staticRoute }));

    checkHistoryAndCurrent(routerStore, history);

    await routerStore.redirectTo({ route: 'staticRoute', query: { q: 'test' } });

    history.push(cloneWithParams({ route: routes.staticRoute, query: { q: 'test' } }));

    checkHistoryAndCurrent(routerStore, history);
  });
});

describe.runIf(constants.isClient)('Client tests', () => {
  it('beforeEnter: redirects are made silently and call lifecycle', async () => {
    const { spyOne, spyTwo, counter, checkSpy } = createCounters();

    const customRoutes = createRouterConfig({
      spyOne: {
        path: '/test/static',
        loader: routes.staticRoute.loader,
        async beforeEnter(config, param: string) {
          spyOne(param);
        },
      },
      redirectToSpyOne: {
        path: '/test/static3',
        loader: routes.dynamicRoute.loader,
        async beforeEnter(config, param: string) {
          spyTwo(param);

          return Promise.resolve({ route: 'spyOne' });
        },
      },
      ...getDefaultRoutes(),
    });

    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      customRoutes,
      ['']
    );

    const history: Array<TypeRouteWithParams> = [];

    await routerStore.redirectTo({ route: 'redirectToSpyOne' });

    history.push(cloneWithParams({ route: customRoutes.spyOne }));

    counter.spyOne += 1;
    counter.spyTwo += 1;

    checkSpy();

    expect(spyOne).toHaveBeenLastCalledWith('');
    expect(spyTwo).toHaveBeenLastCalledWith('');

    checkHistoryAndCurrent(routerStore, history);
  });
});

describe.runIf(!constants.isClient)('SSR tests', () => {
  it('beforeEnter: redirects throw exception and not call next lifecycle', async () => {
    const { spyOne, spyTwo, counter, checkSpy } = createCounters();

    const customRoutes = createRouterConfig({
      spyOne: {
        path: '/test/static',
        loader: routes.staticRoute.loader,
        async beforeEnter(config, param: string) {
          spyOne(param);
        },
      },
      redirectToSpyOne: {
        path: '/test/static3',
        loader: routes.dynamicRoute.loader,
        async beforeEnter(config, param: string) {
          spyTwo(param);

          return Promise.resolve({ route: 'spyOne' });
        },
      },
      ...getDefaultRoutes(),
    });

    const routerStore = createRouterWithCustomRoutes(
      { renderer: 'react', reactivity: 'mobx' },
      customRoutes,
      ['']
    );

    const history: Array<TypeRouteWithParams> = [];

    await routerStore.redirectTo({ route: 'spyOne' });

    history.push(cloneWithParams({ route: customRoutes.spyOne }));

    counter.spyOne += 1;

    checkSpy();

    await expect(async () => {
      await routerStore.redirectTo({ route: 'redirectToSpyOne' });
    }).rejects.toThrowError(
      Object.assign(new Error(customRoutes.spyOne.path), { name: constants.errorRedirect })
    );

    counter.spyTwo += 1;

    checkHistoryAndCurrent(routerStore, history);

    checkSpy();
  });
});
