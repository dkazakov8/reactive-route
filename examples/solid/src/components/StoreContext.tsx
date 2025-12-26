import { createContext } from 'solid-js';

import { getRouter } from '../router';

export const StoreContext = createContext(
  undefined as unknown as { router: Awaited<ReturnType<typeof getRouter>> }
);
