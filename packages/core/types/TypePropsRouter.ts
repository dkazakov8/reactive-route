import { InterfaceRouterStore } from './InterfaceRouterStore';
import { TypeRoute } from './TypeRoute';

export type TypePropsRouter<TRoutes extends Record<string, TypeRoute>> = {
  routes: TRoutes;
  routerStore: InterfaceRouterStore<TRoutes>;
  beforeMount?: () => void;
  beforeSetPageComponent?: (componentConfig: TRoutes[keyof TRoutes]) => void;
  beforeUpdatePageComponent?: () => void;
};
