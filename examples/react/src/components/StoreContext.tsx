import { createContext } from 'react';

import { getRouter } from '../router';

export const StoreContext = createContext(
  undefined as unknown as { router: Awaited<ReturnType<typeof getRouter>> }
);
