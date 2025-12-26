import { useContext } from 'react';
import { Router as RouterReact } from 'reactive-route/react';

import { StoreContext } from './StoreContext';

export function Router() {
  const { router } = useContext(StoreContext);

  return <RouterReact router={router} />;
}
