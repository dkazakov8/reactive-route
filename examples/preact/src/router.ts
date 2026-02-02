import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { createConfigs, createRouter } from 'reactive-route';

// Use a static import in your project instead of a dynamic
const { adapters } =
  REACTIVITY_SYSTEM === 'mobx'
    ? await import('reactive-route/adapters/mobx-preact')
    : await import('reactive-route/adapters/kr-observable-preact');

export function getRouter() {
  const configs = createConfigs({
    home: {
      path: '/',
      loader: () => import('./pages/home'),
      async beforeEnter({ redirect }) {
        return redirect({ name: 'static' });
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
      async beforeEnter({ currentState, redirect }) {
        if (currentState?.name === 'dynamic') {
          return redirect({ name: 'static' });
        }
      },
      async beforeLeave({ nextState, preventRedirect }) {
        if (nextState.name === 'query') {
          return preventRedirect();
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
  });

  return createRouter({ configs, adapters });
}

export type TypeRouterProject = ReturnType<typeof getRouter>;

export type TypeConfigsProject = ReturnType<TypeRouterProject['getGlobalArguments']>['configs'];

export const RouterContext = createContext<{ router: TypeRouterProject }>(undefined);

export function useRouter() {
  return useContext(RouterContext);
}
