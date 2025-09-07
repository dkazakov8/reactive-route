import { render as renderSolid } from '@solidjs/testing-library';
import { render as renderReact } from '@testing-library/react/pure';
import { autorun as autorunMobx, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { batch, createRenderEffect } from 'solid-js';
import { createMutable, modifyMutable, produce } from 'solid-js/store';
import { expect, vi } from 'vitest';

import { Router as RouterReact } from '../../react';
import { routes as routesReact } from '../../react/test/routes';
import { Router as RouterSolid } from '../../solid';
import { routes as routesSolid } from '../../solid/test/routes';
import { createRouterStore } from '../createRouterStore';
import { TypeRoute } from '../index';

export function getData<TRoutes extends Record<string, TypeRoute>>(
  options: { renderer: 'react' | 'solid'; reactivity: 'mobx' | 'solid' },
  customRoutes: TRoutes,
  lifecycleParams?: any
) {
  let routes = customRoutes;
  if (!routes && options.renderer === 'react') routes = routesReact as any;
  if (!routes && options.renderer === 'solid') routes = routesSolid as any;

  let batchFn = (cb: () => void) => cb();
  if (options.reactivity === 'mobx') batchFn = runInAction;
  if (options.reactivity === 'solid') batchFn = batch;

  let autorunFn = (cb: () => void) => cb();
  if (options.reactivity === 'mobx') autorunFn = autorunMobx;
  if (options.reactivity === 'solid') autorunFn = createRenderEffect;

  let replaceObject = (obj: any, newObj: any) => {
    Object.assign(obj, newObj);
  };
  if (options.reactivity === 'mobx')
    replaceObject = (obj, newObj) => {
      runInAction(() => {
        for (const variableKey in obj) {
          if ((obj as Record<string, any>).hasOwnProperty(variableKey)) {
            delete obj[variableKey];
          }
        }
        Object.assign(obj as Record<string, any>, newObj);
      });

      return obj;
    };
  if (options.reactivity === 'solid')
    replaceObject = (obj, newObj) => {
      modifyMutable(
        obj,
        produce((state) => {
          if (typeof state === 'object' && state != null) {
            // biome-ignore lint/suspicious/useGuardForIn: false
            for (const variableKey in state) {
              delete state[variableKey];
            }
          }

          Object.assign(state || {}, newObj);
        })
      );
    };

  let makeObservableFn = (obj: any) => obj;
  if (options.reactivity === 'mobx') makeObservableFn = observable;
  if (options.reactivity === 'solid') makeObservableFn = createMutable;

  const routerStore = createRouterStore({
    routes,
    lifecycleParams,
    routeError500: customRoutes.error500 as any,
    batch: batchFn,
    autorun: autorunFn,
    replaceObject,
    makeObservable: makeObservableFn,
  });

  return routerStore;
}

export function prepareComponentWithSpy(options: {
  renderer: 'react' | 'solid';
  reactivity: 'mobx' | 'solid';
  ssrRender?: boolean;
}) {
  let routes = routesReact;
  if (options.renderer === 'react') routes = routesReact;
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
        <RouterReact
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
