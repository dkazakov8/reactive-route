import { render as renderSolid } from '@solidjs/testing-library';
import { render as renderReact } from '@testing-library/react/pure';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { expect, vi } from 'vitest';

import { adapters as adaptersKrObservable } from '../../adapters/kr-observable';
import { adapters as adaptersMobx } from '../../adapters/mobx';
import { adapters as adaptersSolid } from '../../adapters/solid';
import { Router as RouterReact } from '../../react';
import { routes as routesReact } from '../../react/test/routes';
import { routesKrObservable } from '../../react/test/routesKrObservable';
import { Router as RouterSolid } from '../../solid';
import { routes as routesSolid } from '../../solid/test/routes';
import { createRouterStore } from '../createRouterStore';
import { TypeRoute } from '../index';

type TypeOptions = { renderer: 'react' | 'solid'; reactivity: 'mobx' | 'solid' | 'kr-observable' };

export function getData<TRoutes extends Record<string, TypeRoute>>(
  options: TypeOptions,
  customRoutes: TRoutes,
  lifecycleParams?: any
) {
  let routes = customRoutes;
  if (!routes && options.renderer === 'react') {
    if (options.reactivity === 'mobx') routes = routesReact as any;
    if (options.reactivity === 'kr-observable') routes = routesKrObservable as any;
  }
  if (!routes && options.renderer === 'solid') routes = routesSolid as any;

  let adapters = {} as any;
  if (options.reactivity === 'mobx') adapters = adaptersMobx;
  if (options.reactivity === 'solid') adapters = adaptersSolid;
  if (options.reactivity === 'kr-observable') adapters = adaptersKrObservable;

  const routerStore = createRouterStore({
    routes,
    lifecycleParams,
    routeError500: customRoutes.error500 as any,
    adapters,
  });

  return routerStore;
}

export function prepareComponentWithSpy(
  options: TypeOptions & {
    ssrRender?: boolean;
  }
) {
  let routes = routesReact;
  if (options.renderer === 'react') {
    if (options.reactivity === 'mobx') routes = routesReact as any;
    if (options.reactivity === 'kr-observable') routes = routesKrObservable as any;
  }
  if (options.renderer === 'solid') routes = routesSolid;

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
    App = observer(() => {
      spy_render();

      return (
        // @ts-ignore
        <RouterReact
          // @ts-ignore
          routerStore={routerStore}
          routes={routes}
          beforeSetPageComponent={spy_beforeSetPageComponent}
          beforeUpdatePageComponent={spy_beforeUpdatePageComponent}
        />
      );
    });
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

  let render!: () => HTMLElement;
  if (options.renderer === 'react') render = () => renderReact((<App />) as any).container;
  if (options.renderer === 'solid') render = () => renderSolid(() => (<App />) as any).container;

  return {
    App,
    routerStore,
    calls,
    checkSpy,
    render,
  };
}
