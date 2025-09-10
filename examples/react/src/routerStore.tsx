import { createRouterStore } from 'reactive-route';

import { routes } from './routes';

export async function getRouterStore() {
  const adapters =
    REACTIVITY_SYSTEM === 'mobx'
      ? await import('reactive-route/adapters/mobx').then((m) => m.adapters)
      : await import('reactive-route/adapters/kr-observable').then((m) => m.adapters);

  return createRouterStore({ routes, routeError500: routes.error500, adapters });
}
