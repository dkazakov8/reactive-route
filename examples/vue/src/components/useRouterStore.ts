import { InjectionKey, inject, provide } from 'vue';

import type { getRouter } from '../router';

type RouterStore = { router: Awaited<ReturnType<typeof getRouter>> };

const routerStoreKey: InjectionKey<RouterStore> = Symbol('RouterStore');

export function provideRouterStore(store: RouterStore) {
  provide(routerStoreKey, store);
}

export function useRouterStore(): RouterStore {
  const store = inject(routerStoreKey);

  if (!store) throw new Error('RouterStore: router is not provided');

  return store;
}
