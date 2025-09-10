import { createContext } from 'solid-js';

import { getRouterStore } from '../routerStore';

export const StoreContext = createContext(
  undefined as unknown as { routerStore: Awaited<ReturnType<typeof getRouterStore>> }
);
