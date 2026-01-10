import { InjectionKey, inject, provide } from 'vue';

type RouterStore = { router: any };

const routerStoreKey: InjectionKey<RouterStore> = Symbol('RouterStore');

export function provideRouterStore(store: RouterStore) {
  provide(routerStoreKey, store);
}

export function useRouterStore(): RouterStore {
  const store = inject(routerStoreKey);

  if (!store) throw new Error('RouterStore: router is not provided');

  return store;
}
