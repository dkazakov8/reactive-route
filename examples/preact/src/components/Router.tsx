import { useContext } from 'preact/hooks';
import { Router as RouterPreact } from 'reactive-route/preact';

import { StoreContext } from './StoreContext';

export function Router() {
  const { router } = useContext(StoreContext);

  return <RouterPreact router={router} />;
}
