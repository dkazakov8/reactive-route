import { TypeAdapters } from './TypeAdapters';
import { TypeCurrentRoute } from './TypeCurrentRoute';
import { TypeRedirectParams } from './TypeRedirectParams';
import { TypeRoute } from './TypeRoute';

export type TypeRouter<TRoutes extends Record<string | 'notFound' | 'internalError', TypeRoute>> = {
  adapters: TypeAdapters;
  currentRoute: TypeCurrentRoute<TRoutes[keyof TRoutes]>;
  routesHistory: Array<string>;
  isRedirecting: boolean;
  redirect<TRouteName extends keyof TRoutes>(
    config: TypeRedirectParams<TRoutes, TRouteName>
  ): Promise<void>;
  restoreFromURL(params: { pathname: string; noHistoryPush?: boolean }): Promise<void>;
  restoreFromServer(obj: {
    routesHistory: Array<string>;
    currentRoute: TypeCurrentRoute<TRoutes[keyof TRoutes]>;
  }): Promise<void>;
};
