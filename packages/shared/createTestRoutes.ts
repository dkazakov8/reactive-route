import { createRoutes } from '../core';

export function createTestRoutes(imports: Record<string, any>) {
  return createRoutes({
    staticRoute: {
      path: '/test/static',
      query: { q: (value) => value.length > 2 },
      pageId: 'static',
      loader: imports.staticRoute as any,
    },
    dynamicRoute: {
      path: '/test/:static',
      params: { static: (value) => value.length > 2 },
      query: {
        q: (value) => value.length > 2,
        s: (value) => value.length > 2,
      },
      pageId: 'dynamic',
      loader: imports.dynamicRoute as any,
    },
    dynamicRoute2: {
      path: '/test3/:static',
      params: { static: (value) => value.length > 2 },
      pageId: 'dynamic',
      loader: imports.dynamicRoute2 as any,
    },
    dynamicRoute3: {
      path: '/test4/::static',
      params: {
        ':static': (value) => value.length > 2,
      },
      pageId: 'dynamic',
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
      pageId: 'dynamic',
      loader: imports.dynamicRouteNoValidators as any,
    },
    dynamicRouteMultiple: {
      path: '/test/:param/:param2',
      params: {
        param: (value) => value.length > 2,
        param2: (value) => value.length > 2,
      },
      pageId: 'dynamic',
      loader: imports.dynamicRouteMultiple as any,
    },
    staticRouteAutorun: {
      path: '/test/static/autorun',
      loader: imports.staticRouteAutorun as any,
      props: {},
    },
    notFound: {
      path: '/error404',
      props: { errorNumber: 404 },
      pageId: 'error',
      loader: imports.notFound as any,
    },
    internalError: {
      path: '/error500',
      props: { errorNumber: 500 },
      pageId: 'error',
      loader: imports.internalError as any,
    },
  });
}
