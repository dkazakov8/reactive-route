import { createRouter, createRoutes } from 'reactive-route';

export async function getRouterStore() {
  const adapters =
    REACTIVITY_SYSTEM === 'mobx'
      ? await import('reactive-route/adapters/mobx-preact').then((m) => m.adapters)
      : await import('reactive-route/adapters/kr-observable-preact').then((m) => m.adapters);

  return createRouter({
    routes: createRoutes({
      home: {
        path: '/',
        loader: () => import('./pages/home'),
        async beforeEnter(config) {
          return config.redirect({ route: 'static' });
        },
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
          foo: (value: string) => value.length > 2,
        },
        loader: () => import('./pages/query'),
      },
      preventRedirect: {
        path: '/prevent',
        async beforeEnter(config) {
          if (config.currentState?.name === 'dynamic') {
            return config.redirect({ route: 'static' });
          }
        },
        async beforeLeave(config) {
          if (config.nextState.name === 'query') {
            return config.preventRedirect();
          }
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
    }),
    adapters,
  });
}
