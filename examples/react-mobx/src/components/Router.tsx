import { useContext } from 'react';
import { Router as RouterReact } from 'reactive-route/react';

import { routes } from '../routes';
import { StoreContext } from './StoreContext';

export function Router() {
  const { routerStore } = useContext(StoreContext);

  return <RouterReact routes={routes} routerStore={routerStore} />;
}
