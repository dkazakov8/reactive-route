import { TypeCurrentRoute } from './TypeCurrentRoute';
import { TypeRedirectToParams } from './TypeRedirectToParams';
import { TypeRoute } from './TypeRoute';

type TypeUtils = {
  batch: (cb: () => void) => void;
  autorun: (cb: () => void) => any;
  replaceObject: <TObj extends Record<string, any>>(obj: TObj, newObj: TObj) => void;
  makeObservable: <TObj extends Record<string, any>>(obj: TObj) => TObj;
};

export type TypeCreateRouterStore<TRoutes extends Record<string, TypeRoute>> = TypeUtils & {
  routes: TRoutes;
  routeError500: TRoutes[keyof TRoutes];
  lifecycleParams?: Array<any>;
};

export type InterfaceRouterStore<TRoutes extends Record<string, TypeRoute>> = {
  utils: TypeUtils;
  currentRoute: TypeCurrentRoute<TRoutes[keyof TRoutes]>;
  routesHistory: Array<string>;
  isRedirecting: boolean;
  redirectTo<TRouteName extends keyof TRoutes>(
    config: TypeRedirectToParams<TRoutes, TRouteName>
  ): Promise<void>;
  restoreFromURL(params: {
    pathname: string;
    fallback: TRoutes[keyof TRoutes]['name'];
  }): Promise<void>;
  restoreFromServer(obj: InterfaceRouterStore<TRoutes>): Promise<void>;
};
