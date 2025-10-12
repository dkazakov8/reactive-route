import { expect, vi } from 'vitest';

import { createRouter } from '../core';
import { createTestRoutes } from './createTestRoutes';
import { getAdapters } from './getAdapters';
import { TypeOptions } from './types';

export function getRoutes(options: TypeOptions) {
  let routes: ReturnType<typeof createTestRoutes> = {} as any;

  if (options.renderer === 'react') {
    if (options.reactivity === 'mobx') {
      routes = createTestRoutes({
        staticRoute: () => import('../react/test/pages/static/StaticMobx'),
        dynamicRoute: () => import('../react/test/pages/dynamic/DynamicMobx'),
        dynamicRoute2: () => import('../react/test/pages/dynamic/DynamicMobx'),
        dynamicRoute3: () => import('../react/test/pages/dynamic/DynamicMobx'),
        dynamicRouteNoValidators: () => import('../react/test/pages/dynamic/DynamicMobx'),
        dynamicRouteMultiple: () => import('../react/test/pages/dynamic/DynamicMobx'),
        noPageName: () => import('../react/test/pages/noPageName/NoPageNameMobx'),
        noPageName2: () => import('../react/test/pages/noPageName/NoPageNameMobx'),
        staticRouteAutorun: () => import('../react/test/pages/staticAutorun/StaticAutorunMobx'),
        notFound: () => import('../react/test/pages/error/ErrorMobx'),
        internalError: () => import('../react/test/pages/error/ErrorMobx'),
      });
    }
    if (options.reactivity === 'kr-observable') {
      routes = createTestRoutes({
        staticRoute: () => import('../react/test/pages/static/StaticKrObservable'),
        dynamicRoute: () => import('../react/test/pages/dynamic/DynamicKrObservable'),
        dynamicRoute2: () => import('../react/test/pages/dynamic/DynamicKrObservable'),
        dynamicRoute3: () => import('../react/test/pages/dynamic/DynamicKrObservable'),
        dynamicRouteNoValidators: () => import('../react/test/pages/dynamic/DynamicKrObservable'),
        dynamicRouteMultiple: () => import('../react/test/pages/dynamic/DynamicKrObservable'),
        noPageName: () => import('../react/test/pages/noPageName/NoPageNameKrObservable'),
        noPageName2: () => import('../react/test/pages/noPageName/NoPageNameKrObservable'),
        staticRouteAutorun: () =>
          import('../react/test/pages/staticAutorun/StaticAutorunKrObservable'),
        notFound: () => import('../react/test/pages/error/ErrorKrObservable'),
        internalError: () => import('../react/test/pages/error/ErrorKrObservable'),
      });
    }
  }

  if (options.renderer === 'preact') {
    if (options.reactivity === 'mobx') {
      routes = createTestRoutes({
        staticRoute: () => import('../preact/test/pages/static/StaticMobx'),
        dynamicRoute: () => import('../preact/test/pages/dynamic/DynamicMobx'),
        dynamicRoute2: () => import('../preact/test/pages/dynamic/DynamicMobx'),
        dynamicRoute3: () => import('../preact/test/pages/dynamic/DynamicMobx'),
        dynamicRouteNoValidators: () => import('../preact/test/pages/dynamic/DynamicMobx'),
        dynamicRouteMultiple: () => import('../preact/test/pages/dynamic/DynamicMobx'),
        noPageName: () => import('../preact/test/pages/noPageName/NoPageNameMobx'),
        noPageName2: () => import('../preact/test/pages/noPageName/NoPageNameMobx'),
        staticRouteAutorun: () => import('../preact/test/pages/staticAutorun/StaticAutorunMobx'),
        notFound: () => import('../preact/test/pages/error/ErrorMobx'),
        internalError: () => import('../preact/test/pages/error/ErrorMobx'),
      });
    }
    if (options.reactivity === 'kr-observable') {
      routes = createTestRoutes({
        staticRoute: () => import('../preact/test/pages/static/StaticKrObservable'),
        dynamicRoute: () => import('../preact/test/pages/dynamic/DynamicKrObservable'),
        dynamicRoute2: () => import('../preact/test/pages/dynamic/DynamicKrObservable'),
        dynamicRoute3: () => import('../preact/test/pages/dynamic/DynamicKrObservable'),
        dynamicRouteNoValidators: () => import('../preact/test/pages/dynamic/DynamicKrObservable'),
        dynamicRouteMultiple: () => import('../preact/test/pages/dynamic/DynamicKrObservable'),
        noPageName: () => import('../preact/test/pages/noPageName/NoPageNameKrObservable'),
        noPageName2: () => import('../preact/test/pages/noPageName/NoPageNameKrObservable'),
        staticRouteAutorun: () =>
          import('../preact/test/pages/staticAutorun/StaticAutorunKrObservable'),
        notFound: () => import('../preact/test/pages/error/ErrorKrObservable'),
        internalError: () => import('../preact/test/pages/error/ErrorKrObservable'),
      });
    }
  }

  if (options.renderer === 'solid') {
    routes = createTestRoutes({
      staticRoute: () => import('../solid/test/pages/static/Static'),
      dynamicRoute: () => import('../solid/test/pages/dynamic/Dynamic'),
      dynamicRoute2: () => import('../solid/test/pages/dynamic/Dynamic'),
      dynamicRoute3: () => import('../solid/test/pages/dynamic/Dynamic'),
      dynamicRouteNoValidators: () => import('../solid/test/pages/dynamic/Dynamic'),
      dynamicRouteMultiple: () => import('../solid/test/pages/dynamic/Dynamic'),
      noPageName: () => import('../solid/test/pages/noPageName/NoPageName'),
      noPageName2: () => import('../solid/test/pages/noPageName/NoPageName'),
      staticRouteAutorun: () => import('../solid/test/pages/staticAutorun/StaticAutorun'),
      notFound: () => import('../solid/test/pages/error/Error'),
      internalError: () => import('../solid/test/pages/error/Error'),
    });
  }

  if (options.renderer === 'vue') {
    routes = createTestRoutes({
      staticRoute: () => import('../vue/test/pages/static'),
      dynamicRoute: () => import('../vue/test/pages/dynamic'),
      dynamicRoute2: () => import('../vue/test/pages/dynamic'),
      dynamicRoute3: () => import('../vue/test/pages/dynamic'),
      dynamicRouteNoValidators: () => import('../vue/test/pages/dynamic'),
      dynamicRouteMultiple: () => import('../vue/test/pages/dynamic'),
      noPageName: () => import('../vue/test/pages/noPageName'),
      noPageName2: () => import('../vue/test/pages/noPageName'),
      staticRouteAutorun: () => import('../vue/test/pages/staticAutorun'),
      notFound: () => import('../vue/test/pages/error'),
      internalError: () => import('../vue/test/pages/error'),
    });
  }

  return routes;
}

async function getRouterComponent(options: TypeOptions) {
  let Router: any;
  if (options.renderer === 'react') Router = await import('../react').then((m) => m.Router);
  if (options.renderer === 'preact') Router = await import('../preact').then((m) => m.Router);
  if (options.renderer === 'solid') Router = await import('../solid').then((m) => m.Router);
  if (options.renderer === 'vue') Router = await import('../vue').then((m) => m.Router);

  return Router;
}

async function getRender(options: TypeOptions, App: any, props?: any) {
  let renderFunction: any;
  if (options.renderer === 'react')
    renderFunction = await import('@testing-library/react/pure').then((m) => m.render);
  if (options.renderer === 'preact')
    renderFunction = await import('@testing-library/preact/pure').then((m) => m.render);
  if (options.renderer === 'solid')
    renderFunction = await import('@solidjs/testing-library').then((m) => m.render);
  if (options.renderer === 'vue')
    renderFunction = await import('@testing-library/vue').then((m) => m.render);

  let render!: () => { innerHTML: string };
  if (options.renderer === 'react') render = () => renderFunction(<App />).container;
  if (options.renderer === 'preact') render = () => renderFunction(<App />).container;
  if (options.renderer === 'solid') render = () => renderFunction(() => <App />).container;
  if (options.renderer === 'vue') {
    const ren = await import('@testing-library/vue').then((m) => m.render);

    render = () => {
      const res = ren(App, { props: props });

      return {
        get innerHTML() {
          return res.html();
        },
      };
    };
  }

  return render;
}

async function getRenderToString(options: TypeOptions, App: any, props?: any) {
  let renderFunction: any;
  if (options.renderer === 'react')
    renderFunction = await import('react-dom/server').then((m) => m.renderToString);
  if (options.renderer === 'preact')
    renderFunction = await import('preact-render-to-string').then((m) => m.renderToString);
  if (options.renderer === 'solid')
    renderFunction = await import('solid-js/web').then((m) => m.renderToString);
  if (options.renderer === 'vue')
    renderFunction = await import('vue/server-renderer').then((m) => m.renderToString);

  let renderToString!: () => Promise<string>;
  if (options.renderer === 'react') renderToString = () => Promise.resolve(renderFunction(<App />));
  if (options.renderer === 'preact')
    renderToString = () => Promise.resolve(renderFunction(<App />));
  if (options.renderer === 'solid') renderToString = () => Promise.resolve(renderFunction(App));
  if (options.renderer === 'vue') {
    const createSSRApp = await import('vue').then((m) => m.createSSRApp);

    renderToString = () => renderFunction(createSSRApp(App, props));
  }

  return renderToString;
}

export async function prepareComponentWithSpy(options: TypeOptions) {
  const spy_pageRender = vi.fn();
  const spy_pageAutorun = vi.fn();
  const spy_beforeSetPageComponent = vi.fn();
  const spy_beforeUpdatePageComponent = vi.fn();

  const adapters = await getAdapters(options);
  const router = createRouter({ routes: getRoutes(options), adapters });

  router.routes.staticRouteAutorun.props = {
    renderSpy: spy_pageRender,
    autorunSpy: spy_pageAutorun,
  };

  const calls = {
    pageRender: 0,
    pageAutorun: 0,
    beforeSetPageComponent: 0,
    beforeUpdatePageComponent: 0,
  };

  function checkSpy() {
    expect(spy_pageRender, 'spy_pageRender').toHaveBeenCalledTimes(calls.pageRender);
    expect(spy_pageAutorun, 'spy_pageAutorun').toHaveBeenCalledTimes(calls.pageAutorun);
    expect(spy_beforeSetPageComponent, 'spy_beforeSetPageComponent').toHaveBeenCalledTimes(
      calls.beforeSetPageComponent
    );
    expect(spy_beforeUpdatePageComponent, 'spy_beforeUpdatePageComponent').toHaveBeenCalledTimes(
      calls.beforeUpdatePageComponent
    );
  }

  const Router = await getRouterComponent(options);

  let App: any;

  if (options.renderer === 'vue') {
    App = Router;
  } else {
    App = function App() {
      return (
        <Router
          router={router}
          beforeSetPageComponent={spy_beforeSetPageComponent}
          beforeUpdatePageComponent={spy_beforeUpdatePageComponent}
        />
      );
    };
  }

  const render = await getRender(options, App, {
    router,
    beforeSetPageComponent: spy_beforeSetPageComponent,
    beforeUpdatePageComponent: spy_beforeUpdatePageComponent,
  });
  const renderToString = await getRenderToString(options, App, {
    router,
    beforeSetPageComponent: spy_beforeSetPageComponent,
    beforeUpdatePageComponent: spy_beforeUpdatePageComponent,
  });

  return {
    router,
    calls,
    checkSpy,
    render,
    renderToString,
    spy_pageRender,
    spy_pageAutorun,
  };
}
