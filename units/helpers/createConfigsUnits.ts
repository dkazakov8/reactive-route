import { createConfigs } from '../../packages/core';

export function createConfigsUnits(imports: Record<string, any>) {
  return createConfigs({
    home: { path: '/', loader: imports.staticRoute },
    dynamicOneParam: {
      path: '/test/:static',
      params: { static: (value) => value.length > 2 },
      query: {
        q: (value) => value.length > 2,
        s: (value) => value.length > 2,
      },
      loader: imports.dynamicOneParam,
    },
    staticRoute: {
      path: '/test/static',
      query: { q: (value) => value.length > 2 },
      loader: imports.staticRoute,
    },
    dynamicRoute2: {
      path: '/test3/:static',
      params: { static: (value) => value.length > 2 },
      loader: imports.dynamicRoute2,
    },
    dynamicRoute3: {
      path: '/test4/::static',
      params: {
        ':static': (value) => value.length > 2,
      },
      loader: imports.dynamicRoute3,
    },
    noPageName: {
      path: '/test/:foo',
      params: { foo: (value) => value.length > 2 },
      loader: imports.noPageName,
    },
    noPageName2: {
      path: '/test/:foo/:bar',
      params: { foo: (value) => value.length > 2, bar: (value) => value.length > 2 },
      loader: imports.noPageName2,
    },
    dynamicRouteNoValidators: {
      path: '/test2/:param',
      params: undefined as any,
      loader: imports.dynamicRouteNoValidators,
    },
    dynamicRouteMultiple: {
      path: '/test/:param/:param2',
      params: {
        param: (value) => value.length > 2,
        param2: (value) => value.length > 2,
      },
      loader: imports.dynamicRouteMultiple,
    },
    staticRouteAutorun: {
      path: '/test/static/autorun',
      loader: imports.staticRouteAutorun,
      props: {},
    },
    specialCharsPathname: {
      path: '/special/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B%3Fx%3Dtest',
      loader: imports.staticRoute,
    },
    notFound: {
      path: '/error404',
      props: { errorNumber: 404 },
      loader: imports.notFound,
    },
    internalError: {
      path: '/error500',
      props: { errorNumber: 500 },
      loader: imports.internalError,
    },
  });
}
