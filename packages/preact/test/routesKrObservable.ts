import { createRouterConfig } from '../../core/createRouterConfig.js';

export const routesKrObservable = createRouterConfig({
  staticRoute: {
    path: '/test/static',
    query: {
      q: (value) => value.length > 2,
    },
    loader: (() => import('./pages/static/StaticKrObservable')) as any,
  },
  dynamicRoute: {
    path: '/test/:static',
    params: { static: (value) => value.length > 2 },
    query: {
      q: (value) => value.length > 2,
      s: (value) => value.length > 2,
    },
    loader: (() => import('./pages/dynamic/DynamicKrObservable')) as any,
  },
  dynamicRoute2: {
    path: '/test3/:static',
    params: { static: (value) => value.length > 2 },
    loader: (() => import('./pages/dynamic/DynamicKrObservable')) as any,
  },
  dynamicRoute3: {
    path: '/test4/::static',
    params: {
      ':static': (value) => value.length > 2,
    },
    loader: (() => import('./pages/dynamic/DynamicKrObservable')) as any,
  },
  noPageName: {
    path: '/test/:foo',
    params: { foo: (value) => value.length > 2 },
    loader: (() => import('./pages/noPageName/NoPageNameKrObservable')) as any,
  },
  noPageName2: {
    path: '/test/:foo/:bar',
    params: { foo: (value) => value.length > 2, bar: (value) => value.length > 2 },
    loader: (() => import('./pages/noPageName/NoPageNameKrObservable')) as any,
  },
  // @ts-ignore
  dynamicRouteNoValidators: {
    path: '/test2/:param',
    loader: (() => import('./pages/dynamic/DynamicKrObservable')) as any,
  },
  dynamicRouteMultiple: {
    path: '/test/:param/:param2',
    params: {
      param: (value) => value.length > 2,
      param2: (value) => value.length > 2,
    },
    loader: (() => import('./pages/dynamic/DynamicKrObservable')) as any,
  },
  notFound: {
    path: '/error404',
    props: { errorNumber: 404 },
    loader: (() => import('./pages/error/ErrorKrObservable')) as any,
  },
  internalError: {
    path: '/error500',
    props: { errorNumber: 500 },
    loader: (() => import('./pages/error/ErrorKrObservable')) as any,
  },
});
