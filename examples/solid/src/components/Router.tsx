import { Router as RouterSolid } from 'reactive-route/solid';
import { useContext } from 'solid-js';

import { StoreContext } from './StoreContext';

export function Router() {
  const { router } = useContext(StoreContext);

  return <RouterSolid router={router} />;
}
