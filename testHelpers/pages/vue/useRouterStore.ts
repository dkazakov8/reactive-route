import { InjectionKey, inject, provide } from 'vue';

const routerStoreKey: InjectionKey<{ router: any }> = Symbol();

export function provideRouterStore(store: { router: any }) {
  provide(routerStoreKey, store);
}

export const useRouterStore = () => inject(routerStoreKey)!;
