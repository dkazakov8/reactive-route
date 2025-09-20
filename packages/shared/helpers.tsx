import { expect, vi } from 'vitest';

import { createRouterStore, TypeRoute } from '../core';
import { createRoutes } from './createRoutes';
import { getAdapters } from './getAdapters';
import { TypeOptions } from './types';

export function getRoutes(options: TypeOptions) {
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

export async function createRouterWithCustomRoutes<TRoutes extends Record<string, TypeRoute>>(
  options: TypeOptions,
  routes: TRoutes,
  lifecycleParams?: any
) {
  const adapters = await getAdapters(options);

  return createRouterStore({ routes, lifecycleParams, adapters });
}

async function getRouterComponent(options: TypeOptions) {
  let Router: any;
  if (options.renderer === 'react') Router = await import('../react').then((m) => m.Router);
  if (options.renderer === 'preact') Router = await import('../preact').then((m) => m.Router);
  if (options.renderer === 'solid') Router = await import('../solid').then((m) => m.Router);

  return Router;
}

async function getRender(options: TypeOptions, App: any) {
  let renderFunction: any;
  if (options.renderer === 'react')
    renderFunction = await import('@testing-library/react/pure').then((m) => m.render);
  if (options.renderer === 'preact')
    renderFunction = await import('@testing-library/preact/pure').then((m) => m.render);
  if (options.renderer === 'solid')
    renderFunction = await import('@solidjs/testing-library').then((m) => m.render);

  let render!: () => HTMLElement | Element;
  if (options.renderer === 'react') render = () => renderFunction(<App />).container;
  if (options.renderer === 'preact') render = () => renderFunction(<App />).container;
  if (options.renderer === 'solid') render = () => renderFunction(() => <App />).container;

  return render;
}

async function getRenderToString(options: TypeOptions, App: any) {
  let renderFunction: any;
  if (options.renderer === 'react')
    renderFunction = await import('react-dom/server').then((m) => m.renderToString);
  if (options.renderer === 'preact')
    renderFunction = await import('preact-render-to-string').then((m) => m.renderToString);
  if (options.renderer === 'solid')
    renderFunction = await import('solid-js/web').then((m) => m.renderToString);

  let renderToString!: () => string;
  if (options.renderer === 'react') renderToString = () => renderFunction(<App />);
  if (options.renderer === 'preact') renderToString = () => renderFunction(<App />);
  if (options.renderer === 'solid') renderToString = () => renderFunction(App);

  return renderToString;
}

export async function prepareComponentWithSpy(options: TypeOptions) {
  const routes = getRoutes(options);
  const adapters = await getAdapters(options);
  const routerStore = createRouterStore({ routes, adapters });

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

  const Router = await getRouterComponent(options);

  function App() {
    spy_render();

    return (
      <Router
        routerStore={routerStore}
        routes={routes}
        beforeSetPageComponent={spy_beforeSetPageComponent}
        beforeUpdatePageComponent={spy_beforeUpdatePageComponent}
      />
    );
  }

  const render = await getRender(options, App);
  const renderToString = await getRenderToString(options, App);

  return {
    routerStore,
    calls,
    checkSpy,
    render,
    renderToString,
  };
}
