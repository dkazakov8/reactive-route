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
    staticRouteAutorun: {
      path: '/test/static/autorun',
      loader: imports.staticRouteAutorun,
      props: {},
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
