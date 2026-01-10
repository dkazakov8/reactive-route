import { createRouter, createRoutes } from 'reactive-route';
import { InjectionKey, inject } from 'vue';

export async function getRouter() {
  const adapters = await import('reactive-route/adapters/vue').then((m) => m.adapters);

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
      notFound: {
        path: '/error404',
        props: { errorCode: 404 },
        loader: () => import('./pages/error'),
      },
      internalError: {
        path: '/error500',
        props: { errorCode: 500 },
        loader: () => import('./pages/error'),
      },
    }),
    adapters,
  });
}

type RouterStore = { router: Awaited<ReturnType<typeof getRouter>> };

export const routerStoreKey: InjectionKey<RouterStore> = Symbol('RouterStore');

export function useRouterStore(): RouterStore {
  const store = inject(routerStoreKey);

  if (!store) throw new Error('RouterStore: router is not provided');

  return store;
}
