import { createRouter, createRoutes } from 'reactive-route';
import { InjectionKey, inject } from 'vue';

// Use a static import in your project instead of dynamic
const { adapters } = await import('reactive-route/adapters/vue');

export function getRouter() {
  return createRouter({
    routes: createRoutes({
      home: {
        path: '/',
        loader: () => import('./pages/home'),
        async beforeEnter(config) {
          return config.redirect({ name: 'static' });
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
            return config.redirect({ name: 'static' });
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

export type TypeRouterProject = ReturnType<typeof getRouter>;

export type TypeRoutesProject = ReturnType<TypeRouterProject['getGlobalArguments']>['routes'];

export const routerStoreKey: InjectionKey<{ router: TypeRouterProject }> = Symbol();

export const useRouter = () => inject(routerStoreKey)!;
