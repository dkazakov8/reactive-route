import { Router as RouterSolid } from 'reactive-route/solid';
import { useContext } from 'solid-js';

import { routes } from '../routes';
import { StoreContext } from './StoreContext';

export const Router = () => {
  const { router } = useContext(StoreContext);

  return <RouterSolid routes={routes} router={router} />;
};
