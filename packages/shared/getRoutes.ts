import { createTestRoutes } from './createTestRoutes';
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
