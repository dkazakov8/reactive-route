import { createRouterStore } from 'reactive-route';
import { adapters } from 'reactive-route/adapters/mobx';

import { routes } from './routes';

export function getRouterStore() {
  return createRouterStore({ routes, routeError500: routes.error500, adapters });
}
