import { createContext } from 'preact';

import { getRouterStore } from '../router';

export const StoreContext = createContext(
  undefined as unknown as { router: Awaited<ReturnType<typeof getRouterStore>> }
);
