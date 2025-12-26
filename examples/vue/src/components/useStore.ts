import { InjectionKey, inject, provide } from 'vue';

import type { getRouter } from '../router';

export interface Store {
  router: Awaited<ReturnType<typeof getRouter>>;
}

export const StoreKey: InjectionKey<Store> = Symbol('Store');

export function provideStore(store: Store) {
  provide(StoreKey, store);
}

export function useStore(): Store {
  const store = inject(StoreKey);

  if (!store) throw new Error('Store is not provided');

  return store;
}
