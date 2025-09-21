import { createRouter } from 'reactive-route';

import { routes } from './routes';

export async function getRouterStore() {
  const adapters =
    REACTIVITY_SYSTEM === 'mobx'
      ? await import('reactive-route/adapters/mobx-preact').then((m) => m.adapters)
      : await import('reactive-route/adapters/kr-observable-preact').then((m) => m.adapters);

  return createRouter({ routes, adapters });
}
