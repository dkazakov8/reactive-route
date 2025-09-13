import { createRouterConfig } from 'reactive-route';

export const routes = createRouterConfig({
  home: {
    path: '/',
    loader: () => import('./pages/home'),
  },
  static: {
    path: '/static',
    loader: () => import('./pages/static'),
  },
  dynamic: {
    path: '/page/:foo',
    params: {
      foo: (value: string) => value.length > 2,
    },
    loader: () => import('./pages/dynamic'),
  },
  query: {
    path: '/query',
    query: {
      foo: (value: string) => value.length > 0,
    },
    loader: () => import('./pages/query'),
  },
  preventRedirect: {
    path: '/prevent',
    beforeEnter(config) {
      if (config.currentRoute?.name === 'dynamic') {
        return Promise.resolve({ route: 'static' });
      }

      return Promise.resolve();
    },
    beforeLeave(config) {
      if (config.nextRoute.name === 'query') {
        throw Object.assign(new Error(''), { name: 'PREVENT_REDIRECT' });
      }

      return Promise.resolve();
    },
    loader: () => import('./pages/prevent'),
  },
  // this page is necessary
  notFound: {
    path: '/error404',
    props: { errorCode: 404 },
    loader: () => import('./pages/error'),
  },
  // this page is necessary
  internalError: {
    path: '/error500',
    props: { errorCode: 500 },
    loader: () => import('./pages/error'),
  },
});
