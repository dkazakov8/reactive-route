import { render as renderSolid } from '@solidjs/testing-library';
import { render as renderPreact } from '@testing-library/preact/pure';
import { render as renderReact } from '@testing-library/react/pure';
import { expect, vi } from 'vitest';

import { adapters as adaptersKrObservable } from '../adapters/kr-observable';
import { adapters as adaptersKrObservablePreact } from '../adapters/kr-observable-preact';
import { adapters as adaptersMobx } from '../adapters/mobx';
import { adapters as adaptersMobxPreact } from '../adapters/mobx-preact';
import { adapters as adaptersSolid } from '../adapters/solid';
import { createRouterStore, TypeRoute } from '../core';
import { Router as RouterPreact } from '../preact';
import { routesKrObservable as routesKrObservablePreact } from '../preact/test/routesKrObservable';
import { routesMobx as routesMobxPreact } from '../preact/test/routesMobx';
import { Router as RouterReact } from '../react';
import { routesKrObservable as routesKrObservableReact } from '../react/test/routesKrObservable';
import { routesMobx as routesMobxReact } from '../react/test/routesMobx';
import { Router as RouterSolid } from '../solid';
import { routes as routesSolid } from '../solid/test/routes';

export type TypeOptions = {
  renderer: 'react' | 'solid' | 'preact';
  reactivity: 'mobx' | 'solid' | 'kr-observable';
  ssrRender?: boolean;
};

function getRoutes(options: TypeOptions, customRoutes?: any) {
  let routes = customRoutes;
  if (!routes && options.renderer === 'react') {
    if (options.reactivity === 'mobx') routes = routesMobxReact as any;
    if (options.reactivity === 'kr-observable') routes = routesKrObservableReact as any;
  }
  if (!routes && options.renderer === 'preact') {
    if (options.reactivity === 'mobx') routes = routesMobxPreact as any;
    if (options.reactivity === 'kr-observable') routes = routesKrObservablePreact as any;
  }
  if (!routes && options.renderer === 'solid') routes = routesSolid as any;

  return routes;
}

function getAdapters(options: TypeOptions) {
  let adapters = {} as any;
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

export function getData<TRoutes extends Record<string, TypeRoute>>(
  options: TypeOptions,
  customRoutes: TRoutes,
  lifecycleParams?: any
) {
  const routes = getRoutes(options, customRoutes);
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

  const routerStore = getData(options, routes);

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
