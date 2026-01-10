import { createTestRoutes } from './createTestRoutes';
import { TypeOptions } from './types';

export function getRoutes(options: TypeOptions) {
  let routes: ReturnType<typeof createTestRoutes> = {} as any;

  if (options.renderer === 'react') {
    if (options.reactivity === 'mobx') {
      routes = createTestRoutes({
        staticRoute: () => import('./pages/react/static/StaticMobx'),
        dynamicRoute: () => import('./pages/react/dynamic/DynamicMobx'),
        dynamicRoute2: () => import('./pages/react/dynamic/DynamicMobx'),
        dynamicRoute3: () => import('./pages/react/dynamic/DynamicMobx'),
        dynamicRouteNoValidators: () => import('./pages/react/dynamic/DynamicMobx'),
        dynamicRouteMultiple: () => import('./pages/react/dynamic/DynamicMobx'),
        noPageName: () => import('./pages/react/noPageName/NoPageNameMobx'),
        noPageName2: () => import('./pages/react/noPageName/NoPageNameMobx'),
        staticRouteAutorun: () => import('./pages/react/staticAutorun/StaticAutorunMobx'),
        notFound: () => import('./pages/react/error/ErrorMobx'),
        internalError: () => import('./pages/react/error/ErrorMobx'),
      });
    }
    if (options.reactivity === 'kr-observable') {
      routes = createTestRoutes({
        staticRoute: () => import('./pages/react/static/StaticKrObservable'),
        dynamicRoute: () => import('./pages/react/dynamic/DynamicKrObservable'),
        dynamicRoute2: () => import('./pages/react/dynamic/DynamicKrObservable'),
        dynamicRoute3: () => import('./pages/react/dynamic/DynamicKrObservable'),
        dynamicRouteNoValidators: () => import('./pages/react/dynamic/DynamicKrObservable'),
        dynamicRouteMultiple: () => import('./pages/react/dynamic/DynamicKrObservable'),
        noPageName: () => import('./pages/react/noPageName/NoPageNameKrObservable'),
        noPageName2: () => import('./pages/react/noPageName/NoPageNameKrObservable'),
        staticRouteAutorun: () => import('./pages/react/staticAutorun/StaticAutorunKrObservable'),
        notFound: () => import('./pages/react/error/ErrorKrObservable'),
        internalError: () => import('./pages/react/error/ErrorKrObservable'),
      });
    }
  }

  if (options.renderer === 'preact') {
    if (options.reactivity === 'mobx') {
      routes = createTestRoutes({
        staticRoute: () => import('./pages/preact/static/StaticMobx'),
        dynamicRoute: () => import('./pages/preact/dynamic/DynamicMobx'),
        dynamicRoute2: () => import('./pages/preact/dynamic/DynamicMobx'),
        dynamicRoute3: () => import('./pages/preact/dynamic/DynamicMobx'),
        dynamicRouteNoValidators: () => import('./pages/preact/dynamic/DynamicMobx'),
        dynamicRouteMultiple: () => import('./pages/preact/dynamic/DynamicMobx'),
        noPageName: () => import('./pages/preact/noPageName/NoPageNameMobx'),
        noPageName2: () => import('./pages/preact/noPageName/NoPageNameMobx'),
        staticRouteAutorun: () => import('./pages/preact/staticAutorun/StaticAutorunMobx'),
        notFound: () => import('./pages/preact/error/ErrorMobx'),
        internalError: () => import('./pages/preact/error/ErrorMobx'),
      });
    }
    if (options.reactivity === 'kr-observable') {
      routes = createTestRoutes({
        staticRoute: () => import('./pages/preact/static/StaticKrObservable'),
        dynamicRoute: () => import('./pages/preact/dynamic/DynamicKrObservable'),
        dynamicRoute2: () => import('./pages/preact/dynamic/DynamicKrObservable'),
        dynamicRoute3: () => import('./pages/preact/dynamic/DynamicKrObservable'),
        dynamicRouteNoValidators: () => import('./pages/preact/dynamic/DynamicKrObservable'),
        dynamicRouteMultiple: () => import('./pages/preact/dynamic/DynamicKrObservable'),
        noPageName: () => import('./pages/preact/noPageName/NoPageNameKrObservable'),
        noPageName2: () => import('./pages/preact/noPageName/NoPageNameKrObservable'),
        staticRouteAutorun: () => import('./pages/preact/staticAutorun/StaticAutorunKrObservable'),
        notFound: () => import('./pages/preact/error/ErrorKrObservable'),
        internalError: () => import('./pages/preact/error/ErrorKrObservable'),
      });
    }
  }

  if (options.renderer === 'solid') {
    routes = createTestRoutes({
      staticRoute: () => import('./pages/solid/static/Static'),
      dynamicRoute: () => import('./pages/solid/dynamic/Dynamic'),
      dynamicRoute2: () => import('./pages/solid/dynamic/Dynamic'),
      dynamicRoute3: () => import('./pages/solid/dynamic/Dynamic'),
      dynamicRouteNoValidators: () => import('./pages/solid/dynamic/Dynamic'),
      dynamicRouteMultiple: () => import('./pages/solid/dynamic/Dynamic'),
      noPageName: () => import('./pages/solid/noPageName/NoPageName'),
      noPageName2: () => import('./pages/solid/noPageName/NoPageName'),
      staticRouteAutorun: () => import('./pages/solid/staticAutorun/StaticAutorun'),
      notFound: () => import('./pages/solid/error/Error'),
      internalError: () => import('./pages/solid/error/Error'),
    });
  }

  if (options.renderer === 'vue') {
    routes = createTestRoutes({
      staticRoute: () => import('./pages/vue/static'),
      dynamicRoute: () => import('./pages/vue/dynamic'),
      dynamicRoute2: () => import('./pages/vue/dynamic'),
      dynamicRoute3: () => import('./pages/vue/dynamic'),
      dynamicRouteNoValidators: () => import('./pages/vue/dynamic'),
      dynamicRouteMultiple: () => import('./pages/vue/dynamic'),
      noPageName: () => import('./pages/vue/noPageName'),
      noPageName2: () => import('./pages/vue/noPageName'),
      staticRouteAutorun: () => import('./pages/vue/staticAutorun'),
      notFound: () => import('./pages/vue/error'),
      internalError: () => import('./pages/vue/error'),
    });
  }

  return routes;
}
