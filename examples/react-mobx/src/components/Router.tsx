import { useContext } from 'react';
import { Router as RouterMobx } from 'reactive-route/react';

import { routes } from '../routes';
import { StoreContext } from './StoreContext';

export function Router() {
  const { routerStore } = useContext(StoreContext);

  return <RouterMobx routes={routes} routerStore={routerStore} />;
}
