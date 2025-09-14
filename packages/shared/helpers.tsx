import { render as renderSolid } from '@solidjs/testing-library';
import { render as renderPreact } from '@testing-library/preact/pure';
import { render as renderReact } from '@testing-library/react/pure';
import { expect, vi } from 'vitest';

import { adapters as adaptersKrObservable } from '../adapters/kr-observable';
import { adapters as adaptersKrObservablePreact } from '../adapters/kr-observable-preact';
import { adapters as adaptersMobx } from '../adapters/mobx';
import { adapters as adaptersMobxPreact } from '../adapters/mobx-preact';
import { adapters as adaptersSolid } from '../adapters/solid';
import { createRouterConfig, createRouterStore, TypeAdapters, TypeRoute } from '../core';
import { Router as RouterPreact } from '../preact';
import { Router as RouterReact } from '../react';
import { Router as RouterSolid } from '../solid';

export type TypeOptions = {
  renderer: 'react' | 'solid' | 'preact';
  reactivity: 'mobx' | 'solid' | 'kr-observable';
  ssrRender?: boolean;
};

export function getRoutes(options: TypeOptions, customRoutes?: ReturnType<typeof createRoutes>) {
  if (customRoutes) return customRoutes;

  let routes: ReturnType<typeof createRoutes> = {} as any;

  if (options.renderer === 'react') {
    if (options.reactivity === 'mobx') {
      routes = createRoutes({
        staticRoute: () => import('../react/test/pages/static/StaticMobx'),
        dynamicRoute: () => import('../react/test/pages/dynamic/DynamicMobx'),
        dynamicRoute2: () => import('../react/test/pages/dynamic/DynamicMobx'),
        dynamicRoute3: () => import('../react/test/pages/dynamic/DynamicMobx'),
        dynamicRouteNoValidators: () => import('../react/test/pages/dynamic/DynamicMobx'),
        dynamicRouteMultiple: () => import('../react/test/pages/dynamic/DynamicMobx'),
        noPageName: () => import('../react/test/pages/noPageName/NoPageNameMobx'),
        noPageName2: () => import('../react/test/pages/noPageName/NoPageNameMobx'),
        notFound: () => import('../react/test/pages/error/ErrorMobx'),
        internalError: () => import('../react/test/pages/error/ErrorMobx'),
      });
    }
    if (options.reactivity === 'kr-observable') {
      routes = createRoutes({
        staticRoute: () => import('../react/test/pages/static/StaticKrObservable'),
        dynamicRoute: () => import('../react/test/pages/dynamic/DynamicKrObservable'),
        dynamicRoute2: () => import('../react/test/pages/dynamic/DynamicKrObservable'),
        dynamicRoute3: () => import('../react/test/pages/dynamic/DynamicKrObservable'),
        dynamicRouteNoValidators: () => import('../react/test/pages/dynamic/DynamicKrObservable'),
        dynamicRouteMultiple: () => import('../react/test/pages/dynamic/DynamicKrObservable'),
        noPageName: () => import('../react/test/pages/noPageName/NoPageNameKrObservable'),
        noPageName2: () => import('../react/test/pages/noPageName/NoPageNameKrObservable'),
        notFound: () => import('../react/test/pages/error/ErrorKrObservable'),
        internalError: () => import('../react/test/pages/error/ErrorKrObservable'),
      });
    }
  }
  if (options.renderer === 'preact') {
    if (options.reactivity === 'mobx') {
      routes = createRoutes({
        staticRoute: () => import('../preact/test/pages/static/StaticMobx'),
        dynamicRoute: () => import('../preact/test/pages/dynamic/DynamicMobx'),
        dynamicRoute2: () => import('../preact/test/pages/dynamic/DynamicMobx'),
        dynamicRoute3: () => import('../preact/test/pages/dynamic/DynamicMobx'),
        dynamicRouteNoValidators: () => import('../preact/test/pages/dynamic/DynamicMobx'),
        dynamicRouteMultiple: () => import('../preact/test/pages/dynamic/DynamicMobx'),
        noPageName: () => import('../preact/test/pages/noPageName/NoPageNameMobx'),
        noPageName2: () => import('../preact/test/pages/noPageName/NoPageNameMobx'),
        notFound: () => import('../preact/test/pages/error/ErrorMobx'),
        internalError: () => import('../preact/test/pages/error/ErrorMobx'),
      });
    }
    if (options.reactivity === 'kr-observable') {
      routes = createRoutes({
        staticRoute: () => import('../preact/test/pages/static/StaticKrObservable'),
        dynamicRoute: () => import('../preact/test/pages/dynamic/DynamicKrObservable'),
        dynamicRoute2: () => import('../preact/test/pages/dynamic/DynamicKrObservable'),
        dynamicRoute3: () => import('../preact/test/pages/dynamic/DynamicKrObservable'),
        dynamicRouteNoValidators: () => import('../preact/test/pages/dynamic/DynamicKrObservable'),
        dynamicRouteMultiple: () => import('../preact/test/pages/dynamic/DynamicKrObservable'),
        noPageName: () => import('../preact/test/pages/noPageName/NoPageNameKrObservable'),
        noPageName2: () => import('../preact/test/pages/noPageName/NoPageNameKrObservable'),
        notFound: () => import('../preact/test/pages/error/ErrorKrObservable'),
        internalError: () => import('../preact/test/pages/error/ErrorKrObservable'),
      });
    }
  }
  if (options.renderer === 'solid') {
    routes = createRoutes({
      staticRoute: () => import('../solid/test/pages/static/Static'),
      dynamicRoute: () => import('../solid/test/pages/dynamic/Dynamic'),
      dynamicRoute2: () => import('../solid/test/pages/dynamic/Dynamic'),
      dynamicRoute3: () => import('../solid/test/pages/dynamic/Dynamic'),
      dynamicRouteNoValidators: () => import('../solid/test/pages/dynamic/Dynamic'),
      dynamicRouteMultiple: () => import('../solid/test/pages/dynamic/Dynamic'),
      noPageName: () => import('../solid/test/pages/noPageName/NoPageName'),
      noPageName2: () => import('../solid/test/pages/noPageName/NoPageName'),
      notFound: () => import('../solid/test/pages/error/Error'),
      internalError: () => import('../solid/test/pages/error/Error'),
    });
  }

  return routes;
}

function getAdapters(options: TypeOptions) {
  let adapters = {} as TypeAdapters;
  if (options.reactivity === 'mobx') {
    if (options.renderer === 'react') adapters = adaptersMobx;
    if (options.renderer === 'preact') adapters = adaptersMobxPreact;
  }
  if (options.reactivity === 'solid') adapters = adaptersSolid;
  if (options.reactivity === 'kr-observable') {
    if (options.renderer === 'react') adapters = adaptersKrObservable;
    if (options.renderer === 'preact') adapters = adaptersKrObservablePreact;
  }

  return adapters;
}

export function createRouterWithCustomRoutes<TRoutes extends Record<string, TypeRoute>>(
  options: TypeOptions,
  customRoutes: TRoutes,
  lifecycleParams?: any
) {
  const routes = getRoutes(options, customRoutes as any) as unknown as TRoutes;
  const adapters = getAdapters(options);

  const routerStore = createRouterStore({
    routes,
    lifecycleParams,
    adapters,
  });

  return routerStore;
}

export function prepareComponentWithSpy(options: TypeOptions) {
  const routes = getRoutes(options);
  const adapters = getAdapters(options);

  const routerStore = createRouterStore({
    routes,
    adapters,
  });

  const spy_render = vi.fn();
  const spy_beforeSetPageComponent = vi.fn();
  const spy_beforeUpdatePageComponent = vi.fn();

  const calls = {
    renderTimes: 0,
    beforeSetPageComponent: 0,
    beforeUpdatePageComponent: 0,
  };

  function checkSpy() {
    expect(spy_render).toHaveBeenCalledTimes(calls.renderTimes);
    expect(spy_beforeSetPageComponent).toHaveBeenCalledTimes(calls.beforeSetPageComponent);
    expect(spy_beforeUpdatePageComponent).toHaveBeenCalledTimes(calls.beforeUpdatePageComponent);
  }

  let App: any;

  if (options.renderer === 'react') {
    // @ts-ignore
    App = () => {
      spy_render();

      return (
        <RouterReact
          routerStore={routerStore}
          routes={routes}
          beforeSetPageComponent={spy_beforeSetPageComponent}
          beforeUpdatePageComponent={spy_beforeUpdatePageComponent}
        />
      );
    };
  }

  if (options.renderer === 'preact') {
    // @ts-ignore
    App = () => {
      spy_render();

      return (
        <RouterPreact
          routerStore={routerStore}
          routes={routes}
          beforeSetPageComponent={spy_beforeSetPageComponent}
          beforeUpdatePageComponent={spy_beforeUpdatePageComponent}
        />
      );
    };
  }

  if (options.renderer === 'solid') {
    App = () => {
      spy_render();

      return (
        <RouterSolid
          routerStore={routerStore}
          routes={routes}
          beforeSetPageComponent={spy_beforeSetPageComponent}
          beforeUpdatePageComponent={spy_beforeUpdatePageComponent}
        />
      );
    };
  }

  let render!: () => HTMLElement | Element;
  if (options.renderer === 'react') render = () => renderReact((<App />) as any).container;
  if (options.renderer === 'preact') render = () => renderPreact((<App />) as any).container;
  if (options.renderer === 'solid') render = () => renderSolid(() => (<App />) as any).container;

  return {
    App,
    routerStore,
    calls,
    checkSpy,
    render,
  };
}

export function createRoutes(imports: Record<string, any>) {
  return createRouterConfig({
    staticRoute: {
      path: '/test/static',
      query: {
        q: (value) => value.length > 2,
      },
      loader: imports.staticRoute as any,
    },
    dynamicRoute: {
      path: '/test/:static',
      params: { static: (value) => value.length > 2 },
      query: {
        q: (value) => value.length > 2,
        s: (value) => value.length > 2,
      },
      loader: imports.dynamicRoute as any,
    },
    dynamicRoute2: {
      path: '/test3/:static',
      params: { static: (value) => value.length > 2 },
      loader: imports.dynamicRoute2 as any,
    },
    dynamicRoute3: {
      path: '/test4/::static',
      params: {
        ':static': (value) => value.length > 2,
      },
      loader: imports.dynamicRoute3 as any,
    },
    noPageName: {
      path: '/test/:foo',
      params: { foo: (value) => value.length > 2 },
      loader: imports.noPageName as any,
    },
    noPageName2: {
      path: '/test/:foo/:bar',
      params: { foo: (value) => value.length > 2, bar: (value) => value.length > 2 },
      loader: imports.noPageName2 as any,
    },
    // @ts-ignore
    dynamicRouteNoValidators: {
      path: '/test2/:param',
      loader: imports.dynamicRouteNoValidators as any,
    },
    dynamicRouteMultiple: {
      path: '/test/:param/:param2',
      params: {
        param: (value) => value.length > 2,
        param2: (value) => value.length > 2,
      },
      loader: imports.dynamicRouteMultiple as any,
    },
    notFound: {
      path: '/error404',
      props: { errorNumber: 404 },
      loader: imports.notFound as any,
    },
    internalError: {
      path: '/error500',
      props: { errorNumber: 500 },
      loader: imports.internalError as any,
    },
  });
}
