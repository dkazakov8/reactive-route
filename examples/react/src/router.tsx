import { createRouter } from 'reactive-route';

import { routes } from './routes';

export async function getRouter() {
  const adapters =
    REACTIVITY_SYSTEM === 'mobx'
      ? await import('reactive-route/adapters/mobx-react').then((m) => m.adapters)
      : await import('reactive-route/adapters/kr-observable-react').then((m) => m.adapters);

  return createRouter({ routes, adapters });
}
