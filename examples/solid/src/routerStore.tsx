import { createRouterStore } from 'reactive-route';

import { routes } from './routes';

export async function getRouterStore() {
  const adapters =
    REACTIVITY_SYSTEM === 'solid'
      ? await import('reactive-route/adapters/solid').then((m) => m.adapters)
      : await import('reactive-route/adapters/kr-observable').then((m) => m.adapters);

  return createRouterStore({ routes, adapters });
}
