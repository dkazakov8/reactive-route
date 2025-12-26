import { TypeRoute } from './TypeRoute';
import { TypeRouter } from './TypeRouter';

export type TypePropsRouter<TRoutes extends Record<string, TypeRoute>> = {
  router: TypeRouter<TRoutes>;
  beforeMount?: () => void;
  beforeSetPageComponent?: (componentConfig: TRoutes[keyof TRoutes]) => void;
  beforeUpdatePageComponent?: () => void;
};
