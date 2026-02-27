import { createConfigsUnits } from './createConfigsUnits';
import { TypeOptions } from './types';

export function getConfigs(options: TypeOptions) {
  let configs: ReturnType<typeof createConfigsUnits> = {} as any;

  if (options.renderer === 'react') {
    if (options.reactivity === 'mobx') {
      configs = createConfigsUnits({
        staticRoute: () => import('../pages/react/StaticMobx'),
        dynamicOneParam: () => import('../pages/react/DynamicMobx'),
        dynamicRoute2: () => import('../pages/react/DynamicMobx'),
        staticRouteAutorun: () => import('../pages/react/StaticAutorunMobx'),
        notFound: () => import('../pages/react/ErrorMobx'),
        internalError: () => import('../pages/react/ErrorMobx'),
      });
    }
    if (options.reactivity === 'kr-observable') {
      configs = createConfigsUnits({
        staticRoute: () => import('../pages/react/StaticKrObservable'),
        dynamicOneParam: () => import('../pages/react/DynamicKrObservable'),
        dynamicRoute2: () => import('../pages/react/DynamicKrObservable'),
        staticRouteAutorun: () => import('../pages/react/StaticAutorunKrObservable'),
        notFound: () => import('../pages/react/ErrorKrObservable'),
        internalError: () => import('../pages/react/ErrorKrObservable'),
      });
    }
  }

  if (options.renderer === 'preact') {
    if (options.reactivity === 'mobx') {
      configs = createConfigsUnits({
        staticRoute: () => import('../pages/preact/StaticMobx'),
        dynamicOneParam: () => import('../pages/preact/DynamicMobx'),
        dynamicRoute2: () => import('../pages/preact/DynamicMobx'),
        staticRouteAutorun: () => import('../pages/preact/StaticAutorunMobx'),
        notFound: () => import('../pages/preact/ErrorMobx'),
        internalError: () => import('../pages/preact/ErrorMobx'),
      });
    }
    if (options.reactivity === 'kr-observable') {
      configs = createConfigsUnits({
        staticRoute: () => import('../pages/preact/StaticKrObservable'),
        dynamicOneParam: () => import('../pages/preact/DynamicKrObservable'),
        dynamicRoute2: () => import('../pages/preact/DynamicKrObservable'),
        staticRouteAutorun: () => import('../pages/preact/StaticAutorunKrObservable'),
        notFound: () => import('../pages/preact/ErrorKrObservable'),
        internalError: () => import('../pages/preact/ErrorKrObservable'),
      });
    }
  }

  if (options.renderer === 'solid') {
    configs = createConfigsUnits({
      staticRoute: () => import('../pages/solid/Static'),
      dynamicOneParam: () => import('../pages/solid/Dynamic'),
      dynamicRoute2: () => import('../pages/solid/Dynamic'),
      staticRouteAutorun: () => import('../pages/solid/StaticAutorun'),
      notFound: () => import('../pages/solid/Error'),
      internalError: () => import('../pages/solid/Error'),
    });
  }

  if (options.renderer === 'vue') {
    configs = createConfigsUnits({
      staticRoute: () => import('../pages/vue/static'),
      dynamicOneParam: () => import('../pages/vue/dynamic'),
      dynamicRoute2: () => import('../pages/vue/dynamic'),
      staticRouteAutorun: () => import('../pages/vue/staticAutorun'),
      notFound: () => import('../pages/vue/error'),
      internalError: () => import('../pages/vue/error'),
    });
  }

  return configs;
}
