import { TypeCurrentRoute } from './TypeCurrentRoute';
import { TypeRedirectToParams } from './TypeRedirectToParams';
import { TypeRoute } from './TypeRoute';

export type InterfaceRouterStore<TRoutes extends Record<string, TypeRoute>> = {
  routesHistory: Array<string>;
  currentRoute: TypeCurrentRoute<TRoutes[keyof TRoutes]>;
  isRedirecting: boolean;
  redirectTo<TRouteName extends keyof TRoutes>(
    config: TypeRedirectToParams<TRoutes, TRouteName>
  ): Promise<void>;
};
