import { createRouter } from 'reactive-route';

import { routes } from './routes';

export async function getRouter() {
  let adapters: any;

  if (REACTIVITY_SYSTEM === 'solid') {
    adapters = await import('reactive-route/adapters/solid').then((m) => m.adapters);
  }

  if (REACTIVITY_SYSTEM === 'kr-observable') {
    adapters = await import('reactive-route/adapters/kr-observable-solid').then((m) => m.adapters);
  }

  if (REACTIVITY_SYSTEM === 'mobx') {
    adapters = await import('reactive-route/adapters/mobx-solid').then((m) => m.adapters);
  }

  return createRouter({ routes, adapters });
}
